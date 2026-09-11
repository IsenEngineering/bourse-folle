use axum::{extract::State, http::StatusCode, response::Redirect};
use axum_extra::extract::CookieJar;

use crate::{Shared, auth};

/// redirects to identity provider with a state and configured settings
/// if authentificated redirects to dashboard
pub async fn handle(
    State(handle): State<Shared>,
    cookies: CookieJar,
) -> Result<Redirect, (StatusCode, String)> {
    if let Some(cookie) = cookies.get("session") {
        let check = auth::check_session(cookie.value())
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        if let Some(_email) = check {
            return Ok(Redirect::to("/dash/service"));
        }
    }

    match handle.oidc.authorization_url().await {
        Ok(redirection_url) => Ok(Redirect::to(&redirection_url)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}
