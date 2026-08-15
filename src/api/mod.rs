// - /api/live -> stream les ressources à interval régulié
// - /api/service/logs -> stream les logs concernant le service (qui prends un service / qui s'occupe d'appuyer sur les boissons)
// - /api/service/actif -> upgrade en websocket pour passer les commandes (permet de tracker l'utilisation du service, 
//      lorsque la connexion est interrompue on sait que le service est fini pour la personne/ au pire il redémarre)

// - /api/config [GET,PATCH] -> modifier les paramètres globaux
// - /api/resources [GET,POST,PATCH,DELETE] -> récupérer/créer/modifier/supprimer une ressource
// - /api/logs [GET] -> récupérer la liste des logs
// - /api/logs/{id} [GET] -> récupérer le contenu d'un log

// - /api/auth/login
// - /api/auth/validate
// - /api/auth/logout