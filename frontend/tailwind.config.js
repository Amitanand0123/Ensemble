// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        gradient: 'gradient-flow 3s ease infinite',
      },
      keyframes: {
        'gradient-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float:{
          '0%':{transform:'translateY(0px'},
          '50%':{transform:'translateY(-10px)'},
          '100%':{transform:'translateY(0px)'},
        },
        fadeInUp:{
          from:{opacity:0,transform:'translateY(20px)'},
          to:{opacity:1,transform:'translateY(0)'},
        }
      },
    },
  },
  plugins: [],
};
