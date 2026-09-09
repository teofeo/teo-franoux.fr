---
title: "Automatiser son Infrastructure avec Ansible : De 0 à Production"
description: "Comment j'ai automatisé la gestion de mon infrastructure serveur avec Ansible, du provisionning initial au déploiement d'applications."
pubDate: 2026-09-07
tags:
  - Ansible
  - Automation
  - Infrastructure
  - DevOps
  - Configuration Management
  - Linux
---

# Automatiser son Infrastructure avec Ansible : De 0 à Production

Gérer manuellement une infrastructure de plusieurs serveurs devient rapidement un cauchemar : configurations qui dérivent, oublis, erreurs humaines, temps perdu... J'ai décidé de tout automatiser avec **Ansible**, et après 6 mois d'utilisation intensive, je ne reviendrai jamais en arrière. Voici mon retour d'expérience complet.

## Le Problème Initial

Avant Ansible, mon workflow ressemblait à ça :

1. 🖥️ SSH sur chaque serveur manuellement
2. 📝 Suivre une checklist (parfois incomplète)
3. ⚙️ Exécuter des commandes à la main
4. 🙏 Espérer ne rien avoir oublié
5. 🔁 Répéter pour chaque serveur...

**Résultats** :
- ⏱️ 2-3 heures pour configurer un nouveau serveur
- 🐛 Configurations différentes entre serveurs
- 📊 Aucune traçabilité des changements
- 😰 Stress permanent à chaque mise à jour

## Pourquoi Ansible ?

J'ai évalué plusieurs outils (Puppet, Chef, Salt) avant de choisir Ansible :

| Critère | Ansible | Puppet | Chef |
|---------|---------|--------|------|
| Courbe d'apprentissage | ✅ Faible | ❌ Élevée | ❌ Élevée |
| Agent requis | ✅ Non | ❌ Oui | ❌ Oui |
| Langage | ✅ YAML | DSL Ruby-like | ❌ Ruby |
| Architecture | ✅ Sans serveur | Serveur master | Serveur master |
| Communauté | ✅ Énorme | Bonne | Bonne |

**Ansible gagne** grâce à sa simplicité : pas d'agent à installer, juste SSH et Python. Parfait pour commencer rapidement.

## Architecture de mon Setup Ansible

Voici comment j'ai structuré mon dépôt :

```
ansible/
├── ansible.cfg
├── inventory/
│   ├── production/
│   │   ├── hosts.yml
│   │   └── group_vars/
│   │       ├── all.yml
│   │       ├── webservers.yml
│   │       └── databases.yml
│   └── staging/
│       ├── hosts.yml
│       └── group_vars/
├── roles/
│   ├── common/
│   ├── nginx/
│   ├── postgresql/
│   ├── docker/
│   └── monitoring/
├── playbooks/
│   ├── site.yml
│   ├── webservers.yml
│   └── databases.yml
├── group_vars/
│   └── all/
│       ├── vars.yml
│       └── vault.yml
└── requirements.yml
```

### Fichier d'Inventaire

Mon fichier `inventory/production/hosts.yml` :

```yaml
all:
  children:
    webservers:
      hosts:
        web01:
          ansible_host: 192.168.1.10
          ansible_user: deploy
        web02:
          ansible_host: 192.168.1.11
          ansible_user: deploy
    
    databases:
      hosts:
        db01:
          ansible_host: 192.168.1.20
          ansible_user: deploy
          postgresql_version: 15
    
    monitoring:
      hosts:
        monitor01:
          ansible_host: 192.168.1.30
          ansible_user: deploy
```

## Mon Premier Playbook : Hardening de Base

Le rôle `common` que j'applique sur tous mes serveurs :

