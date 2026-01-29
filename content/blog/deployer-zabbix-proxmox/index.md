---
title: "Déployer Zabbix sur Proxmox : Surveillance centralisée"
date: 2026-01-20
tags: ["DevOps", "Monitoring", "Proxmox", "Zabbix"]
categories: ["Tutoriels"]
image: "cover-zabbix-proxmox.png"
description: "Apprenez à déployer Zabbix sur Proxmox pour surveiller vos VMs et conteneurs, avec des alertes personnalisées et des tableaux de bord."
draft: false
---

## Pourquoi Zabbix ?
Zabbix est une solution open source de monitoring, idéale pour :
- Surveiller les performances des VMs.
- Recevoir des alertes en temps réel.
- Visualiser les métriques via des tableaux de bord.

## Étapes de déploiement

### 1. Créer une VM dédiée
- Allouer 2 vCPUs et 4 Go de RAM.
- Utiliser un template Ubuntu 22.04.

### 2. Installer Zabbix
```bash
wget https://repo.zabbix.com/zabbix/6.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_6.0-4+ubuntu22.04_all.deb
dpkg -i zabbix-release_6.0-4+ubuntu22.04_all.deb
apt update && apt install zabbix-server-mysql zabbix-frontend-php zabbix-apache-conf zabbix-agent
```

### 3. Configurer la base de données

```sql
CREATE DATABASE zabbix CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
CREATE USER 'zabbix'@'localhost' IDENTIFIED BY 'motdepasse';
GRANT ALL PRIVILEGES ON zabbix.* TO 'zabbix'@'localhost';
```
### 4. Accéder à l'interface web

Rendez-vous sur [http://<IP_SERVEUR>/zabbix](http://<IP_SERVEUR>/zabbix).

### Conclusion
Zabbix offre une surveillance complète de mon homelab, avec des alertes par email et une intégration facile avec Grafana.
