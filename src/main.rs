use axum::Router;
use tokio::net::TcpListener;
use anyhow::{Context, Result};

mod auth;
mod resources;
mod logs;
mod config;
mod api;

#[tokio::main]
async fn main() -> Result<()> {
    let app = Router::new();

    let listener = TcpListener::bind("0.0.0.0:80").await?;

    axum::serve(listener, app).await
        .context("failed to serve the app through TCP")
}