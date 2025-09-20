import Boissons from "./controls/boissons.ts";
import Live from "./controls/stream.ts";
import Periodification from "./controls/timer.ts";
import endpoints from "./routes/mod.ts"
import { serveDir } from "@std/http/file-server"

export const boissons = new Boissons()
export const timer = new Periodification(0.25)

await Promise.all([
    await boissons.ajouter_boisson("TGV", 9, 14),
    await boissons.ajouter_boisson("JAEGERBOMB", 7, 10),
    await boissons.ajouter_boisson("DIABOLO", 3, 5),
    await boissons.ajouter_boisson("A", 12, 20),
    await boissons.ajouter_boisson("B", 12, 15),
    await boissons.ajouter_boisson("C", 12, 15),
    await boissons.ajouter_boisson("D", 12, 15),
])

timer.callback = async () => {
    // gérer l'évolution des prix
    await boissons.nouvelle_periode({
        "TGV": Math.floor(Math.random() * 20),
        "JAEGERBOMB": Math.floor(Math.random() * 20),
        "DIABOLO": Math.floor(Math.random() * 20),
        "A": Math.floor(Math.random() * 20),
        "B": Math.floor(Math.random() * 20),
        "C": Math.floor(Math.random() * 20),
        "D": Math.floor(Math.random() * 20),
    })

    Live.broadcast({
        type: 'update',
        annonce: boissons.annonce(),
        historique: boissons.historique(),
    })
    Live.broadcast({
        type: 'time',
        time: Math.floor(timer.temps_avant_maj() / 1000)
    })
}

timer.démarrer()

Deno.serve({
    hostname: '0.0.0.0',
    port: 80
}, async (req, info) => {
    const url = new URL(req.url)

    if(url.pathname in endpoints) {
        const endpoint = endpoints[url.pathname]
        if(endpoint.protected) {
            // auth logic
        }
        const resp = await endpoints[url.pathname].handle(req, url, info)
        if(resp !== "next") return resp
    }
    
    return serveDir(req, {
        fsRoot: './dist',
    })
})