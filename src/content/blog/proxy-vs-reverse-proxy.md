---
title: "Proxy vs reverse proxy : comprendre enfin la différence"
description: "Proxy, reverse proxy... deux mots qui se ressemblent mais qui ne jouent pas du tout le même rôle. Découvre qui chacun représente, à quoi ils servent, et comment en mettre un en place avec Squid et Nginx."
pubDate: 2026-10-04
tags: ["Réseau", "Proxy", "Reverse proxy", "Nginx", "Squid", "Infrastructure"]
---

## Introduction

Si tu as déjà travaillé en entreprise, tu as sûrement croisé un **proxy** : ce truc qu'il faut configurer pour que `apt`, `npm` ou `docker pull` daignent fonctionner. Et si tu as déjà déployé une application web, tu as forcément croisé un **reverse proxy** : Nginx, Traefik, Caddy, HAProxy...

Les deux noms se ressemblent, les deux font « intermédiaire »... et pourtant **ils ne jouent pas du tout le même rôle**. On les confond souvent, et on entend même parfois « un proxy Nginx » pour parler d'un reverse proxy.

Dans cet article, on va voir :

- Ce qu'est un proxy, au sens général.
- Le rôle du **proxy** (ou *forward proxy*) et ses cas d'usage.
- Le rôle du **reverse proxy** et ses cas d'usage.
- La vraie question à se poser pour ne plus jamais les confondre.
- Ce qui se passe avec **HTTPS** et les **headers** `X-Forwarded-*`.
- Comment **mettre en place les deux** avec Docker, Squid et Nginx.

---

## Petit rappel : c'est quoi un proxy ?

Un proxy, c'est un **intermédiaire**. Au lieu que le client parle directement au serveur, il passe par une machine qui **reçoit la requête, la relaie, récupère la réponse et la renvoie**.

```
Client  ──────►  Proxy  ──────►  Serveur
        ◄──────         ◄──────
```

Le mot vient de l'anglais *proxy* : « mandataire », quelqu'un qui agit **au nom de** quelqu'un d'autre. Et c'est exactement là que se cache toute la différence : **au nom de qui** le proxy agit-il ? 🤔

- S'il agit au nom du **client** → c'est un **proxy** (forward proxy).
- S'il agit au nom du **serveur** → c'est un **reverse proxy**.

Garde cette idée en tête, tout le reste en découle.

---

## Le proxy (forward proxy) : le mandataire du client

