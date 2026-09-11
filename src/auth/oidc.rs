use anyhow::{Context, Result, anyhow};
use openid::{Claims, Client, Discovered, Options};
use reqwest::Url;
use serde::{Deserialize, Serialize};
use std::{sync::Arc, time::UNIX_EPOCH};

const GOOGLE_OIDC_ISSUER: &str = "https://accounts.google.com";

/// client OIDC configuré pour Google
#[derive(Clone)]
pub struct OidcClient(Arc<Client<Discovered>>);

impl OidcClient {
    /// configure un nouveau client en découvrant les métadonnées OIDC de Google.
    pub async fn new(client_id: String, client_secret: String, redirect_url: &str) -> Result<Self> {
        // vérification du lien de redirection.
        let _ = Url::parse(redirect_url)?;
        let issuer = Url::parse(GOOGLE_OIDC_ISSUER)?;

        // découverte de la configuration de l'autorité.
        let client = Client::<Discovered>::discover(
            client_id,
            Some(client_secret),
            Some(redirect_url.to_string()),
            issuer,
        )
        .await?;

        Ok(Self(Arc::new(client)))
    }

    /// génère le lien de redirection vers Google
    pub async fn authorization_url(&self) -> Result<String> {
        let options = Options {
            scope: Some("openid email profile".to_string()),
            ..Default::default()
        };

        Ok(self.0.auth_url(&options).to_string())
    }

    /// échange le code d'autorisation contre un token, valide l'ID token
    /// reçu (signature), puis retourne les informations utilisateur
    /// ainsi que les données de session à persister.
    pub async fn exchange_code(&self, code: String) -> Result<SessionData> {
        let bearer = self.0.request_token(&code).await?;

        let id_token_str = bearer
            .id_token
            .ok_or_else(|| anyhow!("no id_token in response"))?;

        // Crée un IdToken (Jws<StandardClaims>) à partir de la chaîne encodée.
        let mut id_token = openid::IdToken::new_encoded(&id_token_str);

        // Décode la signature du JWT.
        self.0.decode_token(&mut id_token)?;

        // Valide le token par rapport aux données connues (dont le nonce).
        self.0.validate_token(&id_token, None, None)?;

        // Extrait les claims du token validé.
        let claims = id_token.payload()?;
        let userinfo = claims.userinfo();
        let email = userinfo
            .email
            .clone()
            .context("email is missing from claims")?;

        let session = SessionData {
            sub: claims.sub().to_string(),
            email,
            name: userinfo.name.clone(),
            picture: userinfo.picture.clone().map(|u| u.to_string()),

            // access_token: bearer.access_token.clone(),
            // refresh_token: bearer.refresh_token.clone(),
            expires_at: bearer
                .expires_in
                .and_then(|expires_in| Some(UNIX_EPOCH.elapsed().ok()?.as_secs() + expires_in)),
        };

        Ok(session)
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SessionData {
    pub sub: String,
    pub email: String,
    pub name: Option<String>,
    pub picture: Option<String>,

    // pub access_token: String,
    // pub refresh_token: Option<String>,
    pub expires_at: Option<u64>,
}
