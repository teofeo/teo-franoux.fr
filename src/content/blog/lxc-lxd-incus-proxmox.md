---
title: "LXC, LXD, Incus et Proxmox : l'histoire mouvementée des conteneurs système"
description: "LXC, LXD, Incus, Proxmox... quatre noms qui tournent autour des mêmes conteneurs Linux. Découvre qui fait quoi, comment Canonical a perdu l'équipe qui a créé LXD, et pourquoi LXD dépend aujourd'hui du code maintenu par son propre fork."
pubDate: 2026-10-07
tags: ["Conteneurs", "LXC", "LXD", "Incus", "Proxmox", "Linux", "Infrastructure"]
---

## Introduction

Si tu as déjà créé un **CT** dans Proxmox, tu as utilisé **LXC**. Si tu traînes un peu sur les forums homelab, tu as forcément vu passer **LXD** et **Incus**, souvent dans des phrases du genre « passe sur Incus, LXD c'est fini ».

Le problème, c'est que ces quatre noms se mélangent vite. LXC, LXD, Incus, Proxmox : est-ce que ce sont des concurrents ? Des couches les unes sur les autres ? Des forks ? Un peu tout ça à la fois 🤔

Et derrière, il y a une histoire assez savoureuse : celle d'un projet open source repris en main par une entreprise, de toute l'équipe d'origine qui part le recréer ailleurs, et d'une dépendance qui fait que **l'entreprise dépend aujourd'hui du code maintenu par ceux qui l'ont forkée**.

Dans cet article, on va voir :

- Ce qu'est un **conteneur système**, et en quoi il diffère d'un conteneur Docker.
- Le rôle de **LXC**, la brique de base.
- Pourquoi Canonical a créé **LXD** par-dessus.
- Comment **Incus** est né d'un fork en 2023.
- Où se place **Proxmox** dans tout ça.
- **L'ironie de l'histoire** : qui dépend de qui aujourd'hui.
- Un détail technique qui change tout : **LXCFS**.
- Comment **tester Incus** en quelques commandes.

---

## Petit rappel : c'est quoi un conteneur système ?

Un conteneur, ce n'est **pas** une machine virtuelle. Il n'y a ni hyperviseur, ni noyau invité : tous les conteneurs partagent **le noyau de l'hôte**. Ce sont simplement des processus Linux qu'on a **isolés** grâce à deux mécanismes du noyau :

- Les **namespaces** : ils limitent ce qu'un processus **voit**. Ses propres PID, son propre réseau, ses propres points de montage, ses propres utilisateurs, son propre hostname...
- Les **cgroups** : ils limitent ce qu'un processus **consomme**. CPU, RAM, I/O disque, nombre de processus...

Avec ces deux briques, on peut faire deux types de conteneurs très différents :

- **Conteneur applicatif** (Docker, Podman) : **un processus principal** par conteneur, une image immuable, on le détruit et on le recrée à chaque mise à jour. On conteneurise **une application**.
- **Conteneur système** (LXC, LXD, Incus, Proxmox) : un **système Linux complet**, avec `systemd` comme PID 1, plusieurs services, des utilisateurs, `apt upgrade`, du SSH... On s'en sert **comme d'une VM**, sauf qu'il démarre en une seconde et ne consomme presque rien.

Garde cette distinction en tête : tout cet article parle de **conteneurs système**.

---

## LXC : la brique de base (2008)

**LXC** (*Linux Containers*) apparaît vers **2008**, au moment où les namespaces et les cgroups arrivent dans le noyau. Son rôle : assembler toutes ces briques du noyau pour **créer et lancer un conteneur**.

LXC, c'est en réalité deux choses :

- **liblxc** : une **bibliothèque C** qui fait le vrai travail (créer les namespaces, configurer les cgroups, appliquer les profils AppArmor/seccomp, monter le système de fichiers...).
- Des **outils en ligne de commande** construits sur cette bibliothèque : `lxc-create`, `lxc-start`, `lxc-attach`, `lxc-ls`...

Le projet est hébergé sous l'égide de **linuxcontainers.org**, et deux noms vont revenir tout au long de l'histoire : **Stéphane Graber** et **Serge Hallyn**, à l'époque tous les deux chez **Canonical**.

Petite anecdote : **Docker lui-même utilisait LXC** à ses débuts, avant de développer sa propre bibliothèque (`libcontainer`, devenue `runc`) en 2014.

