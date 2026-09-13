use axum::{
    Extension, Router,
    extract::{State, WebSocketUpgrade},
    response::IntoResponse,
    routing::get,
};
use serde::{Deserialize, Serialize};

use crate::{Shared, auth::Authentificated};

mod ws;

#[derive(Deserialize, Serialize)]
pub enum MsgIn {
    Increase(String),
    Decrease(String),
}

#[derive(Serialize, Clone)]
pub struct TinyResource {
    pub name: String,
    pub id: String,
    pub price: f32,
    pub demande: usize,
}

#[derive(Clone, Serialize)]
pub enum MsgOut {
    Resources(Vec<TinyResource>),
    Resource(TinyResource),
    Log(String),
}

pub async fn upgrade(
    State(shared): State<Shared>,
    Extension(auth): Extension<Authentificated>,
    ws: WebSocketUpgrade,
) -> impl IntoResponse {
    let email = auth.email.split("@").nth(0);
    let id = email.expect("email should have @").to_string();
    ws.on_upgrade(|ws| ws::handle(id, shared, ws))
}

pub fn routes(shared: Shared) -> Router<Shared> {
    Router::new().route("/", get(upgrade)).with_state(shared)
}
