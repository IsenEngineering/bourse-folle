// struct that represents resource
// impl to update / derive state

// une ressource est composée de
//  - un nom
//  - un identifiant
//  - un prix (initial, minimum et maximum)
//  - une variation (sur un nombre déterminé d'interval)
//  - historique (les prix précédents avec des timestamps)
//  - coefficents (détermine le comportement du prix de la ressource 
//      en fonction du temps et de la demande)
//      - volatilite (descente)
//      - force (monte)