export default class Timer {
    t: number
    private interval?: number
    private element: HTMLParagraphElement
    private callback: () => void
    constructor(t: number, callback: () => void) {
        this.callback = callback
        this.t = (t + 1) // temps restant

        this.element = document.getElementById("timer") as HTMLParagraphElement
        this.setup()
    }
    private setup() {
        if(this.interval) clearInterval(this.interval)

        this.interval = setInterval(() => {
            if(this.t <= 0 && this.interval !== undefined) {
                clearInterval(this.interval)
                this.interval = undefined
                this.callback()
            } else {
                this.t--;
                this.update()
            }
        }, 1000);
    }
    private update() {
        const min = Math.floor(this.t / 60)
        const sec = Math.floor(this.t - 60 * min)
        this.element.innerText = `Nouveau prix dans ${ min } minutes et ${ sec } secondes`
    }
    sync(t: number) {
        this.t = (t + 1)
        this.setup()
    }
    detach() {
        if(this.interval) clearInterval(this.interval)
    }
}