import db from "../kv.ts"
import { sign, verify } from "../jwt.ts"

export default class Auth {
    login() {
        
    }
    
    static jwt(): Promise<string> {
        return sign()
    }
    static async cookie(jwt: string): Promise<boolean> {
        return await verify(jwt) === "success"
    }
}