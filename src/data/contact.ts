export interface ContactLink {
  name: string;
  url: string;
  icon: string;
}

export const contactInfo = {
  email: "teo.franoux@epitech.eu",
  links: [
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/teo-franoux",
      icon: "linkedin",
    },
    {
      name: "GitHub",
      url: "https://github.com/teofranoux",
      icon: "github",
    },
  ] as ContactLink[],
};
