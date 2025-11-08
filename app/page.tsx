'use client'

import Image from 'next/image'
import QuizApp from '../components/quiz-app'
import { useRef } from 'react'

export default function Home() {
  const quizAppRef = useRef<{ resetQuiz: () => void }>(null)

  const handleLogoClick = () => {
    if (quizAppRef.current) {
      quizAppRef.current.resetQuiz()
    }
  }

  return (
    <main className="h-screen flex flex-col bg-background">
      <div className="p-2 md:p-4 flex-shrink-0">
        <nav className="flex justify-between items-center border-2 border-foreground">
          <div className="flex items-center p-2">
            <button 
              onClick={handleLogoClick}
              className="mr-4 cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Volver al inicio"
            >
              <Image
                src="/images/logo_loto.png"
                alt="Logo Loto"
                width={50}  
                height={50} 
                className="transition-transform"
                priority
              />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-trajan-black uppercase tracking-wider">Qin-Na</h1>
              <h2 className="text-xs md:text-sm font-trajan-regular tracking-wide">Escuela Loto Blanco Lianhua</h2>
            </div>
          </div>
        </nav>
      </div>

      <div className="flex-1 min-h-0 p-2 md:p-4">
        <div className="h-full border-2 border-foreground">
          <QuizApp ref={quizAppRef} />
        </div>
      </div>
    </main>
  )
}