Le **forward proxy** (qu'on appelle simplement « proxy » la plupart du temps) se place **devant les clients**. Les clients savent qu'il existe, sont configurés pour l'utiliser, et lui envoient toutes leurs requêtes sortantes vers Internet.

```
           Réseau de l'entreprise                       Internet
┌────────────────────────────────────────┐
│  PC 1 ──┐                              │
│  PC 2 ──┼──►  Forward proxy  ──────────┼──►  google.com
│  PC 3 ──┘     (proxy.corp:3128)        │     github.com
└────────────────────────────────────────┘     registry.npmjs.org
```

Du point de vue du serveur distant, **la requête vient du proxy**, pas du PC. Il voit l'IP du proxy, et c'est tout.

### À quoi ça sert ?

- **Filtrer le trafic sortant** : bloquer certains sites ou catégories (réseaux sociaux, sites malveillants...). C'est l'usage numéro un en entreprise.
- **Contrôler qui sort** : authentifier les utilisateurs avant de les laisser accéder à Internet.
- **Journaliser** : garder une trace de qui a accédé à quoi (obligations légales, audit, sécurité).
- **Mettre en cache** : si 200 postes téléchargent la même mise à jour, le proxy ne la récupère qu'une fois.
- **Masquer les clients** : les serveurs ne voient que l'IP du proxy. C'est le principe d'un service d'anonymisation.
- **Sortir depuis un réseau fermé** : dans les environnements très sécurisés (banques, santé, industrie), les serveurs n'ont souvent **aucun accès direct à Internet**. Le proxy est la seule porte de sortie, et elle est très surveillée.

### Les différents types de forward proxy

- **Proxy HTTP** : le client lui envoie ses requêtes HTTP avec l'URL complète (`GET http://exemple.com/page HTTP/1.1`), et le proxy les relaie.
- **Proxy HTTPS via `CONNECT`** : pour HTTPS, le client demande au proxy d'ouvrir un **tunnel TCP** vers le serveur (`CONNECT exemple.com:443`). Le chiffrement TLS se fait ensuite de bout en bout entre le client et le serveur, *à travers* le tunnel. On y revient plus bas.
- **Proxy SOCKS (SOCKS5)** : un proxy plus bas niveau, qui relaie n'importe quel trafic TCP (et UDP en SOCKS5), pas seulement du HTTP. SSH sait d'ailleurs en créer un en une commande.
- **Proxy transparent** : le client n'est pas configuré, c'est le réseau (routeur, pare-feu) qui **redirige** le trafic vers le proxy sans que le client le sache. Pratique, mais plus délicat avec HTTPS.

Les outils classiques : **Squid** (la référence open source), **Zscaler**, **Bluecoat/Symantec**, **Forcepoint**... et côté perso, n'importe quel VPN commercial joue un rôle très proche.

### Utiliser un proxy en ligne de commande

La plupart des outils CLI respectent ces variables d'environnement :

```
export http_proxy="http://proxy.corp:3128"
export https_proxy="http://proxy.corp:3128"
export no_proxy="localhost,127.0.0.1,.corp.local"
```

- **`http_proxy` / `https_proxy`** : le proxy à utiliser selon le protocole de la destination. Note que l'URL du proxy est souvent en `http://` même pour `https_proxy` : c'est le protocole pour parler **au proxy**, pas au site.
- **`no_proxy`** : les destinations qui ne doivent **pas** passer par le proxy (typiquement le réseau interne).

> Selon les outils, ce sont les variables en minuscules ou en majuscules (`HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`) qui sont lues. En cas de doute, exporte les deux versions.

Avec `curl`, tu peux aussi préciser le proxy directement :

```
curl -x http://proxy.corp:3128 https://exemple.com
```

### Bonus : un proxy SOCKS en une commande avec SSH

Tu as un serveur accessible en SSH ? Tu as déjà un proxy 🔥

```
ssh -D 1080 -N user@mon-serveur
```

- **`-D 1080`** : ouvre un proxy SOCKS sur le port `1080` de ta machine.
- **`-N`** : n'exécute aucune commande distante, on veut juste le tunnel.

Tout ce qui passe par `localhost:1080` sort désormais **depuis ton serveur** :

```
curl --socks5-hostname localhost:1080 https://ifconfig.me
```

L'IP affichée est celle de ton serveur, pas la tienne. (Si SSH n'est pas encore ton meilleur ami, j'ai écrit [un guide complet pour débuter](https://teo-franoux.fr/blog/ssh-guide-debutant).)

---

## Le reverse proxy : le mandataire du serveur

Le **reverse proxy**, lui, se place **devant les serveurs**. Les clients ne savent même pas qu'il existe : pour eux, le reverse proxy **est** le site. Il reçoit les requêtes entrantes et les redirige vers le bon service en interne.

```
     Internet                        Infrastructure
                    ┌──────────────────────────────────────────────┐
                    │                       ┌──►  app (port 3000)   │
Client  ──► :443 ───┼──►  Reverse proxy  ───┼──►  api (port 8080)   │
                    │     (Nginx)           └──►  grafana (3001)    │
                    └──────────────────────────────────────────────┘
```

Du point de vue du client, **il parle à `monsite.fr`**. Il ne voit ni les ports internes, ni les IP des backends, ni combien de serveurs il y a derrière.

### À quoi ça sert ?

- **Point d'entrée unique** : un seul couple de ports ouverts (80/443) pour exposer des dizaines de services. Le reverse proxy route selon le **nom de domaine** (`api.monsite.fr`, `grafana.monsite.fr`) ou le **chemin** (`/api`, `/admin`).
- **Terminaison TLS** : c'est lui qui gère les **certificats HTTPS** (souvent automatiquement avec Let's Encrypt). Les applications derrière peuvent parler en HTTP simple sur le réseau interne.
- **Répartition de charge (load balancing)** : répartir les requêtes entre plusieurs instances d'une même application, et retirer automatiquement celles qui ne répondent plus (*health checks*).
- **Sécurité** : masquer l'architecture interne, appliquer du **rate limiting**, filtrer les IP, ajouter des headers de sécurité, ou servir de **WAF** (*Web Application Firewall*).
- **Performance** : cache des réponses, compression (gzip, brotli), service direct des fichiers statiques, HTTP/2 et HTTP/3 côté client même si le backend ne les gère pas.
- **Déploiements sans coupure** : basculer le trafic d'une version à l'autre (blue/green, canary) sans que les clients s'en rendent compte.

Les outils classiques : **Nginx**, **HAProxy**, **Traefik**, **Caddy**, **Envoy**, **Apache** (avec `mod_proxy`)... et à grande échelle, des services comme **Cloudflare** jouent aussi ce rôle devant ton site.

### À quoi ça ressemble avec Nginx

