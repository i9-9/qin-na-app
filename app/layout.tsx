import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'

import { helveticaNow, helveticaNowText } from '@/lib/fonts'

import './globals.css'

export const metadata: Metadata = {
  title: 'Qin-Na - Loto Blanco Lianhua - Shaolin Tradicional',
  description: 'Kung Fu - Shaolin Tradicional',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${helveticaNow.variable} ${helveticaNowText.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
