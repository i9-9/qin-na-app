'use client'

import { useState, useEffect } from 'react'
import { questions } from './questions'
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw, Eye, BookOpen, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type StudyGroup = 'basico' | 'blanco' | 'avanzado' | 'all'
type StudyMode = 'number-to-name' | 'name-to-number'
type CardStatus = 'unseen' | 'review' | 'mastered'

interface StudyCard {
  id: number
  number: number
  name: string
  status: CardStatus
}

export function StudyMode({ onClose }: { onClose: () => void }) {
  const [studyGroup, setStudyGroup] = useState<StudyGroup>('all')
  const [studyMode, setStudyMode] = useState<StudyMode>('number-to-name')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isShuffled, setIsShuffled] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [cards, setCards] = useState<StudyCard[]>([])
  const [cardStatuses, setCardStatuses] = useState<Record<number, CardStatus>>({})

  // Load card statuses from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('palancaCardStatuses')
    if (stored) {
      setCardStatuses(JSON.parse(stored))
    }
  }, [])

  // Filter and prepare cards based on study group
  useEffect(() => {
    let filteredQuestions = questions

    if (studyGroup === 'basico') {
      filteredQuestions = questions.filter(q => q.id <= 10)
    } else if (studyGroup === 'blanco') {
      filteredQuestions = questions.filter(q => q.id <= 18)
    } else if (studyGroup === 'avanzado') {
      filteredQuestions = questions
    }

    const newCards: StudyCard[] = filteredQuestions.map(q => ({
      id: q.id,
      number: q.id,
      name: q.answer.split('|')[0].trim(),
      status: cardStatuses[q.id] || 'unseen'
    }))

    if (isShuffled) {
      setCards([...newCards].sort(() => Math.random() - 0.5))
    } else {
      setCards(newCards.sort((a, b) => a.number - b.number))
    }

    setCurrentIndex(0)
    setIsRevealed(false)
  }, [studyGroup, isShuffled, cardStatuses])

  const currentCard = cards[currentIndex]
  const reviewCards = cards.filter(c => c.status === 'review')
  const masteredCards = cards.filter(c => c.status === 'mastered')

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsRevealed(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsRevealed(false)
    }
  }

  const handleShuffle = () => {
    setIsShuffled(!isShuffled)
  }

  const handleSetStatus = (status: CardStatus) => {
    if (!currentCard) return
    
    const newStatuses = { ...cardStatuses, [currentCard.id]: status }
    setCardStatuses(newStatuses)
    localStorage.setItem('palancaCardStatuses', JSON.stringify(newStatuses))
    
    // Update current card status
    setCards(cards.map(c => c.id === currentCard.id ? { ...c, status } : c))
  }

  const handleResetProgress = () => {
    if (confirm('¿Estás seguro de que quieres resetear todo el progreso de estudio?')) {
      setCardStatuses({})
      localStorage.removeItem('palancaCardStatuses')
    }
  }

  if (cards.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="font-trajan text-lg mb-4">Cargando tarjetas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border p-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl md:text-2xl font-trajan-black uppercase tracking-wide flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Modo de Estudio
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center hover:bg-secondary border border-border"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="flex gap-1 border border-border">
            <button
              onClick={() => setStudyGroup('basico')}
              className={`px-3 py-1 text-xs font-trajan ${
                studyGroup === 'basico' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
              }`}
            >
              Básico
            </button>
            <button
              onClick={() => setStudyGroup('blanco')}
              className={`px-3 py-1 text-xs font-trajan ${
                studyGroup === 'blanco' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
              }`}
            >
              Blanco
            </button>
            <button
              onClick={() => setStudyGroup('avanzado')}
              className={`px-3 py-1 text-xs font-trajan ${
                studyGroup === 'avanzado' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
              }`}
            >
              Avanzado
            </button>
            <button
              onClick={() => setStudyGroup('all')}
              className={`px-3 py-1 text-xs font-trajan ${
                studyGroup === 'all' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
              }`}
            >
              Todas
            </button>
          </div>

          <div className="flex gap-1 border border-border">
            <button
              onClick={() => setStudyMode('number-to-name')}
              className={`px-3 py-1 text-xs font-trajan ${
                studyMode === 'number-to-name' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
              }`}
            >
              Número → Nombre
            </button>
            <button
              onClick={() => setStudyMode('name-to-number')}
              className={`px-3 py-1 text-xs font-trajan ${
                studyMode === 'name-to-number' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
              }`}
            >
              Nombre → Número
            </button>
          </div>

          <button
            onClick={handleShuffle}
            className={`px-3 py-1 text-xs font-trajan border border-border ${
              isShuffled ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
            }`}
          >
            <Shuffle className="h-3 w-3 inline mr-1" />
            Aleatorio
          </button>
        </div>

        {/* Progress Stats */}
        <div className="flex gap-4 text-xs font-mono">
          <span>Total: {cards.length}</span>
          {reviewCards.length > 0 && (
            <span className="text-yellow-600">Repaso: {reviewCards.length}</span>
          )}
          {masteredCards.length > 0 && (
            <span className="text-green-600">Dominadas: {masteredCards.length}</span>
          )}
        </div>
      </div>

      {/* Card Display */}
      <div className="flex-grow flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCard?.id}-${studyMode}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-2xl"
          >
            <div className="border border-border p-6 md:p-8 min-h-[300px] flex flex-col items-center justify-center">
              {/* Card Number Indicator */}
              <div className="text-sm font-mono mb-4 text-muted-foreground">
                Tarjeta {currentIndex + 1} de {cards.length}
              </div>

              {/* Card Content */}
              <div className="text-center flex-grow flex flex-col items-center justify-center w-full">
                {studyMode === 'number-to-name' ? (
                  <>
                    <div className="text-6xl md:text-8xl font-trajan-black mb-6">
                      #{currentCard.number}
                    </div>
                    {isRevealed ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl md:text-2xl font-trajan"
                      >
                        {currentCard.name}
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setIsRevealed(true)}
                        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                      >
                        <Eye className="h-5 w-5" />
                        <span className="font-trajan">Haz clic para revelar</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-xl md:text-2xl font-trajan mb-6 px-4">
                      {currentCard.name}
                    </div>
                    {isRevealed ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-trajan-black"
                      >
                        #{currentCard.number}
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setIsRevealed(true)}
                        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                      >
                        <Eye className="h-5 w-5" />
                        <span className="font-trajan">Haz clic para revelar</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Status Buttons */}
              {isRevealed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex gap-2 w-full"
                >
                  <button
                    onClick={() => handleSetStatus('review')}
                    className={`flex-1 py-2 px-3 border border-border font-trajan text-sm ${
                      currentCard.status === 'review'
                        ? 'bg-yellow-500 text-yellow-900'
                        : 'bg-background hover:bg-secondary'
                    }`}
                  >
                    Necesita repaso
                  </button>
                  <button
                    onClick={() => handleSetStatus('mastered')}
                    className={`flex-1 py-2 px-3 border border-border font-trajan text-sm ${
                      currentCard.status === 'mastered'
                        ? 'bg-green-500 text-green-900'
                        : 'bg-background hover:bg-secondary'
                    }`}
                  >
                    Dominada
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-border p-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 border border-border font-trajan-bold bg-background hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleResetProgress}
              className="px-3 py-2 border border-border font-trajan text-sm bg-background hover:bg-secondary"
              title="Resetear progreso"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className="flex items-center gap-2 px-4 py-2 border border-border font-trajan-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

