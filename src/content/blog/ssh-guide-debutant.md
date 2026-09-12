---
title: "SSH : Guide complet pour les débutants"
description: "Apprenez à utiliser SSH pour vous connecter à un serveur à distance en toute sécurité. Découvrez comment générer des clés SSH, configurer des alias, et sécuriser vos connexions."
pubDate: 2026-09-12
updatedDate:
tags:
  - SSH
  - Sécurité
  - Linux
  - Développement
  - Infrastructure
---

## Introduction

SSH (Secure Shell) est un protocole de connexion sécurisée qui permet de **se connecter à un serveur à distance de manière sécurisée**. Contrairement à des outils comme Telnet (qui envoie les données en clair), SSH **chiffre** toutes les communications entre ton ordinateur et le serveur distant.

---

### À quoi ça sert ?

- Admininstrer un serveur Linux.
- Exécuter des commandes à distance.
- Transférer des fichiers (avec scp ou sftp).
- Automatiser des tâches (scripts, déploiements).

---

## Installation de SSH

### Sur Linux/macOS

SSH est généralement préinstallé. Pour vérifier :

```bash
ssh -V
```

Si ce n'est pas le cas, installe-le :

* Debian/Ubuntu : `sudo apt-get install openssh-server`

```bash
sudo apt update && sudo apt install openssh-client
```

* Fedora/RHEL :

```bash
sudo dnf update && sudo dnf install openssh-client
```

### Sur Windows

Installe WSL 🤡

Et voilà !

---

## Se connecter à un serveur avec SSH avec mot de passe

C'est la méthode la plus simple mais **moins sécurisée**. Il te suffira d'avoir ces informations :

* **`utilisateur`** : Le nom d'utilisateur sur le serveur (admin).
* **`adresse_ip`** : L'adresse IP ou le nom de domaine du serveur (192.168.1.100).
* **`mot_de_passe`** : Le mot de passe de l'utilisateur (admin dans ce cas précis).

```bash
ssh admin@192.168.1.100
```

Tu seras invité à entrer le **mot de passe** de l'utilisateur.

