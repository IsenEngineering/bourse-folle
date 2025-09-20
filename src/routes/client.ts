import { Endpoint } from "./mod.ts";

import { boissons, timer } from "../main.ts";

export default [
    {
        protected: true,
        route: '/api/client/menu',
        async handler(req) {
            switch(req.method) {
                case 'GET': {
                    return new Response(
                        JSON.stringify(boissons.json()), 
                        {
                            headers: {
                                'content-type': 'application/json'
                            }
                        }
                    )
                }
                case 'POST': {
                    const body = await req.text()

                    boissons.vente(body)
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
                        intervalle: Math.floor(timer.tick / 1000)
                    })
                )

            } else if(req.method === 'POST') {
                const body = await req.json() as {
                    intervalle?: number,
                    appairage?: boolean,
                    boissons?: {
                        nom: string,
                        prix_min?: number,
                        prix_initial?: number,
                    }[]
                }
    
                if(body.intervalle) {
                    await timer.modifier_tick(body.intervalle)
                }
                if(body.appairage) {
                    // ?
                }
                if(body.boissons) {
                    for(const boisson of body.boissons) {
                        if(boissons.boisson_existante(boisson.nom)) {
                            await boissons.modifier_boisson(
                                boisson.nom, 
                                boisson.prix_min, 
                                boisson.prix_initial
                            )
                        } else if(boisson.prix_initial && boisson.prix_min) {
                            await boissons.ajouter_boisson(
                                boisson.nom,
                                boisson.prix_min, 
                                boisson.prix_initial
                            )
                        } else {
                            console.warn(
                                `[routes/client.ts] cas non traité (POST /api/client/config)`
                            )
                        }
                    }
                }
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
                const body = await req.json() as {
                    etat: 'pause' | 'arret' | 'demarrer'
                }
                switch(body.etat) {
                    case 'arret':
                        // ...
                    case 'pause':
                        // ....
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