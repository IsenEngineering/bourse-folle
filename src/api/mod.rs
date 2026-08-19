mod live;
// - /api/live -> stream les ressources à interval régulié

mod service;
// - /api/service/logs -> stream les logs concernant le service (qui prends un service / qui s'occupe d'appuyer sur les boissons)
// - /api/service/actif -> upgrade en websocket pour passer les commandes (permet de tracker l'utilisation du service, 
//      lorsque la connexion est interrompue on sait que le service est fini pour la personne/ au pire il redémarre)

mod config;
// - /api/config [GET,PATCH] -> modifier les paramètres globaux

mod resources;
// - /api/resources [GET,POST,PATCH,DELETE] -> récupérer/créer/modifier/supprimer une ressource

mod logs;
// - /api/logs [GET] -> récupérer la liste des logs
// - /api/logs/{id} [GET] -> récupérer le contenu d'un log

mod auth;
// - /api/auth/login
// - /api/auth/validate
// - /api/auth/logout