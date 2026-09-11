use std::sync::Arc;

use anyhow::{Context, Result};
use axum::{Router, middleware};
use tokio::{net::TcpListener, sync::RwLock};

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
}

#[tokio::main]
async fn main() -> Result<()> {
    let client_id = std::env::var("GOOGLE_SSO_ID").context("GOOGLE_SSO_ID has not been setup")?;
    let client_secret =
        std::env::var("GOOGLE_SSO_SECRET").context("GOOGLE_SSO_SECRET has not been setup")?;

    let state = Shared {
        config: Arc::new(RwLock::new(config::Config::new().await?)),
        resources: resources::ResourcePool::new().await?,
        oidc: auth::OidcClient::new(client_id, client_secret, "http://localhost/auth/verify")
            .await?,
    };

    let app = Router::new()
        .nest("/auth", api::auth::routes(state.clone()))
        .fallback_service(web::routes())
        .layer(middleware::from_fn(web::middleware))
        .with_state(state);

    let listener = TcpListener::bind("0.0.0.0:80").await?;

    axum::serve(listener, app)
        .await
        .context("failed to serve the app through TCP")
}
