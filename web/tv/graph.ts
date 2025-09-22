import { fnv1aHash } from "../utils/hash.ts"

const GRAPH_MAX = 25 // euros
const GRAPH_MIN = 3 // euros
const width = window.innerWidth
const height = window.innerWidth < 768 ? window.innerHeight * 0.4 : Math.floor(window.innerHeight / 8 * 7)

type Point = [number, number]
type Records = Record<string, [Point[], string]>

const svg = (
    width: number,
    height: number,
    records: Records,
) => {
    // L -> Line to, M -> Move to, z -> close line to first point
    const paths = Object.entries(records).map(([id, [points, color]]) => {
        const path = points.map(([x, y]) => `L${x} ${height - y}`).join(' ') + ' z'
        return `<path stroke="${ color }" stroke-width="4"
            d="M${ path.slice(1) }" fill="url(#grad-${ id })"/>`
    })

    const grads = Object.entries(records).map(([id, [_, color]]) => {
        return `<linearGradient id="grad-${ id }" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="hsla(from ${ color } h s l / 0.5)" />
            <stop offset="100%" stop-color="hsla(from ${ color } h s l / 0)" />
        </linearGradient>`
    })

    return `<svg width="${width}" height="${height}" viewport="0 0 ${width} ${height}">
        ${ paths.join('\n') }
        <defs>
            ${ grads }
        </defs>
    </svg>`
}

// donne une valeur entre 0.15 et 1.00 (affichage sur le graphique)
const prixPourHistorique = (prix: number, max: number = GRAPH_MAX, min: number = GRAPH_MIN) => {
        const prix_bornee = Math.max(
            Math.min(
                max + 3,
                prix 
            ),
            min - 3
        )
        const t = Math.round(prix_bornee / (max + 3) * 100) / 100
        return t
    }

const historiqueToPoints = (prix: number[], max: number = GRAPH_MAX, min: number = GRAPH_MIN): Point[] => {
    const historique = prix.map(p => prixPourHistorique(p, max, min))
    const points: [number, number][] = [
        [ 0, Math.floor(historique[0] * height) ]
    ]

    const n = historique.length
    if(n === 1) {
        points.push([width, Math.floor(historique[0] * height)])
    }
    for(let i = 1; i < n; i++) {
        const point = historique[i]
        points.push(
            [
                Math.floor(i * width / (n - 1)),
                Math.floor(point * height)
            ]
        )
    }

    points.push(
        [width + 10, - 10],
        [-10, -10]
    )

    return points
}

const compute = (records: [string, number, number, number[]][]): Records => {
    const computed: Records = {}
    let max = records[0][3][0]
    let min = records[0][3][0]

    records.forEach(record => {
        const max_local = Math.max(...record[3])
        const min_local = Math.min(...record[3])

        if(max < max_local) {
            max = max_local
        }
        if(min > min_local) {
            min = min_local
        }
    })

    for(const record of records) {
        const boisson = record[0]
        // chaque boisson a une unique couleur
        const h = fnv1aHash(boisson) 

        computed[boisson] = [
            historiqueToPoints(record[3], max, min),
            `hsl(${ h }deg 75% 50%)`
        ]
    }

    return computed
}

export default (records: [string, number, number, number[]][]) => {
    const graph = document.getElementById('graph') as HTMLDivElement

    const computed_records = compute(records)

    const computed = svg(width, height, computed_records)

    graph.innerHTML = computed
}