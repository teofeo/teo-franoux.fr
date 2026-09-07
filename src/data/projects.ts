export interface Project {
  title: string;
  description: string;
  technologies: string[];
  href?: string;
  github?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    title: "Homelab",
    description:
      "Infrastructure personnelle basée sur Proxmox, Terraform, Ansible et Kubernetes.",
    technologies: [
      "Proxmox",
      "Terraform",
      "Ansible",
      "Kubernetes",
    ],
    href: "/homelab",
    featured: true,
  },

  {
    title: "Projet exemple",
    description:
      "Description du projet à remplacer.",
    technologies: [
      "TypeScript",
      "Docker",
      "PostgreSQL",
    ],
    github: "https://github.com/...",
    featured: true,
  },

  {
    title: "Projet exemple",
    description:
      "Description du projet à remplacer.",
    technologies: [
      "TypeScript",
      "Docker",
      "PostgreSQL",
    ],
    github: "https://github.com/...",
    featured: true,
  },

  {
    title: "Projet exemple",
    description:
      "Description du projet à remplacer.",
    technologies: [
      "TypeScript",
      "Docker",
      "PostgreSQL",
    ],
    github: "https://github.com/...",
    featured: true,
  },
];
