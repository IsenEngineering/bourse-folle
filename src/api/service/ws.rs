use std::sync::Arc;

use axum::extract::ws::{CloseFrame, Message, WebSocket};
use futures_util::{SinkExt, StreamExt, stream::SplitSink};
use tokio::sync::{Mutex, broadcast::Sender};

use super::{MsgIn, MsgOut, TinyResource};
use crate::{Shared, logs::ServiceLogs};

type WsSender = Arc<Mutex<SplitSink<WebSocket, Message>>>;

async fn close(sender: &WsSender, code: u16, reason: &str) {
    let mut sender = sender.lock().await;
    let _ = sender
        .send(Message::Close(Some(CloseFrame {
            code,
            reason: reason.to_owned().into(),
        })))
        .await;
}

async fn log(msg: String, tx: &Sender<MsgOut>) {
    if let Ok(msg) = ServiceLogs::log(&msg).await {
        let msg_out = MsgOut::Log(msg);
        let _ = tx.send(msg_out);
    }
}

async fn send_json(sender: &WsSender, msg: &MsgOut) -> Result<(), axum::Error> {
    let data = serde_json::to_string(msg).unwrap();
    let mut sender = sender.lock().await;
    sender.send(Message::text(data)).await
}

pub async fn handle(email: String, shared: Shared, ws: WebSocket) {
    let (sink, mut receiver) = ws.split();
    let sender: WsSender = Arc::new(Mutex::new(sink));

    // send broadcast events to user
    let mut rx = shared.tx_service.subscribe();
    let sender_rt = Arc::clone(&sender);
    let real_time = tokio::spawn(async move {
        while let Ok(msg_out) = rx.recv().await {
            if send_json(&sender_rt, &msg_out).await.is_err() {
                break;
            }
        }
    });
    {
        // broadcast user just entered
        log(format!("-> {}", email), &shared.tx_service).await;
    }
    {
        // send init resources to user
        let resources = shared.resources.read().await;
        let tiny_resources: Vec<TinyResource> = resources
            .iter()
            .map(|(_id, res)| TinyResource {
                name: res.name.clone(),
                id: res.id.clone(),
                price: res.price,
                demande: res.demande,
            })
            .collect();
        if send_json(&sender, &MsgOut::Resources(tiny_resources))
            .await
            .is_err()
        {
            // closing & logging user is closing
            log(format!("<- {}", email), &shared.tx_service).await;
            return;
        }
    }
    {
        // read 10 last lines of logs and send to user
        if let Ok(logs) = ServiceLogs::read(10).await {
            if send_json(&sender, &MsgOut::Log(logs)).await.is_err() {
                // closing & logging user is closing
                log(format!("<- {}", email), &shared.tx_service).await;
                return;
            }
        }
    }

    // listening to incoming commands
    // cmd_buffer old the 10 last "demande"
    while let Some(msg) = receiver.next().await {
        match msg {
            Ok(Message::Text(content)) => match serde_json::from_str::<MsgIn>(&content) {
                Ok(MsgIn::Increase(resource_id)) => {
                    let mut resources = shared.resources.write().await;
                    if let Some(resource) = resources.get_mut(&resource_id) {
                        // increases demande
                        resource.demande += 1;
                        let _ = resource.write().await;

                        let updated = MsgOut::Resource(TinyResource {
                            name: resource.name.clone(),
                            id: resource.id.clone(),
                            price: resource.price,
                            demande: resource.demande,
                        });

                        log(
                            format!("{} + 1 ({})", resource.name, &email),
                            &shared.tx_service,
                        )
                        .await;

                        // send updated resource via broadcast
                        let _ = shared.tx_service.send(updated);
                    }
                }
                Ok(MsgIn::Decrease(resource_id)) => {
                    let mut resources = shared.resources.write().await;
                    if let Some(resource) = resources.get_mut(&resource_id) {
                        if resource.demande == 0 {
                            continue;
                        }
                        resource.demande -= 1;
                        let _ = resource.write().await;

                        let updated = MsgOut::Resource(TinyResource {
                            name: resource.name.clone(),
                            id: resource.id.clone(),
                            price: resource.price,
                            demande: resource.demande,
                        });

                        log(
                            format!("{} - 1 ({})", resource.name, &email),
                            &shared.tx_service,
                        )
                        .await;

                        // send updated resource via broadcast
                        let _ = shared.tx_service.send(updated);
                    }
                }
                _ => (),
            },
            Ok(Message::Close(_)) => {
                log(format!("<- {}", email), &shared.tx_service).await;
                break;
            }
            Err(e) => {
                log(format!("<- {}", email), &shared.tx_service).await;
                close(&sender, 1011, &e.to_string()).await;
                break;
            }
            _ => (),
        }
    }

    real_time.abort();
}
