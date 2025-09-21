import Boissons from "./controls/boissons.ts";
import Live from "./controls/stream.ts";
import Periode from "./controls/periode.ts";
import Auth from "./controls/auth.ts";
import endpoints from "./routes/mod.ts"
import { serveDir } from "@std/http/file-server"

export const periode = new Periode(1)
export const boissons = new Boissons()

await Promise.all([
    await boissons.add("TGV", 9, 14),
    await boissons.add("JAEGERBOMB", 7, 10),
    await boissons.add("DIABOLO", 3, 5),
    await boissons.add("A", 12, 20),
    await boissons.add("B", 12, 15),
    await boissons.add("C", 12, 15),
])

periode.effet = async () => {
    // gérer l'évolution des prix
    await boissons.nouvelle_periode({
        "TGV": Math.floor(Math.random() * 20),
        "JAEGERBOMB": Math.floor(Math.random() * 20),
        "DIABOLO": Math.floor(Math.random() * 20),
        "A": Math.floor(Math.random() * 20),
        "B": Math.floor(Math.random() * 20),
        "C": Math.floor(Math.random() * 20),
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
    
    if(url.pathname in endpoints) {
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
    }
    
    return serveDir(req, {
        fsRoot: './dist/assets',
        urlRoot: 'assets/',
        quiet: true
    })
})