```yaml
---
# roles/common/tasks/main.yml
- name: Update apt cache
  apt:
    update_cache: yes
    cache_valid_time: 3600
  tags: packages

- name: Upgrade all packages
  apt:
    upgrade: dist
    autoremove: yes
  tags: packages

- name: Install essential packages
  apt:
    name:
      - vim
      - git
      - curl
      - wget
      - htop
      - net-tools
      - ufw
      - fail2ban
      - unattended-upgrades
    state: present
  tags: packages

- name: Configure automatic security updates
  template:
    src: 50unattended-upgrades.j2
    dest: /etc/apt/apt.conf.d/50unattended-upgrades
    owner: root
    group: root
    mode: '0644'
  tags: security

- name: Create deploy user
  user:
    name: "{{ deploy_user }}"
    shell: /bin/bash
    groups: sudo
    append: yes
    create_home: yes
  tags: users

- name: Add SSH authorized keys for deploy user
  authorized_key:
    user: "{{ deploy_user }}"
    state: present
    key: "{{ item }}"
  loop: "{{ ssh_public_keys }}"
  tags: users

- name: Disable SSH password authentication
  lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^#?PasswordAuthentication'
    line: 'PasswordAuthentication no'
    state: present
  notify: restart sshd
  tags: security

- name: Disable SSH root login
  lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^#?PermitRootLogin'
    line: 'PermitRootLogin no'
    state: present
  notify: restart sshd
  tags: security

- name: Configure UFW defaults
  ufw:
    direction: "{{ item.direction }}"
    policy: "{{ item.policy }}"
  loop:
    - { direction: 'incoming', policy: 'deny' }
    - { direction: 'outgoing', policy: 'allow' }
  tags: firewall

- name: Allow SSH through UFW
  ufw:
    rule: allow
    port: '22'
    proto: tcp
  tags: firewall

- name: Enable UFW
  ufw:
    state: enabled
  tags: firewall

- name: Configure fail2ban
  template:
    src: jail.local.j2
    dest: /etc/fail2ban/jail.local
    owner: root
    group: root
    mode: '0644'
  notify: restart fail2ban
  tags: security
```

### Handlers

Les handlers dans `roles/common/handlers/main.yml` :

```yaml
---
- name: restart sshd
  service:
    name: sshd
    state: restarted

- name: restart fail2ban
  service:
    name: fail2ban
    state: restarted
```

## Rôle NGINX avec Let's Encrypt

Un de mes rôles les plus utiles : déployer NGINX avec SSL automatique.

```yaml
---
# roles/nginx/tasks/main.yml
- name: Install NGINX
  apt:
    name: nginx
    state: present
    update_cache: yes

- name: Install Certbot for Let's Encrypt
  apt:
    name:
      - certbot
      - python3-certbot-nginx
    state: present

- name: Remove default NGINX site
  file:
    path: /etc/nginx/sites-enabled/default
    state: absent
  notify: reload nginx

- name: Create NGINX sites-available configuration
  template:
    src: "{{ item.template }}"
    dest: "/etc/nginx/sites-available/{{ item.name }}"
    owner: root
    group: root
    mode: '0644'
  loop: "{{ nginx_sites }}"
  notify: reload nginx

- name: Enable NGINX sites
  file:
    src: "/etc/nginx/sites-available/{{ item.name }}"
    dest: "/etc/nginx/sites-enabled/{{ item.name }}"
    state: link
  loop: "{{ nginx_sites }}"
  notify: reload nginx

- name: Ensure NGINX is started and enabled
  service:
    name: nginx
    state: started
    enabled: yes

- name: Obtain Let's Encrypt certificates
  command: >
    certbot --nginx -n --agree-tos
    --email {{ letsencrypt_email }}
    -d {{ item.domain }}
  loop: "{{ nginx_sites }}"
  when: item.ssl | default(false)
  register: certbot_result
  changed_when: "'Congratulations' in certbot_result.stdout"

- name: Setup auto-renewal for certificates
  cron:
    name: "Certbot renewal"
    minute: "0"
    hour: "3"
    job: "certbot renew --quiet --post-hook 'systemctl reload nginx'"
```

Template NGINX (`roles/nginx/templates/site.conf.j2`) :

```nginx
server {
    listen 80;
    server_name {{ item.domain }};

    {% if item.ssl | default(false) %}
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name {{ item.domain }};

    ssl_certificate /etc/letsencrypt/live/{{ item.domain }}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{{ item.domain }}/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    {% endif %}

    root {{ item.root | default('/var/www/html') }};
    index index.html index.htm;

    location / {
        {% if item.proxy_pass is defined %}
        proxy_pass {{ item.proxy_pass }};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        {% else %}
        try_files $uri $uri/ =404;
        {% endif %}
    }

    access_log /var/log/nginx/{{ item.domain }}_access.log;
    error_log /var/log/nginx/{{ item.domain }}_error.log;
}
```

## Gestion des Secrets avec Ansible Vault

