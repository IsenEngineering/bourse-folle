use std::path::PathBuf;
use std::time::Instant;

use crate::auth::oidc::SessionData;
use crate::auth::random_string;
use anyhow::Result;

/// creates a new session given a session data
pub async fn new_session(data: &SessionData) -> Result<String> {
    let session = random_string(Some(32));

    let data_path = std::env::var("DATASTORE_PATH").unwrap_or("./data".to_string());
    let session_path = PathBuf::from(data_path).join(format!("sessions/{}.json", session));
    let content = serde_json::to_string(data)?;

    tokio::fs::write(session_path, content).await?;

    Ok(session)
}

pub async fn read_session(session: &str) -> Result<Option<SessionData>> {
    let data_path = std::env::var("DATASTORE_PATH").unwrap_or("./data".to_string());
    let session_path = PathBuf::from(data_path).join(format!("sessions/{}.json", session));

    if !session_path.exists() {
        return Ok(None);
    }
    let content = tokio::fs::read(session_path).await?;
    let data: SessionData = serde_json::from_slice(&content)?;

    match data
        .expires_at
        .and_then(|expiration| Some(expiration < Instant::now().elapsed().as_secs()))
    {
        Some(true) | None => {
            remove_session(session).await?;
            Ok(None)
        }
        _ => Ok(Some(data)),
    }
}

/// checks if a session exists returning session's email
pub async fn check_session(session: &str) -> Result<Option<String>> {
    let data_path = std::env::var("DATASTORE_PATH").unwrap_or("./data".to_string());
    let session_path = PathBuf::from(data_path).join(format!("sessions/{}.json", session));

    if !session_path.exists() {
        return Ok(None);
    }
    let content = tokio::fs::read(session_path).await?;
    let data: SessionData = serde_json::from_slice(&content)?;

    match data
        .expires_at
        .and_then(|expiration| Some(expiration < Instant::now().elapsed().as_secs()))
    {
        Some(true) | None => {
            remove_session(session).await?;
            Ok(None)
        }
        _ => Ok(Some(data.email)),
    }
}

pub async fn remove_session(session: &str) -> Result<usize> {
    let data_path = std::env::var("DATASTORE_PATH").unwrap_or("./data".to_string());
    let session_path = PathBuf::from(data_path).join(format!("sessions/{}.json", session));

    if !session_path.exists() {
        return Ok(0);
    }

    tokio::fs::remove_file(session_path).await?;
    Ok(1)
}
