import Timer from "./timer"
import bandeau from "./bandeau"
import graph from "./graph"

const data = {
    interval: 1000 * 60 * 7,
    last_interval: new Date(),
    boissons: {
        "JAGERBOMB": 7.1,
        "DIABOLO FRAISE": 10.10
    }
}

const t = new Timer(data.interval, () => {
    console.log('callback')
}, data.last_interval)

bandeau(data.boissons)
// graph()