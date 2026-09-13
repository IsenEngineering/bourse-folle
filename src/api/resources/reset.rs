use crate::Shared;
use axum::extract::State;

pub async fn reset_resource(State(handle): State<Shared>) {
    let mut resources = handle.resources.write().await;

    for (_resource_id, resource) in resources.iter_mut() {
        resource.demande = 0;
        resource.historic = Vec::new();
        resource.price = resource.price_initial;
        resource.var = 0.0;
        let _ = resource.write().await;
    }
}
