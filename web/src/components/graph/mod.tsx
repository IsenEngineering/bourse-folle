import { defineChart, lineY } from "@tanstack/charts"
import { Chart } from "@tanstack/charts/solid"
import { createMemo, createSignal, onMount, useContext } from "solid-js"
import { RessourcesCtx } from "../../routes"
import { scalePoint } from "@tanstack/charts/scales/point"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"

export default () => {
    const ctx = useContext(RessourcesCtx)
    if(!ctx) return <section class="h-full w-full flex justify-center items-center text-white 
        text-2xl font-black animate-pulse">
        <div class="w-10 h-10 border-4 border-white animate-spin"/>
    </section>

    const [ressources, _] = ctx
    const [height, setHeight] = createSignal(320)

    onMount(() => {
        const parent = document.getElementById('main-graph') as HTMLElement
        if(!parent) return
        setHeight(parent.getBoundingClientRect().height || 320)

        const resizeObserver = new ResizeObserver(entries => entries.forEach(entry => {
            if(entry.target.id != 'main-graph') return
        
            setHeight(entry.contentRect.height)
        }))

        resizeObserver.observe(parent)
    })

    const data = createMemo(() => {
        const t = Date.now()

        return defineChart({
            tooltip,
            marks: ressources.map(ressource => lineY(ressource.historique.map(point => ({
                prix: point.prix,
                ts: Math.floor((t - point.ts) / 100) / 10 // miliseconde / 1000 = seconde mais on veut une précision à 1/10
            })), {
                id: ressource.nom,
                x: 'ts',
                y: 'prix',
                points: window.innerWidth > 900,
                stroke: ressource.couleur,
            })),
            x: {
                scale: () => scalePoint<string>().padding(0.2),
                grid: true,
                axis: { label: "Temps (s)" }
            },
            y: {
                scale: scaleLinear,
                nice: true,
                grid: true,
                axis: { label: "Prix (€)" }
            },
            margin: {
                left: 48,
                bottom: 48
            },
            theme: {
                foreground: "#FFF",
                grid: "#FFF8",
                muted: "#FFF"
            }
        })
    })

    return <Chart
        height={height()}
        definition={data()}
        ariaLabel="Graphique du prix des boissons en fonction du temps"/>
}