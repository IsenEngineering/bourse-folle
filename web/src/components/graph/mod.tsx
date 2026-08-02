import { For } from "solid-js"

type PolylineProps = {
    historique: { prix: number, ts: number }[],
    couleur: string
}

const PolylineByHistorique = ({ historique, couleur }: PolylineProps) => {
    const path = historique.map((point, i) => [
        point.ts,
        point.prix
    ].join(',')).join(' ')

    return <polyline stroke-width={2} fill="none" stroke={couleur} stroke-linecap="round" stroke-linejoin="round" points={path}/>
}

interface Props {
    ressources: BourseFolle.Ressource[]
}

const PADDING = 50
export default ({ ressources }: Props) => {
    const historique = ressources.flatMap(ressource => ressource.historique)
    const prixs = historique.flatMap(item => item.prix)
    const tss = historique.flatMap(item => item.ts)

    const TS_MAX = Math.max(...tss)
    const TS_MIN = Math.min(...tss)
    const PRIX_MAX = Math.max(...prixs)
    const PRIX_MIN = Math.min(...prixs)

    const w = (TS_MAX - TS_MIN) + PADDING * 4
    const h = (PRIX_MAX - PRIX_MIN) + PADDING * 2

    return <section class="h-full p-3 flex flex-col lg:flex-row gap-1">
        <svg class="h-full w-full" preserveAspectRatio="none" viewBox={[
            TS_MIN - PADDING * 2,
            PRIX_MIN - PADDING,
            w,
            h
        ].join(' ')}>
            <For each={ressources}>
                {(ressource) => <PolylineByHistorique couleur={ressource.couleur} historique={ressource.historique} />}
            </For>
        </svg>
        <div class="flex flex-row lg:flex-col gap-4 gap-y-1 flex-wrap text-white p-3">
            <div class="flex flex-row gap-2 items-center select-none">
                <div class="w-2 h-2 lg:w-4 lg:h-4 bg-amber-500"/>
                <p class="text-xs lg:text-lg font-black">JBZZ</p>
            </div>
            <div class="flex flex-row gap-2 items-center select-none">
                <div class="w-2 h-2 lg:w-4 lg:h-4 bg-emerald-400"/>
                <p class="text-xs lg:text-lg font-black">STK</p>
            </div>
        </div>
    </section>
}