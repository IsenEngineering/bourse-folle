import { SignJWT, jwtVerify } from "@panva/jose"

const JWT_SECRET = new TextEncoder().encode(
    Deno.env.get('JWT_SECRET') || 'secret'
)
const ALG = 'HS256'
const ISSUER = 'nogata-livio'
const AUDIENCE = 'staff-kudeta'

export async function sign() {
    const jwt = await new SignJWT()
        .setProtectedHeader({ ALG })
        .setIssuedAt()
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
        .setExpirationTime('8h')
        .sign(JWT_SECRET)

    return jwt
}

export async function verify(jwt: string): Promise<'success' | 'failed'> {
    try {
        await jwtVerify(jwt, JWT_SECRET, {
            issuer: ISSUER,
            audience: AUDIENCE,
        })
        return 'success'
    } catch {
        return 'failed'
    }
}