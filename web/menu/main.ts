import { Events } from "types";
import consume from "../utils/stream.ts"

const service = document.getElementById('service') as HTMLButtonElement | null
const commandes = document.getElementById('commandes') as HTMLButtonElement | null

if(!service || !commandes) throw new Error("???")

const data = {
    service: true,
}

service.addEventListener('click', () => {
    data.service = !data.service

    service.classList.toggle('active', data.service)
    commandes.classList.toggle('disabled', !data.service)
})

const setup_commandes = (records: [string, number, number][], callback: (boisson: string) => void) => {
    commandes.querySelectorAll('*').forEach(a => a.remove())
    commandes.append(
        ...records.map(([boisson, prix, compte]) => {
            const a = document.createElement('button')
            a.className = `article btn active`
            a.innerHTML = `
                <h3>${ boisson } </h3>
                <p class="ventes">${ compte } Commandes</p>
                <p>${ prix }€</p>`
            a.id = `boisson-${ boisson }`

            a.addEventListener('click', () => {
                if(!data.service) return
                callback(boisson)
            })

            return a
        })
    )
}

const modify_commandes = (historiques: [string, number, number, number[]][]) => {
    historiques.forEach(historique => {
        const boisson = historique[0]
        const prix = historique[1]
        const ventes = historique[2]

        const a = document.getElementById(`boisson-${ boisson }`) as HTMLLinkElement | null
        if(!a) return

        a.innerHTML = `
            <h3>${ boisson } </h3>
            <p class="ventes">${ ventes } Commandes</p>
            <p>${ prix }€</p>`
        a.classList.toggle('registered', true)

        setTimeout(() => {
            a.classList.toggle('registered', false)
        }, 1000)
    })
}

const modify_ventes = (boisson: string, ventes: number) => {
    const a = document.getElementById(`boisson-${ boisson }`)
    if(!a) return
    const p = a.querySelector(`p.ventes`) as HTMLParagraphElement | null
    if(!p) return
    p.innerText = `${ ventes } Commandes`
    a.classList.toggle('success', true)

    setTimeout(() => {
        a.classList.toggle('success', false)
    }, 1000)
}

const setup = async () => {
    const response = await fetch('/api/client/menu')
    const data = await response.json() as {
        boisson: string,
        prix: number,
        ventes: number,
        prix_min: number,
        prix_initial: number
    }[]

    setup_commandes(
        data.map(ligne => ([ligne.boisson, ligne.prix, ligne.ventes ])),
        async (boisson) => {
            await fetch('/api/client/menu', {
                credentials: 'include',
                method: 'POST',
                body: boisson
            })
        }
    )
}

const decoder = new TextDecoder()

setup()
consume('/api/tv', (chunk) => {
    const payload = decoder.decode(chunk)
    const data = JSON.parse(payload) as Events[]

    data.forEach(event => {
        switch(event.type) {
            case 'update':
                modify_commandes(event.historique)
                break;
            case 'vente':
                modify_ventes(event.boisson, event.ventes)
                break;
        }
    })
})