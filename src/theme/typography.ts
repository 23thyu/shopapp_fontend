import type { TypographyVariantsOptions } from '@mui/material/styles';

const FONT_DISPLAY = '"SF Pro Display", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const FONT_TEXT = '"SF Pro Text", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const typography: TypographyVariantsOptions = {
  fontFamily: FONT_TEXT,
  h1: {
    fontFamily: FONT_DISPLAY,
    fontSize: '96px', // display
    lineHeight: 1.04,
    letterSpacing: '-2.11px',
    fontWeight: 700,
  },
  h2: {
    fontFamily: FONT_DISPLAY,
    fontSize: '56px', // heading-lg
    lineHeight: 1.07,
    letterSpacing: '-0.9px',
    fontWeight: 700,
  },
  h3: {
    fontFamily: FONT_DISPLAY,
    fontSize: '56px', // heading-lg
    lineHeight: 1.07,
    letterSpacing: '-0.9px',
    fontWeight: 700,
  },
  h4: {
    fontFamily: FONT_DISPLAY,
    fontSize: '40px', // heading
    lineHeight: 1.17,
    letterSpacing: '-0.6px',
    fontWeight: 700,
  },
  h5: {
    fontFamily: FONT_DISPLAY,
    fontSize: '40px', // heading
    lineHeight: 1.17,
    letterSpacing: '-0.6px',
    fontWeight: 700,
  },
  h6: {
    fontFamily: FONT_DISPLAY,
    fontSize: '24px', // heading-sm
    lineHeight: 1.29,
    letterSpacing: '-0.36px',
    fontWeight: 600,
  },
  subtitle1: {
    fontFamily: FONT_TEXT,
    fontSize: '20px', // subheading
    lineHeight: 1.4,
    letterSpacing: '-0.2px',
    fontWeight: 500,
  },
  subtitle2: {
    fontFamily: FONT_TEXT,
    fontSize: '20px', // subheading
    lineHeight: 1.4,
    letterSpacing: '-0.2px',
    fontWeight: 500,
  },
  body1: {
    fontFamily: FONT_TEXT,
    fontSize: '17px', // body
    lineHeight: 1.47,
    letterSpacing: '-0.1px',
    fontWeight: 400,
  },
  body2: {
    fontFamily: FONT_TEXT,
    fontSize: '14px', // body-sm
    lineHeight: 1.43,
    letterSpacing: '-0.04px',
    fontWeight: 400,
  },
  caption: {
    fontFamily: FONT_TEXT,
    fontSize: '12px', // caption
    lineHeight: 1.33,
    letterSpacing: '-0.26px',
    fontWeight: 600,
  },
  button: {
    fontFamily: FONT_TEXT,
    fontSize: '14px',
    lineHeight: 1.43,
    letterSpacing: '-0.04px',
    fontWeight: 600,
    textTransform: 'none',
  },
};

export default typography;
