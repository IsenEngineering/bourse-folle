// logs per day that tracks service mode / configurations / actions / logs

// fonction qui écrit sur disque et broadcast les logs
// fonction qui lit les derniers logs

use std::{
    collections::VecDeque,
    path::PathBuf,
    time::{SystemTime, UNIX_EPOCH},
};

use anyhow::Result;
use tokio::{
    fs::OpenOptions,
    io::{AsyncBufReadExt, AsyncWriteExt, BufReader},
};

pub struct ServiceLogs;

impl ServiceLogs {
    pub async fn log(user: &str, msg: &str) -> Result<()> {
        let now = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();
        let secs_today = now % 60 * 60 * 24;
        let hours = secs_today / 3600;
        let minutes = (secs_today % 3600) / 60;
        let content = format!("{:02}:{:02} {} ({})", hours, minutes, msg, user);

        let data_path = std::env::var("DATASTORE_PATH").unwrap_or("./data".to_string());
        let logs_path = PathBuf::from(data_path).join("logs/services.txt");

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&logs_path)
            .await?;

        file.write_all(content.as_bytes()).await?;
        file.write_all(b"\n").await?;

        Ok(())
    }
    pub async fn read(n: u32) -> Result<String> {
        let data_path = std::env::var("DATASTORE_PATH").unwrap_or("./data".to_string());
        let resource_path = PathBuf::from(data_path).join("logs/services.txt");

        let file = tokio::fs::File::open(&resource_path).await?;

        let reader = BufReader::new(file);
        let mut lines = reader.lines();

        let mut buf: VecDeque<String> = VecDeque::with_capacity(n as usize);

        while let Some(line) = lines.next_line().await? {
            if buf.len() == n as usize {
                buf.pop_front();
            }
            buf.push_back(line);
        }

        Ok(buf.into_iter().collect::<Vec<_>>().join("\n"))
    }
}
