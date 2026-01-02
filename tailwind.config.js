/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "hsl(212, 100%, 47%)",
                    foreground: "hsl(0, 0%, 100%)",
                    50: "hsl(212, 100%, 97%)",
                    100: "hsl(212, 96%, 93%)",
                    200: "hsl(212, 94%, 85%)",
                    300: "hsl(212, 92%, 75%)",
                    400: "hsl(212, 90%, 60%)",
                    500: "hsl(212, 100%, 47%)",
                    600: "hsl(212, 100%, 42%)",
                    700: "hsl(212, 100%, 35%)",
                },
                accent: {
                    DEFAULT: "hsl(200, 95%, 48%)",
                    foreground: "hsl(0, 0%, 100%)",
                },
                background: "hsl(0, 0%, 100%)",
                foreground: "hsl(220, 20%, 15%)",
                muted: {
                    DEFAULT: "hsl(210, 20%, 96%)",
                    foreground: "hsl(210, 10%, 45%)",
                },
                border: "hsl(210, 15%, 90%)",
                ring: "hsl(212, 100%, 47%)",
                success: {
                    DEFAULT: "hsl(142, 76%, 36%)",
                    light: "hsl(142, 76%, 95%)",
                },
                danger: {
                    DEFAULT: "hsl(0, 84%, 60%)",
                    light: "hsl(0, 84%, 95%)",
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
