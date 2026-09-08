# 📝 Exemples de Code - Patterns UX/UI

Ce document contient des exemples de code réutilisables pour maintenir la cohérence visuelle du site.

---

## 🎴 Cards (Projets, Blog, etc.)

### Card Interactive Standard
```astro
<article
    class="group relative overflow-hidden 
           rounded-xl border border-border p-6 
           transition-smooth hover:bg-muted/50 
           hover-lift hover:shadow-soft hover:border-primary/30"
>
    <div class="relative z-10">
        <!-- Contenu de la card -->
        <h3 class="font-semibold transition-colors-smooth group-hover:text-primary">
            Titre
        </h3>
        
        <p class="text-muted-foreground group-hover:text-foreground transition-colors-smooth">
            Description
        </p>
        
        <!-- Tags -->
        <div class="flex gap-2">
            <span class="rounded-md bg-muted px-2 py-1 text-xs 
                         group-hover:bg-primary/20 group-hover:text-primary 
                         transition-colors-smooth">
                Tag
            </span>
        </div>
    </div>
    
    <!-- Effet gradient au survol -->
    <div class="absolute inset-0 -z-0 opacity-0 
                group-hover:opacity-100 transition-opacity duration-500">
        <div class="absolute inset-0 bg-gradient-to-br 
                    from-primary/5 via-transparent to-transparent"></div>
    </div>
</article>
```

---

## 🔘 Boutons

### Bouton Primaire avec Effet Shimmer
```astro
<a
    href="/link"
    class="group relative overflow-hidden 
           rounded-md bg-primary px-5 py-2.5 
           text-sm font-medium text-primary-foreground 
           shadow-soft transition-smooth 
           hover:shadow-glow hover:scale-105"
>
    <span class="relative z-10">Texte du bouton</span>
    <div class="absolute inset-0 -z-0 
                bg-gradient-to-r from-transparent via-white/20 to-transparent 
                translate-x-[-200%] group-hover:translate-x-[200%] 
                transition-transform duration-700"></div>
</a>
```

### Bouton Secondaire
```astro
<a
    href="/link"
    class="rounded-md border border-border px-5 py-2.5 
           text-sm font-medium 
           transition-smooth hover:bg-accent 
           hover:border-primary/50 hover:scale-105 
           shadow-soft"
>
    Texte du bouton
</a>
```

### Bouton Ghost/Lien
```astro
<a
    href="/link"
    class="group inline-flex items-center gap-2 
           text-sm font-medium 
           transition-smooth hover:text-primary"
>
    Texte du lien
    <ArrowUpRight 
        class="size-4 transition-transform 
               group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
    />
</a>
```

---

## 📐 Sections

### Section Standard avec Animations
```astro
<section class="mx-auto max-w-7xl px-4 py-16 md:py-24">
    <!-- Header de section -->
    <div class="mb-10 animate-fade-up">
        <p class="text-sm font-medium text-primary">
            Catégorie/
        </p>
        
        <h2 class="mt-2 text-3xl font-bold tracking-tight">
            Titre de Section
        </h2>
        
        <p class="mt-3 text-muted-foreground">
            Description
        </p>
    </div>
    
    <!-- Contenu -->
    <div class="animate-fade-up animation-delay-200">
        <!-- ... -->
    </div>
</section>
```

### Section avec Gradient Background
```astro
<section class="relative overflow-hidden border-y border-border bg-muted/20">
    <!-- Gradient en arrière-plan -->
    <div class="absolute inset-0 
                bg-gradient-to-br from-primary/5 via-transparent to-transparent 
                pointer-events-none"></div>
    
    <div class="mx-auto max-w-7xl px-4 py-20 md:py-28 relative z-10">
        <!-- Contenu -->
    </div>
</section>
```

---

## 🎯 Navigation

### Lien de Navigation Desktop
```astro
<a
    href="/link"
    class="group relative font-medium text-sm 
           transition-colors-smooth 
           text-muted-foreground hover:text-foreground"
>
    <span class="relative z-10">Label</span>
    
    <!-- Indicateur en bas -->
    <span class="absolute -bottom-2 left-0 h-0.5 bg-primary 
                 w-0 group-hover:w-full 
                 transition-all duration-300 ease-out"></span>
    
    <!-- Background au hover -->
    <span class="absolute inset-0 -z-0 rounded-md 
                 bg-primary/10 opacity-0 
                 group-hover:opacity-100 transition-opacity duration-300"></span>
</a>
```

### Item de Navigation Mobile
```astro
<a
    href="/link"
    class="relative flex min-h-12 w-full flex-col 
           items-center justify-center 
           transition-smooth 
           text-muted-foreground hover:text-foreground 
           active:scale-95"
>
    <span class="flex size-9 items-center justify-center 
                 rounded-full transition-smooth 
                 bg-transparent hover:bg-muted">
        <Icon class="size-5 transition-transform" />
    </span>
    
    <span class="text-[10px]">Label</span>
</a>
```

---

## 🎨 Effets Spéciaux

### Box/Container avec Hover
```astro
<div
    class="overflow-hidden rounded-xl border border-border 
           bg-muted/30 shadow-soft 
           hover-lift hover:shadow-glow hover:border-primary/30 
           transition-smooth"
>
    <!-- Contenu -->
</div>
```

### Liste avec Items Interactifs
```astro
<ul class="space-y-4">
    {items.map((item) => (
        <li class="group transition-smooth hover:translate-x-2">
            <h4 class="font-semibold 
                       group-hover:text-primary transition-colors-smooth">
                {item.title}
            </h4>
            <p class="text-muted-foreground 
                      group-hover:text-foreground transition-colors-smooth">
                {item.description}
            </p>
        </li>
    ))}
</ul>
```