**Problème** : Les mots de passe peuvent être interceptés (même si SSH les chiffrent, c'est moins sécurisé que les clés SSH).

## Se connecter à un serveur avec SSH avec clés SSH

C'est la **meilleure pratique** pour se connecter à un serveur avec SSH.

### Générer une paire de clés SSH (publique + privée)

Sur ton ordinateur (pas le serveur distant), on  va utiliser [ssh-keygen](https://linux.die.net/man/1/ssh-keygen) :

```bash
ssh-keygen -t ed25519 -C "ton_email@example.com"
```

Voici le détail de chaque élément de la commande :

* **`ssh-keygen`** : L'utilitaire intégré aux systèmes Unix/Linux pour générer, gérer et convertir les paires de clés d'authentification.
* **`-t ed25519`** : L'option `-t` (pour *type*) définit l'algorithme cryptographique. **Ed25519** est la norme moderne recommandée : elle offre une sécurité de pointe tout en produisant des clés courtes et très rapides à calculer.
* **`-C "ton_email@example.com"`** : L'option `-C` (pour *comment*) ajoute une étiquette textuelle à la fin de la clé publique. Y placer une adresse e-mail permet de l'identifier facilement lorsqu'elle est listée sur un serveur ou une forge logicielle (comme GitHub ou GitLab).

Lorsque tu lances la commande, le termiinal guide l'utilisateur à travers trois étapes interactives successives.

1. Le choix de l'emplacement du fichier
- Ce qu'on te demande : Enter file in which to save the key (/home/utilisateur/.ssh/id_ed25519):
- L'explication : Le terminal propose un chemin par défaut (~/.ssh/id_ed25519).
- Quoi faire : Dans 99 % des cas, il suffit d'appuyer sur Entrée pour valider ce choix par défaut. Sauf si tu possèdes déjà une clé du même nom et que tu ne veux pas l'écraser, il n'est pas nécessaire de modifier ce chemin.

2. La saisie de la *passphrase* (mot de passe)
- Ce qu'on te demande : `Enter passphrase (empty for no passphrase):` puis une confirmation `Enter same passphrase again:`
- L'explication : C'est un mot de passe qui chiffre ta clé privée directement sur ton disque dur. Même si quelqu'un vole ton ordinateur ou accède à ton dossier .ssh, il ne pourra pas utiliser ta clé sans connaître cette phrase secrète.
- Quoi faire :
    - Mettre une passphrase (fortement recommandé pour la sécurité) : C'est la bonne pratique sur une machine personnelle ou professionnelle partagée. Ton système (via un agent SSH comme ssh-agent) te demandera généralement de la saisir une seule fois au démarrage de ta session pour tout déverrouiller automatiquement.
    - Laisser vide (sans passphrase) : Appuyer directement sur Entrée sans rien taper. C'est pratique si tu es le seul administrateur de la machine et que tu automatises des scripts ou des déploiements (CI/CD) où personne ne peut taper de mot de passe. C'est à éviter sur un ordinateur portable exposé au vol ou partagé.

### Copier la clée publique sur le serveur

```bash
ssh-copy-id utilisateur@adresse_ip
```

Tu seras invité à entrer le mot de passe une dernière fois.

### Se connecter sans mot de passe
```bash
ssh utilisateur@adresse_ip
```

**C'est tout !** Plus besoin de mot de passe pour se connecter.

---

## Configurer SSH pour simplifier sa vie

### Utiliser un alias pour éviter de taper l'adresse IP à chaque fois

```bash
nano ~/.ssh/config
```

Ajoute :

```
Host mon-serveur
    HostName 192.168.1.100
    User admin
    IdentityFile ~/.ssh/id_ed25519
```

Maintenant, tu peux te connecter avec :

```bash
ssh mon-serveur
```

### Modifie ou ajoute :

```bash
PasswordAuthentication no
PubkeyAuthentication yes
```

Redémarre le service SSH :

```bash
sudo systemctl restart ssh
```

Attention : Assure-toi que ta clée SSH fonctionne avant de désactiver le mot de passe, sinon tu risques de te retrouver bloqué.

---

## Astuces utiles avec SSH

### Exécuter une commande à distance sans se connecter

```bash
ssh utilisateur@adresse_ip "ls -la /var/www"
```

### Copier des fichiers avec `scp` (Secure Copy)

* Copier un fichier local vers le serveur :

```bash
scp mon_fichier.txt utilisateur@serveur:/chemin/de/destination/
```

* Copier un fichier du serveur vers ton ordinateur :

```bash
scp utilisateur@serveur:/chemin/de/destination/mon_fichier.txt ./
```

### Monter un tunnel SSH (pour accéder à un service distant localement)

Exemple : Accéder à une base de données **MySQL** (port 3306) qui n'est pas accessible depuis l'extérieur.

```bash
ssh -L 3306:localhost:3306 admin@serveur
```

* L'option -L active le transfert de port local (Local Port Forwarding).
* La syntaxe suit toujours ce modèle : [port_local]:[hote_destination]:[port_destination]

- Le premier 3306 : C'est le port d'écoute ouvert sur ta machine locale (ton propre ordinateur). Lorsque tu configuras ton application pour se connecter à localhost:3306 chez toi, tout le trafic est capturé et injecté dans le tunnel SSH.

- localhost : C'est la machine cible vue depuis le serveur distant. Ici, localhost désigne le serveur SSH lui-même (la machine serveur). Si le service était hébergé sur une autre machine du réseau interne du serveur, tu pourrais remplacer localhost par son IP interne (ex: 192.168.1.50).

- Le second 3306 : C'est le port sur lequel tourne réellement le service cible sur la machine de destination (dans cet exemple, le port standard d'un serveur MySQL ou MariaDB).

Maintenant, tu peux te connecter à `localhost:3306` sur ton ordinateur, et ça sera redirigé vers le serveur.

### Utiliser `ssh-agent` pour ne pas retaper sa phrase de passe

Si ta clé privée a une phrase de passe (recommandé), ssh-agent te permet de ne la taper qu’une fois :

```bash
# Démarrer l'agent
eval $(ssh-agent)
# Ajouter ta clé
ssh-add ~/.ssh/id_ed25519
```

Maintenant, toutes tes connexions SSH utiliseront cette clé **sans redemander la phrase de passe**.

---

## Bonnes pratiques de sécurité

1. **Utilise toujours des clés SSH** au lieu des mots de passe.
2. **Désactive l’authentification par mot de passe** sur tes serveurs.
3. **Utilise `fail2ban`** pour bloquer les attaques par force brute :
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```
4. **Ne jamais partager ta clé privée** (id_ed25519).

---

## Conclusion

SSH est **l'outil de base** pour tout développeur ou ingénieur infrastructure. Avec cet article, tu sais maintenant :
- **Te connecter à un serveur** en toute sécurité.
- **Utiliser des clés SSH** pour éviter les mots de passe.
- **Configurer SSH** pour simplifier ton quotidien.
- **Sécuriser ton serveur** contre les attaques.
