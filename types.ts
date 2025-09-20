interface TimeUpdateEvent {
    type: 'time',
    time: number // nombre de secondes restantes avant mise à jours
}

interface UpdateEvent {
    type: 'update',
    historique: [string, number, number, number[]][],
    annonce: string,
}

interface VenteEvent {
    type: 'vente',
    boisson: string,
    ventes: number
}

export type Events = UpdateEvent | TimeUpdateEvent | VenteEvent