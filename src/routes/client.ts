import { Endpoint } from "./mod.ts";

import { boissons, timer } from "../main.ts";
import Live from "../controls/stream.ts";

export default [
    {
        protected: true,
        route: '/api/client/menu',
        async handler(req) {
            switch(req.method) {
                case 'GET': {
                    return new Response(
                        JSON.stringify(boissons.json())
                    )
                }
                case 'POST': {
                    const body = await req.text()

                    boissons.vente(body)
                    Live.broadcast({
                        type: 'vente',
                        boisson: body,
                        ventes: boissons.get(body).ventes
                    })
                    return new Response('ok')
                }
            }
            return new Response('Bad Request', {
                status: 400
            })
        }
    },
    {
        protected: true,
        route: '/api/client/config',
        async handler(req) {
            if(req.method === 'GET') {
                return new Response(
                    JSON.stringify({
                        intervalle: Math.floor(timer.tick / 1000 / 60),
                        boissons: boissons.json()
                    })
                )
            } else if(req.method === 'POST') {
                const body = await req.json() as {
                    intervalle?: number,
                    boissons?: {
                        nom: string,
                        prix_min?: number,
                        prix_initial?: number,
                    }[],
                    boissons_supprimees?: string[]
                }
    
                if(body.intervalle) {
                    await timer.modifier_tick(body.intervalle)
                    console.log(`[client.ts] durée de période modifée à ${ Math.floor(timer.tick / 1000 / 60) }min `)
                }
                if(body.boissons) {
                    for(const boisson of body.boissons) {
                        if(boissons.exists(boisson.nom)) {
                            await boissons.modify(
                                boisson.nom, 
                                boisson.prix_min, 
                                boisson.prix_initial
                            )
                        } else if(boisson.prix_initial && boisson.prix_min) {
                            await boissons.add(
                                boisson.nom,
                                boisson.prix_min, 
                                boisson.prix_initial
                            )
                        } else {
                            console.warn(
                                `[client.ts] cas non traité`
                            )
                        }
                    }
                }
                if(body.boissons_supprimees) {
                    for(const boisson of body.boissons_supprimees) {
                        await boissons.delete(boisson)
                    }
                }
                return new Response('ok')
            }
            return new Response('Bad Request', { 
                status: 400 
            })
        }
    },
    {
        protected: true,
        route: '/api/client/event',
        async handler(req) {
            if(req.method === 'POST') {
                const body = await req.text() as 'pause' | 'arret' | 'demarrer'
                switch(body) {
                    case 'arret':
                        // ...
                    case 'pause':
                        timer.pause()
                        break;
                    case 'demarrer':
                        timer.démarrer()
                        break;
                }

                return new Response('ok')
            }

            return new Response('Bad Request', {
                status: 400
            })
        }
    }
] as Endpoint[]