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
      "Préparation et passage de la certification AWS Cloud Practitioner en autonomie, principalement comme challenge personnel.",
    highlight: "Certification obtenue",
  },
  {
    period: "2025 - 2026",
    title: "Homelab",
    organization: "Projet personnel",
    location: "Québec, Canada",
    description:
      "Pendant mon année à l'Université Laval, j'ai acheté un MS-A2 qui me permet de pouvoir augmenter mes connaissances en virtualisation et en DevOps.",
    highlight: "Proxmox · Linux · Networking · DevOps",
  },
  {
    period: "2025 - 2026",
    title: "Université Laval",
    organization: "Certificat sur mesure en technologies de l'information",
    location: "Québec, Canada",
    description:
      "Départ à l'étranger pendant ma quatrième année d'Epitech pour étudier à l'Université Laval et élargir mon expérience technique et personnelle.",
    highlight: "Expérience internationale",
  },
  {
    period: "2025",
    title: "Stage - Société Générale Luxembourg",
    organization: "Société Générale",
    location: "Luxembourg",
    description:
      "Deuxième expérience chez Société Générale Luxembourg, qui confirme mon intérêt pour le DevOps, l'automatisation et l'infrastructure.",
    highlight: "Début réel de mon parcours DevOps",
  },
  {
    period: "2024",
    title: "Stage - Société Générale Luxembourg",
    organization: "Société Générale",
    location: "Luxembourg",
    description:
      "Première expérience professionnelle où je découvre concrètement les environnements d'entreprise et les problématiques d'infrastructure.",
    highlight: "Première découverte du DevOps",
  },
  {
    period: "2023",
    title: "Epitech",
    organization: "Études en informatique",
    location: "Nancy, France",
    description:
      "Début de mon parcours en informatique avec un intérêt grandissant pour l'automatisation et la compréhension des systèmes.",
  },
];