### Le problème de LXC

LXC fonctionne très bien, mais c'est un outil **bas niveau**, pensé pour **une seule machine** :

- Pas de démon ni d'**API** : impossible de piloter ses conteneurs à distance proprement.
- Pas de vrai système d'**images** : on crée ses conteneurs à partir de templates/scripts.
- Le **réseau** et le **stockage** sont à configurer soi-même.
- Pas de **cluster**, pas de **migration** simple entre machines.

En gros, LXC sait **faire tourner** un conteneur, mais pas **gérer une flotte** de conteneurs. C'est exactement le problème que LXD va résoudre.

---

## LXD : la couche de gestion de Canonical (2014)

Fin **2014**, Canonical annonce **LXD** (prononcé « lex-dee »), écrit en **Go**, avec une première version LTS (LXD 2.0) livrée avec **Ubuntu 16.04**.

LXD ne remplace pas LXC : il se pose **au-dessus** de liblxc, et transforme un outil local en **service** :

- Un **démon** (`lxd`) avec une **API REST**, pilotable en local ou à distance.
- Un système d'**images** prêtes à l'emploi : un conteneur Debian ou Alpine lancé en quelques secondes.
- La gestion du **stockage** (ZFS, Btrfs, LVM, Ceph) et du **réseau** (bridges, OVN...).
- Des **profils**, des **snapshots**, la **migration à chaud** entre machines.
- Le **clustering** pour regrouper plusieurs serveurs.
- Et à partir de **2020** (LXD 4.0), les **machines virtuelles** via **QEMU/KVM**, avec exactement les mêmes commandes que les conteneurs.

LXD devient une sorte de **mini-cloud privé** : plus simple qu'OpenStack, plus léger que Proxmox, et capable de gérer conteneurs et VMs côte à côte.

> **Piège classique** : le client en ligne de commande de LXD s'appelle... `lxc`. Donc `lxc launch` (LXD) et `lxc-start` (LXC « pur ») sont deux outils **complètement différents**. Cette histoire de nom a perdu énormément de monde 🙃

---

## 2023 : Canonical reprend LXD, et l'équipe s'en va

Pendant presque dix ans, LXD vit sous l'égide communautaire de **linuxcontainers.org**, aux côtés de LXC. Puis tout s'accélère en 2023.

### Juillet 2023 : LXD quitte linuxcontainers.org

Début juillet 2023, Canonical annonce que LXD **quitte le projet Linux Containers** pour passer directement sous son contrôle, avec des mainteneurs uniquement salariés de Canonical.

Quelques jours plus tard, **Stéphane Graber**, lead historique de LXD, annonce qu'il **quitte Canonical**.

### Août 2023 : naissance d'Incus

**Aleksa Sarai**, ingénieur chez **SUSE** (connu pour son travail sur `runc`) et packageur de LXD pour openSUSE depuis des années, crée un **fork de LXD**, juste après la version **LXD 5.16**. Il l'appelle **Incus**.

Le fork devait au départ être un projet personnel. Mais le **7 août 2023**, le projet Linux Containers l'adopte officiellement et lui donne toute l'infrastructure qui servait auparavant à LXD. Ses premiers mainteneurs : Aleksa Sarai, **Stéphane Graber**, **Serge Hallyn**, **Christian Brauner** et **Tycho Andersen**... soit, en pratique, **toute l'équipe qui avait créé LXD** 😮

Au moment du fork, Incus est donc **littéralement LXD renommé** :

- La commande `lxc` devient `incus`.
- Le démon `lxd` devient `incusd`.
- Les dépendances spécifiques à Canonical (snap, images Ubuntu par défaut...) sont retirées.
- Un outil, `lxd-to-incus`, permet de **convertir une installation LXD existante** sur place, puisque les formats sont identiques.

### Décembre 2023 : la séparation devient définitive

En **décembre 2023**, avec LXD 5.20, Canonical **change la licence** de LXD : de **Apache 2.0** vers **AGPLv3**, et impose un **CLA** (*Contributor License Agreement*) à tous les contributeurs.

Incus, lui, reste en **Apache 2.0**. Et cette asymétrie a une conséquence directe : **Incus ne peut plus reprendre le nouveau code de LXD**, puisque intégrer du code AGPLv3 l'obligerait à changer de licence. Les deux projets divergent donc pour de bon.

