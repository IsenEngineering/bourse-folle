import { fnv1aHash } from "../utils/hash.ts"

export default (boissons: string) => {
    const bandeau = document.getElementById('boissons') as HTMLDivElement

    bandeau.innerHTML = ""

    bandeau.append(
        ...boissons.split(' - ').map((boisson, i, a) => {
            const span = document.createElement('span')
            span.innerText = boisson

            const h = fnv1aHash(boisson.split(' ').at(0)!)
            span.attributeStyleMap.set('--c', `hsl(${ h }deg 75% 50%)`)
            
            return span
        })
    )
}

export const text = (msg: string) => {
    const bandeau = document.getElementById('boissons') as HTMLDivElement

    bandeau.querySelectorAll('span').forEach(span => 
        span.style.display = msg.length > 0 ? 'none' : 'inline')

    if(msg.length > 0) {
        const p = document.createElement('p')
        p.innerText = msg
    
        bandeau.appendChild(p)
    } else {
        bandeau.querySelectorAll('p').forEach(p => p.remove())
    }
}