Pour gérer les mots de passe et secrets :

```bash
# Créer un fichier vault
ansible-vault create group_vars/all/vault.yml

# Éditer le vault
ansible-vault edit group_vars/all/vault.yml
```

Contenu du vault :

```yaml
---
vault_deploy_user: deploy
vault_postgresql_password: "SuperSecretPassword123!"
vault_letsencrypt_email: "admin@example.com"
vault_ssh_public_keys:
  - "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJqXXXXXXXXXXXXXXXXXXXXXX admin@laptop"
```

Dans `group_vars/all/vars.yml`, référencer les variables vault :

```yaml
---
deploy_user: "{{ vault_deploy_user }}"
postgresql_password: "{{ vault_postgresql_password }}"
letsencrypt_email: "{{ vault_letsencrypt_email }}"
ssh_public_keys: "{{ vault_ssh_public_keys }}"
```

## Playbook Principal

Mon playbook `site.yml` qui orchestre tout :

```yaml
---
- name: Configure all servers
  hosts: all
  become: yes
  roles:
    - common

- name: Configure web servers
  hosts: webservers
  become: yes
  roles:
    - nginx
    - docker
  vars:
    nginx_sites:
      - name: myapp
        domain: myapp.example.com
        ssl: true
        proxy_pass: http://localhost:3000

- name: Configure database servers
  hosts: databases
  become: yes
  roles:
    - postgresql
  vars:
    postgresql_databases:
      - name: myapp_production
        owner: myapp_user
    postgresql_users:
      - name: myapp_user
        password: "{{ vault_postgresql_password }}"
        privileges: "ALL"
        database: myapp_production

- name: Configure monitoring servers
  hosts: monitoring
  become: yes
  roles:
    - prometheus
    - grafana
```

## Exécution et Bonnes Pratiques

### Commandes courantes

```bash
# Dry-run (check mode)
ansible-playbook -i inventory/production/hosts.yml playbooks/site.yml --check

# Exécution avec vault
ansible-playbook -i inventory/production/hosts.yml playbooks/site.yml --ask-vault-pass

# Limiter à un groupe
ansible-playbook -i inventory/production/hosts.yml playbooks/site.yml --limit webservers

# Exécuter seulement certains tags
ansible-playbook -i inventory/production/hosts.yml playbooks/site.yml --tags security

# Mode verbose pour debug
ansible-playbook -i inventory/production/hosts.yml playbooks/site.yml -vvv
```

### Tests avec Molecule

Pour tester mes rôles, j'utilise **Molecule** :

```bash
# Installation
pip install molecule molecule-docker

# Initialiser un test
cd roles/nginx
molecule init scenario

# Tester
molecule test
```

## Rôle Docker Avancé

Un exemple de rôle plus complexe pour installer Docker :

```yaml
---
# roles/docker/tasks/main.yml
- name: Install required system packages
  apt:
    name:
      - apt-transport-https
      - ca-certificates
      - curl
      - gnupg
      - lsb-release
    state: present

- name: Add Docker GPG key
  apt_key:
    url: https://download.docker.com/linux/ubuntu/gpg
    state: present

- name: Add Docker repository
  apt_repository:
    repo: "deb [arch=amd64] https://download.docker.com/linux/ubuntu {{ ansible_distribution_release }} stable"
    state: present

- name: Install Docker
  apt:
    name:
      - docker-ce
      - docker-ce-cli
      - containerd.io
      - docker-compose-plugin
    state: present
    update_cache: yes

- name: Add deploy user to docker group
  user:
    name: "{{ deploy_user }}"
    groups: docker
    append: yes

- name: Ensure Docker is started and enabled
  service:
    name: docker
    state: started
    enabled: yes

- name: Install docker-compose standalone
  get_url:
    url: "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64"
    dest: /usr/local/bin/docker-compose
    mode: '0755'

- name: Configure Docker daemon
  template:
    src: daemon.json.j2
    dest: /etc/docker/daemon.json
    owner: root
    group: root
    mode: '0644'
  notify: restart docker
```

