/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            colors: {
                background: "#020617", // slate-950
                surface: "#0f172a",    // slate-900
                primary: {
                    DEFAULT: "#06b6d4", // cyan-500
                    foreground: "#ecfeff",
                },
                secondary: {
                    DEFAULT: "#334155", // slate-700
                    foreground: "#f8fafc",
                },
                muted: {
                    DEFAULT: "#1e293b", // slate-800
                    foreground: "#94a3b8", // slate-400
                },
                accent: {
                    DEFAULT: "#0ea5e9", // sky-500
                    foreground: "#f0f9ff",
                }
            },
            animation: {
                "scan-line": "scan 3s ease-in-out infinite",
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                scan: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(100%)" },
                }
            }
        },
    },
    plugins: [],
}
