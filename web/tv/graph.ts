const width = window.innerWidth
// const height = window.innerHeight
const height = Math.floor(window.innerHeight / 8 * 7)

type Point = [number, number]
const rand = (max: number, min: number) =>
    min + Math.floor(Math.random() * (max - min))
export const points: Point[] = []

const svg = (
    width: number,
    height: number,
    records: Record<string, [[number, number][], `#${string}`]>,
) => {
    // L -> Line to, M -> Move to, z -> close line to first point
    const paths = Object.entries(records).map(([id, [points, color]]) => {
        const path = points.map(([x, y]) => `L${x} ${height - y}`).join(' ') + ' z'
        return `<path stroke="${ color }" stroke-width="2"
            d="M${ path.slice(1) }" fill="url(#grad-${ id })"/>`
    })

    const grads = Object.entries(records).map(([id, [_, color]]) => {
        return `<linearGradient id="grad-${ id }" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="${ color }" />
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

const historiqueToPoints = (historique: number[]): [number, number][] => {
    const points: [number, number][] = []

    const n = historique.length

    historique.forEach((point, i) => {
        points.push(
            [
                Math.floor((i + 1) * width / n),
                Math.floor(point * height)
            ]
        )
    })

    points.push(
        [width + 10, - 10],
        [-10, -10]
    )

    return points
}

// const records: Record<string, [[number, number][], `#${string}`]> = {
//     "coca": [
//         historiqueToPoints([
//             0.1,
//             0.2,
//             0.3,
//             0.2,
//             0.5,
//             0.3,
//             0.7,
//             0.2
//         ]),
//         "#ffffffA0"
//     ],
//     "fanta": [
//         [
            
//             [0, 0],
//             [Math.floor(width / 5), Math.floor(height / 5)],
//             [Math.floor(2 * width / 3), Math.floor(height / 5)],
//             [Math.floor(3 * width / 4), Math.floor(1.2 * height / 4)],
//             [width + 10, Math.floor(height / 5 * 2.1)],
//             [width + 10, -10],
//             [-10, -10],
//         ],
//         "#00ffffA0"
//     ]
// }

export default (records: Record<string, [[number, number][], `#${string}`]>) => {
    const graph = document.getElementById('graph') as HTMLDivElement

    const computed = svg(width, height, records)

    graph.innerHTML = computed
}