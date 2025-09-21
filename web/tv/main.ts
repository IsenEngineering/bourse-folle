import Timer from "./timer.ts"
import bandeau, { text } from "./bandeau.ts"
import graph from "./graph.ts"
import consume from "../utils/stream.ts"
import { Events } from "types";

let t: Timer | null
const decoder = new TextDecoder()
consume('/api/tv', (chunk) => {
    const payload = decoder.decode(chunk)
    const data = JSON.parse(payload) as Events[]

    for(const event of data) {
        console.info(event)
        switch(event.type) {
            case 'time':
                if(!t) {
                    t = new Timer(event.time)
                } else {
                    t.sync(event.time)
                }
                break;
            case 'update':
                bandeau(event.annonce)
                graph(event.historique)
                break;
            case 'etat':
                text(event.etat !== 'demarre' ? 'PAUSE' : '')
                break;
        }
    }
})