Dans la foulée, le serveur d'images communautaire de linuxcontainers.org cesse de servir les utilisateurs de LXD, et Canonical doit fournir ses propres images.

### Et aujourd'hui ?

- **LXD** reste le produit de Canonical, distribué principalement en **snap**, intégré à l'écosystème Ubuntu (MicroCloud, MAAS...).
- **Incus** est la continuation **communautaire**. Sa première LTS, **Incus 6.0**, sort en 2024. Il est packagé nativement dans **Debian 13** et dans de nombreuses distributions. Stéphane Graber propose aussi des paquets à jour et du support commercial via sa société, **Zabbly**.

Si tu as déjà suivi l'histoire **OpenOffice → LibreOffice** ou **MySQL → MariaDB**, tu reconnais le scénario : une entreprise reprend la main sur un projet, et la communauté repart avec le code et les développeurs.

---

## Et Proxmox dans tout ça ?

**Proxmox VE** utilise aussi **LXC** pour ses conteneurs (les fameux « CT »), mais **ni LXD, ni Incus**. Il a construit **sa propre couche de gestion** directement au-dessus de liblxc :

- L'outil en ligne de commande **`pct`** (l'équivalent de `qm` pour les VMs).
- Des fichiers de configuration dans **`/etc/pve/lxc/<id>.conf`**.
- L'intégration au **stockage**, au **réseau** et au **cluster** Proxmox.
- Et bien sûr l'**interface web**.

Depuis **Proxmox VE 9.1**, il est même possible de créer des conteneurs LXC à partir d'**images OCI** (le format des images Docker), encore en *tech preview*.

C'est exactement le même schéma que dans [mon article sur KVM, QEMU et libvirt](https://teo-franoux.fr/blog/kvm-qemu-libvirt/) : Proxmox utilise QEMU/KVM pour ses VMs mais **pas libvirt**, et il utilise LXC pour ses conteneurs mais **pas LXD**. Proxmox préfère toujours **sa propre couche de gestion** au-dessus des moteurs communs.

C'est pour ça qu'aujourd'hui, **Incus et Proxmox se retrouvent un peu en concurrence** : deux gestionnaires différents, qui pilotent les mêmes moteurs (liblxc pour les conteneurs, QEMU/KVM pour les VMs).

---

## Comment tout ça s'empile

Voici l'architecture complète, du plus haut niveau au plus bas :

```
┌───────────────────────┬───────────────────────┬───────────────────────┐
│   LXD (Canonical)     │   Incus (communauté)  │   Proxmox (pct, web)  │  ← Gestion
│   CLI : lxc           │   CLI : incus         │                       │
├───────────────────────┴───────────┬───────────┴───────────────────────┤
│      liblxc  +  LXCFS             │       QEMU                        │  ← Moteurs
│      (conteneurs)                 │       (VMs)                       │
├───────────────────────────────────┴───────────────────────────────────┤
│   Noyau Linux : namespaces · cgroups · seccomp · AppArmor · KVM       │
└───────────────────────────────────────────────────────────────────────┘
```

Pour résumer en une phrase chacun :

- **LXC** : *« Je crée et je lance des conteneurs à partir des briques du noyau. »*
- **LXD** : *« Je transforme LXC (et QEMU) en service avec une API, des images et du clustering. »*
- **Incus** : *« Je suis LXD, mais repris par ses créateurs, sous gouvernance communautaire. »*
- **Proxmox** : *« J'ai ma propre couche de gestion, au-dessus des mêmes moteurs. »*

---

## L'ironie de l'histoire

Revenons à la couche « Moteurs » du schéma. Pour faire tourner ses conteneurs, LXD n'a jamais réimplémenté LXC : il utilise **liblxc** via des bindings Go (`go-lxc`). Et pour que les conteneurs affichent une RAM et un CPU cohérents, il utilise **LXCFS** (on y vient juste après).

Or quand Canonical a sorti LXD de linuxcontainers.org en 2023, **LXC et LXCFS, eux, sont restés là-bas**. Et qui maintient aujourd'hui le projet linuxcontainers.org ? **L'équipe d'Incus.** 🔥

Résultat :

- Canonical a repris LXD pour en garder le contrôle...
- ... mais LXD dépend toujours de **liblxc** et de **LXCFS**...
- ... qui sont maintenus par **les personnes qui ont forké LXD**.

