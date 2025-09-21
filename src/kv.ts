const DB_CLOSING_TIMEOUT = 1000 * 60
let global_timeout = 0
let db: Deno.Kv | undefined = undefined

export default async () => {
    if(db) {
        return db
    }
    db = await Deno.openKv('./data.db')
    console.debug(`[kv.ts] BDD ouverte`)
    const timeout = Date.now()
    global_timeout = timeout
    
    setTimeout(() => {
        if(global_timeout != timeout || !db) {
            return
        }
        db.close()
        db = undefined
        console.debug(`[kv.ts] BDD fermée`)
    }, DB_CLOSING_TIMEOUT)

    return db
}
