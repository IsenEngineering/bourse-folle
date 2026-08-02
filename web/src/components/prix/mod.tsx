import { For } from "solid-js"
import placeholder from "./placeholder.json"

export const PRIX_PLACEHOLDER = placeholder.ressources.map(r => ({
    ...r,
    historique: r.historique.map((h, i) => ({
        ...h,
        ts: i * 100
    }))
})) satisfies BourseFolle.Ressource[]

export interface Props {
    ressources: BourseFolle.Ressource[]
}

type PerformanceProps = {
    historique: { prix: number, ts: number }[],
    variation: number
}

export const PerformancePolyline = ({ historique, variation }: PerformanceProps) => {
    const pts = historique.map(point => point.prix)
    const min = Math.min(...pts)
    const max = Math.max(...pts)

    const path = pts.map((point, i) => [
        ((i / (pts.length - 1)) * 150).toPrecision(4), 
        ((point - min) / (max - min) * 25).toPrecision(4)
    ].join(',')).join(' ')

    return <svg viewBox={`0 0 150 25`} preserveAspectRatio="none" class="col-span-1 lg:col-span-3 w-full h-6">
        <polyline stroke-width={2} fill="none" stroke-linejoin="bevel"
            class={variation > 0 ? 'stroke-red-500' : 'stroke-green-500'}
            points={path}/>
    </svg>
}

export default ({ ressources }: Props) => <section class="h-full w-full p-3 flex flex-col gap-1 text-white">
    <div class="grid grid-cols-8 lg:grid-cols-12 items-center gap-1 w-full text-xs lg:text-sm mb-2 text-gray-500">
        <p class="text-xs font-black">CODE</p>            
        <p class="col-span-4 font-semibold truncate">Nom de la ressource</p>            
        <p class="col-span-2">Prix</p>            
        <p class="col-span-2 hidden lg:block">Variation</p>            
        <div class="col-span-1 lg:col-span-3 w-full truncate">Performance</div>            
    </div>
    <For 
        each={ressources} 
        fallback={
            <div class="text-gray-500 text-sm font-black animate-pulse w-full h-full flex justify-center items-center">
                Aucune ressource
            </div>
        }>
        {ressource => <div class="grid grid-cols-8 lg:grid-cols-12 items-center gap-1 w-full text-sm">
            <p class="text-xs font-black">{ressource.code}</p>            
            <p class="col-span-4 font-semibold">{ressource.nom}</p>            
            <p class="col-span-2">{ressource.prix}€</p>            
            <p class={"col-span-2 hidden lg:block " + (ressource.variation > 0 ? 'text-red-500' : 'text-green-500')}>
                {ressource.variation > 0 ? ('+' + ressource.variation) : ressource.variation}€
            </p>
            <PerformancePolyline historique={ressource.historique} variation={ressource.variation}/>
        </div>}
    </For>
</section>