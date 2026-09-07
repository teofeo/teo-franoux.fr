import {
  House,
  FolderGit2,
  BookOpen,
  Server,
  Mail,
} from "lucide-astro";

export const navigation = [
  {
    label: "Accueil",
    href: "/",
    icon: House,
  },
  {
    label: "Projets",
    href: "/projects",
    icon: FolderGit2,
  },
  {
    label: "Blog",
    href: "/blog",
    icon: BookOpen,
  },
  {
    label: "Homelab",
    href: "/homelab",
    icon: Server,
  },
  {
    label: "Contact",
    href: "/contact",
    icon: Mail,
  },
] as const;
