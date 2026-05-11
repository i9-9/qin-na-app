'use client'

import { useState } from 'react'
import { questions } from '@/components/questions'
import { ArrowLeft, BookOpen, GraduationCap, Target } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { StudyMode } from '@/components/StudyMode'
import { MemoryExercises } from '@/components/MemoryExercises'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function PalancasPage() {
  const [viewMode, setViewMode] = useState<'list' | 'study' | 'exercises'>('list')

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-background">
      <div className="shrink-0 p-2 md:p-4">
        <nav className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-border bg-background px-2 py-2 md:px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0 transition-opacity duration-ux ease-ux-out hover:opacity-80">
              <Image
                src="/images/logo_loto.png"
                alt=""
                width={50}
                height={50}
                className="h-9 w-9 object-contain md:h-10 md:w-10"
                priority
              />
            </Link>
            <div>
              <h1 className="font-display text-lg font-bold uppercase tracking-tight md:text-xl">Qin-Na</h1>
              <p className="text-[0.65rem] font-medium uppercase leading-snug tracking-[0.12em] text-muted-foreground md:text-xs">
                Escuela Loto Blanco Lianhua
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pr-1">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors duration-ux ease-ux-out hover:text-foreground"
            >
              Inicio
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </div>

      {viewMode === 'study' ? (
        <div className="flex-grow p-2 md:p-4">
          <StudyMode onClose={() => setViewMode('list')} />
        </div>
      ) : viewMode === 'exercises' ? (
        <div className="flex-grow p-2 md:p-4 overflow-hidden">
          <MemoryExercises onClose={() => setViewMode('list')} />
        </div>
      ) : (
        <div className="flex-grow p-2 md:p-4 overflow-y-auto pb-8">
          <div className="border border-border p-4">
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                <h2 className="text-xl md:text-2xl font-trajan-black uppercase tracking-wide">
                  Listado de Palancas
                </h2>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setViewMode('study')}
                  className="flex items-center border border-border p-2 font-trajan-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <GraduationCap className="mr-1 h-4 w-4" />
                  Modo de Estudio
                </button>
                <button
                  onClick={() => setViewMode('exercises')}
                  className="flex items-center border border-border p-2 font-trajan-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Target className="mr-1 h-4 w-4" />
                  Ejercicios
                </button>
                <Link 
                  href="/"
                  className="flex items-center border border-border p-2 font-trajan-bold bg-background hover:bg-secondary"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Volver
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              {questions.map((question) => (
                <div 
                  key={question.id} 
                  className="border border-border p-3 hover:bg-secondary transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <span className="font-trajan-bold text-sm md:text-base min-w-[3rem]">
                          #{question.id}
                        </span>
                        <p className="font-trajan text-sm md:text-base">
                          {question.text}
                        </p>
                      </div>
                    </div>
                    <div className="md:ml-4 md:text-right">
                      <p className="text-xs md:text-sm text-muted-foreground font-mono">
                        {question.answer.split('|')[0]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border text-center mb-8">
              <p className="text-sm font-trajan text-muted-foreground mb-4">
                Total: {questions.length} palancas
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => setViewMode('study')}
                  className="flex items-center justify-center gap-2 border border-border p-2 font-trajan-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <GraduationCap className="h-4 w-4" />
                  Estudiar con tarjetas
                </button>
                <button
                  onClick={() => setViewMode('exercises')}
                  className="flex items-center justify-center gap-2 border border-border p-2 font-trajan-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Target className="h-4 w-4" />
                  Ejercicios de memorización
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

