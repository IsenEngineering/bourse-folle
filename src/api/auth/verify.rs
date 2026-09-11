use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::Redirect,
};
use axum_extra::extract::CookieJar;
use serde::Deserialize;

use super::cookies;
use crate::{Shared, auth};

#[derive(Deserialize)]
pub struct VerifyQuery {
    code: String,
}

/// callback for the identity provider, takes a code and state as input
/// and returns a cookie session and redirection or an error
pub async fn handle(
    State(handle): State<Shared>,
    Query(params): Query<VerifyQuery>,
) -> Result<(CookieJar, Redirect), (StatusCode, String)> {
    let session_data = handle
        .oidc
        .exchange_code(params.code)
        .await
        .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    let session = auth::new_session(&session_data)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let cookies = cookies::set(session);

    Ok((cookies, Redirect::to("/dash/service")))
}
