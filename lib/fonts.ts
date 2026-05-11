import localFont from 'next/font/local'

export const helveticaNow = localFont({
  src: [
    {
      path: '../public/fonts/HelveticaNowDisplay-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/HelveticaNowDisplay-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  preload: true,
  variable: '--font-helvetica-now',
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
  adjustFontFallback: 'Arial',
})

export const helveticaNowText = localFont({
  src: [
    {
      path: '../public/fonts/HelveticaNowText-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  display: 'swap',
  preload: true,
  variable: '--font-helvetica-now-text',
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
  adjustFontFallback: 'Arial',
})
