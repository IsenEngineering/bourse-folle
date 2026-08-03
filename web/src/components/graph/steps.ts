// L'idée c'est de diviser le temps en n instants et de les nommer
// exemple: [present, 10s, 20s, 30s, 40s...] ou [present, 5min, 10min, 15min...]
export function step_ts(ts_min: number, ts_max: number, n: number): { indice: string, x: number }[] {
    const elapsed = ts_max - ts_min
    const step = elapsed / n

    const rtf = new Intl.RelativeTimeFormat("fr", { 
        numeric: "auto",
        style: "short" 
    })
    const steps = [{ indice: rtf.format(0, "second"), x: 0 }]

    for (let i = 1; i < n; i++) {

        const value = step * i
        steps.push({
            indice: formatDuration(value, rtf),
            x: value
        })
    }

    return steps
}

function formatDuration(ms: number, rtf: Intl.RelativeTimeFormat): string {
    const totalSeconds = ms / 1000

    if (totalSeconds < 60) {
        return rtf.format(Math.round(-totalSeconds), "second")
    }

    const totalMinutes = totalSeconds / 60
    if (totalMinutes < 60) {
        return rtf.format(Math.round(-totalMinutes), "minute")
    }

    const totalHours = totalMinutes / 60
    if (totalHours < 24) {
        return rtf.format(Math.round(-totalHours), "hour")
    }

    const totalDays = totalHours / 24
    return rtf.format(Math.round(-totalDays), "day")
}

export function step_prix(prix_min: number, prix_max: number, n: number): { indice: string, y: number }[] {
    const elapsed = prix_max - prix_min
    const step = elapsed / n

    const nf = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
    })

    const steps = []

    for (let i = 0; i <= n; i++) {
        const value = prix_min + step * i
        steps.push({
            indice: nf.format(value),
            y: value
        })
    }

    return steps
}