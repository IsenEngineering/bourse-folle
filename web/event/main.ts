const start = document.getElementById('start') as HTMLButtonElement | null
const stopp = document.getElementById('stop') as HTMLButtonElement | null

if(!stopp || !start) throw new Error('missing elements')

start.addEventListener('click', () => {
    
})
stopp.addEventListener('click', () => {

})

const setup_recap = (recaps: [string, string][]) => {
    const main = document.querySelector('main') as HTMLElement
    main.querySelectorAll('a').forEach(a => a.remove())
    
    main.append(
        ...recaps.map(([date, href]) => {
            const a = document.createElement('a')
            a.href = href
            a.innerText = `recap ${ date }`
            a.className = `btn text-2xl`
            return a
        })
    )
}

setup_recap([
    ['18/09', "???"],
    ['18/09', "???"]
])