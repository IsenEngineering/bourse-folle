use std::{path::PathBuf, time::Duration};

use anyhow::Result;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub enum EventState {
    Stopped,
    Running,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub interval: Duration, // configurer l'interval des mises à jour des ressources
    pub event_id: String, // le numéro/identifiant de l'évènement (pour différencier une sauvegarde d'une autre)
    pub event_state: EventState,
    pub expected_drinks: u32, // consommations attendues (pour calculer l'indice de demande)
}

impl Config {
    pub async fn new() -> Result<Self> {
        let data_path = std::env::var("DATASTORE_PATH").unwrap_or("./data".to_string());
        let config_path = PathBuf::from(data_path).join("config.json");

        if config_path.exists() {
            let content = tokio::fs::read_to_string(config_path).await?;
            let config: Self = serde_json::from_str(&content)?;

            Ok(config)
        } else {
            Ok(Self::default())
        }
    }

    pub async fn save(&self) -> Result<()> {
        let data_path = std::env::var("DATASTORE_PATH").unwrap_or("./data".to_string());
        let config_path = PathBuf::from(data_path).join("config.json");
        let content = serde_json::to_string(self)?;

        tokio::fs::write(config_path, content).await?;
        Ok(())
    }
}

impl Default for Config {
    fn default() -> Self {
        Self {
            interval: Duration::from_secs(60 * 5),
            event_id: "bourse-folle".to_string(),
            event_state: EventState::Stopped,
            expected_drinks: 50,
        }
    }
}
