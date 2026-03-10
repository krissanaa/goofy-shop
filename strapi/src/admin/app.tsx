import './app.css';
import authLogo from './extensions/auth-logo.svg';
import menuLogo from './extensions/menu-logo.svg';

const marioRed = '#e52521';
const marioBlue = '#049cd8';
const marioGreen = '#43b047';
const foreground = '#1a1a2e';
const background = '#fafaf8';
const cream = '#f0ece4';
const border = '#e0dcd4';

export default {
  config: {
    auth: {
      logo: authLogo,
    },
    menu: {
      logo: menuLogo,
    },
    locales: ['en'],
    translations: {
      en: {
        'app.components.LeftMenu.navbrand.title': 'MENU',
        'app.components.LeftMenu.navbrand.workplace': 'GOOFY ADMIN',
      },
    },
    theme: {
      light: {
        colors: {
          // Primary - Mario Red
          primary700: '#a01816',
          primary600: '#c41e1a',
          primary500: marioRed,
          primary400: '#eb4b48',
          primary200: '#f7a8a7',
          primary100: '#fce4e4',
          primary50: '#fff0f0',

          // Neutral - dark navy text on cream/white
          neutral900: foreground,
          neutral800: foreground,
          neutral700: '#2e2e44',
          neutral600: '#4a4a60',
          neutral500: '#7a7a8c',
          neutral400: '#a0a0b0',
          neutral300: border,
          neutral200: cream,
          neutral150: '#f5f2ee',
          neutral100: cream,
          neutral50: background,
          neutral0: '#ffffff',

          // Background
          buttonNeutral0: '#ffffff',

          // Success - Mario Green
          success700: '#2d7a32',
          success600: '#369a3a',
          success500: marioGreen,
          success200: '#b8e6b8',
          success100: '#e6f7e6',
          success50: '#f0fbf0',

          // Warning - Mario Blue
          warning700: '#0250a0',
          warning600: '#0370c8',
          warning500: marioBlue,
          warning200: '#b3e0f7',
          warning100: '#d9f2fc',
          warning50: '#f0f9ff',

          // Danger - Mario Red
          danger700: '#a01816',
          danger600: '#c41e1a',
          danger500: marioRed,
          danger200: '#f7a8a7',
          danger100: '#fce4e4',

          // Buttons
          buttonPrimary600: '#c41e1a',
          buttonPrimary500: marioRed,
          buttonSecondary600: '#0370c8',
          buttonSecondary500: marioBlue,
        },
      },
      dark: {
        colors: {
          primary600: '#c41e1a',
          primary500: marioRed,
          neutral900: foreground,
          neutral800: foreground,
          neutral700: '#2e2e44',
          neutral600: '#4a4a60',
          neutral500: '#7a7a8c',
          neutral0: '#ffffff',
          neutral50: background,
          neutral100: cream,
          success500: marioGreen,
          warning500: marioBlue,
          danger500: marioRed,
          buttonPrimary500: marioRed,
          buttonPrimary600: '#c41e1a',
          buttonSecondary500: marioBlue,
        },
      },
    },
  },
  bootstrap() {},
};
