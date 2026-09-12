// - /api/resources [GET,POST,PATCH,DELETE] -> récupérer/créer/modifier/supprimer une ressource

use crate::{Shared, resources};
use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    routing::{get, post},
};

mod get;
mod update;
pub use get::list_resources;

pub fn routes(shared: Shared) -> Router<Shared> {
    Router::new()
        .route(
            "/{resource_id}",
            get(get::get_resource)
                .delete(delete_resource)
                .patch(update::update_resource),
        )
        .route("/", post(create_resource).patch(update::update_resource))
        .with_state(shared)
}

pub async fn delete_resource(
    State(handle): State<Shared>,
    Path(resource_id): Path<String>,
) -> (StatusCode, String) {
    let mut resources = handle.resources.write().await;
    if let Some(resource) = resources.remove(&resource_id) {
        match resource.remove().await {
            Ok(()) => (StatusCode::OK, "".to_string()),
            Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
        }
    } else {
        (StatusCode::NOT_FOUND, "".to_string())
    }
}

pub async fn create_resource(
    State(handle): State<Shared>,
    Json(resource): Json<resources::Resource>,
) -> (StatusCode, String) {
    let mut resources = handle.resources.write().await;

    match resources.insert(resource.id.clone(), resource) {
        Some(resource) => match resource.write().await {
            Ok(()) => (StatusCode::OK, "".to_string()),
            Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
        },
        None => (StatusCode::BAD_REQUEST, "".to_string()),
    }
}
