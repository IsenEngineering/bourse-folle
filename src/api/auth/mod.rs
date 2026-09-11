mod cookies;
mod logout;
mod redirect;
mod verify;
mod whoami;

use crate::Shared;
use axum::{Router, routing::get};

pub fn routes(shared: Shared) -> Router<Shared> {
    Router::new()
        .route("/google", get(redirect::handle))
        .route("/verify", get(verify::handle))
        .route("/whoami", get(whoami::handle))
        .route("/logout", get(logout::handle))
        .with_state(shared)
}
