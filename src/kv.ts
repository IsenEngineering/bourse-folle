const DB_CLOSING_TIMEOUT = 1000 * 60 * 10
let global_timeout = 0
let db: Deno.Kv | undefined = undefined

export default async () => {
    if(db) {
        return db
    }
    db = await Deno.openKv('./data.db')
    const timeout = Date.now()
    global_timeout = timeout

    setTimeout(() => {
        if(global_timeout != timeout || !db) {
            return
        }
        db.close()
        db = undefined
    }, DB_CLOSING_TIMEOUT)

    return db
}
