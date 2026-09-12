use crate::{Shared, config};
use axum::{Json, Router, extract::State, http::StatusCode, routing::get};
use serde::Deserialize;
use std::time::Duration;

pub fn routes(shared: Shared) -> Router<Shared> {
    Router::new()
        .route("/", get(get_config).patch(set_config))
        .with_state(shared)
}

pub async fn get_config(State(handle): State<Shared>) -> Json<config::Config> {
    let config = handle.config.read().await;

    Json(config::Config {
        interval: config.interval,
        event_id: config.event_id.clone(),
        event_state: config.event_state.clone(),
        expected_drinks: config.expected_drinks,
    })
}

#[derive(Deserialize, Debug)]
pub struct SetConfig {
    interval: Option<Duration>,
    event_id: Option<String>,
    event_state: Option<config::EventState>,
    expected_drinks: Option<u32>,
}

pub async fn set_config(
    State(handle): State<Shared>,
    Json(set): Json<SetConfig>,
) -> (StatusCode, String) {
    if set.event_id.is_none()
        && set.event_state.is_none()
        && set.expected_drinks.is_none()
        && set.interval.is_none()
    {
        return (StatusCode::BAD_REQUEST, "no kv pairs".to_string());
    }
    let mut config = handle.config.write().await;
    if let Some(event_id) = set.event_id {
        config.event_id = event_id
    }
    if let Some(event_state) = set.event_state {
        config.event_state = event_state
    }
    if let Some(interval) = set.interval {
        config.interval = interval
    }
    if let Some(expected_drinks) = set.expected_drinks {
        config.expected_drinks = expected_drinks
    }

    match config.save().await {
        Ok(()) => (StatusCode::OK, "succeed".to_string()),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    }
}