Et ça ne s'arrête pas là :

- Après le changement de licence, LXD a continué à **importer du code d'Incus** (c'est possible dans ce sens-là, puisque Apache 2.0 est compatible avec l'AGPLv3), alors que l'inverse n'est plus possible.
- Comme toute l'équipe d'origine de LXD travaille désormais sur Incus, Stéphane Graber s'amusait à faire remarquer qu'on pourrait presque se demander **lequel des deux est le fork de l'autre**.
- Et cerise sur le gâteau : Incus n'ayant pas d'interface web officielle, Graber a packagé... **l'interface web de LXD développée par Canonical** pour qu'elle fonctionne avec Incus (`incus-ui-canonical`).

L'open source, parfois, c'est mieux qu'une série Netflix 😎

---

## LXCFS : pourquoi `free` ment dans un conteneur

Revenons au technique avec un détail qui montre bien la différence entre un conteneur et une VM.

Imagine un conteneur limité à **2 Go de RAM**, sur un hôte qui en a **64 Go**. Tu lances `free -h` dans le conteneur. Sans précaution particulière, il affiche... **64 Go** 🤔

### Pourquoi ?

`free` ne calcule rien lui-même : il lit simplement le fichier **`/proc/meminfo`**. Ce fichier est généré à la volée par le noyau, et il décrit la mémoire **de la machine entière**.

Or `/proc/meminfo` **n'est pas « namespacé »** : aucun namespace ne lui fait afficher des valeurs propres au conteneur. Tous les processus du système, conteneurisés ou non, lisent exactement le même contenu.

