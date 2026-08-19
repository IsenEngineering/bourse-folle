// Lorsque l'utilisateur clique sur le bouton pour se connecter on le redirige vers google

// Enfin une fois authentifié, google renverra le client vers nous avec un jeton d'authentification.

mod config;

use anyhow::Result;
use axum::response::Redirect;
use openidconnect::{
    AccessToken, AuthorizationCode, CsrfToken, Nonce, OAuth2TokenResponse, Scope, core::{CoreResponseType, CoreRevocableToken}, reqwest::{Client, redirect::Policy}
};

use config::{OidcConfig, OidcToken, OidcClient};

pub async fn login() -> (Redirect, CsrfToken, Nonce) {
    let client = OidcConfig::new().client().await;

    // authorization url generation
    let (authorize_url, csrf_state, nonce) = client
        .authorize_url(
            openidconnect::AuthenticationFlow::<CoreResponseType>::AuthorizationCode,
            CsrfToken::new_random,
            Nonce::new_random,
        )
        .add_scope(Scope::new("email".to_string()))
        .add_scope(Scope::new("profile".to_string()))
        .url();

    // csrf_state & nonce should be stored for the rest of the authentification process

    // redirect clients to the identity provider to authentificate
    (Redirect::to(authorize_url.as_str()), csrf_state, nonce)
}

// /auth/validate
pub async fn validate(nonce: Nonce, code: AuthorizationCode) -> Result<AccessToken> {
    // let's exchange code against a token to the identity provider
    let client = OidcConfig::new().client().await;
    let token = exchange_code_against_token(&client, code.clone()).await?;
    
    let id_token = token.extra_fields().id_token();
    
    let id_token_verifier = client.id_token_verifier();
    let id_token_claims = id_token.unwrap().claims(&id_token_verifier, &nonce)?;
    
    // let expiration = id_token_claims.expiration().timestamp();
    // let email = id_token_claims.email().ok_or(anyhow!("email not in claims"))?;

    dbg!(&id_token_claims);

    Ok(token.access_token().clone())
}

async fn exchange_code_against_token(client: &OidcClient, code: AuthorizationCode) -> Result<OidcToken> {
    // let's exchange code against a token to the identity provider
    let token_request = client.exchange_code(code)?;

    let http_client = Client::builder()
        // prevents SSRF
        .redirect(Policy::none())
        .build()?;

    Ok(token_request.request_async(&http_client).await?)
}

pub async fn revocate(access_token: AccessToken) -> Result<()> {
    let client = OidcConfig::new().client().await;
            
    let http_client = Client::builder()
        // prevents SSRF
        .redirect(Policy::none())
        .build().unwrap();

    let token_to_revoke: CoreRevocableToken = access_token.into();
            
    client
        .revoke_token(token_to_revoke)?
        .request_async(&http_client).await?;

    Ok(())
}