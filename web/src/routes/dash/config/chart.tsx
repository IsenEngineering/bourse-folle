interface SimulationProps {
    force: Accessor<number>,
    interval: Accessor<number>,
    prix: {
        initial: number;
        min: number;
        max: number;
    },
    duree: Accessor<number>,
    volatilite: Accessor<number>
}

import { defineChart, lineY } from "@tanstack/charts"
import { Chart } from "@tanstack/charts/solid"
import { Accessor, createMemo, createSignal, onMount } from "solid-js"
import { scalePoint } from "@tanstack/charts/scales/point"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
// Courbe exponentielle normalisée : 0 en x=0, 1 en x=1, avec courbure k
const courbe = (x: number, k: number) => {
    if (k === 0) return x;
    return (Math.exp(k * x) - 1) / (Math.exp(k) - 1);
}

const u = (p: SimulationProps & { prix_precedent: number, demande: number }) => {
    // 0 <= demande <= 1
    const force = p.force();
    const volatilite = p.volatilite();
    const intervalHeures = p.interval() / 15;

    // k élevé = courbure marquée, même sur peu de points
    const k = 8;

    const courbeHausse = courbe(p.demande, k);
    const courbeBaisse = courbe(1 - p.demande, k);

    const tauxHausse = (force * courbeHausse) / 100;
    const tauxBaisse = (volatilite * courbeBaisse) / 100;

    const tauxNet = tauxHausse - tauxBaisse;
    const prix = p.prix_precedent * Math.pow(Math.exp(tauxNet * intervalHeures), 5);

    return Math.max(p.prix.min, Math.min(p.prix.max, prix));
}
   
// const f = (t: number, demande: number, p0: number, force: number, volatilite: number) => 
//     p0 * Math.exp(force * demande - volatilite * t)

function generationPoints(p: SimulationProps) {
    const nb = Math.ceil(p.duree() / p.interval())

    const generation = (demande: () => number) => {
        const points: { prix: number, t: number }[] = new Array(nb).fill({ prix: 0, t: 0 })
        for(let i = 0; i < nb; i++) {
            const prix_precedent = i === 0 ? p.prix.initial : points[i - 1].prix
            
            points[i] = {
                prix: u({
                    ...p,
                    demande: demande(),
                    prix_precedent
                }),
                t: i * p.interval()
            }
        }

        return points
    }

    return {
        demande_aleatoire: generation(() => Math.random()),
        demande_superieur: generation(() => 0.66 + Math.random() * 0.33),
        demande_inferieur: generation(() => Math.random() * 0.33),
        demande_constante: generation(() => 1),
        demande_nulle: generation(() => 0)
    }
}

export default (props: SimulationProps) => {
    const [height, setHeight] = createSignal(320)
    
    onMount(() => {
        const parent = document.getElementById('simulation-graph') as HTMLElement
        if(!parent) return
        setHeight(parent.getBoundingClientRect().height || 320)
        
        const resizeObserver = new ResizeObserver(entries => entries.forEach(entry => {
            if(entry.target.id != 'simulation-graph') return
            
            setHeight(entry.contentRect.height)
        }))
        
        resizeObserver.observe(parent)
    })
    
    const data = createMemo(() => {
        const points = generationPoints(props)
        return defineChart({
            tooltip: {
                use: tooltip,
                ...{
                    format(point) {
                        return `${point.groupLabel} ${Math.ceil(point.yValue * 100) / 100}€`   
                    }
                }
            },
            marks: [
                lineY(points.demande_aleatoire, {
                    id: "Demande aléatoire",
                    x: 't',
                    y: 'prix',
                    points: window.innerWidth > 900,
                    stroke: "rgb(255, 255, 255)",
                }),
                lineY(points.demande_superieur, {
                    id: "Demande supérieur",
                    x: 't',
                    y: 'prix',
                    points: window.innerWidth > 900,
                    stroke: "rgb(200, 55, 55)",
                }),
                lineY(points.demande_inferieur, {
                    id: "Demande inférieur",
                    x: 't',
                    y: 'prix',
                    points: window.innerWidth > 900,
                    stroke: "rgb(55, 100, 55)",
                }),
                lineY(points.demande_constante, {
                    id: "Demande constante",
                    x: 't',
                    y: 'prix',
                    points: window.innerWidth > 900,
                    stroke: "rgb(255, 0, 0)",
                }),
                lineY(points.demande_nulle, {
                    id: "Demande nulle",
                    x: 't',
                    y: 'prix',
                    points: window.innerWidth > 900,
                    stroke: "rgb(0, 255, 0)",
                }),
            ],
            x: {
                scale: () => scalePoint<string>().padding(0.2),
                grid: true,
                axis: { label: "Temps (min)" }
            },
            y: {
                scale: scaleLinear,
                nice: true,
                grid: true,
                axis: { label: "Prix (€)" }
            },
            margin: 48,
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
        ariaLabel="Simulation du prix des boissons en fonction du temps"/>
}