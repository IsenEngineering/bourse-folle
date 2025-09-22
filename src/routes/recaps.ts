import { Boisson } from "../controls/boissons.ts";
import kv from "../kv.ts";
import { Endpoint } from "./mod.ts";

export const getAll = async (): Promise<string[]> => {
    const datasets = await Array.fromAsync(Deno.readDir('./data'))

    return datasets
        .filter(entry => entry.isFile && entry.name.endsWith('.db'))
        .map(entry => entry.name.slice(0, -3))
}

export const get = async (dataset: string) => {
    const datasets = (await Array.fromAsync(
        Deno.readDir('./data')
    )).map(entry => entry.name.slice(0, -3))

    if(!dataset || !datasets.includes(dataset)) return null

    const db = await kv(dataset)
    const boissons = await Array.fromAsync(
        db.list<Boisson>({
            prefix: ['boissons']
        })
    )

    for(const i in boissons) {
        const nom = boissons[i].key.at(1) as string
        const historique = await db.get<[number, number][]>(['historiques', nom])
        if(!historique.value) continue;
        boissons[i].value.historique = historique.value
    }

    const [ouverture, fermeture] = await db.getMany<[number, number]>([["ouverture"], ["fermeture"]])
    
    return {
        boissons: boissons
            .map(({ key, value}) => ({
                prix_initial: value.prix_initial,
                prix_min: value.prix_min,
                nom: key.at(1) as string,
                historique: value.historique.map((h, i) => ({
                    periode: i + 1,
                    prix: h[0],
                    ventes: h[1]
                }))
            })),
        ouverture: new Date(ouverture.value || 0).toLocaleString('fr-FR'),
        fermeture: new Date(fermeture.value || 0).toLocaleString('fr-FR')
    }
}

export default [
    {
        route: '/api/recaps',
        protected: true,
        async handler() {
            return new Response(JSON.stringify({
                datasets: await getAll()
            }))
        }
    },
    {
        route: '/api/recaps/data',
        protected: true,
        async handler(_, url) {
            const dataset = url.searchParams.get('dataset')

            const response = dataset === null ? null : await get(dataset)

            if(response) {
                return new Response(JSON.stringify(response, undefined, 4))
            } else {
                return new Response('Bad Request', {
                    status: 400
                })
            }
        }
    }
] as Endpoint[]