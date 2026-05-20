/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        brand: {
          orange:           "#E8500D",
          "orange-light":   "#F26522",
          "orange-dark":    "#C44008",
          "orange-xdark":   "#A33508",
          dark:             "#2B2B2B",
          "dark-mid":       "#3D3D3D",
          "dark-light":     "#555555",
          sidebar:          "#1E1E1E",
          "sidebar-border": "#2E2E2E",
          "sidebar-hover":  "#2A2A2A",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        "orange-sm": "0 2px 8px rgba(232, 80, 13, 0.25)",
        "orange-md": "0 4px 16px rgba(232, 80, 13, 0.30)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
