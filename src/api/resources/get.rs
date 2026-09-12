use std::collections::HashMap;

use crate::{Shared, resources};
use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

pub async fn list_resources(
    State(handle): State<Shared>,
) -> Json<HashMap<String, resources::Resource>> {
    let resources = handle.resources.read().await;

    Json(resources.clone())
}

pub async fn get_resource(
    State(handle): State<Shared>,
    Path(resource_id): Path<String>,
) -> Result<Json<resources::Resource>, StatusCode> {
    let resources = handle.resources.read().await;

    resources
        .get(&resource_id)
        .ok_or(StatusCode::NOT_FOUND)
        .and_then(|resource| Ok(Json(resource.clone())))
}
