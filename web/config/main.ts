import Boisson from "./boisson.ts"

const intervalle = document.getElementById('intervalle') as HTMLSpanElement | null
const boissons = document.getElementById('boissons') as HTMLElement | null
const nouvelle_boisson = document.getElementById('nouvelle_boisson') as HTMLButtonElement | null
const k = document.getElementById('k') as HTMLElement | null

if(!intervalle || !boissons || !nouvelle_boisson || !k) throw new Error('???')

nouvelle_boisson.addEventListener('click', async () => {
    const nom = prompt('Nom de la boisson')
    if(!nom || nom.length === 0) return

    const boisson = new Boisson(boissons, nom.trim())

    await fetch('/api/client/config', {
        method: 'POST',
        body: JSON.stringify({
            boissons: [
                {
                    nom: boisson.nom,
                    prix_min: boisson.prix_min,
                    prix_initial: boisson.prix_initial
                }
            ]
        })
    })
})

const setup = async () => {
    const response = await fetch('/api/client/config')
    if(!response.ok) return
    
    const body = await response.json() as {
        k: number,
        intervalle: number,
        boissons: {
            boisson: string,
            prix: number,
            ventes: number,
            prix_min: number,
            prix_initial: number
        }[]
    }

    intervalle.innerText = body.intervalle.toString().trim()
    intervalle.addEventListener('input', async () => {
        const n = parseFloat(intervalle.innerText)
        if(n <= 0) return
        await fetch('/api/client/config', {
            method: 'POST',
            body: JSON.stringify({
                intervalle: n
            })
        })
    })

    k.innerText = body.k.toString()
    k.addEventListener('input', async () => {
        const n = parseFloat(k.innerText)
        if(n < 0) return
        await fetch('/api/client/config', {
            method: 'POST',
            body: JSON.stringify({
                k: n
            })
        })
    })

    body.boissons.forEach(boisson => {
        new Boisson(boissons, boisson.boisson, boisson.prix_min, boisson.prix_initial)
    })
}

setup()