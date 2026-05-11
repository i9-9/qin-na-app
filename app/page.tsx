'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'

import QuizApp from '../components/quiz-app'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Home() {
  const quizAppRef = useRef<{ resetQuiz: () => void }>(null)

  const handleLogoClick = () => {
    if (quizAppRef.current) {
      quizAppRef.current.resetQuiz()
    }
  }

  return (
    <main className="flex h-screen flex-col bg-background">
      <div className="shrink-0">
        <nav className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-border bg-background px-3 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogoClick}
              className="cursor-pointer transition-opacity duration-ux ease-ux-out hover:opacity-80"
              aria-label="Volver al inicio"
            >
              <Image
                src="/images/logo_loto.png"
                alt=""
                width={50}
                height={50}
                className="h-9 w-9 object-contain md:h-10 md:w-10"
                priority
              />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold uppercase tracking-tight md:text-xl">
                Qin-Na
              </h1>
              <p className="text-[0.65rem] font-medium uppercase leading-snug tracking-[0.12em] text-muted-foreground md:text-xs">
                Escuela Loto Blanco Lianhua
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/palancas"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors duration-ux ease-ux-out hover:text-foreground"
            >
              Palancas
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </div>

      <div className="min-h-0 flex-1 p-2 md:p-4">
        <div className="flex h-full flex-col border border-border bg-background">
          <QuizApp ref={quizAppRef} />
        </div>
      </div>
    </main>
  )
}
