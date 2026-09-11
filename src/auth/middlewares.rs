use crate::auth::session::check_session;
use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use axum_extra::extract::CookieJar;

#[derive(Clone, Debug)]
pub struct Authentificated {
    pub email: String,
}

/// checks if request is authentificated,
/// inserts Authentificated extension for authentificated requests
/// and returns UNAUTHORIZED for unauthentificated users
pub async fn check_authentification(mut req: Request, next: Next) -> Response {
    let cookie_jar = CookieJar::from_headers(req.headers());
    let session = cookie_jar.get("session");

    let checked_session = match session {
        Some(session_cookie) => check_session(session_cookie.value()).await,
        None => return StatusCode::UNAUTHORIZED.into_response(),
    };

    let email = match checked_session {
        Ok(Some(email)) => email,
        _ => return StatusCode::UNAUTHORIZED.into_response(),
    };

    let extensions = req.extensions_mut();
    extensions.insert(Authentificated { email });

    next.run(req).await
}
