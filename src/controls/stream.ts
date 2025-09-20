import type { Events } from "types"
export default class Live {
    static streams: Map<string, ReadableStreamDefaultController<any>> = new Map()
    static queue: Set<Events> = new Set()
    id: string
    queue: Set<Events> = new Set()
    constructor(id: string, stream: ReadableStreamDefaultController<any>) {
        this.id = id
        Live.streams.set(id, stream)
    }

    private static encode(data: Events[]): Uint8Array<ArrayBuffer> {
        const payload = JSON.stringify(data)
        const encoder = new TextEncoder()
        const bytes = encoder.encode(payload)

        return bytes
    }
    static broadcast(data: Events) {
        this.queue.add(data)
        const size = this.queue.size

        setTimeout(() => {
            if(size !== this.queue.size) {
                return
            }
            
            const bytes = this.encode(
                Array.from(this.queue.values())
            )
            this.streams.forEach(stream => 
                stream.enqueue(bytes))
            this.queue.clear()
        }, 100)
    }
    send(data: Events) {
        this.queue.add(data)
        const size = this.queue.size

        setTimeout(() => {
            if(size !== this.queue.size) {
                return
            }

            const bytes = Live.encode(
                Array.from(this.queue.values())
            )
            const stream = Live.streams.get(this.id)
            if(!stream) return
            
            stream.enqueue(bytes)
            this.queue.clear()
        }, 100)
    }
    close() {
        Live.streams.delete(this.id)
    }
}