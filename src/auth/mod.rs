mod middlewares;
mod oidc;
mod session;

#[allow(unused)]
pub use middlewares::Authentificated;
pub use middlewares::check_authentification;
pub use oidc::OidcClient;
pub use oidc::SessionData;
pub use session::check_session;
pub use session::new_session;
pub use session::read_session;
pub use session::remove_session;

use base64::{Engine as _, engine::general_purpose};
use rand::fill;

fn random_string(n: Option<usize>) -> String {
    let mut bytes = vec![0u8; n.unwrap_or(32)];
    fill(&mut bytes);

    general_purpose::URL_SAFE_NO_PAD.encode(bytes)
}