### Timeline Point Interactif
```astro
<div
    class="absolute size-2.5 rounded-full 
           bg-primary ring-4 ring-muted/20 
           transition-transform hover:scale-150 hover:ring-8 
           shadow-glow"
/>
```

---

## 🏷️ Tags et Badges

### Tag Standard
```astro
<span
    class="rounded-md bg-muted px-2 py-1 text-xs 
           text-muted-foreground 
           group-hover:bg-primary/20 group-hover:text-primary 
           transition-colors-smooth"
>
    Tag
</span>
```

### Badge avec Icône
```astro
<div class="inline-flex items-center gap-2 
            rounded-full bg-primary/10 px-3 py-1 
            text-xs font-medium text-primary">
    <Icon class="size-3" />
    Badge
</div>
```

---

## 🎬 Animations

### Grid avec Stagger Animation
```astro
<div class="grid gap-6 md:grid-cols-3">
    {items.map((item, index) => (
        <div 
            class="animate-fade-up"
            style={`animation-delay: ${index * 100}ms;`}
        >
            <Card item={item} />
        </div>
    ))}
</div>
```

### Élément avec Multiple Delays
```astro
<div>
    <p class="animate-fade-up animation-delay-0">Premier</p>
    <h2 class="animate-fade-up animation-delay-100">Deuxième</h2>
    <p class="animate-fade-up animation-delay-200">Troisième</p>
    <div class="animate-fade-up animation-delay-300">Quatrième</div>
</div>
```

---

## 🎨 Icônes Animées

### Icône avec Scale au Hover
```astro
<Icon 
    class="size-5 transition-transform 
           group-hover:scale-110"
/>
```

### Icône avec Translation
```astro
<ArrowUpRight 
    class="size-4 transition-transform 
           group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
/>
```

### Icône de Réseau Social
```astro
<a
    href="/link"
    class="inline-flex items-center justify-center 
           size-10 rounded-full 
           text-muted-foreground 
           transition-smooth 
           hover:text-primary hover:bg-primary/10 
           hover:scale-110"
>
    <Icon class="size-5" />
</a>
```

---

## 📱 Composants Responsive

### Container avec Padding Responsive
```astro
<div class="mx-auto max-w-7xl px-4 py-16 md:py-24">
    <!-- Contenu -->
</div>
```

### Grid Responsive
```astro
<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    <!-- Items -->
</div>
```

### Flex Responsive
```astro
<div class="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
    <!-- Items -->
</div>
```

---

## 🎨 Gradients et Backgrounds

### Gradient Subtil
```astro
<div class="bg-gradient-to-br from-primary/5 via-transparent to-transparent">
    <!-- Contenu -->
</div>
```

### Gradient Overlay
```astro
<div class="relative">
    <div class="absolute inset-0 
                bg-gradient-to-t from-primary/10 via-transparent to-transparent 
                pointer-events-none"></div>
    <div class="relative z-10">
        <!-- Contenu -->
    </div>
</div>
```

---

## 🔧 Utilitaires Personnalisés

### Classes Disponibles

#### Transitions
- `transition-smooth` - All properties
- `transition-colors-smooth` - Colors only

#### Effets
- `hover-lift` - Levée au hover
- `shadow-soft` - Ombre douce
- `shadow-glow` - Ombre lumineuse
- `glass` - Glassmorphism

#### Animations
- `animate-fade-up` - Fade + translateY
- `animate-fade-in` - Fade simple
- `animate-slide-in-left` - Slide from left
- `animation-delay-{0-600}` - Delays 0-600ms

---

## 💡 Best Practices

### ✅ À Faire
- Utiliser `group` pour les effets de hover sur les enfants
- Combiner `transition-smooth` avec `hover-lift`
- Ajouter `relative z-10` sur le contenu quand on a un gradient overlay
- Utiliser les delays d'animation pour l'effet cascade
- Toujours tester sur mobile (hover → touch)

### ❌ À Éviter
- Ne pas abuser des animations (max 600ms de delay)
- Ne pas combiner trop d'effets sur un même élément
- Ne pas oublier `pointer-events-none` sur les overlays
- Ne pas utiliser `hover:` sur mobile uniquement
- Ne pas oublier le `group` quand nécessaire

---

## 🎯 Checklist pour Nouveau Composant

Quand vous créez un nouveau composant interactif :

- [ ] Ajouter `transition-smooth` ou `transition-colors-smooth`
- [ ] Définir les états hover avec `group` si nécessaire
- [ ] Ajouter une animation d'entrée si approprié
- [ ] Tester les états (normal, hover, active, focus)
- [ ] Vérifier sur mobile et desktop
- [ ] S'assurer que c'est accessible (focus visible)
- [ ] Vérifier en dark mode

---

## 📚 Ressources

### Classes Tailwind Utilisées
- Transitions : `transition-all`, `duration-*`, `ease-*`
- Transforms : `scale-*`, `translate-*`, `rotate-*`
- Opacity : `opacity-*`
- Colors : `text-*`, `bg-*`, `border-*`
- Shadows : `shadow-*`
- Filters : `backdrop-blur-*`

### Variables CSS Custom
Toutes les couleurs utilisent les variables CSS de shadcn :
- `--primary`
- `--primary-foreground`
- `--muted`
- `--muted-foreground`
- `--border`
- etc.

---

## 🎉 Conclusion

Ces patterns garantissent :
- ✅ Cohérence visuelle
- ✅ Performance optimale
- ✅ Accessibilité
- ✅ Maintenabilité
- ✅ Expérience utilisateur fluide

**Réutilisez et adaptez selon vos besoins !** 🚀
