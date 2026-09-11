use axum::{
    http::{HeaderMap, StatusCode},
    response::Redirect,
};
use axum_extra::extract::CookieJar;

use crate::auth;

pub async fn handle(
    cookies: CookieJar,
) -> Result<(CookieJar, HeaderMap, Redirect), (StatusCode, String)> {
    let cookie = cookies
        .get("session")
        .ok_or((StatusCode::BAD_REQUEST, "unauthentificated".to_string()))?;

    auth::remove_session(cookie.value())
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let jar = cookies.remove("session");
    let mut headers = HeaderMap::new();
    headers.insert("Clear-Site-Data", "*".parse().unwrap());

    Ok((jar, headers, Redirect::to("/")))
}
