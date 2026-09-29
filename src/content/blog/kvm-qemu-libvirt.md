---
title: "KVM, QEMU et libvirt : comprendre la virtualisation sous Linux"
description: "KVM, QEMU, libvirt... trois noms qu'on croise partout dès qu'on touche à la virtualisation sous Linux. Découvre le rôle de chacun, comment ils s'articulent, et comment créer ta première VM en ligne de commande."
pubDate: 2026-09-28
tags: ["Virtualisation", "KVM", "QEMU", "libvirt", "Linux", "Infrastructure"]
---

## Introduction

Si tu as déjà utilisé **Proxmox**, **virt-manager**, **GNOME Boxes** ou même **OpenStack**, tu as utilisé KVM et QEMU sans forcément le savoir. Ces trois briques **KVM**, **QEMU** et **libvirt** sont le socle de la virtualisation sous Linux.

Le problème, c'est qu'on les mélange souvent. On entend « une VM KVM », « une VM QEMU », « une VM libvirt »... alors qu'en réalité **les trois travaillent ensemble**, chacun à un niveau différent.

Dans cet article, on va voir :

- Ce qu'est la virtualisation et un hyperviseur.
- Le rôle exact de **KVM**, **QEMU** et **libvirt**.
- Comment ils s'empilent les uns sur les autres.
- Comment **créer et gérer une VM** en ligne de commande.

---

## Petit rappel : c'est quoi la virtualisation ?

