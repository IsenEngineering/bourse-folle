import db from "../kv.ts"

interface Boisson {
    prix_initial: number,
    prix_min: number,
    historique: number[],
    dernier_prix: number,
    ventes: number
}

export default class Boissons {
    private list: Record<string, Boisson> = {}
    
    constructor() {
        this.setup()
    }

    private async setup() {
        const kv = await db()

        for await (const boisson of kv.list<Boisson>({ prefix: ['boissons'] })) {
            const nom = boisson.key.at(1) as string
            this.list[nom] = boisson.value
            const historique = await kv.get<number[]>([
                'historiques', nom
            ])
            if(!historique.value) continue;

            this.list[nom].historique = historique.value
        }

        console.info(`[boissons.ts] Boissons syncronisées avec la BDD`)
    }

    get(boisson: string) {
        return this.list[boisson] || null
    }

    async add(nom: string, prix_min: number, prix_initial: number) {
        if(nom in this.list) {
            return "la boisson existe déjà"
        }

        this.list[nom] = {
            prix_initial: prix_initial,
            prix_min: prix_min,
            historique: [ prix_initial ],
            dernier_prix: prix_initial,
            ventes: 0
        }

        const kv = await db()
        kv.set(['boissons', nom], this.list[nom])
        kv.set(['historiques', nom], this.list[nom].historique)

        console.info(`[boissons.ts] Nouvelle boisson ajoutée (${ nom })`)
        return "ok"
    }

    exists(nom: string) {
        return (nom in this.list)
    }

    async delete(nom: string) {
        if(!(nom in this.list)) 
            return "la boisson n'existe pas"
        
        delete this.list[nom]
        const kv = await db()
        kv.delete(['boissons', nom])
        kv.delete(['historiques', nom])

        console.info(`[boissons.ts] Boisson supprimée (${ nom })`)
        return "ok"
    }

    async modify(nom: string, prix_min?: number, prix_initial?: number) {
        if(!(nom in this.list)) {
            return "la boisson n'existe pas"
        }

        if(prix_min) {
            this.list[nom].prix_min = prix_min
            this.list[nom].dernier_prix = Math.max(this.list[nom].dernier_prix, prix_min)
        }
        if(prix_initial) {
            this.list[nom].prix_initial = prix_initial
            if(this.list[nom].historique.length === 1) {
                this.list[nom].historique = [ 
                    this.list[nom].prix_initial
                ]
                this.list[nom].dernier_prix = prix_initial
            }
        }

        const kv = await db()
        kv.set(['boissons', nom], this.list[nom])
        kv.set(['historiques', nom], this.list[nom].historique)

        console.info(`[boissons.ts] Boisson modifiée (${ nom })`)

        return "ok"
    }

    private count_latest?: number
    private count_set: Set<string> = new Set()
    vente(boisson: string) {
        if(!(boisson in this.list)) {
            return
        }

        this.list[boisson].ventes++
        
        const t = Date.now()
        this.count_set.add(boisson)
        this.count_latest = t

        setTimeout(async () => {
            if(this.count_latest !== t) {
                return
            }
            const kv = await db()
            this.count_set.forEach(async boisson => {
                await kv.set(['boissons', boisson], this.list[boisson])
            })

            this.count_set.clear()
            this.count_latest = undefined
        }, 1000)
    }

    // Nouvelle période, le prix de chaque boisson est mis à jours
    async nouvelle_periode(boissons: Record<string, number>) {
        const kv = await db()

        Object.keys(this.list).forEach(async boisson => {
            if(!(boisson in boissons)) {
                this.list[boisson].historique.push(
                    this.list[boisson].dernier_prix
                )
            } else {
                const computed = Math.round(boissons[boisson] * 10) / 10
                this.list[boisson].dernier_prix = computed
                this.list[boisson].historique.push(computed)
            }
            

            await kv.set(['boissons', boisson], this.list[boisson])
            await kv.set(['historiques', boisson], this.list[boisson].historique)
        })
    }

    annonce() {
        return Object.entries(this.list)
            .map(([nom, boisson]) => `${ nom } ${ boisson.dernier_prix }€ - `)
            .join('').slice(0, -2)
    }
    
    json() {
        return Object.entries(this.list)
            .map(([nom, boisson]) => ({
                boisson: nom,
                prix: boisson.dernier_prix,
                ventes: boisson.ventes,
                prix_min: boisson.prix_min,
                prix_initial: boisson.prix_initial
            }))
    }

    historique(): [string, number, number, number[]][] {
        return Object.entries(this.list)
            .map(([nom, boisson]) => [
                nom,
                boisson.dernier_prix,
                boisson.ventes,
                boisson.historique.slice(-6)
            ])
    }
}