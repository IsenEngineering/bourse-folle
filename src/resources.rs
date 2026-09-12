use std::{collections::HashMap, path::PathBuf, sync::Arc};

use anyhow::{Result, anyhow};
use serde::{Deserialize, Serialize};
use tokio::sync::{RwLock, RwLockReadGuard, RwLockWriteGuard};

#[derive(Clone, Debug)]
pub struct ResourcePool(Arc<RwLock<HashMap<String, Resource>>>);

impl ResourcePool {
    pub async fn read(&self) -> RwLockReadGuard<'_, HashMap<String, Resource>> {
        self.0.read().await
    }
    pub async fn write(&self) -> RwLockWriteGuard<'_, HashMap<String, Resource>> {
        self.0.write().await
    }
    pub async fn new() -> Result<Self> {
        let data_path = std::env::var("DATASTORE_PATH").unwrap_or("./data".to_string());
        let resources_path = PathBuf::from(data_path).join("resources");

        let mut resources = HashMap::new();

        let mut entries = tokio::fs::read_dir(&resources_path).await?;
        while let Ok(Some(entry)) = entries.next_entry().await {
            let path = entry.path();
            if !path.ends_with(".json") {
                continue;
            }

            let content = tokio::fs::read(path).await?;
            let resource: Resource = serde_json::from_slice(&content)?;

            resources.insert(resource.id.clone(), resource);
        }

        Ok(Self(Arc::new(RwLock::new(resources))))
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Resource {
    pub name: String,
    pub id: String,
    pub price: f32,
    pub price_initial: f32,
    pub price_min: f32,
    pub price_max: f32,
    pub var: f32,
    pub historic: Vec<f32>,
    pub demande: usize,
    pub coef_volatility: f32,
    pub coef_strength: f32,
}

impl Resource {
    pub async fn remove(self) -> Result<()> {
        let data_path = std::env::var("DATASTORE_PATH").unwrap_or("./data".to_string());
        let resource_path = PathBuf::from(data_path).join(format!("resources/{}.json", self.id));

        if !resource_path.exists() {
            return Err(anyhow!("resource's path doesn't exist"));
        }

        tokio::fs::remove_file(resource_path).await?;

        Ok(())
    }

    pub async fn write(&self) -> Result<()> {
        let data_path = std::env::var("DATASTORE_PATH").unwrap_or("./data".to_string());
        let resource_path = PathBuf::from(data_path).join(format!("resources/{}.json", self.id));
        let resource = serde_json::to_string(self)?;

        tokio::fs::write(resource_path, resource).await?;
        Ok(())
    }

    pub fn new_price(&mut self, price: f32) -> Result<()> {
        if price < self.price_min || price > self.price_max {
            return Err(anyhow!(
                "Le nouveau prix ({}) de {} ne respecte pas les contraintes",
                price,
                self.id
            ));
        }
        self.historic.insert(0, self.price);
        self.price = price;
        self.var = price - self.historic.last().unwrap_or(&price);

        Ok(())
    }
}
