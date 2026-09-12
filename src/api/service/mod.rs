use axum::{
    Router,
    extract::{State, WebSocketUpgrade},
    response::IntoResponse,
    routing::get,
};
use serde::{Deserialize, Serialize};

use crate::Shared;

mod ws;

#[derive(Deserialize, Serialize)]
pub enum MsgIn {
    Demande(String),
    Undo,
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

pub async fn upgrade(State(shared): State<Shared>, ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(|ws| ws::handle(shared, ws))
}

pub fn routes(shared: Shared) -> Router<Shared> {
    Router::new().route("/", get(upgrade)).with_state(shared)
}
