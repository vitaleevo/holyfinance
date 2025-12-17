import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: "#13ec6d",
                "primary-dark": "#0ea64c",
                "background-light": "#f6f8f7",
                "background-dark": "#111814",
                "surface-dark": "#1a2620",
                "surface-border": "#28392f",
                "text-secondary": "#9db9a8",
                "danger": "#fa5538",
                "success": "#0bda43",
            },
            fontFamily: {
                display: ["var(--font-manrope)", "sans-serif"],
                body: ["var(--font-noto)", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