La virtualisation, c'est le fait de faire tourner **plusieurs systèmes d'exploitation isolés** (les *invités*, ou *guests*) sur une seule machine physique (l'*hôte*, ou *host*).

Chaque machine virtuelle (VM) croit avoir son propre CPU, sa propre RAM, son propre disque et sa propre carte réseau. En réalité, tout ça est **partagé et contrôlé** par un logiciel : l'**hyperviseur**.

### Les deux types d'hyperviseurs

- **Type 1 (bare-metal)** : l'hyperviseur tourne directement sur le matériel. Exemples : VMware ESXi, Xen, Hyper-V.
- **Type 2 (hébergé)** : l'hyperviseur est une application qui tourne sur un OS classique. Exemples : VirtualBox, VMware Workstation.

Et KVM dans tout ça ? **C'est un peu des deux** 🤔 On y revient juste en dessous.

---

## KVM : l'accélération matérielle dans le noyau

**KVM** (*Kernel-based Virtual Machine*) est un **module du noyau Linux**, intégré depuis 2007 (noyau 2.6.20).

Son rôle est simple mais essentiel : **transformer le noyau Linux lui-même en hyperviseur**. Comme KVM vit dans le noyau et parle directement au matériel, on le classe généralement comme un hyperviseur de **type 1**, même si la machine hôte reste un Linux tout à fait normal.

### Comment ça marche ?

Les processeurs modernes intègrent des **extensions de virtualisation** :

- **Intel VT-x** (flag `vmx`)
- **AMD-V** (flag `svm`)

Ces extensions permettent au CPU d'exécuter le code d'une VM **directement sur le processeur physique**, à vitesse quasi native, tout en gardant l'isolation. KVM est la couche qui exploite ces instructions.

Concrètement, KVM expose un fichier spécial : **`/dev/kvm`**. N'importe quel programme qui sait l'utiliser peut créer des VMs accélérées.

### Ce que KVM ne fait PAS

C'est là que beaucoup se trompent : **KVM tout seul ne sait pas faire tourner une VM**. Il gère le CPU et la mémoire, mais il ne fournit :

- ni disque virtuel,
- ni carte réseau virtuelle,
- ni écran, clavier, USB,
- ni BIOS/UEFI.

Il lui faut un programme en espace utilisateur pour s'occuper de tout le reste. Et ce programme, c'est QEMU.

### Vérifier que ton CPU supporte KVM

```bash
grep -Ec '(vmx|svm)' /proc/cpuinfo
```

- Si le résultat est **supérieur à 0**, ton CPU supporte la virtualisation.
- Si c'est **0**, il faut sans doute l'activer dans le **BIOS/UEFI** (souvent appelé *Intel Virtualization Technology* ou *SVM Mode*).

Vérifie ensuite que les modules sont chargés :

```bash
lsmod | grep kvm
```

Tu devrais voir `kvm` et `kvm_intel` (ou `kvm_amd`). Et le fichier `/dev/kvm` doit exister :

```bash
ls -l /dev/kvm
```

---

## QEMU : l'émulateur qui fait tout le reste

**QEMU** (*Quick EMUlator*) est un **émulateur et virtualiseur open source**, qui tourne en **espace utilisateur** (c'est un programme classique, pas un module noyau).

### Les deux modes de QEMU

1. **Émulation complète (TCG)** : QEMU traduit les instructions d'une architecture vers une autre. Tu peux faire tourner une VM **ARM sur un PC x86**, ou une VM **RISC-V** sur ton laptop. C'est très puissant... mais **lent**, car chaque instruction est traduite.
2. **Virtualisation accélérée (avec KVM)** : quand l'invité a la même architecture que l'hôte, QEMU délègue l'exécution du CPU à KVM. Résultat : **performances quasi natives**.

### Ce que QEMU apporte

QEMU émule tout le **matériel** de la VM :

- Le **firmware** (SeaBIOS ou OVMF pour l'UEFI).
- Les **disques** (formats `qcow2`, `raw`...).
- Les **cartes réseau**, le **GPU**, l'**USB**, le **son**...

Il propose aussi les périphériques **virtio** : des pilotes *paravirtualisés*, conçus spécialement pour la virtualisation. L'invité sait qu'il est dans une VM et communique de manière optimisée avec l'hôte. **Utilise toujours virtio pour le disque et le réseau** quand c'est possible, la différence de performance est énorme.

### Lancer une VM avec QEMU « à la main »

Créer un disque virtuel de 20 Go au format `qcow2` :

```bash
qemu-img create -f qcow2 debian.qcow2 20G
```

Démarrer une VM qui boote sur une ISO d'installation :

```bash
qemu-system-x86_64 \
  -enable-kvm \
  -cpu host \
  -m 2048 \
  -smp 2 \
  -drive file=debian.qcow2,format=qcow2,if=virtio \
  -cdrom debian.iso \
  -boot d
```

Voici le détail de chaque option :

- **`-enable-kvm`** : utilise KVM pour l'accélération. **Sans cette option, QEMU passe en émulation pure et tout sera très lent.**
- **`-cpu host`** : expose à la VM le même modèle de CPU que l'hôte (meilleures performances).
- **`-m 2048`** : 2 Go de RAM.
- **`-smp 2`** : 2 vCPU.
- **`-drive ... if=virtio`** : attache le disque via un contrôleur virtio.
- **`-cdrom debian.iso`** : insère l'ISO dans un lecteur CD virtuel.
- **`-boot d`** : démarre sur le CD (`d`) plutôt que sur le disque (`c`).

Ça fonctionne... mais tu vois le problème : **une ligne de commande interminable**, rien n'est sauvegardé, pas de gestion du réseau, pas de démarrage automatique, pas de snapshots simples. Gérer 10 VMs comme ça, c'est l'enfer.

C'est exactement le problème que résout libvirt.

---

## libvirt : la couche de gestion

**libvirt** est une **API, un démon et un ensemble d'outils** pour gérer des plateformes de virtualisation de manière unifiée.

Au lieu de lancer QEMU à la main, tu **décris** ta VM, et libvirt se charge de :

- **Générer** la bonne commande QEMU et lancer le processus.
- **Persister** la configuration des VMs (au format XML).
- Gérer les **réseaux virtuels** (NAT, bridge, réseaux isolés).
- Gérer les **pools de stockage** et les volumes.
- Gérer les **snapshots**, la **migration à chaud**, le **démarrage automatique**...
- Appliquer une **isolation de sécurité** (SELinux/AppArmor via sVirt, cgroups).

### Pas seulement pour QEMU

libvirt n'est pas lié à QEMU/KVM : il sait aussi piloter **Xen**, **LXC**, **VirtualBox**, **Bhyve**... Le pilote QEMU/KVM reste de loin le plus utilisé.

### Les outils de l'écosystème

- **`libvirtd`** (ou les démons modulaires comme `virtqemud` sur les distributions récentes) : le démon qui fait le travail.
- **`virsh`** : l'outil en ligne de commande pour tout gérer.
- **`virt-install`** : pour créer des VMs facilement.
- **`virt-manager`** : une interface graphique très pratique.
- Et plein d'autres qui s'appuient sur l'API libvirt : **Cockpit**, **OpenStack Nova**, le **provider Terraform libvirt**...

### Les URI de connexion

libvirt se connecte à un hyperviseur via une **URI** :

- **`qemu:///system`** : les VMs système, gérées par root. C'est ce que tu veux dans 99 % des cas (serveur, homelab).
- **`qemu:///session`** : les VMs de ton utilisateur, sans privilèges (plus limité côté réseau).
- **`qemu+ssh://admin@serveur/system`** : gérer les VMs d'une **machine distante via SSH** 🔥 (si tu n'es pas à l'aise avec SSH, j'ai écrit [un guide complet](/blog/ssh-guide-debutant)).

---

## Comment tout ça s'empile

Voici l'architecture complète, du plus haut niveau au plus bas :

```
┌──────────────────────────────────────────────────┐
│  virsh · virt-manager · virt-install · Terraform │  ← Outils
├──────────────────────────────────────────────────┤
│              libvirt (API + démon)               │  ← Gestion
├──────────────────────────────────────────────────┤
│       QEMU (1 processus par VM, userspace)       │  ← Émulation du matériel
├──────────────────────────────────────────────────┤
│         KVM (module noyau, /dev/kvm)             │  ← Accélération CPU/RAM
├──────────────────────────────────────────────────┤
│   Matériel (CPU avec Intel VT-x / AMD-V)         │
└──────────────────────────────────────────────────┘
```

Pour résumer en une phrase chacun :

- **KVM** : *« Je fais tourner le CPU et la mémoire de la VM à vitesse native. »*
- **QEMU** : *« Je fabrique tout le matériel virtuel de la VM. »*
- **libvirt** : *« Je gère et j'orchestre les VMs pour que tu n'aies pas à parler à QEMU. »*

Petit détail intéressant : **chaque VM est un simple processus QEMU** sur l'hôte. Tu peux le vérifier avec :

```bash
ps aux | grep qemu
```

Tu verras la fameuse ligne de commande interminable, générée pour toi par libvirt.

### Et Proxmox dans tout ça ?

**Proxmox VE** utilise aussi **QEMU + KVM**, mais **pas libvirt** : il a sa propre couche de gestion (l'outil `qm` et son API REST). C'est un exemple parfait qui montre que **libvirt est une couche de gestion parmi d'autres**, alors que QEMU et KVM restent le moteur commun.

---

## Mise en pratique : installer et créer une VM

### Installation

- Debian/Ubuntu :

```bash
sudo apt update && sudo apt install qemu-system-x86 qemu-utils libvirt-daemon-system libvirt-clients virtinst
```

- Fedora/RHEL :

```bash
sudo dnf install @virtualization
```

Active et démarre le service :

```bash
sudo systemctl enable --now libvirtd
```

> Sur certaines distributions récentes (Fedora notamment), libvirt utilise des démons modulaires (`virtqemud`, `virtnetworkd`...) activés par socket. Dans ce cas, pas besoin de toucher à `libvirtd`.

Ajoute ton utilisateur au groupe `libvirt` pour éviter de tout faire en `sudo` :

```bash
sudo usermod -aG libvirt $USER
```

Déconnecte-toi puis reconnecte-toi pour que le groupe soit pris en compte.

Vérifie que tout fonctionne :

```bash
virsh -c qemu:///system list --all
```

Une liste vide sans erreur ? **C'est gagné.**

**Astuce** : pour ne pas retaper `-c qemu:///system` à chaque fois, ajoute cette ligne dans ton `~/.bashrc` ou `~/.zshrc` :

```bash
export LIBVIRT_DEFAULT_URI="qemu:///system"
```

### Activer le réseau par défaut

libvirt fournit un réseau NAT nommé `default` (sous-réseau `192.168.122.0/24`). Assure-toi qu'il est démarré et qu'il démarre automatiquement :

```bash
virsh net-list --all
virsh net-start default
virsh net-autostart default
```

### Créer une VM avec virt-install

```bash
virt-install \
  --name debian-test \
  --memory 2048 \
  --vcpus 2 \
  --disk size=20,format=qcow2,bus=virtio \
  --cdrom ~/iso/debian.iso \
  --os-variant debian12 \
  --network network=default,model=virtio \
  --graphics spice
```

Voici le détail :

- **`--name`** : le nom de la VM dans libvirt.
- **`--memory`** / **`--vcpus`** : RAM (en Mo) et nombre de vCPU.
- **`--disk size=20`** : crée automatiquement un disque de 20 Go dans le pool de stockage par défaut (`/var/lib/libvirt/images/`).
- **`--cdrom`** : l'ISO d'installation.
- **`--os-variant`** : indique l'OS invité pour que libvirt applique des réglages optimisés. Liste des valeurs possibles avec `osinfo-query os`.
- **`--network network=default,model=virtio`** : branche la VM sur le réseau NAT avec une carte virtio.
- **`--graphics spice`** : affichage graphique (accessible avec `virt-viewer` ou `virt-manager`).

Compare avec la commande QEMU brute de tout à l'heure : c'est **plus lisible**, et surtout **la VM est maintenant enregistrée** dans libvirt.

---

## Gérer ses VMs avec virsh

`virsh` est ton couteau suisse. Voici les commandes à connaître.

### Cycle de vie

```bash
virsh list --all                # Lister toutes les VMs (allumées et éteintes)
virsh start debian-test         # Démarrer
virsh shutdown debian-test      # Arrêt propre (ACPI)
virsh reboot debian-test        # Redémarrer
virsh destroy debian-test       # Arrêt brutal (≈ débrancher la prise)
virsh autostart debian-test     # Démarrer la VM au boot de l'hôte
```

**Attention** : malgré son nom effrayant, `destroy` **ne supprime pas** la VM, il la coupe brutalement. Pour supprimer réellement une VM :

```bash
virsh undefine debian-test --remove-all-storage
```

Là, par contre, **tout est effacé**, disque compris.

### Informations et accès

```bash
virsh dominfo debian-test       # Infos générales
virsh domifaddr debian-test     # Adresse IP de la VM
virsh console debian-test       # Console série (quitter avec Ctrl + ])
```

### Snapshots

```bash
virsh snapshot-create-as debian-test avant-maj "Snapshot avant mise à jour"
virsh snapshot-list debian-test
virsh snapshot-revert debian-test avant-maj
virsh snapshot-delete debian-test avant-maj
```

Parfait avant de tester une manip risquée sur une VM.

---

## La configuration XML

Chaque VM (appelée **domaine** dans le vocabulaire libvirt) est décrite par un fichier **XML**. Pour l'afficher :

```bash
virsh dumpxml debian-test
```

Voici un extrait simplifié :

```xml
<domain type='kvm'>
  <name>debian-test</name>
  <memory unit='MiB'>2048</memory>
  <vcpu>2</vcpu>
  <os>
    <type arch='x86_64' machine='q35'>hvm</type>
  </os>
  <cpu mode='host-passthrough'/>
  <devices>
    <disk type='file' device='disk'>
      <driver name='qemu' type='qcow2'/>
      <source file='/var/lib/libvirt/images/debian-test.qcow2'/>
      <target dev='vda' bus='virtio'/>
    </disk>
    <interface type='network'>
      <source network='default'/>
      <model type='virtio'/>
    </interface>
  </devices>
</domain>
```

Tu retrouves exactement les briques vues plus haut :

- **`type='kvm'`** : libvirt demande à QEMU d'utiliser l'accélération KVM.
- **`<driver name='qemu' type='qcow2'/>`** : QEMU gère le disque au format qcow2.
- **`bus='virtio'`** / **`model type='virtio'`** : les périphériques paravirtualisés.

Pour modifier une VM (ajouter de la RAM, un disque, une carte réseau...) :

```bash
virsh edit debian-test
```

Les changements s'appliquent au **prochain démarrage** de la VM.

Et comme tout est déclaratif en XML, tu peux **versionner** tes définitions de VMs dans Git et les recréer avec :

```bash
virsh define debian-test.xml
```

Un premier pas vers l'infrastructure as code 😎

---

## Récapitulatif

| Composant | Où il tourne | Son rôle | Peut-il fonctionner seul ? |
|-----------|--------------|----------|----------------------------|
| **KVM** | Noyau Linux | Exécute le CPU et la RAM des VMs à vitesse native | Non, il a besoin d'un programme userspace |
| **QEMU** | Espace utilisateur | Émule le matériel (disques, réseau, firmware...) | Oui, mais lent sans KVM |
| **libvirt** | Espace utilisateur (démon) | Gère, configure et orchestre les VMs | Non, il pilote un hyperviseur (QEMU, Xen, LXC...) |

---

## Conclusion

KVM, QEMU et libvirt ne sont pas trois alternatives : **ce sont trois couches complémentaires**. Avec cet article, tu sais maintenant :

- **Ce que fait KVM** : l'accélération matérielle dans le noyau.
- **Ce que fait QEMU** : l'émulation du matériel virtuel.
- **Ce que fait libvirt** : la gestion unifiée des VMs.
- **Créer et gérer une VM** avec `virt-install` et `virsh`.

La prochaine étape ? Automatiser tout ça avec **Terraform** ou **Ansible**, ou passer sur un hyperviseur complet comme **Proxmox**... qui, sous le capot, utilise exactement les mêmes briques QEMU/KVM.