La limite de 2 Go, elle, est appliquée par le **cgroup** mémoire du conteneur. Le noyau la fait bien respecter (au-delà, il récupère de la mémoire ou déclenche l'**OOM killer**), mais cette information vit ailleurs :

```
/sys/fs/cgroup/memory.max       # la limite
/sys/fs/cgroup/memory.current   # la consommation actuelle
```

Rien ne la répercute dans `/proc/meminfo`. En une phrase : **les cgroups limitent, mais ils ne mentent pas.**

Le conteneur croit donc avoir 64 Go... et se fait tuer à 2 Go.

### Ce que fait LXCFS

**LXCFS** est un petit système de fichiers **FUSE** qui génère de **faux** fichiers `/proc` : `/proc/meminfo`, `/proc/cpuinfo`, `/proc/uptime`, `/proc/stat`... calculés à partir **du cgroup du conteneur qui les lit**.

Incus (comme LXD et Proxmox) monte ces fichiers **par-dessus** les vrais dans chaque conteneur. Quand `free` lit `/proc/meminfo`, il tombe sur la version LXCFS, et affiche **2 Go**.

### Pas qu'un problème cosmétique

L'exemple classique, c'est **Java**. Pendant longtemps, la JVM dimensionnait son heap par défaut en fonction de la RAM de l'hôte, et se faisait **OOM-kill** dans les conteneurs Docker. Il a fallu rendre la JVM consciente des conteneurs (Java 10, rétroporté dans Java 8u191) pour qu'elle lise directement les limites du cgroup.

Docker n'utilise pas LXCFS par défaut : ce sont donc les **applications** qui ont dû s'adapter. Pour des conteneurs système, où on veut que `free`, `htop` ou `nproc` disent la vérité, on préfère **corriger la vue** avec LXCFS.

---

## Mise en pratique : tester Incus

Rien ne vaut un test. On installe Incus sur une Debian 13, et on vérifie tout ce qu'on vient de voir.

### Installation

Sur **Debian 13**, Incus est directement dans les dépôts :

```
sudo apt update && sudo apt install incus
```

> Sur d'autres distributions (ou pour avoir la toute dernière version), les paquets de **Zabbly** sont la référence : [github.com/zabbly/incus](https://github.com/zabbly/incus).

Ajoute ton utilisateur au groupe `incus-admin` pour éviter de tout faire en `sudo` :

```
sudo usermod -aG incus-admin $USER
```

Déconnecte-toi puis reconnecte-toi pour que le groupe soit pris en compte.

Initialise Incus avec une configuration minimale (un pool de stockage et un bridge réseau par défaut) :

```
incus admin init --minimal
```

> Pour une configuration plus poussée (ZFS, cluster, accès distant...), lance `incus admin init` sans option : il te posera les questions une par une.

### Lancer un conteneur et une VM

Un conteneur Debian :

```
incus launch images:debian/13 c1
```

Une **VM** Debian, avec la même commande et juste une option en plus :

```
incus launch images:debian/13 v1 --vm
```

Liste tes instances :

```
incus list
```

Tu verras `c1` de type **CONTAINER** et `v1` de type **VIRTUAL-MACHINE**, côte à côte. Pour entrer dans une instance :

```
incus exec c1 -- bash
```

### Vérifier qu'Incus utilise bien LXC et QEMU

```
incus info | grep -i driver
```

Tu devrais voir quelque chose comme :

```
  driver: lxc | qemu
  driver_version: 6.0.x | 9.x.x
```

Noir sur blanc : **liblxc** pour les conteneurs, **QEMU** pour les VMs. (Et si tu fais la même chose avec `lxc info` sur un LXD, tu obtiendras... la même ligne.)

### Voir LXCFS en action

Crée un conteneur limité à 2 Go de RAM et 2 CPU :

```
incus launch images:debian/13 c2 -c limits.memory=2GiB -c limits.cpu=2
```

Puis compare :

```
free -h                            # sur l'hôte
incus exec c2 -- free -h           # dans le conteneur
incus exec c2 -- nproc             # nombre de CPU vus par le conteneur
```

Le conteneur voit **2 Go** et **2 CPU**, alors que l'hôte en a bien plus. Et pour voir d'où vient la magie :

```
incus exec c2 -- grep lxcfs /proc/mounts
```

Tu verras les fichiers `/proc/meminfo`, `/proc/cpuinfo`, `/proc/uptime`... montés par **LXCFS** par-dessus les vrais.

### Nettoyage

```
incus delete -f c1 c2 v1
```

---

## Récapitulatif

|               | **LXC**                       | **LXD**                         | **Incus**                          | **Proxmox VE**                   |
| ------------- | ----------------------------- | ------------------------------- | ---------------------------------- | -------------------------------- |
| **Rôle**      | Moteur de conteneurs          | Gestionnaire conteneurs + VMs   | Gestionnaire conteneurs + VMs      | Plateforme de virtualisation     |
| **Créé par**  | Projet Linux Containers       | Canonical                       | Fork de LXD (A. Sarai), 2023       | Proxmox Server Solutions         |
| **Gouvernance** | Communautaire               | Canonical                       | Communautaire (linuxcontainers.org) | Proxmox                         |
| **Licence**   | LGPL                          | AGPLv3 + CLA (depuis 2023)      | Apache 2.0                         | AGPLv3                           |
| **Conteneurs via** | —                        | liblxc                          | liblxc                             | liblxc (`pct`)                   |
| **VMs via**   | —                             | QEMU/KVM                        | QEMU/KVM                           | QEMU/KVM (`qm`)                  |
| **CLI**       | `lxc-start`, `lxc-attach`...    | `lxc` (oui, oui)                | `incus`                            | `pct`, `qm`                      |
| **Interface** | CLI                           | CLI, API REST, UI web           | CLI, API REST                      | Interface web, API REST          |

---

## Conclusion

LXC, LXD, Incus et Proxmox ne sont pas quatre alternatives : **LXC est le moteur**, et les trois autres sont **des gestionnaires** construits au-dessus. Avec cet article, tu sais maintenant :

- **Ce qu'est un conteneur système**, et en quoi il diffère d'un conteneur Docker.
- **Ce que fait LXC** : créer des conteneurs à partir des briques du noyau.
- **Ce que fait LXD** : transformer LXC (et QEMU) en service avec une API.
- **Pourquoi Incus existe** : un fork de LXD repris par ses créateurs après la reprise en main de Canonical.
- **Où se place Proxmox** : sa propre couche de gestion, au-dessus des mêmes moteurs.
- **Pourquoi LXCFS est indispensable** pour qu'un conteneur affiche la bonne quantité de RAM et de CPU.
- Et surtout, **l'ironie de l'histoire** : LXD dépend aujourd'hui du code maintenu par l'équipe qui l'a forké.

La prochaine étape ? Piloter Incus en **infrastructure as code** avec le provider **Terraform/OpenTofu** pour Incus, monter un **cluster Incus** sur plusieurs machines, ou comparer concrètement Incus et Proxmox pour ton homelab.
