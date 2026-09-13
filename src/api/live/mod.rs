use crate::{Shared, resources};
use axum::{
    extract::State,
    response::sse::{Event, KeepAlive, Sse},
};
use std::convert::Infallible;
use tokio_stream::{Stream, StreamExt, once, wrappers::BroadcastStream};

pub async fn handle(
    State(handle): State<Shared>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    // snapshot initial
    let initial: Vec<resources::Resource> = {
        let resources = handle.resources.read().await;
        resources.values().cloned().collect()
    };

    let init_event = Event::default().event("init").json_data(&initial).unwrap();
    let init_stream = once(Ok(init_event));

    // updates suivants
    let rx = handle.tx_resources.subscribe();
    let updates_stream = BroadcastStream::new(rx).filter_map(|msg| match msg {
        Ok(resource) => Some(Ok(Event::default()
            .event("update")
            .json_data(&resource)
            .unwrap())),
        Err(_) => None, // Lagged : on saute silencieusement
    });

    Sse::new(init_stream.chain(updates_stream)).keep_alive(KeepAlive::default())
}
