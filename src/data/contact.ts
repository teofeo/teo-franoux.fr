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
      url: "https://linkedin.com/in/téo-franoux",
      icon: "linkedin",
    },
    {
      name: "GitHub",
      url: "https://github.com/teofeo",
      icon: "github",
    },
  ] as ContactLink[],
};
