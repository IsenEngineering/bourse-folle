import log from "./log.ts"

const DB_CLOSING_TIMEOUT = 1000 * 60
let global_timeout = 0
let db: [string, Deno.Kv] | undefined = undefined

export default async (dataset?: string) => {
    if(db && (db[0] === dataset || dataset === undefined)) {
        return db[1]
    } else if(dataset === undefined) {
        throw new Error('called KV before periode setup')
    } else if(db) {
        db[1].close()
        log('kv', `KV fermé (${ db[0] })`)
    } 
    db = [dataset.trim(), await Deno.openKv(`./data/${ dataset.trim() }.db`)]
    log('kv', `KV ouvert (${ db[0] })`)
    const timeout = Date.now()
    global_timeout = timeout
    
    setTimeout(() => {
        if(global_timeout != timeout || !db) {
            return
        }
        db[1].close()
        log('kv', `KV fermé (${ db[0] })`)
        db = undefined
    }, DB_CLOSING_TIMEOUT)

    return db[1]
}
