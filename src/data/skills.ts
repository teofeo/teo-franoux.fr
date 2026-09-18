export interface Skill {
  name: string;
  category: "Infrastructure" | "Cloud" | "Automation" | "Containers" | "Other";
}

export const skills: Skill[] = [
  {
    name: "Proxmox",
    category: "Infrastructure",
  },
  {
    name: "Linux",
    category: "Infrastructure",
  },
  {
    name: "Networking",
    category: "Infrastructure",
  },

  {
    name: "AWS",
    category: "Cloud",
  },
  {
    name: "Azure",
    category: "Cloud",
  },

  {
    name: "Terraform",
    category: "Automation",
  },
  {
    name: "Ansible",
    category: "Automation",
  },
  {
    name: "GitLab CI/CD",
    category: "Automation",
  },
  {
    name: "GitHub Actions",
    category: "Automation",
  },

  {
    name: "Docker",
    category: "Containers",
  },
  {
    name: "Kubernetes",
    category: "Containers",
  },

  {
    name: "Git",
    category: "Other",
  },
  {
    name: "Python",
    category: "Other",
  },
  {
    name: "Bash",
    category: "Other",
  },
];
