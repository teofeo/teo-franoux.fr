export interface TimelineItem {
  period: string;
  title: string;
  organization: string;
  location?: string;
  description: string;
  highlight?: string;
}

export const timeline: TimelineItem[] = [
  {
    period: "2026",
    title: "AWS Cloud Practitioner",
    organization: "Certification AWS",
    location: "France",
    description:
      "Obtention de la certification AWS Cloud Practitioner en autonomie pour consolider mes fondamentaux en cloud et en infrastructure.",
    highlight: "Certification obtenue",
  },
  {
    period: "Aujourd'hui",
    title: "Homelab",
    organization: "Projet personnel",
    location: "Québec, Canada",
    description:
      "Mise en place d'un homelab autour d'un Minisforum MS-A2 pour expérimenter la virtualisation, Linux, le réseau et les pratiques DevOps dans un environnement que je contrôle.",
    highlight: "Proxmox · Linux · Networking · DevOps",
  },
  {
    period: "2025 - 2026",
    title: "Université Laval",
    organization: "Certificat sur mesure en technologies de l'information",
    location: "Québec, Canada",
    description:
      "Échange académique au Canada pendant ma quatrième année d'Epitech. Une expérience qui m'a permis d'élargir mes connaissances techniques et de découvrir un nouvel environnement académique.",
    highlight: "Expérience internationale",
  },
  {
    period: "2025",
    title: "Stage DevOps & Automatisation",
    organization: "Société Générale Private Banking",
    location: "Esch-sur-Alzette, Luxembourg",
    description:
      "Contribution à l'automatisation et à la sécurisation des processus d'infrastructure. Administration et sécurisation de Rundeck, gestion des ACL et intégration de HashiCorp Vault pour centraliser les secrets.",
    highlight: "Rundeck · Vault · ACL · Automatisation",
  },
  {
    period: "2023",
    title: "Stage Développement & Automatisation DevOps",
    organization: "Société Générale Private Banking",
    location: "Esch-sur-Alzette, Luxembourg",
    description:
      "Participation à la modernisation d'une plateforme interne de gestion des équipements de datacenter. Développement d'une nouvelle solution avec Python, HTML et CSS pour améliorer la visualisation et la gestion des actifs.",
    highlight: "Python · Datacenter · Full-stack",
  },
  {
    period: "2022 - 2027",
    title: "Programme Grand école",
    organization: "Epitech",
    location: "France",
    description:
      "Début de mon parcours en informatique et découverte progressive du développement, des systèmes et des problématiques liées à l'infrastructure.",
    highlight: "Début du parcours informatique",
  },
];
