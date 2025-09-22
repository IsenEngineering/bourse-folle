export default class Boisson {
    static changes: Set<Boisson> = new Set()
    static deletes: Set<string> = new Set()
    private element: HTMLDivElement
    nom: string
    prix_min: number
    prix_initial: number

    constructor(parent: HTMLElement, nom: string = 'DIABOLO', prix_min: number = 5, prix_initial: number = 7) {
        this.element = document.createElement('div')
        this.element.className = 'boisson bg-white text-ie'
        this.element.id = 'boisson-DIABOLO'
        
        this.element.innerHTML = `
            <div class="nom">
                ${ nom }
            </div>
            <div class="prix-min" class="border-x" contenteditable="true">
                ${ prix_min }
            </div>
            <div class="prix-init" contenteditable="true">
                ${ prix_initial }
            </div>
            <span>
                x
            </span>
        `

        parent.appendChild(this.element)
        this.nom = nom
        this.prix_initial = prix_initial
        this.prix_min = prix_min
        this.listeners()
    }

    listeners() {
        const min = this.element.querySelector('.prix-min') as HTMLDivElement | null
        const init = this.element.querySelector('.prix-init') as HTMLDivElement | null
        const x = this.element.querySelector('span') as HTMLSpanElement | null

        if(!min || !init || !x) {
            throw new Error('failed to bind listeners on boisson handler')
        }

        min.addEventListener('input', () => {
            const n = parseFloat(min.innerText)
            if(n < 0) return
            this.changes(n)
        })
        init.addEventListener('input', () => {
            const n = parseFloat(init.innerText)
            if(n < 0) return
            this.changes(undefined, n)
        })

        x.addEventListener('click', () => {
            Boisson.deletes.add(this.nom)

            const s = Boisson.deletes.size
            setTimeout(async () => {
                if(s !== Boisson.deletes.size) return

                const response = await fetch('/api/client/config', {
                    method: 'POST',
                    body: JSON.stringify({
                        boissons_supprimees: Array.from(Boisson.deletes.values())
                    })
                })

                Boisson.deletes.clear()

                if(response.ok) {
                    this.element.remove()
                }
            }, 150)
        })
    }

    changes(prix_min?: number, prix_initial?: number) {
        if(prix_min) {
            this.prix_min = prix_min
            Boisson.changes.add(this)
        }
        if(prix_initial) {
            this.prix_initial = prix_initial
            Boisson.changes.add(this)
        }

        const s = Boisson.changes.size
        setTimeout(async () => {
            if(s !== Boisson.changes.size) return

            await fetch('/api/client/config', {
                method: 'POST',
                body: JSON.stringify({
                    boissons: Array.from(Boisson.changes.values().map(boisson => ({
                        nom: boisson.nom,
                        prix_min: boisson.prix_min,
                        prix_initial: boisson.prix_initial
                    })))
                })
            })

            Boisson.changes.clear()
        }, 150)
    }
}