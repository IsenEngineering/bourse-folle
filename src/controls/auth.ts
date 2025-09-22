import log from "../log.ts";
import { Cookie, getCookies, setCookie } from "@std/http/cookie"
import { SignJWT, jwtVerify } from "@panva/jose"
import { Protection } from "types";

const JWT_SECRET = new TextEncoder().encode(
    Deno.env.get('JWT_SECRET') || 'secret'
)
const ALG = 'HS256'
const ISSUER = 'nogata-livio'
const AUDIENCE = 'staff-kudeta'

export default class Auth {
    private static token: string

    static generateToken() {
        this.token = Math.floor(Math.random() * 10E8).toString(36)

        log(`auth`, '')
        console.log('')
        console.log(`   authentification token regenerated`)
        console.log(`   https://bourse-folle.isenengineering.fr?t=${this.token}`)
        console.log('')
    }

    static async protect(req: Request, url: URL): Promise<Protection> {
        const cookies = getCookies(req.headers)
        const jwt = cookies['t']
        if(jwt && await this.verify(jwt)) {
            return {
                type: 'pass'
            }
        }

        const t = url.searchParams.get('t')
        if(t && this.authorized(t)) {
            const jwt = await this.sign()
            const headers = new Headers()
            const cookie: Cookie = {
                name: 't',
                value: jwt,
                secure: true,
                domain: 'bourse-folle.isenengineering.fr',
                expires: Date.now() + 1000 * 60 * 60 * 8,
            }
            setCookie(headers, cookie)

            return {
                type: 'signed',
                header: headers.get('Set-Cookie') as string
            }
        }

        return {
            type: 'forbidden',
            resp: new Response('Veuillez vous authentifier', {
                status: 403
            })
        }
    }

    static authorized(token: string) {
        const authorized = token === this.token
        if(authorized) {
            this.generateToken()
        }

        return authorized
    }
    static async sign(): Promise<string> {
        return await new SignJWT()
            .setProtectedHeader({ alg: ALG })
            .setIssuedAt()
            .setIssuer(ISSUER)
            .setAudience(AUDIENCE)
            .setExpirationTime('8h')
            .sign(JWT_SECRET)
    }
    static async verify(jwt: string): Promise<boolean> {
        try {
            await jwtVerify(jwt, JWT_SECRET, {
                issuer: ISSUER,
                audience: AUDIENCE,
            })
            return true
        } catch {
            return false
        }
    }
}