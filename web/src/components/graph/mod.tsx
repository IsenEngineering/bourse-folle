import { Accessor, createMemo, For, useContext } from "solid-js"
import { step_prix, step_ts } from "./steps"
import { RessourcesCtx } from "../../routes"

type PolylineProps = {
    historique: { prix: number, ts: number }[],
    couleur: string,
    consts: Accessor<{
        TS_MAX: number;
        TS_MIN: number;
        PRIX_MAX: number;
        PRIX_MIN: number;
    }>
}

const RESOLUTION = 1000
const PADDING_X = 0.0
const PADDING_Y = 0.0

const normalize = (value: number, min: number, max: number) => {
    if (max <= min) return 0.5
    return (value - min) / (max - min)
}

const PolylineByHistorique = ({ historique, couleur, consts }: PolylineProps) => {
    const path = createMemo(() => historique.map(point => {
        const x = RESOLUTION * PADDING_X + normalize(point.ts, consts().TS_MIN, consts().TS_MAX) * RESOLUTION * (1 - PADDING_X)
        const y = normalize(consts().PRIX_MAX - point.prix, 0, consts().PRIX_MAX - consts().PRIX_MIN) * RESOLUTION * (1 - PADDING_Y)

        return `${x},${y}`
    }).join(' '))

    return <polyline stroke-width={2} fill="none" stroke={couleur} stroke-linejoin="bevel" points={path()}/>
}

export default () => {
    const ctx = useContext(RessourcesCtx)
    if(!ctx) return <section class="h-full w-full flex justify-center items-center 
        text-2xl font-black animate-pulse">
        loading
    </section>

    const [ressources, _] = ctx

    const consts = createMemo(() => {
        const historique = ressources.flatMap(ressource => ressource.historique)
        const prixs = historique.flatMap(item => item.prix)
        const tss = historique.flatMap(item => item.ts)

        return {
            TS_MAX: Math.max(...tss),
            TS_MIN: Math.min(...tss),
            PRIX_MAX: Math.max(...prixs),
            PRIX_MIN: Math.min(...prixs)
        }
    })

    // const indices_x = step_ts(TS_MIN, TS_MAX, 5).map(item => ({
    //     ...item,
    //     x: RESOLUTION * PADDING_X + normalize(item.x, TS_MIN, TS_MAX) * RESOLUTION - 2 * RESOLUTION * PADDING_X
    // }))
    // const indices_y = step_prix(PRIX_MIN, PRIX_MAX, 5).map(item => ({
    //     ...item,
    //     y: RESOLUTION * PADDING_Y + normalize(item.y, 0, PRIX_MAX - PRIX_MIN) * RESOLUTION - 2 * RESOLUTION * PADDING_Y 
    // }))

    return <section class="h-full w-full min-h-0 p-3 flex flex-col lg:flex-row gap-1">
        <svg class="h-full w-full min-h-0" preserveAspectRatio="none" viewBox={`0 0 ${RESOLUTION} ${RESOLUTION}`}>
            <For each={ressources}>
                {(ressource) => <PolylineByHistorique
                    consts={consts}
                    couleur={ressource.couleur}
                    historique={ressource.historique}
                />}
            </For>

            <line x1={RESOLUTION * PADDING_X}       x2={RESOLUTION * PADDING_X} stroke-width={2}
                  y1={RESOLUTION * (1 - PADDING_Y)} y2={RESOLUTION * -PADDING_Y} stroke="#FFF2"/>
            <line x1={RESOLUTION * PADDING_X}       x2={RESOLUTION  * (1 + PADDING_X)} stroke-width={2} 
                  y1={RESOLUTION * (1 - PADDING_Y)} y2={RESOLUTION * (1 - PADDING_Y)} stroke="#FFF2"/>
{/*             
            <For each={indices_x}>
                {item => (
                    <g>
                        <line
                            x1={item.x} x2={item.x}
                            y1={RESOLUTION * (1 - PADDING_Y)} y2={RESOLUTION * PADDING_Y}
                            stroke="#FFF1" stroke-width={1}
                            vector-effect="non-scaling-stroke"
                        />
                        <text
                            x={item.x + 4}
                            y={RESOLUTION * (1 - PADDING_Y) + 16}
                            fill="#FFF8"
                            font-size={14}
                        >
                            {item.indice}
                        </text>
                    </g>
                )}
            </For>
            <For each={indices_y}>
                {item => (
                    <g>
                        <line
                            x1={RESOLUTION * PADDING_X} x2={RESOLUTION * (1 - PADDING_X)}
                            y1={item.y} y2={item.y}
                            stroke="#FFF1" stroke-width={1}
                            vector-effect="non-scaling-stroke"
                        />
                        <text
                            x={4}
                            y={item.y - 4}
                            fill="#FFF8"
                            font-size={14}>
                            {item.indice}
                        </text>
                    </g>
                )}
            </For> */}
        </svg>
        <div class="flex flex-row lg:flex-col gap-4 gap-y-1 flex-wrap text-white p-3">
            <For each={ressources}>
                {(ressource) => <div class="flex flex-row gap-2 items-center select-none">
                    <div class="w-2 h-2 lg:w-4 lg:h-4" style={`background: ${ressource.couleur};`}/>
                    <p class="text-xs lg:text-lg font-black">{ressource.code}</p>
                </div>}
            </For>
        </div>
    </section>
}