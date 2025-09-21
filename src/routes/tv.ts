import { Endpoint } from "./mod.ts";

import { boissons, periode } from "../main.ts";
import Live from "../controls/stream.ts";

export default [
    {
        route: '/api/tv',
        protected: false,
        handler() {
            const id = Math.floor(Math.random() * 10E6).toString(36)
            let live: Live
                    
            const stream = new ReadableStream({
                start(controller) {
                    live = new Live(id, controller)
                    if(periode.etat === "demarre") {
                        live.send({
                            type: 'update',
                            annonce: boissons.annonce(),
                            historique: boissons.historique(),
                        })
    
                        live.send({
                            type: 'time',
                            time: Math.floor(periode.temps_restant() / 1000)
                        })
                    } else {
                        live.send({
                            type: 'etat',
                            etat: periode.etat
                        })
                    }

                },
                cancel() {
                    live.close()
                },
            })
            
            return new Response(stream, {
                headers: {
                    'content-type': 'application/octet-stream',
                },
            })
        }
    }
] as Endpoint[]