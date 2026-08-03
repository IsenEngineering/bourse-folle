import { For } from "solid-js"
import { step_prix, step_ts } from "./steps"

type PolylineProps = {
    historique: { prix: number, ts: number }[],
    couleur: string,
    ts_min: number,
    ts_max: number,
    prix_min: number,
    prix_max: number
}

const RESOLUTION = 1000
const PADDING_X = 0.05
const PADDING_Y = 0.025

const normalize = (value: number, min: number, max: number) => {
    if (max <= min) return 0.5
    return (value - min) / (max - min)
}

const PolylineByHistorique = ({ historique, couleur, ts_min, ts_max, prix_min, prix_max }: PolylineProps) => {
    const path = historique.map(point => {
        const x = RESOLUTION * PADDING_X + normalize(point.ts, ts_min, ts_max) * RESOLUTION * (1 - PADDING_X)
        const y = normalize(prix_max - point.prix, 0, prix_max - prix_min) * RESOLUTION * (1 - PADDING_Y)

        return `${x},${y}`
    }).join(' ')

    return <polyline stroke-width={2} fill="none" stroke={couleur} stroke-linejoin="bevel" points={path}/>
}


interface Props {
    ressources: BourseFolle.Ressource[]
}

export default ({ ressources }: Props) => {
    const historique = ressources.flatMap(ressource => ressource.historique)
    const prixs = historique.flatMap(item => item.prix)
    const tss = historique.flatMap(item => item.ts)

    const TS_MAX = Math.max(...tss)
    const TS_MIN = Math.min(...tss)
    const PRIX_MAX = Math.max(...prixs)
    const PRIX_MIN = Math.min(...prixs)

    const indices_x = step_ts(TS_MIN, TS_MAX, 5).map(item => ({
        ...item,
        x: RESOLUTION * PADDING_X + normalize(item.x, TS_MIN, TS_MAX) * RESOLUTION - 2 * RESOLUTION * PADDING_X
    }))
    const indices_y = step_prix(PRIX_MIN, PRIX_MAX, 5).map(item => ({
        ...item,
        y: RESOLUTION * PADDING_Y + normalize(item.y, 0, PRIX_MAX - PRIX_MIN) * RESOLUTION - 2 * RESOLUTION * PADDING_Y 
    }))

    return <section class="h-full w-full min-h-0 p-3 flex flex-col lg:flex-row gap-1">
        <svg class="h-full w-full min-h-0" preserveAspectRatio="none" viewBox={`0 0 ${RESOLUTION} ${RESOLUTION}`}>
            <For each={ressources}>
                {(ressource) => <PolylineByHistorique
                    ts_min={TS_MIN}
                    ts_max={TS_MAX}
                    prix_min={PRIX_MIN}
                    prix_max={PRIX_MAX}
                    couleur={ressource.couleur}
                    historique={ressource.historique}
                />}
            </For>

            <line x1={RESOLUTION * PADDING_X} x2={RESOLUTION * PADDING_X} y1={RESOLUTION * (1 - PADDING_Y)} y2={RESOLUTION * PADDING_Y} stroke="#FFF2"/>
            <line x1={RESOLUTION * PADDING_X} x2={RESOLUTION  * (1 - PADDING_X)} y1={RESOLUTION * (1 - PADDING_Y)} y2={RESOLUTION * (1 - PADDING_Y)} stroke="#FFF2"/>
            
            <For each={indices_x}>
                {item => <text style={`translate: ${item.indice.length * 0.66}ch 0;`} fill="#FFF" font-size="12px" 
                x={item.x} y={RESOLUTION}>{item.indice}</text>}
            </For>
            <For each={indices_y}>
                {item => <text font-size="12px" style={`translate: ${-item.indice.length}ch 0`}
                    fill="#FFF" x={RESOLUTION * PADDING_X} y={item.y}>{item.indice}</text>}
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