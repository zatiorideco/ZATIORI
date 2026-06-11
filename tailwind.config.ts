import type { Config } from "tailwindcss";

// Design tokens Zatiori (Claude Design) integrados sobre la base shadcn/ui.
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // Tokens Zatiori
        primary: {
          DEFAULT: "#775A48", // Marrón Zatiori
          deep: "#3E2F26", // Espresso
          foreground: "#F4EDE2",
        },
        ink: "#1A1512", // texto principal
        bg: "#F4EDE2", // fondo global
        surface: "#EFE9DF", // paneles
        sand: "#E2D3BE", // fondos suaves, hover
        line: "#E0D4C3", // bordes y divisores
        ok: "#5E7350",
        warn: "#A9682B",
        info: "#6E5E8A",
        danger: "#9C4A33",
        // Alias históricos (usados en toda la app)
        marron: "#775A48",
        espresso: "#3E2F26",
        negro: "#1A1512",
        crema: "#F4EDE2",
        arena: "#E2D3BE",
        madera: "#B0875F",
        // Tokens semánticos shadcn/ui (mapeados a la paleta en globals.css)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#B0875F", // Madera natural
          foreground: "#FAF5EC",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        display: ["var(--font-anton)", "sans-serif"],
        serif: ["var(--font-fraunces)", "serif"],
        editorial: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(52px,9vw,104px)", { lineHeight: "1.02" }],
        "display-lg": ["clamp(34px,5.5vw,56px)", { lineHeight: "1.05" }],
        "display-md": ["clamp(28px,4vw,38px)", { lineHeight: "1.1" }],
        lead: ["19px", { lineHeight: "1.55" }],
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "10px",
        md: "10px",
        lg: "12px",
        xl: "18px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(62,47,38,.06), 0 2px 8px rgba(62,47,38,.05)",
        DEFAULT: "0 4px 14px rgba(62,47,38,.09), 0 1px 3px rgba(62,47,38,.06)",
        lg: "0 18px 44px rgba(62,47,38,.14), 0 4px 12px rgba(62,47,38,.07)",
      },
      spacing: {
        "4.5": "18px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
