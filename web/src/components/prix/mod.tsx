import { For, useContext } from "solid-js"
import { RessourcesCtx } from "../../routes"
import resourceColor from "../resource-color"

export interface Props {
    ressources: BourseFolle.Resource[]
}

type PerformanceProps = {
    historique: [number, number][],
    variation: number
}

export const PerformancePolyline = ({ historique, variation }: PerformanceProps) => {
	const pts = historique.map(p => p[1])
	const min = Math.min(...pts)
    const max = Math.max(...pts)

    const path = pts.map((point, i) => [
        (((pts.length - 1 - i) / (pts.length - 1)) * 150).toPrecision(4),
        (25 - (point - min) / (max - min) * 25).toPrecision(4)
    ].join(',')).join(' ')

    return <svg viewBox={`0 0 150 25`} preserveAspectRatio="none" class="col-span-2 lg:col-span-3 w-full h-6">
        <polyline stroke-width={2} fill="none" stroke-linejoin="bevel"
            class={variation > 0 ? 'stroke-red-500' : 'stroke-green-500'}
            points={path}/>
    </svg>
}

export default () => {
    const ctx = useContext(RessourcesCtx)
    if(!ctx) return <section class="h-full w-full flex justify-center items-center text-white
        text-2xl font-black animate-pulse">
        <div class="w-10 h-10 border-4 border-white animate-spin"/>
    </section>

    const [ressources, _] = ctx

    return <section class="h-full w-full p-3 flex flex-col gap-1 text-white">
        <div class="grid grid-cols-7 lg:grid-cols-8 items-center gap-1 w-full text-xs lg:text-sm text-gray-500">
            <p class="text-xs font-black px-1 py-0.5">CODE</p>
            <p class="col-span-2 font-semibold truncate">Nom de la ressource</p>
            <p class="col-span-1">Prix</p>
            <p class="col-span-1">Variation</p>
            <div class="col-span-2 lg:col-span-3 w-full truncate">Performance</div>
        </div>
        <For
            each={ressources}
            fallback={
                <div class="text-gray-500 text-sm font-black animate-pulse w-full h-full flex justify-center items-center">
                    Aucune ressource
                </div>
            }>
            {ressource => <div class="grid grid-cols-7 lg:grid-cols-8 items-center gap-1 w-full text-xs sm:text-sm">
                <p class="text-xs font-black bg-white/10 px-1 py-0.5 w-fit rounded" style={`color: ${ resourceColor(ressource.id) };`}>{ressource.id}</p>
                <p class="col-span-2 font-semibold">{ressource.name}</p>
                <p class="col-span-1">{Math.ceil(ressource.price * 100) / 100}€</p>
                <p class={"col-span-1 " + (ressource.var > 0 ? 'text-red-500' : 'text-green-500')}>
                    {(ressource.var > 0 ? '+' : '') + Math.floor(ressource.var * 100) / 100}€
                </p>
                <PerformancePolyline historique={ressource.historic} variation={ressource.var}/>
            </div>}
        </For>
    </section>
}
