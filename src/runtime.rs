use crate::{
    Shared,
    api::{self, service::TinyResource},
    config::{self, EventState},
    resources,
};

const K: f32 = 8.0;
fn curve(x: f32) -> f32 {
    if K == 0.0 {
        x
    } else {
        ((K * x).exp() - 1.0) / (K.exp() - 1.0)
    }
}

pub fn compute(config: &config::Config, resource: &resources::Resource) -> f32 {
    let demande = (resource.demande as f32 / config.expected_drinks as f32)
        .min(1.0)
        .max(0.0);

    let curve_high = (resource.coef_strength * curve(demande)) / 100.0;
    let curve_low = (resource.coef_volatility * curve(1.0 - demande)) / 100.0;

    let curve_net = curve_high - curve_low;
    let interval_normalize = (config.interval.as_secs() as f32 / 60.0) / 15.0; // normalize to 15min
    let price = resource.price * (curve_net * interval_normalize).exp().powf(5.0);

    price.max(resource.price_min).min(resource.price_max)
}

pub async fn tick(shared: &Shared) {
    let time = time::UtcDateTime::now();
    println!("{:02}:{:02} tick", time.hour() + 2, time.minute());

    let config = shared.config.read().await.clone();
    match config.event_state {
        EventState::Stopped => return,
        _ => (),
    }

    let mut resources = shared.resources.write().await;

    for (_resource_id, resource) in resources.iter_mut() {
        let new_price = compute(&config, resource);

        if let Ok(()) = resource.new_price(new_price) {
            // save changes to disk
            let _ = resource.write().await;
        }
    }

    let tiny_resources = resources
        .iter()
        .map(|(_id, res)| TinyResource {
            name: res.name.clone(),
            id: res.id.clone(),
            price: res.price,
            demande: 0,
        })
        .collect();

    // propagate via broadcast
    let _ = shared
        .tx_service
        .send(api::service::MsgOut::Resources(tiny_resources));
    let _ = shared
        .tx_resources
        .send(resources.values().map(|res| res.clone()).collect());
}
