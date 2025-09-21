interface TimeUpdateEvent {
    type: 'time',
    time: number // nombre de secondes restantes avant mise à jours
}

interface UpdateEvent {
    type: 'update',
    historique: [string, number, number, number[]][],
    annonce: string,
}

interface Vente {
    type: 'vente',
    boisson: string,
    ventes: number
}

interface ChangementEtat {
    type: 'etat',
    etat: 'pause' | 'arret' | 'demarre'
}

export type Events = UpdateEvent | TimeUpdateEvent | Vente | ChangementEtat