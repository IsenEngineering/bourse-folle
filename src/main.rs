use std::sync::Arc;

use anyhow::{Context, Result};
use axum::{Router, middleware, routing::get};
use tokio::{
    net::TcpListener,
    sync::{RwLock, broadcast::Sender},
};

use crate::auth::check_authentification;

mod api;
mod auth;
mod config;
mod logs;
mod resources;
mod web;

#[derive(Clone)]
pub struct Shared {
    pub config: Arc<RwLock<config::Config>>,
    pub resources: resources::ResourcePool,
    pub oidc: auth::OidcClient,
    pub tx_service: Sender<api::service::MsgOut>,
    pub tx_resources: Sender<String>,
}

#[tokio::main]
async fn main() -> Result<()> {
    let client_id = std::env::var("GOOGLE_SSO_ID").context("GOOGLE_SSO_ID has not been setup")?;
    let client_secret =
        std::env::var("GOOGLE_SSO_SECRET").context("GOOGLE_SSO_SECRET has not been setup")?;

    let (tx_service, _) = tokio::sync::broadcast::channel(32);
    let (tx_resources, _) = tokio::sync::broadcast::channel(32);

    let state = Shared {
        config: Arc::new(RwLock::new(config::Config::new().await?)),
        resources: resources::ResourcePool::new().await?,
        oidc: auth::OidcClient::new(client_id, client_secret, "http://localhost/auth/verify")
            .await?,
        tx_resources,
        tx_service,
    };

    let app = Router::new()
        .route("/api/resources", get(api::resources::list_resources))
        .nest(
            "/api",
            Router::new()
                .nest("/service", api::service::routes(state.clone()))
                .nest("/config", api::config::routes(state.clone()))
                .nest("/resources", api::resources::routes(state.clone()))
                .layer(middleware::from_fn(check_authentification)),
        )
        .nest("/auth", api::auth::routes(state.clone()))
        .fallback_service(web::routes())
        .layer(middleware::from_fn(web::middleware))
        .with_state(state);

    let listener = TcpListener::bind("0.0.0.0:80").await?;

    axum::serve(listener, app)
        .await
        .context("failed to serve the app through TCP")
}
