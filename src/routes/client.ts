import { Endpoint } from "./mod.ts";

import { getAll } from "./recaps.ts";
import { boissons, periode } from "../main.ts";
import Live from "../controls/stream.ts";
import log from "../log.ts";
import kv from "../kv.ts";

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
                const db = await kv(periode.dataset)

                const k = await db.get<number>(['k'])
                return new Response(
                    JSON.stringify({
                        k: k.value || 5,
                        intervalle: Math.floor(periode.tick / 1000 / 60),
                        boissons: boissons.json()
                    })
                )
            } else if(req.method === 'POST') {
                const body = await req.json() as {
                    k?: number
                    intervalle?: number,
                    boissons?: {
                        nom: string,
                        prix_min?: number,
                        prix_initial?: number,
                    }[],
                    boissons_supprimees?: string[]
                }
    
                if(body.intervalle) {
                    await periode.modifier_tick(body.intervalle)
                    log(`client`, `durée de période modifée à ${ 
                        Math.floor(periode.tick / 1000 / 60) 
                    }min `)
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
                if(body.k && typeof body.k == 'number') {
                    const db = await kv(periode.dataset)

                    await db.set(['k'], body.k)
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
                        await periode.stop()
                        break;
                    case 'pause':
                        periode.pause()
                        break;
                    case 'demarrer':
                        await periode.démarrer()
                        break;
                }

                return new Response('ok')
            } else if(req.method === 'GET') {
                return new Response(JSON.stringify(
                    await getAll()
                ))
            }

            return new Response('Bad Request', {
                status: 400
            })
        }
    }
] as Endpoint[]