const start = document.getElementById('start') as HTMLButtonElement | null
const pause = document.getElementById('pause') as HTMLButtonElement | null
const arret = document.getElementById('stop') as HTMLButtonElement | null

if(!pause || !arret || !start) throw new Error('missing elements')

start.addEventListener('click', async () => {
    const response = await fetch('/api/client/event', {
        method: 'POST',
        body: 'demarrer'
    })

    if(response.ok) {
        start.classList.toggle('success', true)
        start.classList.toggle('disabled', true)
        arret.classList.toggle('disabled', false)
        pause.classList.toggle('disabled', false)
    }

    setTimeout(() => {
        start.classList.toggle('success', false)
    }, 1000)
})
arret.addEventListener('click', async () => {
    const response = await fetch('/api/client/event', {
        method: 'POST',
        body: 'arret'
    })

    if(response.ok) {
        arret.classList.toggle('success', true)

        start.classList.toggle('disabled', false)
        arret.classList.toggle('disabled', true)
        pause.classList.toggle('disabled', true)
    }

    setTimeout(() => {
        arret.classList.toggle('success', false)
    }, 1000)
})
pause.addEventListener('click', async () => {
    const response = await fetch('/api/client/event', {
        method: 'POST',
        body: 'pause'
    })

    if(response.ok) {
        pause.classList.toggle('success', true)
        start.classList.toggle('disabled', false)
        arret.classList.toggle('disabled', true)
        pause.classList.toggle('disabled', true)
    }

    setTimeout(() => {
        pause.classList.toggle('success', false)
    }, 1000)
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