export default (boissons: Record<string, number>) => {
    const bandeau = document.getElementById('boissons') as HTMLDivElement

    bandeau.innerHTML = ""

    bandeau.append(
        ...Object.entries(boissons).map(([boisson, prix], i, a) => {
            const span = document.createElement('span')
            span.innerText = `${ boisson } ${ prix }€ - `
    
            return span
        })
    )
}