```
server {
    listen 80;
    server_name api.monsite.fr;

    location / {
        proxy_pass http://127.0.0.1:8080;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- **`server_name`** : ce bloc s'applique aux requêtes destinées à `api.monsite.fr`.
- **`proxy_pass`** : l'adresse du backend vers lequel relayer la requête.
- **`proxy_set_header`** : les informations sur le client d'origine à transmettre au backend. Sans ça, ton application croit que **toutes les requêtes viennent de `127.0.0.1`**. On détaille ça juste après.

Et avec **Caddy**, qui gère le HTTPS automatiquement, c'est encore plus court :

```
api.monsite.fr {
    reverse_proxy 127.0.0.1:8080
}
```

Oui, c'est tout. Certificat Let's Encrypt compris 😎

### Et Kubernetes dans tout ça ?

Dans Kubernetes, le reverse proxy s'appelle un **Ingress Controller** (ou, avec l'API plus récente, une implémentation de la **Gateway API**). Nginx, Traefik, HAProxy, Envoy... ce sont les mêmes outils, simplement pilotés par des ressources Kubernetes au lieu de fichiers de configuration. **k3s**, par exemple, embarque **Traefik** par défaut.

---

## La vraie différence : qui le proxy représente-t-il ?

Techniquement, un proxy et un reverse proxy font **la même chose** : recevoir une requête, la relayer, renvoyer la réponse. D'ailleurs, Nginx peut faire les deux, et Squid aussi. La différence n'est pas dans le logiciel, elle est dans **la position** et **le camp** du proxy.

```
FORWARD PROXY : dans le camp des clients

  ┌─ Réseau du client ─────────┐
  │  Client ──┐                │
  │  Client ──┼──►  Proxy  ────┼──►  Internet  ──►  Serveur
  │  Client ──┘                │
  └────────────────────────────┘


REVERSE PROXY : dans le camp des serveurs

                                ┌─ Réseau du serveur ────────────┐
                                │                  ┌──►  Serveur │
  Client  ──►  Internet  ───────┼──►  Reverse  ────┼──►  Serveur │
                                │     proxy        └──►  Serveur │
                                └────────────────────────────────┘
```

Quelques questions pour trancher à coup sûr :

- **Qui l'a installé ?** L'équipe qui gère les postes clients → proxy. L'équipe qui héberge le service → reverse proxy.
- **Qui sait qu'il existe ?** Le client est configuré pour l'utiliser → proxy. Le client n'en a aucune idée → reverse proxy.
- **Qui est caché ?** Le serveur ne voit pas le vrai client → proxy. Le client ne voit pas le vrai serveur → reverse proxy.
- **Quel trafic ?** Sortant, vers n'importe quel site → proxy. Entrant, vers un ensemble de services précis → reverse proxy.

Et le meilleur exemple pour comprendre que ce sont deux rôles distincts : **les deux peuvent exister sur le même trajet**. Quand tu consultes un site depuis le réseau de ton entreprise, ta requête passe d'abord par le **proxy de ton entreprise**, puis traverse Internet, puis arrive sur le **reverse proxy de l'hébergeur** du site.

```
PC ──► Proxy entreprise ──► Internet ──► Reverse proxy du site ──► Application
       (camp du client)                  (camp du serveur)
```

---

## Ce qui voyage dans les headers

Quand une requête passe par un intermédiaire, le serveur final perd une information importante : **qui est le vrai client ?** La connexion TCP qu'il reçoit vient du proxy, pas du navigateur.

Pour ne pas perdre cette information, les proxies ajoutent des **headers HTTP** :

- **`X-Forwarded-For`** : l'IP du client d'origine, puis celle de chaque proxy traversé (`X-Forwarded-For: 203.0.113.42, 10.0.0.5`).
- **`X-Forwarded-Proto`** : le protocole utilisé par le client (`https`). Indispensable quand le reverse proxy termine le TLS : sans lui, ton application croit recevoir du HTTP et peut générer des redirections en boucle ou des liens en `http://`.
- **`X-Forwarded-Host`** : le nom de domaine demandé à l'origine.
- **`X-Real-IP`** : une variante plus simple utilisée par Nginx, avec uniquement l'IP du client.
- **`Forwarded`** : le header **standardisé** (RFC 7239) qui regroupe tout ça (`Forwarded: for=203.0.113.42;proto=https;host=monsite.fr`). Plus propre, mais moins répandu que les `X-Forwarded-*`.

### Attention : ne fais pas confiance à ces headers aveuglément

