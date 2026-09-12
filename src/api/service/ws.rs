use std::collections::VecDeque;

use axum::extract::ws::{Message, WebSocket};
use futures_util::{SinkExt, StreamExt};

use super::{MsgIn, MsgOut, TinyResource};
use crate::{Shared, logs::ServiceLogs};

pub async fn handle(shared: Shared, ws: WebSocket) {
    let (mut sender, mut receiver) = ws.split();

    {
        // send resources at init
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
        let msg = MsgOut::Resources(tiny_resources);

        let data = serde_json::to_string(&msg).unwrap();
        sender.send(Message::text(data)).await.unwrap();
    }
    {
        // send last logs at init
        match ServiceLogs::read(10).await {
            Ok(logs) => {
                let msg = MsgOut::Log(logs);
                let data = serde_json::to_string(&msg).unwrap();
                sender.send(Message::text(data)).await.unwrap()
            }
            _ => (),
        }
    }

    // then send real twime service log
    let mut rx = shared.tx_service.subscribe();
    tokio::spawn(async move {
        while let Ok(msg_out) = rx.recv().await {
            let data = serde_json::to_string(&msg_out).unwrap();
            sender.send(Message::text(data)).await.unwrap()
        }
    });

    // broadcast that this user took service

    // listen to incoming commands
    let mut cmd_buffer: VecDeque<String> = VecDeque::with_capacity(10);
    while let Some(msg) = receiver.next().await {
        match msg {
            Ok(Message::Text(content)) => match serde_json::from_str::<MsgIn>(&content) {
                Ok(MsgIn::Demande(resource_id)) => {
                    let mut resources = shared.resources.write().await;
                    let resource = resources.get_mut(&resource_id);
                    if let Some(resource) = resource {
                        resource.demande = resource.demande + 1;

                        if cmd_buffer.len() == 10 {
                            cmd_buffer.pop_front();
                        }
                        cmd_buffer.push_back(resource_id);

                        // send updated resource via broadcast
                        // send log via broadcast
                    }
                }
                Ok(MsgIn::Undo) => {
                    let resource_id = cmd_buffer.pop_back();
                    if let Some(resource_id) = resource_id {
                        let mut resources = shared.resources.write().await;
                        let resource = resources.get_mut(&resource_id);
                        if let Some(resource) = resource {
                            resource.demande = resource.demande - 1;

                            // send updated resource via broadcast
                            // send log via broadcast
                        }
                    }
                }
                _ => (),
            },
            _ => (),
        }
    }
}
