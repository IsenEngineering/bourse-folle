interface TimeUpdateEvent {
    type: 'time',
    time: number // nombre de secondes restantes avant mise à jours
}

interface UpdateEvent {
    type: 'update',
    historique: [string, number[]][],
    annonce: string
}

export type Events = UpdateEvent | TimeUpdateEvent