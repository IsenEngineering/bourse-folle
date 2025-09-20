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
            
            if(i + 1 !== a.length) {
                span.innerText += ' - '
            }
            return span
        })
    )
}