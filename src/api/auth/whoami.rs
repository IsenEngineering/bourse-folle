use axum::{Json, http::StatusCode};
use axum_extra::extract::CookieJar;

use crate::auth::{self, SessionData};

pub async fn handle(cookies: CookieJar) -> Result<Json<SessionData>, (StatusCode, String)> {
    let cookie = cookies
        .get("session")
        .ok_or((StatusCode::BAD_REQUEST, "unauthentificated".to_string()))?;

    let data = auth::read_session(cookie.value())
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::BAD_REQUEST, "unauthentificated".to_string()))?;

    Ok(Json(data))
}
