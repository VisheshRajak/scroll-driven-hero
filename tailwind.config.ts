import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1d2018",
        paper: "#efeee7",
        acid: "#d7f45b",
      },
    },
  },
  plugins: [],
};

export default config;
