# Kata

📆 **Mise à jour le 17/12/2024**

# 1. Cloner l’application

---

Dans ton terminal de commande →

```bash
git clone https://github.com/jeremie98/kata.git
```

# 2. Installer Docker

---

Installez Docker selon votre OS.

https://docs.docker.com/desktop/install/mac-install/

https://docs.docker.com/desktop/install/windows-install/

https://docs.docker.com/desktop/install/linux-install/

# 3. Installer l’application et les dépendances

---

1 → `make docker-start` dans le terminal à la racine de votre dossier cloner.

2 → `make database-build` configure la base de données.

3 → `make dev-build` dans le terminal à la racine de votre dossier, cette commande installe le front-end, le back-end et leurs dépendances.

# 4. Démarrer l'application

---

1 → Ouvrir un terminal dans le dossier `/api` et exécuter `yarn dev`, afin de lancer le backend lequel sera accessible à http://localhost:4071/api

2 → Ouvrir un terminal dans le dossier `/frontend` et exécuter `yarn dev`, afin de lancer le frontend

# 5. Connexion à l'interface

---

Utilisez les identifiants suivants :

- johndoe@kata.com
- Testtest2!

# 6. Documentation API

---

1 → Démarrer l'api comme indiqué ci-dessus dans le 4.

2 → Ouvrir l'url suivante : http://localhost:4071/docs
