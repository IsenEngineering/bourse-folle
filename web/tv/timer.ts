export default class Timer {
    duration: number
    private interval?: number
    private last_update: number
    private element: HTMLParagraphElement
    private callback: () => void
    constructor(duration: number, callback: () => void, last_update?: Date) {
        this.duration = duration
        this.last_update = last_update ? last_update.getTime() : Date.now()
        this.callback = callback

        this.element = document.getElementById("timer") as HTMLParagraphElement
        this.setup()
    }
    private setup() {
        this.interval = setInterval(() => {
            const t = this.last_update + this.duration - Date.now()

            if(t < 0 && this.interval !== undefined) {
                clearInterval(this.interval)
                this.interval = undefined
                this.callback()
            } else {
                this.update(t)
            }
        }, 1000);
    }
    private update(t: number) {
        const min = Math.floor(t / 1000 / 60)
        const sec = Math.floor(t / 1000 - 60 * min)
        this.element.innerText = `Nouveau prix dans ${ min } minutes et ${ sec } secondes`
    }
    detach() {
        if(this.interval) {
            clearInterval(this.interval)
        }
    }
}