import Boissons from "./controls/boissons.ts";
import Live from "./controls/stream.ts";
import Periode from "./controls/periode.ts";
import Auth from "./controls/auth.ts";
import endpoints from "./routes/mod.ts"
import { serveDir } from "@std/http/file-server"

export const periode = new Periode(7)
export const boissons = new Boissons()

periode.effet = async () => {
    // gérer l'évolution des prix
    await boissons.nouvelle_periode({
    })

    Live.broadcast({
        type: 'update',
        annonce: boissons.annonce(),
        historique: boissons.historique(),
    })
    Live.broadcast({
        type: 'time',
        time: Math.floor(periode.temps_restant() / 1000)
    })
}

Auth.generateToken()

Deno.serve({
    hostname: '0.0.0.0',
    port: 80
}, async (req, info) => {
    const url = new URL(req.url)
    
    if(!(url.pathname in endpoints)) {
        return serveDir(req, {
            fsRoot: './dist/assets',
            urlRoot: 'assets/',
            quiet: true
        })
    }

    const headers = new Headers()
    const endpoint = endpoints[url.pathname]
    if(endpoint.protected) {
        const protection = await Auth.protect(req, url)
        switch(protection.type) {
            case 'forbidden':
                return protection.resp
            case 'signed':
                headers.set('Set-Cookie', protection.header)
                break;
        } 
    }
    const resp = await endpoints[url.pathname].handle(req, url, info)
    if(resp !== "next") {
        headers.forEach((value, key) => resp.headers.set(key, value))
        return resp
    }

    return new Response('Not Found', { status: 404 })
})