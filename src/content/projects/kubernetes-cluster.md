---
title: "Cluster Kubernetes Personnel"
description: "Déploiement d'un cluster Kubernetes sur Proxmox avec Terraform et GitOps"
pubDate: 2026-08-20
tags:
  - Kubernetes
  - Proxmox
  - Terraform
  - GitOps
  - ArgoCD
github: "https://github.com/username/k8s-homelab"
---

# Cluster Kubernetes Personnel

## Vue d'ensemble

Ce projet présente la mise en place d'un cluster Kubernetes complet sur mon infrastructure Proxmox, avec un focus sur l'automatisation et les bonnes pratiques DevOps.

## Architecture

Le cluster est composé de :
- 3 nœuds master (control plane)
- 3 nœuds worker
- Un load balancer HAProxy
- Un stockage distribué avec Longhorn

## Stack Technique

### Infrastructure
- **Proxmox VE** : Hyperviseur de virtualisation
- **Terraform** : Provisioning des VMs
- **Ansible** : Configuration automatisée
- **kubeadm** : Installation de Kubernetes

### GitOps
- **ArgoCD** : Déploiement continu
- **Helm** : Gestion des packages
- **Kustomize** : Configuration des manifestes

## Fonctionnalités

### Monitoring
- Prometheus pour la collecte de métriques
- Grafana pour la visualisation
- Alertmanager pour les notifications

### Networking
- Cilium comme CNI
- MetalLB pour le LoadBalancing
- Ingress NGINX pour le routage HTTP

### Sécurité
- Vault pour la gestion des secrets
- Cert-manager pour les certificats SSL
- Network Policies avec Cilium

## Code d'exemple

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: prometheus
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://prometheus-community.github.io/helm-charts
    chart: kube-prometheus-stack
    targetRevision: 45.0.0
  destination:
    server: https://kubernetes.default.svc
    namespace: monitoring
```

## Résultats

Ce cluster me permet de :
- Héberger mes applications personnelles
- Expérimenter avec les dernières technologies cloud-native
- Mettre en pratique les concepts DevOps
- Avoir une plateforme de test pour mes projets

## Prochaines étapes

- Mise en place de la haute disponibilité
- Intégration d'un service mesh (Istio)
- Automatisation des backups
- Implémentation de politiques de sécurité avancées
