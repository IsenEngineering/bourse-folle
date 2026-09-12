use crate::Shared;
use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct UpdateResource {
    pub name: Option<String>,
    pub price_initial: Option<f32>,
    pub price_min: Option<f32>,
    pub price_max: Option<f32>,
    pub coef_volatility: Option<f32>,
    pub coef_strength: Option<f32>,
}

pub async fn update_resource(
    State(handle): State<Shared>,
    Path(resource_id): Path<String>,
    Json(update): Json<UpdateResource>,
) -> Result<(), (StatusCode, String)> {
    let mut resources = handle.resources.write().await;
    let resource = resources
        .get_mut(&resource_id)
        .ok_or((StatusCode::NOT_FOUND, "".to_string()))?;

    if let Some(price_initial) = update.price_initial {
        resource.price_initial = price_initial;
        resource.price = price_initial;
    }

    if let Some(price_max) = update.price_max {
        resource.price_max = price_max;
    }

    if let Some(price_min) = update.price_min {
        resource.price_min = price_min;
    }

    if let Some(name) = update.name {
        resource.name = name;
    }

    if let Some(strength) = update.coef_strength {
        resource.coef_strength = strength;
    }

    if let Some(volatility) = update.coef_volatility {
        resource.coef_volatility = volatility;
    }

    resource
        .write()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(())
}
