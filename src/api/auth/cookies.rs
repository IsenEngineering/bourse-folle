use axum_extra::extract::{
    CookieJar,
    cookie::{Cookie, SameSite},
};
use time::Duration;

const MAX_AGE: Duration = Duration::seconds(3600);

/// set a session cookie with http_only, path, samesite
/// and optionally : domain, secure and/or max_age
pub(super) fn set(session: String) -> CookieJar {
    let cookies = CookieJar::new();
    let mut cookie = Cookie::new("session", session);

    if let Ok(domain) = std::env::var("COOKIE_DOMAIN") {
        cookie.set_domain(domain);
    }
    if let Ok(_secure) = std::env::var("COOKIE_SECURE") {
        cookie.set_secure(true);
    }
    match std::env::var("COOKIE_MAX_AGE") {
        Ok(secs) => match secs.parse::<i64>() {
            Ok(secs) => cookie.set_max_age(Duration::seconds(secs)),
            _ => cookie.set_max_age(MAX_AGE),
        },
        _ => cookie.set_max_age(MAX_AGE),
    };

    cookie.set_http_only(true);
    cookie.set_path("/");
    cookie.set_same_site(SameSite::Strict);
    cookies.add(cookie)
}