Template `daemon.json.j2` :

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "metrics-addr": "127.0.0.1:9323",
  "experimental": false
}
```

## Déploiement d'Applications

Playbook pour déployer une app Node.js :

```yaml
---
# playbooks/deploy-app.yml
- name: Deploy Node.js application
  hosts: webservers
  become: yes
  vars:
    app_name: myapp
    app_path: /opt/{{ app_name }}
    app_repo: git@github.com:username/myapp.git
    app_version: main
    
  tasks:
    - name: Install Node.js
      apt:
        name:
          - nodejs
          - npm
        state: present

    - name: Create application directory
      file:
        path: "{{ app_path }}"
        state: directory
        owner: "{{ deploy_user }}"
        group: "{{ deploy_user }}"

    - name: Clone or update application repository
      git:
        repo: "{{ app_repo }}"
        dest: "{{ app_path }}"
        version: "{{ app_version }}"
        force: yes
      become_user: "{{ deploy_user }}"
      notify: restart app

    - name: Install Node.js dependencies
      npm:
        path: "{{ app_path }}"
        production: yes
      become_user: "{{ deploy_user }}"

    - name: Create systemd service
      template:
        src: app.service.j2
        dest: "/etc/systemd/system/{{ app_name }}.service"
        owner: root
        group: root
        mode: '0644'
      notify:
        - reload systemd
        - restart app

    - name: Ensure application is started and enabled
      service:
        name: "{{ app_name }}"
        state: started
        enabled: yes

  handlers:
    - name: reload systemd
      systemd:
        daemon_reload: yes

    - name: restart app
      service:
        name: "{{ app_name }}"
        state: restarted
```

## Monitoring et Notifications

J'ai intégré des callbacks pour être notifié sur Slack :

```ini
# ansible.cfg
[defaults]
callback_whitelist = slack

[callback_slack]
webhook_url = https://hooks.slack.com/services/YOUR/WEBHOOK/URL
channel = #ansible-notifications
username = Ansible
```

## Résultats Après 6 Mois

**Gains mesurés** :

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| Temps setup serveur | 2-3h | 15 min | **88%** ⬇️ |
| Erreurs de config | ~5/mois | 0 | **100%** ⬇️ |
| Reproductibilité | ❌ Manuelle | ✅ Garantie | ♾️ |
| Documentation | ⚠️ Wiki obsolète | ✅ Code = Docs | 📈 |
| Confiance déploiements | 😰 Stress | 😌 Serein | 🚀 |

**Autres bénéfices** :
- 📦 Infrastructure as Code versionnée dans Git
- 🔄 Rollbacks faciles (revert git + redéploiement)
- 🧪 Tests en staging identiques à la prod
- 📚 Onboarding nouveaux devs accéléré
- 🎯 Disaster recovery testable régulièrement

## Pièges à Éviter

### 1. Ne pas utiliser --check avant de déployer
Toujours tester avec `--check` d'abord !

### 2. Hardcoder des valeurs
Utilisez des variables et group_vars.

### 3. Rôles trop complexes
Un rôle = une responsabilité. Décomposez.

### 4. Oublier l'idempotence
Vos tasks doivent pouvoir s'exécuter plusieurs fois sans effet de bord.

### 5. Ne pas versionner
Tout dans Git, y compris les inventaires.

## Ressources et Next Steps

**À explorer ensuite** :
- 🔄 **AWX / Ansible Tower** : interface web pour Ansible
- 🧪 **Molecule + Testinfra** : tests automatisés des rôles
- 📊 **Ansible Lint** : linter pour playbooks
- 🎭 **Ansible Galaxy** : partager vos rôles
- 🔗 **Intégration CI/CD** : GitLab CI / GitHub Actions

**Ressources utiles** :
- [Documentation Ansible](https://docs.ansible.com/)
- [Ansible Galaxy](https://galaxy.ansible.com/)
- [Awesome Ansible](https://github.com/ansible-community/awesome-ansible)

## Conclusion

Ansible a transformé ma façon de gérer l'infrastructure. Ce qui prenait des heures se fait maintenant en quelques minutes, avec une fiabilité parfaite. L'investissement initial en temps d'apprentissage est largement compensé par les gains quotidiens.

**Mon conseil** : commencez petit (un rôle `common`), puis itérez. Ne cherchez pas la perfection dès le début. L'important est de commencer à automatiser, même imparfaitement.

**Prochain article** : je détaillerai comment j'ai intégré Ansible dans une pipeline GitOps complète avec GitLab CI pour du continuous deployment automatisé.

Des questions sur Ansible ou l'automatisation d'infrastructure ? Contactez-moi !
