const service = document.getElementById('service') as HTMLButtonElement | null
const undo = document.getElementById('undo') as HTMLButtonElement | null
const commandes = document.getElementById('commandes') as HTMLButtonElement | null

if(!service || !undo || !commandes) throw new Error("???")

const data = {
    service: true,
    last_action_id: undefined as undefined | number
}

service.addEventListener('click', () => {
    data.service = !data.service

    service.classList.toggle('active', data.service)
    commandes.classList.toggle('disabled', !data.service)
})

undo.addEventListener('click', () => {
    // ??
})

const setup_commandes = (records: [string, number, number][], callback: (boisson: string) => void) => {
    commandes.querySelectorAll('*').forEach(a => a.remove())
    commandes.append(
        ...records.map(([boisson, prix, compte]) => {
            const a = document.createElement('button')
            a.className = `article btn active`
            a.innerHTML = `
                <h3>${ boisson } </h3>
                <p>${ compte } Commandes</p>
                <p>${ prix }€</p>`

            a.addEventListener('click', () => {
                if(!data.service) return
                callback(boisson)
            })

            return a
        })
    )
}

setup_commandes([
    ["TGV", 1.2, 100],
    ["TGV", 1.2, 101],
    ["TGV", 1.2, 102],
    ["TGV", 1.2, 103],
], console.log)