N'importe quel client peut envoyer lui-même un header `X-Forwarded-For: 1.2.3.4`. Si ton application lit ce header sans réfléchir, un attaquant peut **usurper son IP** pour contourner un rate limiting ou une liste blanche.

La règle : ton application ne doit faire confiance à ces headers **que s'ils viennent d'un proxy de confiance**. La plupart des frameworks ont une option pour ça (*trusted proxies*, `trust proxy`...), et Nginx a le module `real_ip` avec `set_real_ip_from`.

---

## Et avec HTTPS, il se passe quoi ?

C'est ici que les deux rôles se distinguent encore plus nettement.

### Côté forward proxy : un tunnel aveugle (en principe)

Quand ton navigateur passe par un proxy pour aller sur un site en HTTPS, il envoie :

```
CONNECT exemple.com:443 HTTP/1.1
Host: exemple.com:443
```

Le proxy ouvre une connexion TCP vers `exemple.com:443`, répond `200 Connection established`, puis se contente de **faire passer les octets** dans les deux sens. Le TLS est négocié **directement entre ton navigateur et le serveur**.

Résultat : le proxy voit **à quel domaine tu te connectes**, mais **pas ce que tu y fais** (ni les URL, ni le contenu).

> Sauf si ton entreprise fait de l'**inspection TLS** (*TLS interception*). Dans ce cas, le proxy déchiffre le trafic en générant à la volée de faux certificats, signés par une autorité de certification interne **installée sur tous les postes** de l'entreprise. Ton navigateur fait confiance à cette autorité, donc il ne voit rien d'anormal. C'est techniquement une attaque *man-in-the-middle*, mais assumée et encadrée. C'est d'ailleurs pour ça qu'en entreprise, `curl` ou `pip` râlent parfois sur des certificats « invalides » : ils n'utilisent pas toujours le magasin de certificats du système.

### Côté reverse proxy : il détient les certificats

Le reverse proxy, lui, **est le serveur** aux yeux du client. Il possède donc le **certificat et la clé privée** du site, et deux options s'offrent à lui :

- **Terminaison TLS** (le cas le plus courant) : le reverse proxy déchiffre la requête, peut lire les headers, l'URL, router par chemin, ajouter des headers, mettre en cache... puis relaie en HTTP (ou en HTTPS si tu veux chiffrer aussi le réseau interne, on parle alors de *TLS re-encryption*).
- **TLS passthrough** : le reverse proxy ne déchiffre rien et relaie le flux TCP chiffré tel quel. Il peut quand même router grâce au **SNI** (le nom de domaine envoyé en clair au début de la négociation TLS). Utile quand l'application doit gérer elle-même son certificat, ou pour du mTLS de bout en bout. En contrepartie, plus de routage par chemin ni de headers ajoutés.

---

## Reverse proxy, load balancer, API gateway : c'est pareil ?

Ces termes se chevauchent beaucoup, alors mettons un peu d'ordre :

- **Reverse proxy** : le concept général, un intermédiaire placé devant des serveurs.
- **Load balancer** : un reverse proxy **spécialisé** dans la répartition de charge. Il peut travailler au **niveau 7** (HTTP, il comprend les requêtes) ou au **niveau 4** (TCP/UDP, il ne voit que des connexions). Un load balancer L4 n'est pas vraiment un reverse proxy HTTP, puisqu'il ne lit pas les requêtes.
- **API gateway** : un reverse proxy orienté **API**, avec en plus de l'authentification (JWT, clés d'API), des quotas, de la transformation de requêtes, du versioning... Exemples : Kong, Tyk, AWS API Gateway.
- **CDN** : un réseau de reverse proxies **répartis géographiquement** qui mettent ton contenu en cache au plus près des utilisateurs.

En résumé : **tous les load balancers HTTP, API gateways et CDN sont des reverse proxies**, mais avec une spécialité.

---

## Mise en pratique : monter les deux avec Docker

Rien ne vaut un test pour bien comprendre. On va monter un forward proxy avec **Squid**, puis un reverse proxy avec **Nginx**, et observer ce que chacun voit passer.

### Un forward proxy avec Squid

Lance Squid dans un conteneur :

```
docker run -d --name squid -p 3128:3128 ubuntu/squid
```

Par défaut, la configuration de Squid autorise les clients des réseaux privés, ce qui inclut le réseau Docker. Fais maintenant une requête **à travers le proxy** :

```
curl -x http://localhost:3128 -I https://example.com
```

Tu devrais voir passer deux réponses :

```
HTTP/1.1 200 Connection established

HTTP/2 200
content-type: text/html
...
```

La première vient **du proxy** (le tunnel `CONNECT` est ouvert), la seconde vient **du vrai serveur**, à travers le tunnel. Va voir les logs de Squid :

