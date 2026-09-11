use std::path::PathBuf;

use axum::{extract::Request, middleware::Next, response::Response};
use tower_http::services::{ServeDir, ServeFile, fs::TokioBackend};

use crate::auth::check_authentification;

pub fn routes() -> ServeDir<ServeFile, TokioBackend> {
    let dist_path = std::env::var("DIST_PATH").unwrap_or("./web/dist".to_string());
    let index_path = PathBuf::from(&dist_path).join("index.html");

    let index = ServeFile::new(index_path);
    let dist = ServeDir::new(dist_path)
        .append_index_html_on_directories(true)
        .fallback(index);

    dist
}

pub async fn middleware(req: Request, next: Next) -> Response {
    let url = req.uri().path();
    if url.starts_with("/dash") {
        check_authentification(req, next).await
    } else {
        next.run(req).await
    }
}
