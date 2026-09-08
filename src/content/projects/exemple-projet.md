---
title: "Mon infrastructure Homelab"
description: "Mise en place d'une infrastructure complète avec Proxmox, Kubernetes et Terraform"
pubDate: 2026-09-01
tags:
  - Proxmox
  - Kubernetes
  - Terraform
  - Infrastructure
github: "https://github.com/username/homelab"
---

# Mon infrastructure Homelab

## Présentation

Ce projet présente la mise en place complète de mon infrastructure homelab, incluant la virtualisation avec Proxmox, l'orchestration avec Kubernetes et l'automatisation via Terraform.

## Technologies utilisées

- **Proxmox VE** : Plateforme de virtualisation open-source
- **Kubernetes** : Orchestration de conteneurs
- **Terraform** : Infrastructure as Code
- **Ansible** : Gestion de configuration

## Architecture

L'infrastructure est composée de plusieurs nœuds Proxmox, avec des VMs dédiées pour :
- Un cluster Kubernetes
- Des services de monitoring (Prometheus, Grafana)
- Des outils de CI/CD (GitLab Runner)

## Automatisation

Tout est automatisé via Terraform pour provisionner les VMs et Ansible pour leur configuration.

```hcl
resource "proxmox_vm_qemu" "k8s_master" {
  name        = "k8s-master-01"
  target_node = "proxmox-01"
  vmid        = 100
  
  cores   = 4
  memory  = 8192
  
  # ... configuration complète
}
```

## Résultats

Cette infrastructure me permet de :
- Tester différentes technologies
- Héberger mes projets personnels
- Apprendre les bonnes pratiques DevOps