```
docker exec squid tail /var/log/squid/access.log
```

Tu y verras une ligne avec `CONNECT example.com:443` : Squid sait **où** tu es allé, mais pas **quelle page** tu as demandée. C'est exactement ce qu'on a vu dans la partie sur HTTPS.

Fais maintenant le test en HTTP simple :

```
curl -x http://localhost:3128 -I http://example.com
```

Cette fois, les logs montrent l'**URL complète** (`GET http://example.com/`) : sans chiffrement, le proxy voit tout.

### Un reverse proxy avec Nginx

On va exposer deux applications derrière un seul Nginx. Pour les applications, on utilise **`traefik/whoami`**, une petite image qui renvoie simplement les détails de la requête reçue. Parfait pour observer les headers.

Crée un dossier avec ce fichier `docker-compose.yml` :

```
services:
  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - app1
      - app2

  app1:
    image: traefik/whoami
    hostname: app1

  app2:
    image: traefik/whoami
    hostname: app2
```

Remarque que **seul Nginx publie un port**. Les applications ne sont pas joignables directement depuis l'extérieur, uniquement via le reverse proxy.

Et ce fichier `nginx.conf` :

```
server {
    listen 80;
    server_name app1.localhost;

    location / {
        proxy_pass http://app1:80;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name app2.localhost;

    location / {
        proxy_pass http://app2:80;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Lance le tout :

```
docker compose up -d
```

Puis interroge les deux applications **sur le même port**, en changeant uniquement le nom de domaine demandé grâce au header `Host` :

```
curl -H "Host: app1.localhost" http://localhost:8080
curl -H "Host: app2.localhost" http://localhost:8080
```

Dans la réponse, regarde la ligne `Hostname` : elle vaut `app1` puis `app2`. **Même port, même IP, deux applications différentes** : c'est le routage par nom de domaine. Regarde aussi les headers `X-Forwarded-For` et `X-Real-Ip` : ils contiennent l'IP de ton client, transmise par Nginx. Commente les lignes `proxy_set_header`, redémarre Nginx, et tu verras que l'application ne voit plus que l'IP de Nginx.

**Astuce** : la plupart des navigateurs résolvent automatiquement les domaines en `.localhost` vers `127.0.0.1`. Tu peux donc aussi ouvrir directement `http://app1.localhost:8080` dans ton navigateur, sans toucher au fichier `/etc/hosts`.

Quand tu as fini, nettoie :

```
docker compose down
docker rm -f squid
```

---

## Récapitulatif

| | **Proxy (forward proxy)** | **Reverse proxy** |
| --- | --- | --- |
| **Agit au nom de** | Les clients | Les serveurs |
| **Placé devant** | Les clients, en sortie du réseau | Les serveurs, en entrée de l'infra |
| **Qui le configure** | Le client (navigateur, variables d'env, OS) | Personne côté client, c'est transparent |
| **Qui est masqué** | Le client (le serveur voit l'IP du proxy) | Le serveur (le client ne voit que le proxy) |
| **Trafic** | Sortant, vers n'importe quelle destination | Entrant, vers des services précis |
| **Usages typiques** | Filtrage, journalisation, cache, contrôle de la sortie Internet, anonymisation | Routage, terminaison TLS, load balancing, cache, sécurité |
| **Avec HTTPS** | Tunnel `CONNECT`, ne voit que le domaine (sauf inspection TLS) | Détient les certificats, déchiffre et route |
| **Outils** | Squid, Zscaler, SSH `-D`, VPN | Nginx, HAProxy, Traefik, Caddy, Envoy, Cloudflare |

---

## Conclusion

Proxy et reverse proxy utilisent **la même mécanique**, souvent **les mêmes logiciels**, mais ils ne sont **pas dans le même camp**. Avec cet article, tu sais maintenant :

- **Ce que fait un forward proxy** : représenter et contrôler les clients qui sortent vers Internet.
- **Ce que fait un reverse proxy** : représenter et protéger les serveurs qui reçoivent du trafic.
- **Comment les distinguer** : se demander au nom de qui le proxy agit, et qui sait qu'il existe.
- **Ce qui se passe avec HTTPS** et pourquoi les headers `X-Forwarded-*` sont indispensables (mais à manier avec précaution).
- **Monter les deux** avec Squid et Nginx.

La prochaine étape ? Mettre un vrai reverse proxy devant tes services avec du **HTTPS automatique** via **Traefik** ou **Caddy**, ou aller voir comment un **Ingress Controller** fait exactement la même chose dans un cluster Kubernetes.
