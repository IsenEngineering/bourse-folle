import { Endpoint } from "./mod.ts";

import { boissons, timer } from "../main.ts";
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
                    if(timer.etat === "demarre") {
                        live.send({
                            type: 'update',
                            annonce: boissons.annonce(),
                            historique: boissons.historique(),
                        })
    
                        live.send({
                            type: 'time',
                            time: Math.floor(timer.temps_restant() / 1000)
                        })
                    } else {
                        live.send({
                            type: 'etat',
                            etat: timer.etat
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