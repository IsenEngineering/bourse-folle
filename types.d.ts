declare namespace BourseFolle {
    export interface Ressource {
        nom: string,
        code: string,
        prix: number,
        couleur: string,
        variation: number
        historique: {
            prix: number
            ts: number,
        }[]
    }
} 