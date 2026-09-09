import {
  House,
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
