import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
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
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // --- INICIO: Prueba con colores directos ---
        "fce-red": "hsl(var(--fce-red))",
        "fce-cream": "hsl(var(--fce-cream))",
        "fce-light-gray": "hsl(var(--fce-light-gray))",
        "fce-dark-blue": "hsl(var(--fce-dark-blue))",
        "fce-red-dark": "hsl(var(--fce-red-dark))",
        // --- FIN: Prueba con colores directos ---
        bordeaux: {
          50: "#fdf2f4",
          100: "#fce7ea",
          200: "#f8d0d7",
          300: "#f2aab7",
          400: "#ea7a8f",
          500: "#dc4f6b",
          600: "#c32e4c",
          700: "#a4203e",
          800: "#891d37",
          900: "#731c33",
          950: "#400a18",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      typography: {
        DEFAULT: {
          css: {
            'h3': {
              marginTop: '1em',
              marginBottom: '0.5em',
            },
            'h3 + *': {
              marginTop: '0.25em',
            },
            '.katex-display': {
              margin: '1.5em 0',
              textAlign: 'center',
            },
            'p, li': {
              lineHeight: '2.5',
            }
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}

export default config
