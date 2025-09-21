import db from "../kv.ts"
import log from "../log.ts";
import { boissons } from "../main.ts";
import Live from "./stream.ts";

export default class Periode {
    periodes: number // numéro de la période
    dataset: string
    tick: number // durée des périodes
    etat: 'pause' | 'arret' | 'demarre' = 'arret' // état du chrono
    effet?: () => Promise<void> | void // action effctuée après une période

    private last_tick: number
    private interval?: number

    // duree en minutes
    constructor(duree: number) {
        this.dataset = Periode.newDataset()
        this.periodes = 0
        this.tick = duree * 1000 * 60
        this.last_tick = Date.now()

        this.setup()
    }

    static newDataset() {
        if(Deno.env.get('DEV') == 'true') {
            return 'dev'
        }

        const dataset = new Date().toLocaleString('fr-FR', {
            timeStyle: 'short',
            dateStyle: 'short'
        })
            .replaceAll('_', '-')
            .replaceAll('/', '-')
            .replaceAll(' ', '_')
            .trim()

        return dataset
    }

    private async setup() {
        const kv = await db(this.dataset)
        const periodes = await kv.get<number>(['periodes'])
        if(periodes.value) {
            this.periodes = periodes.value
        } else {
            await kv.set(['periodes'], 0)
        }

        const tick = await kv.get<number>(['tick'])
        if(tick.value) {
            this.tick = tick.value
        } else {
            await kv.set(['tick'], this.tick)
        }
    }

    private set_interval() {
        if(this.interval) clearInterval(this.interval)
            
        this.last_tick = Date.now()
        this.interval = setInterval(async () => {
            this.last_tick = Date.now()
            this.periodes++;
            log(`periode`, `Vague ${ this.periodes }`)

            const kv = await db(this.dataset)
            await kv.set(['periodes'], this.periodes)

            if(this.effet) {
                await this.effet()
            }
        }, this.tick)
    }

    // duree en minutes
    async modifier_tick(duree: number) {
        const kv = await db(this.dataset)
        
        this.tick = duree * 1000 * 60
        await kv.set(['tick'], this.tick)

        this.set_interval()

        Live.broadcast({
            type: 'update',
            annonce: boissons.annonce(),
            historique: boissons.historique(),
        })
        Live.broadcast({
            type: 'time',
            time: Math.floor(this.temps_restant() / 1000)
        })
    }

    démarrer() {
        this.etat = 'demarre'

        Live.broadcast({
            type: 'etat',
            etat: 'demarre'
        })
        this.set_interval()

        Live.broadcast({
            type: 'update',
            annonce: boissons.annonce(),
            historique: boissons.historique(),
        })
        Live.broadcast({
            type: 'time',
            time: Math.floor(this.temps_restant() / 1000)
        })

        log(`periode`, `Evenement démarré`)
    }
    
    pause() {
        if(this.interval) clearInterval(this.interval)
            this.etat = 'pause'
        Live.broadcast({
            type: 'etat',
            etat: 'pause'
        })
        log(`periode`, `Evenement en pause`)
    }
    async stop() {
        if(this.interval) clearInterval(this.interval)
            this.etat = 'arret'
        Live.broadcast({
            type: 'etat',
            etat: 'arret'
        })
        
        log(`periode`, `Fin evenement`)
        this.dataset = Periode.newDataset()
        await db(this.dataset)
    }

    temps_restant() {
        if(this.etat !== 'demarre') {
            return 0
        }

        const t = (this.tick + this.last_tick) - Date.now()

        if(Math.floor(t / 1000) > this.tick) {
            // vague -> periode
            log(`periode`, `Vague en retard`) 
        }

        return t
    }
}