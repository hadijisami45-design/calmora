/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.js"],
  theme: {
    extend: {
      colors: {
        creme: "#FBF8F2",
        sable: "#F1E9DA",
        encre: "#1F1A16",
        cafe: "#2A1D14",
        foret: { DEFAULT: "#0F4D36", clair: "#16774F", sombre: "#0A3A28" },
        or: { DEFAULT: "#B8862F", clair: "#D9B36A", sombre: "#96691C" },
        promo: "#C8261B",
      },
      fontFamily: {
        titre: ['"PT Serif"', "Georgia", '"Times New Roman"', "serif"],
        texte: ['"Noto Sans"', "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
      },
      boxShadow: { carte: "0 1px 2px rgba(42,29,20,.06), 0 8px 24px rgba(42,29,20,.07)" },
    },
  },
  plugins: [],
};
