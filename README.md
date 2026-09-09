# 🌐 Mon Site Personnel - Téo Franoux

Mon site internet personnel sur le web, conçu pour centraliser mon parcours, partager mes retours d'expérience et me présenter à travers un portfolio interactif.

## 🎯 Pourquoi ce projet ?

J'avais besoin d'un endroit à moi, entièrement maîtrisé, pour :
- **Centraliser mon parcours** : regrouper mes expériences et mes compétences en un seul endroit propre et professionnel.
- **Partager et documenter** : faire évoluer un blog technique pour y consigner ce que j'apprends au quotidien dans mes projets (homelab, dev, etc.).
- **Expérimenter** : me servir de ce site comme d'un terrain de jeu pour tester des interfaces modernes, soigner l'expérience utilisateur et affiner mon propre design system.

## ✍️ Blog

Les articles sont rédigés en Markdown et gérés par le système de Content Collections d'Astro.

Chaque article contient notamment :

- un titre
- une description
- une date de publication
- des tags
- une image
- un temps de lecture calculé automatiquement

Les tags permettent également de naviguer entre les différents sujets abordés.

## ✍️ Écrire un article

Les articles du blog sont rédigés en **Markdown** et se trouvent dans le dossier `src/content/blog/`.

### Créer un article

Pour créer un nouvel article, créez un fichier `.md` dans le dossier :

```text
src/content/blog/new-article.md
```

Utilisez ensuite le **frontmatter par défaut** du projet au début du fichier :

```md
---
title: "Titre de l'article"
description: "Description courte de l'article"
pubDate: 2026-09-09
tags:
  - devops
  - linux
---

# Contenu de l'article

Votre contenu Markdown ici...
```

Le nom du fichier est utilisé pour générer l'URL de l'article.

Par exemple :

```text
src/content/blog/docker-compose.md
```

sera accessible à l'adresse :

```text
/blog/docker-compose
```

Les articles peuvent utiliser les fonctionnalités classiques de Markdown : titres, listes, liens, images, blocs de code, tableaux, etc.


## 📄 Licence

Distribué sous la licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus d'informations.
