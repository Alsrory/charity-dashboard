import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(0, 153, 138)',
        secondary: '#15B392',
      },
    },
  },
  plugins: [],
}

export default config
