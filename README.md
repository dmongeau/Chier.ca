Chiez.ca
====================
Plateforme de micro-blogging pour phase anale.

Installation
---------------------
1. Renommer le fichier config.sample.js en config.js
2. Configurer votre base de données MongoDB dans le fichier config.js
3. Démarrez le serveur en tapant : node server

Utilisation
---------------------
- Pour builder le projet, vous faites: yeoman build
- Pour le déployer sur Nodejitsu (vous devez d'abord configurer votre subdomain dans package.json): jitsu deploy

Plugins utilisés
---------------------
### Frontend: #####
- Require.js
- Bootstrap
### Backend: #####
- Node.js (Hébergé avec nodejitsu)
- Express
- Swig
- Mongoose
### Build: #####
- Yeoman 