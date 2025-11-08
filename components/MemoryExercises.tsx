'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { questions } from './questions'
import { RotateCcw, CheckCircle2, Clock, Target, Shuffle, Image as ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import Image from 'next/image'

type ExerciseType = 'fill-blanks' | 'matching' | 'find-number' | 'speed' | 'typing' | 'image-memory'
type StudyGroup = 'basico' | 'blanco' | 'avanzado' | 'all'

interface Palanca {
  id: number
  number: number
  name: string
  imageUrl?: string
}

// Mapping for special cases where answer doesn't match filename exactly
const answerToFilenameMap: Record<string, string> = {
  'Muñeca de oro y seda': 'Muñeca de oro y de seda',
  'Mano que corta como cuchillo': 'Mano corta como cuchillo',
  'Rey del cielo sostiene la torre': 'El rey del cielo sostiene la torre',
  'Ba wang indica la batalla': 'Ba Wang indica la batalla',
  'Palmadas en el pecho y girar el codo': 'Palmada en el pecho y girar el codo',
  'Palmaditas en el pecho y girar el codo': 'Palmada en el pecho y girar el codo',
  'Manos como flor de ciruelo': 'Manos de flor de ciruelo',
  'Girar el remo con la corriente': 'Girar el remo a lo largo de la corriente',
  'Sostener el brazo y sostener el codo': 'Sostener el brazo y el codo',
  'Dar la vuelta y girar el codo': 'Dar la vuelta y llevar el codo',
  'Dragon azul inclina la cabeza': 'El dragon azul inclina la cabeza',
}

// Function to normalize Unicode characters
const normalizeUnicode = (str: string): string => {
  return str.normalize('NFD')
}

// Function to map answer to image filename
const getImageUrlFromAnswer = (answer: string): string | null => {
  const mainAnswer = answer.split('|')[0].trim()
  const mappedAnswer = answerToFilenameMap[mainAnswer] || mainAnswer
  const normalizedAnswer = normalizeUnicode(mappedAnswer)
  const filename = normalizedAnswer + '.png'
  return `/palancas/${filename}`
}

export function MemoryExercises({ onClose }: { onClose: () => void }) {
  const [exerciseType, setExerciseType] = useState<ExerciseType | null>(null)
  const [studyGroup, setStudyGroup] = useState<StudyGroup>('all')
  const [palancas, setPalancas] = useState<Palanca[]>([])
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    let filtered = questions
    if (studyGroup === 'basico') filtered = questions.filter(q => q.id <= 10)
    else if (studyGroup === 'blanco') filtered = questions.filter(q => q.id <= 18)
    else if (studyGroup === 'avanzado') filtered = questions

    setPalancas(filtered.map(q => {
      const imageUrl = getImageUrlFromAnswer(q.answer)
      return {
        id: q.id,
        number: q.id,
        name: q.answer.split('|')[0].trim(),
        imageUrl: imageUrl || undefined
      }
    }).filter(p => p.imageUrl)) // Solo incluir palancas que tienen imagen
  }, [studyGroup])

  const resetExercise = () => {
    setExerciseType(null)
    startTimeRef.current = Date.now()
  }

  const handleCorrect = () => {
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } })
  }

  const handleIncorrect = () => {
    // Track incorrect answers in individual exercises
  }

  const finishExercise = () => {
    // Exercise completion tracked in individual exercises
  }

  if (!exerciseType) {
    return (
      <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
        <div className="border-b-2 border-foreground p-3 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-trajan-black uppercase tracking-wide mb-3">
            Ejercicios de Memorización
          </h2>
          
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              onClick={() => setStudyGroup('basico')}
              className={`px-3 py-1 text-xs font-trajan border-2 border-foreground ${
                studyGroup === 'basico' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
              }`}
            >
              Básico
            </button>
            <button
              onClick={() => setStudyGroup('blanco')}
              className={`px-3 py-1 text-xs font-trajan border-2 border-foreground ${
                studyGroup === 'blanco' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
              }`}
            >
              Blanco
            </button>
            <button
              onClick={() => setStudyGroup('avanzado')}
              className={`px-3 py-1 text-xs font-trajan border-2 border-foreground ${
                studyGroup === 'avanzado' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
              }`}
            >
              Avanzado
            </button>
            <button
              onClick={() => setStudyGroup('all')}
              className={`px-3 py-1 text-xs font-trajan border-2 border-foreground ${
                studyGroup === 'all' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
              }`}
            >
              Todas
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto min-h-0">
          <div className="grid-row gap-4 max-w-4xl mx-auto">
            {/* Fill Blanks Exercise */}
            <div className="grid-col grid-col-12 md:grid-col-6">
              <button
                onClick={() => {
                  setExerciseType('fill-blanks')
                  startTimeRef.current = Date.now()
                }}
                className="w-full border-2 border-foreground p-4 hover:bg-secondary transition-colors text-left h-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5" />
                  <h3 className="font-trajan-bold text-lg">Completar Espacios</h3>
                </div>
                <p className="text-sm font-trajan text-muted-foreground">
                  Completa las letras faltantes en el nombre de la palanca
                </p>
              </button>
            </div>

            {/* Matching Exercise */}
            <div className="grid-col grid-col-12 md:grid-col-6">
              <button
                onClick={() => {
                  setExerciseType('matching')
                  startTimeRef.current = Date.now()
                }}
                className="w-full border-2 border-foreground p-4 hover:bg-secondary transition-colors text-left h-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shuffle className="h-5 w-5" />
                  <h3 className="font-trajan-bold text-lg">Emparejar</h3>
                </div>
                <p className="text-sm font-trajan text-muted-foreground">
                  Conecta cada número con su nombre correcto
                </p>
              </button>
            </div>

            {/* Find Number Exercise */}
            <div className="grid-col grid-col-12 md:grid-col-6">
              <button
                onClick={() => {
                  setExerciseType('find-number')
                  startTimeRef.current = Date.now()
                }}
                className="w-full border-2 border-foreground p-4 hover:bg-secondary transition-colors text-left h-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5" />
                  <h3 className="font-trajan-bold text-lg">Encontrar el Número</h3>
                </div>
                <p className="text-sm font-trajan text-muted-foreground">
                  Dado el nombre, encuentra el número correcto
                </p>
              </button>
            </div>

            {/* Speed Exercise */}
            <div className="grid-col grid-col-12 md:grid-col-6">
              <button
                onClick={() => {
                  setExerciseType('speed')
                  startTimeRef.current = Date.now()
                }}
                className="w-full border-2 border-foreground p-4 hover:bg-secondary transition-colors text-left h-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5" />
                  <h3 className="font-trajan-bold text-lg">Velocidad</h3>
                </div>
                <p className="text-sm font-trajan text-muted-foreground">
                  Responde lo más rápido posible
                </p>
              </button>
            </div>

            {/* Typing Exercise */}
            <div className="grid-col grid-col-12 md:grid-col-6">
              <button
                onClick={() => {
                  setExerciseType('typing')
                  startTimeRef.current = Date.now()
                }}
                className="w-full border-2 border-foreground p-4 hover:bg-secondary transition-colors text-left h-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <h3 className="font-trajan-bold text-lg">Escritura</h3>
                </div>
                <p className="text-sm font-trajan text-muted-foreground">
                  Escribe el nombre completo de cada palanca
                </p>
              </button>
            </div>

            {/* Image Memory Exercise */}
            <div className="grid-col grid-col-12 md:grid-col-6">
              <button
                onClick={() => {
                  setExerciseType('image-memory')
                  startTimeRef.current = Date.now()
                }}
                className="w-full border-2 border-foreground p-4 hover:bg-secondary transition-colors text-left h-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-5 w-5" />
                  <h3 className="font-trajan-bold text-lg">Memoria Visual</h3>
                </div>
                <p className="text-sm font-trajan text-muted-foreground">
                  Memoriza la imagen y luego identifica la palanca
                </p>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-foreground p-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full border-2 border-foreground p-2 font-trajan-bold bg-background hover:bg-secondary"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {exerciseType === 'fill-blanks' && (
        <FillBlanksExercise
          palancas={palancas}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
          onFinish={finishExercise}
          onReset={resetExercise}
        />
      )}
      {exerciseType === 'matching' && (
        <MatchingExercise
          palancas={palancas}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
          onFinish={finishExercise}
          onReset={resetExercise}
        />
      )}
      {exerciseType === 'find-number' && (
        <FindNumberExercise
          palancas={palancas}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
          onFinish={finishExercise}
          onReset={resetExercise}
        />
      )}
      {exerciseType === 'speed' && (
        <SpeedExercise
          palancas={palancas}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
          onFinish={finishExercise}
          onReset={resetExercise}
        />
      )}
      {exerciseType === 'typing' && (
        <TypingExercise
          palancas={palancas}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
          onFinish={finishExercise}
          onReset={resetExercise}
        />
      )}
      {exerciseType === 'image-memory' && (
        <ImageMemoryExercise
          palancas={palancas}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
          onFinish={finishExercise}
          onReset={resetExercise}
        />
      )}
    </div>
  )
}

interface AnswerResult {
  palancaNumber: number
  palancaName: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

// Fill Blanks Exercise Component
function FillBlanksExercise({ 
  palancas, 
  onCorrect, 
  onIncorrect, 
  onFinish, 
  onReset 
}: {
  palancas: Palanca[]
  onCorrect: () => void
  onIncorrect: () => void
  onFinish: () => void
  onReset: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [results, setResults] = useState<AnswerResult[]>([])

  const currentPalanca = palancas[currentIndex]
  const [blanksText, correctAnswer] = generateBlanks(currentPalanca?.name || '')

  function generateBlanks(text: string): [string, string] {
    const words = text.split(' ')
    const wordsToBlank = Math.max(1, Math.floor(words.length / 2))
    const indices = new Set<number>()
    
    while (indices.size < wordsToBlank) {
      indices.add(Math.floor(Math.random() * words.length))
    }

    const blanked = words.map((word, i) => {
      if (indices.has(i)) {
        const letters = word.split('')
        const visibleCount = Math.max(1, Math.floor(letters.length / 3))
        const visibleIndices = new Set<number>()
        
        while (visibleIndices.size < visibleCount) {
          visibleIndices.add(Math.floor(Math.random() * letters.length))
        }

        return letters.map((letter, j) => 
          visibleIndices.has(j) ? letter : '_'
        ).join('')
      }
      return word
    })

    return [blanked.join(' '), text]
  }

  const normalizeString = (str: string) => 
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    const isCorrect = normalizeString(userAnswer) === normalizeString(correctAnswer)
    
    // Guardar resultado
    const result: AnswerResult = {
      palancaNumber: currentPalanca.number,
      palancaName: currentPalanca.name,
      userAnswer: userAnswer.trim(),
      correctAnswer: correctAnswer,
      isCorrect
    }
    setResults(prev => [...prev, result])
    
    if (isCorrect) {
      setScore(prev => prev + 1)
      onCorrect()
    } else {
      onIncorrect()
    }

    setIsAnswered(true)

    setTimeout(() => {
      if (currentIndex < palancas.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setUserAnswer('')
        setIsAnswered(false)
      } else {
        setCompleted(true)
        onFinish()
      }
    }, 2000)
  }

  if (completed) {
    const percentage = Math.round((score / palancas.length) * 100)
    const incorrectResults = results.filter(r => !r.isCorrect)
    
    return (
      <div className="flex-grow flex flex-col p-4 overflow-hidden">
        <div className="text-center border-2 border-foreground p-4 mb-4 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-trajan-black uppercase mb-2">¡Ejercicio Completado!</h2>
          <div className="text-3xl md:text-4xl font-trajan-black mb-2">{percentage}%</div>
          <p className="font-trajan mb-2">{score} de {palancas.length} correctas</p>
        </div>

        {incorrectResults.length > 0 && (
          <div className="flex-1 overflow-y-auto border-2 border-foreground p-4 mb-4 min-h-0">
            <h3 className="font-trajan-bold text-lg mb-3 text-center border-b-2 border-foreground pb-2">
              Respuestas Incorrectas ({incorrectResults.length})
            </h3>
            <div className="space-y-3">
              {incorrectResults.map((result, idx) => (
                <div key={idx} className="border-2 border-foreground p-3 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="font-trajan-bold text-sm min-w-[3rem]">#{result.palancaNumber}</span>
                    <p className="font-trajan text-sm flex-1">{result.palancaName}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-trajan-bold text-red-600">Tu respuesta:</span>
                      <p className="font-mono">{result.userAnswer}</p>
                    </div>
                    <div>
                      <span className="font-trajan-bold text-green-600">Correcta:</span>
                      <p className="font-mono">{result.correctAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onReset}
            className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-primary text-primary-foreground"
          >
            Nuevo Ejercicio
          </button>
          <button
            onClick={() => {
              setCurrentIndex(0)
              setScore(0)
              setCompleted(false)
              setUserAnswer('')
              setIsAnswered(false)
              setResults([])
            }}
            className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-background hover:bg-secondary"
          >
            Repetir
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-grow flex flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-mono">
          {currentIndex + 1} / {palancas.length}
        </div>
        <div className="text-sm font-trajan-bold">
          Puntuación: {score}
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-2xl border-2 border-foreground p-6 text-center">
          <div className="text-6xl md:text-8xl font-trajan-black mb-6">
            #{currentPalanca.number}
          </div>
          <div className="text-xl md:text-2xl font-mono mb-6 tracking-wider">
            {blanksText}
          </div>
          
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4"
            >
              <p className="font-trajan text-sm mb-2">Respuesta correcta:</p>
              <p className="font-trajan-bold text-lg">{correctAnswer}</p>
            </motion.div>
          )}

          {!isAnswered && (
            <div className="w-full">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Escribe la respuesta completa..."
                className="w-full p-3 border-2 border-foreground bg-background font-trajan text-center text-lg outline-none"
                autoFocus
              />
              <button
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
                className="w-full mt-3 border-2 border-foreground p-2 font-trajan-bold bg-primary text-primary-foreground disabled:opacity-50"
              >
                Verificar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t-2 border-foreground pt-3 flex gap-2">
        <button
          onClick={onReset}
          className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-background hover:bg-secondary"
        >
          <RotateCcw className="h-4 w-4 inline mr-1" />
          Salir
        </button>
      </div>
    </div>
  )
}

// Matching Exercise Component
function MatchingExercise({
  palancas,
  onCorrect,
  onIncorrect,
  onFinish,
  onReset
}: {
  palancas: Palanca[]
  onCorrect: () => void
  onIncorrect: () => void
  onFinish: () => void
  onReset: () => void
}) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [selectedNames, setSelectedNames] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set())
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [results, setResults] = useState<AnswerResult[]>([])

  const shuffledNumbers = [...palancas].sort(() => Math.random() - 0.5).map(p => p.number)
  const shuffledNames = [...palancas].sort(() => Math.random() - 0.5).map(p => p.name)

  const handleNumberClick = (num: number) => {
    if (matchedPairs.has(`num-${num}`)) return
    
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num))
    } else {
      setSelectedNumbers([...selectedNumbers, num])
    }
  }

  const handleNameClick = (name: string) => {
    const palanca = palancas.find(p => p.name === name)
    if (!palanca || matchedPairs.has(`name-${name}`)) return

    if (selectedNames.includes(name)) {
      setSelectedNames(selectedNames.filter(n => n !== name))
    } else {
      const newSelectedNames = [...selectedNames, name]
      setSelectedNames(newSelectedNames)
      
      if (selectedNumbers.length === 1) {
        const selectedNum = selectedNumbers[0]
        const correctPalanca = palancas.find(p => p.number === selectedNum)
        
        if (correctPalanca?.name === name) {
          // Correct match
          const newMatchedPairs = new Set([...Array.from(matchedPairs), `num-${selectedNum}`, `name-${name}`])
          setMatchedPairs(newMatchedPairs)
          setScore(prev => prev + 1)
          
          // Guardar resultado correcto
          const result: AnswerResult = {
            palancaNumber: selectedNum,
            palancaName: name,
            userAnswer: `#${selectedNum} → ${name}`,
            correctAnswer: `#${selectedNum} → ${name}`,
            isCorrect: true
          }
          setResults(prev => [...prev, result])
          
          setSelectedNumbers([])
          setSelectedNames([])
          onCorrect()
          
          if (newMatchedPairs.size >= palancas.length * 2) {
            setCompleted(true)
            onFinish()
          }
        } else {
          // Incorrect match
          const result: AnswerResult = {
            palancaNumber: selectedNum,
            palancaName: correctPalanca?.name || '',
            userAnswer: `#${selectedNum} → ${name}`,
            correctAnswer: `#${selectedNum} → ${correctPalanca?.name || ''}`,
            isCorrect: false
          }
          setResults(prev => [...prev, result])
          
          onIncorrect()
          setTimeout(() => {
            setSelectedNumbers([])
            setSelectedNames([])
          }, 1000)
        }
      }
    }
  }

  if (completed) {
    const percentage = Math.round((score / palancas.length) * 100)
    const incorrectResults = results.filter(r => !r.isCorrect)
    
    return (
      <div className="flex-grow flex flex-col p-4 overflow-hidden">
        <div className="text-center border-2 border-foreground p-4 mb-4 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-trajan-black uppercase mb-2">¡Ejercicio Completado!</h2>
          <div className="text-3xl md:text-4xl font-trajan-black mb-2">{percentage}%</div>
          <p className="font-trajan mb-2">{score} de {palancas.length} correctas</p>
        </div>

        {incorrectResults.length > 0 && (
          <div className="flex-1 overflow-y-auto border-2 border-foreground p-4 mb-4 min-h-0">
            <h3 className="font-trajan-bold text-lg mb-3 text-center border-b-2 border-foreground pb-2">
              Emparejamientos Incorrectos ({incorrectResults.length})
            </h3>
            <div className="space-y-3">
              {incorrectResults.map((result, idx) => (
                <div key={idx} className="border-2 border-foreground p-3 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="font-trajan-bold text-sm min-w-[3rem]">#{result.palancaNumber}</span>
                    <p className="font-trajan text-sm flex-1">{result.palancaName}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-trajan-bold text-red-600">Tu emparejamiento:</span>
                      <p className="font-mono">{result.userAnswer}</p>
                    </div>
                    <div>
                      <span className="font-trajan-bold text-green-600">Correcto:</span>
                      <p className="font-mono">{result.correctAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onReset}
            className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-primary text-primary-foreground"
          >
            Nuevo Ejercicio
          </button>
          <button
            onClick={() => {
              setMatchedPairs(new Set())
              setScore(0)
              setCompleted(false)
              setSelectedNumbers([])
              setSelectedNames([])
              setResults([])
            }}
            className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-background hover:bg-secondary"
          >
            Repetir
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-3 flex items-center justify-between flex-shrink-0 flex-wrap gap-2 px-2">
        <div className="text-xs md:text-sm font-trajan-bold">
          Empareja cada número con su nombre
        </div>
        <div className="text-xs md:text-sm font-trajan-bold">
          Puntuación: {score} / {palancas.length}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 px-2 min-h-0">
        <div className="border-2 border-foreground p-3 flex flex-col overflow-hidden min-h-0">
          <h3 className="font-trajan-bold mb-2 text-center text-sm flex-shrink-0">Números</h3>
          <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 min-h-0">
            {shuffledNumbers.map(num => {
              const isSelected = selectedNumbers.includes(num)
              const isMatched = matchedPairs.has(`num-${num}`)
              
              return (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  disabled={isMatched}
                  className={`p-2 border-2 border-foreground font-trajan-bold text-xs md:text-sm ${
                    isMatched ? 'bg-green-500 text-green-900 opacity-50' :
                    isSelected ? 'bg-primary text-primary-foreground' :
                    'bg-background hover:bg-secondary'
                  }`}
                >
                  #{num}
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-2 border-foreground p-3 flex flex-col overflow-hidden min-h-0">
          <h3 className="font-trajan-bold mb-2 text-center text-sm flex-shrink-0">Nombres</h3>
          <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0">
            {shuffledNames.map(name => {
              const isSelected = selectedNames.includes(name)
              const isMatched = matchedPairs.has(`name-${name}`)
              
              return (
                <button
                  key={name}
                  onClick={() => handleNameClick(name)}
                  disabled={isMatched}
                  className={`w-full p-1.5 border-2 border-foreground font-trajan text-xs text-left ${
                    isMatched ? 'bg-green-500 text-green-900 opacity-50' :
                    isSelected ? 'bg-primary text-primary-foreground' :
                    'bg-background hover:bg-secondary'
                  }`}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="border-t-2 border-foreground pt-2 mt-3 flex gap-2 flex-shrink-0 px-2">
        <button
          onClick={onReset}
          className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-background hover:bg-secondary text-sm"
        >
          <RotateCcw className="h-4 w-4 inline mr-1" />
          Salir
        </button>
      </div>
    </div>
  )
}

// Find Number Exercise Component
function FindNumberExercise({
  palancas,
  onCorrect,
  onIncorrect,
  onFinish,
  onReset
}: {
  palancas: Palanca[]
  onCorrect: () => void
  onIncorrect: () => void
  onFinish: () => void
  onReset: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [shuffled, setShuffled] = useState<Palanca[]>([])
  const [options, setOptions] = useState<number[]>([])
  const [results, setResults] = useState<AnswerResult[]>([])

  const generateOptions = useCallback((currentPalanca: Palanca) => {
    const correctNumber = currentPalanca.number
    const wrongNumbers = palancas
      .filter(p => p.number !== correctNumber)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(p => p.number)
    
    const allOptions = [correctNumber, ...wrongNumbers].sort(() => Math.random() - 0.5)
    setOptions(allOptions)
  }, [palancas])

  useEffect(() => {
    const newShuffled = [...palancas].sort(() => Math.random() - 0.5)
    setShuffled(newShuffled)
    if (newShuffled.length > 0) {
      generateOptions(newShuffled[0])
    }
  }, [palancas, generateOptions])

  const handleSelect = (num: number) => {
    if (isAnswered) return
    setSelectedNumber(num)
  }

  const handleSubmit = () => {
    if (selectedNumber === null) return

    const current = shuffled[currentIndex]
    const isCorrect = selectedNumber === current.number

    // Guardar resultado
    const result: AnswerResult = {
      palancaNumber: current.number,
      palancaName: current.name,
      userAnswer: `#${selectedNumber}`,
      correctAnswer: `#${current.number}`,
      isCorrect
    }
    setResults(prev => [...prev, result])

    if (isCorrect) {
      setScore(prev => prev + 1)
      onCorrect()
    } else {
      onIncorrect()
    }

    setIsAnswered(true)

    setTimeout(() => {
      if (currentIndex < shuffled.length - 1) {
        const nextIndex = currentIndex + 1
        setCurrentIndex(nextIndex)
        setSelectedNumber(null)
        setIsAnswered(false)
        generateOptions(shuffled[nextIndex])
      } else {
        setCompleted(true)
        onFinish()
      }
    }, 2000)
  }

  if (completed) {
    const percentage = Math.round((score / palancas.length) * 100)
    const incorrectResults = results.filter(r => !r.isCorrect)
    
    return (
      <div className="flex-grow flex flex-col p-4 overflow-hidden">
        <div className="text-center border-2 border-foreground p-4 mb-4 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-trajan-black uppercase mb-2">¡Ejercicio Completado!</h2>
          <div className="text-3xl md:text-4xl font-trajan-black mb-2">{percentage}%</div>
          <p className="font-trajan mb-2">{score} de {palancas.length} correctas</p>
        </div>

        {incorrectResults.length > 0 && (
          <div className="flex-1 overflow-y-auto border-2 border-foreground p-4 mb-4 min-h-0">
            <h3 className="font-trajan-bold text-lg mb-3 text-center border-b-2 border-foreground pb-2">
              Respuestas Incorrectas ({incorrectResults.length})
            </h3>
            <div className="space-y-3">
              {incorrectResults.map((result, idx) => (
                <div key={idx} className="border-2 border-foreground p-3 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="font-trajan text-sm flex-1">{result.palancaName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-trajan-bold text-red-600">Tu respuesta:</span>
                      <p className="font-mono">{result.userAnswer}</p>
                    </div>
                    <div>
                      <span className="font-trajan-bold text-green-600">Correcta:</span>
                      <p className="font-mono">{result.correctAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onReset}
            className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-primary text-primary-foreground"
          >
            Nuevo Ejercicio
          </button>
          <button
            onClick={() => {
              const newShuffled = [...palancas].sort(() => Math.random() - 0.5)
              setShuffled(newShuffled)
              setCurrentIndex(0)
              setScore(0)
              setCompleted(false)
              setSelectedNumber(null)
              setIsAnswered(false)
              setResults([])
              generateOptions(newShuffled[0])
            }}
            className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-background hover:bg-secondary"
          >
            Repetir
          </button>
        </div>
      </div>
    )
  }

  const currentPalanca = shuffled[currentIndex]

  return (
    <div className="flex-grow flex flex-col p-4 overflow-hidden">
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <div className="text-sm font-mono">
          {currentIndex + 1} / {shuffled.length}
        </div>
        <div className="text-sm font-trajan-bold">
          Puntuación: {score}
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center min-h-0">
        <div className="w-full max-w-2xl border-2 border-foreground p-6 text-center">
          <div className="text-xl md:text-2xl font-trajan mb-6 px-4">
            {currentPalanca?.name}
          </div>
          
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <p className={`font-trajan-bold text-lg ${
                selectedNumber === currentPalanca?.number ? 'text-green-600' : 'text-red-600'
              }`}>
                {selectedNumber === currentPalanca?.number ? '¡Correcto!' : 'Incorrecto'}
              </p>
              <p className="font-trajan text-sm mt-2">La respuesta correcta es: #{currentPalanca?.number}</p>
            </motion.div>
          )}

          {!isAnswered && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {options.map(num => (
                <button
                  key={num}
                  onClick={() => handleSelect(num)}
                  className={`p-4 border-2 border-foreground font-trajan-bold text-lg md:text-xl transition-colors ${
                    selectedNumber === num
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-secondary'
                  }`}
                >
                  #{num}
                </button>
              ))}
            </div>
          )}

          {!isAnswered && selectedNumber !== null && (
            <button
              onClick={handleSubmit}
              className="w-full border-2 border-foreground p-2 font-trajan-bold bg-primary text-primary-foreground"
            >
              Verificar
            </button>
          )}
        </div>
      </div>

      <div className="border-t-2 border-foreground pt-3 mt-4 flex gap-2 flex-shrink-0">
        <button
          onClick={onReset}
          className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-background hover:bg-secondary"
        >
          <RotateCcw className="h-4 w-4 inline mr-1" />
          Salir
        </button>
      </div>
    </div>
  )
}

// Speed Exercise Component
function SpeedExercise({
  palancas,
  onCorrect,
  onIncorrect,
  onFinish,
  onReset
}: {
  palancas: Palanca[]
  onCorrect: () => void
  onIncorrect: () => void
  onFinish: () => void
  onReset: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [completed, setCompleted] = useState(false)
  const [shuffled, setShuffled] = useState<Palanca[]>([])
  const [results, setResults] = useState<AnswerResult[]>([])

  useEffect(() => {
    setShuffled([...palancas].sort(() => Math.random() - 0.5))
  }, [palancas])

  useEffect(() => {
    if (completed || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCompleted(true)
          onFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, completed])

  const normalizeString = (str: string) => 
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    const current = shuffled[currentIndex]
    const isCorrect = normalizeString(userAnswer) === normalizeString(current.name)

    // Guardar resultado
    const result: AnswerResult = {
      palancaNumber: current.number,
      palancaName: current.name,
      userAnswer: userAnswer.trim(),
      correctAnswer: current.name,
      isCorrect
    }
    setResults(prev => [...prev, result])

    if (isCorrect) {
      setScore(prev => prev + 1)
      onCorrect()
    } else {
      onIncorrect()
    }

    setUserAnswer('')
    
    if (currentIndex < shuffled.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setShuffled([...palancas].sort(() => Math.random() - 0.5))
      setCurrentIndex(0)
    }
  }

  if (completed) {
    const incorrectResults = results.filter(r => !r.isCorrect)
    const totalAnswered = results.length
    
    return (
      <div className="flex-grow flex flex-col p-4 overflow-hidden">
        <div className="text-center border-2 border-foreground p-4 mb-4 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-trajan-black uppercase mb-2">¡Tiempo Agotado!</h2>
          <div className="text-3xl md:text-4xl font-trajan-black mb-2">{score}</div>
          <p className="font-trajan mb-2">Respuestas correctas de {totalAnswered} respondidas</p>
        </div>

        {incorrectResults.length > 0 && (
          <div className="flex-1 overflow-y-auto border-2 border-foreground p-4 mb-4 min-h-0">
            <h3 className="font-trajan-bold text-lg mb-3 text-center border-b-2 border-foreground pb-2">
              Respuestas Incorrectas ({incorrectResults.length})
            </h3>
            <div className="space-y-3">
              {incorrectResults.map((result, idx) => (
                <div key={idx} className="border-2 border-foreground p-3 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="font-trajan-bold text-sm min-w-[3rem]">#{result.palancaNumber}</span>
                    <p className="font-trajan text-sm flex-1">{result.palancaName}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-trajan-bold text-red-600">Tu respuesta:</span>
                      <p className="font-mono">{result.userAnswer}</p>
                    </div>
                    <div>
                      <span className="font-trajan-bold text-green-600">Correcta:</span>
                      <p className="font-mono">{result.correctAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onReset}
            className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-primary text-primary-foreground"
          >
            Nuevo Ejercicio
          </button>
          <button
            onClick={() => {
              setTimeLeft(60)
              setScore(0)
              setCurrentIndex(0)
              setCompleted(false)
              setUserAnswer('')
              setResults([])
              setShuffled([...palancas].sort(() => Math.random() - 0.5))
            }}
            className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-background hover:bg-secondary"
          >
            Repetir
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-grow flex flex-col p-4">
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <div className="text-2xl font-mono font-bold">
          {timeLeft}s
        </div>
        <div className="text-lg font-trajan-bold">
          Puntuación: {score}
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-2xl border-2 border-foreground p-6 text-center">
          <div className="text-6xl md:text-8xl font-trajan-black mb-6">
            #{shuffled[currentIndex]?.number}
          </div>
          <div className="w-full">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Escribe el nombre rápidamente..."
              className="w-full p-3 border-2 border-foreground bg-background font-trajan text-center text-lg outline-none"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="w-full mt-3 border-2 border-foreground p-2 font-trajan-bold bg-primary text-primary-foreground disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-foreground pt-3 mt-4 flex gap-2 flex-shrink-0">
        <button
          onClick={onReset}
          className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-background hover:bg-secondary"
        >
          <RotateCcw className="h-4 w-4 inline mr-1" />
          Salir
        </button>
      </div>
    </div>
  )
}

// Typing Exercise Component
function TypingExercise({
  palancas,
  onCorrect,
  onIncorrect,
  onFinish,
  onReset
}: {
  palancas: Palanca[]
  onCorrect: () => void
  onIncorrect: () => void
  onFinish: () => void
  onReset: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [shuffled, setShuffled] = useState<Palanca[]>([])
  const [results, setResults] = useState<AnswerResult[]>([])

  useEffect(() => {
    setShuffled([...palancas].sort(() => Math.random() - 0.5))
  }, [palancas])

  const normalizeString = (str: string) => 
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    const current = shuffled[currentIndex]
    const isCorrect = normalizeString(userAnswer) === normalizeString(current.name)

    // Guardar resultado
    const result: AnswerResult = {
      palancaNumber: current.number,
      palancaName: current.name,
      userAnswer: userAnswer.trim(),
      correctAnswer: current.name,
      isCorrect
    }
    setResults(prev => [...prev, result])

    if (isCorrect) {
      setScore(prev => prev + 1)
      onCorrect()
    } else {
      onIncorrect()
    }

    setIsAnswered(true)

    setTimeout(() => {
      if (currentIndex < shuffled.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setUserAnswer('')
        setIsAnswered(false)
      } else {
        setCompleted(true)
        onFinish()
      }
    }, 2000)
  }

  if (completed) {
    const percentage = Math.round((score / palancas.length) * 100)
    const incorrectResults = results.filter(r => !r.isCorrect)
    
    return (
      <div className="flex-grow flex flex-col p-4 overflow-hidden">
        <div className="text-center border-2 border-foreground p-4 mb-4 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-trajan-black uppercase mb-2">¡Ejercicio Completado!</h2>
          <div className="text-3xl md:text-4xl font-trajan-black mb-2">{percentage}%</div>
          <p className="font-trajan mb-2">{score} de {palancas.length} correctas</p>
        </div>

        {incorrectResults.length > 0 && (
          <div className="flex-1 overflow-y-auto border-2 border-foreground p-4 mb-4 min-h-0">
            <h3 className="font-trajan-bold text-lg mb-3 text-center border-b-2 border-foreground pb-2">
              Respuestas Incorrectas ({incorrectResults.length})
            </h3>
            <div className="space-y-3">
              {incorrectResults.map((result, idx) => (
                <div key={idx} className="border-2 border-foreground p-3 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="font-trajan-bold text-sm min-w-[3rem]">#{result.palancaNumber}</span>
                    <p className="font-trajan text-sm flex-1">{result.palancaName}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-trajan-bold text-red-600">Tu respuesta:</span>
                      <p className="font-mono">{result.userAnswer}</p>
                    </div>
                    <div>
                      <span className="font-trajan-bold text-green-600">Correcta:</span>
                      <p className="font-mono">{result.correctAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onReset}
            className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-primary text-primary-foreground"
          >
            Nuevo Ejercicio
          </button>
          <button
            onClick={() => {
              setCurrentIndex(0)
              setScore(0)
              setCompleted(false)
              setUserAnswer('')
              setIsAnswered(false)
              setResults([])
              setShuffled([...palancas].sort(() => Math.random() - 0.5))
            }}
            className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-background hover:bg-secondary"
          >
            Repetir
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-grow flex flex-col p-4">
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <div className="text-sm font-mono">
          {currentIndex + 1} / {shuffled.length}
        </div>
        <div className="text-sm font-trajan-bold">
          Puntuación: {score}
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-2xl border-2 border-foreground p-6 text-center">
          <div className="text-6xl md:text-8xl font-trajan-black mb-6">
            #{shuffled[currentIndex]?.number}
          </div>
          
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4"
            >
              <p className="font-trajan text-sm mb-2">Respuesta correcta:</p>
              <p className="font-trajan-bold text-lg">{shuffled[currentIndex]?.name}</p>
            </motion.div>
          )}

          {!isAnswered && (
            <div className="w-full">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Escribe el nombre completo..."
                className="w-full p-3 border-2 border-foreground bg-background font-trajan text-center text-lg outline-none"
                autoFocus
              />
              <button
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
                className="w-full mt-3 border-2 border-foreground p-2 font-trajan-bold bg-primary text-primary-foreground disabled:opacity-50"
              >
                Verificar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t-2 border-foreground pt-3 mt-4 flex gap-2 flex-shrink-0">
        <button
          onClick={onReset}
          className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-background hover:bg-secondary"
        >
          <RotateCcw className="h-4 w-4 inline mr-1" />
          Salir
        </button>
      </div>
    </div>
  )
}

// Image Memory Exercise Component
function ImageMemoryExercise({
  palancas,
  onCorrect,
  onIncorrect,
  onFinish,
  onReset
}: {
  palancas: Palanca[]
  onCorrect: () => void
  onIncorrect: () => void
  onFinish: () => void
  onReset: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [shuffled, setShuffled] = useState<Palanca[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [results, setResults] = useState<AnswerResult[]>([])
  const [showImage, setShowImage] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(5) // 5 segundos para memorizar

  const normalizeString = (str: string) => 
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()

  const generateOptions = useCallback((currentPalanca: Palanca) => {
    const correctName = currentPalanca.name
    const wrongNames = palancas
      .filter(p => p.name !== correctName)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(p => p.name)
    
    const allOptions = [correctName, ...wrongNames].sort(() => Math.random() - 0.5)
    setOptions(allOptions)
  }, [palancas])

  useEffect(() => {
    const newShuffled = palancas.filter(p => p.imageUrl).sort(() => Math.random() - 0.5)
    setShuffled(newShuffled)
    if (newShuffled.length > 0) {
      generateOptions(newShuffled[0])
      setShowImage(true)
      setTimeRemaining(5)
    }
  }, [palancas, generateOptions])

  // Timer para ocultar la imagen después de 5 segundos
  useEffect(() => {
    if (!showImage || completed) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setShowImage(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showImage, completed])

  const handleSelect = (name: string) => {
    if (isAnswered || showImage) return
    setSelectedOption(name)
  }

  const handleSubmit = () => {
    if (selectedOption === null || showImage) return

    const current = shuffled[currentIndex]
    const isCorrect = normalizeString(selectedOption) === normalizeString(current.name)

    // Guardar resultado
    const result: AnswerResult = {
      palancaNumber: current.number,
      palancaName: current.name,
      userAnswer: selectedOption,
      correctAnswer: current.name,
      isCorrect
    }
    setResults(prev => [...prev, result])

    if (isCorrect) {
      setScore(prev => prev + 1)
      onCorrect()
    } else {
      onIncorrect()
    }

    setIsAnswered(true)

    setTimeout(() => {
      if (currentIndex < shuffled.length - 1) {
        const nextIndex = currentIndex + 1
        setCurrentIndex(nextIndex)
        setSelectedOption(null)
        setIsAnswered(false)
        setShowImage(true)
        setTimeRemaining(5)
        generateOptions(shuffled[nextIndex])
      } else {
        setCompleted(true)
        onFinish()
      }
    }, 2000)
  }

  // Función para obtener el ID de una palanca por su nombre
  const getQuestionIdByAnswer = (answerName: string): number | null => {
    const question = questions.find(q => 
      q.answer.split('|').some(a => normalizeString(a) === normalizeString(answerName))
    )
    return question ? question.id : null
  }

  if (completed) {
    const percentage = Math.round((score / shuffled.length) * 100)
    const incorrectResults = results.filter(r => !r.isCorrect)
    
    return (
      <div className="flex-grow flex flex-col p-4 overflow-hidden">
        <div className="text-center border-2 border-foreground p-4 mb-4 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-trajan-black uppercase mb-2">¡Ejercicio Completado!</h2>
          <div className="text-3xl md:text-4xl font-trajan-black mb-2">{percentage}%</div>
          <p className="font-trajan mb-2">{score} de {shuffled.length} correctas</p>
        </div>

        {incorrectResults.length > 0 && (
          <div className="flex-1 overflow-y-auto border-2 border-foreground p-4 mb-4 min-h-0">
            <h3 className="font-trajan-bold text-lg mb-3 text-center border-b-2 border-foreground pb-2">
              Respuestas Incorrectas ({incorrectResults.length})
            </h3>
            <div className="space-y-3">
              {incorrectResults.map((result, idx) => (
                <div key={idx} className="border-2 border-foreground p-3 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="font-trajan-bold text-sm min-w-[3rem]">#{result.palancaNumber}</span>
                    <p className="font-trajan text-sm flex-1">{result.palancaName}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-trajan-bold text-red-600">Tu respuesta:</span>
                      <p className="font-mono">{result.userAnswer}</p>
                    </div>
                    <div>
                      <span className="font-trajan-bold text-green-600">Correcta:</span>
                      <p className="font-mono">{result.correctAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onReset}
            className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-primary text-primary-foreground"
          >
            Nuevo Ejercicio
          </button>
          <button
            onClick={() => {
              const newShuffled = palancas.filter(p => p.imageUrl).sort(() => Math.random() - 0.5)
              setShuffled(newShuffled)
              setCurrentIndex(0)
              setScore(0)
              setCompleted(false)
              setSelectedOption(null)
              setIsAnswered(false)
              setResults([])
              setShowImage(true)
              setTimeRemaining(5)
              if (newShuffled.length > 0) {
                generateOptions(newShuffled[0])
              }
            }}
            className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-background hover:bg-secondary"
          >
            Repetir
          </button>
        </div>
      </div>
    )
  }

  const currentPalanca = shuffled[currentIndex]

  if (!currentPalanca) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <p className="font-trajan">No hay palancas con imágenes disponibles</p>
      </div>
    )
  }

  return (
    <div className="flex-grow flex flex-col p-4 overflow-hidden">
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <div className="text-sm font-mono">
          {currentIndex + 1} / {shuffled.length}
        </div>
        <div className="text-sm font-trajan-bold">
          Puntuación: {score}
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center min-h-0">
        {showImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl border-2 border-foreground p-6 text-center"
          >
            <div className="mb-4">
              <p className="font-trajan-bold text-lg mb-2">Memoriza esta imagen</p>
              <div className="text-3xl font-trajan-black mb-4">{timeRemaining}</div>
            </div>
            <div className="relative w-full max-w-md h-auto mx-auto border-2 border-foreground p-2 bg-background">
              <Image
                src={currentPalanca.imageUrl!}
                alt="Palanca"
                width={600}
                height={400}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </motion.div>
        ) : (
          <div className="w-full max-w-2xl border-2 border-foreground p-6 text-center">
            <div className="mb-6">
              <p className="font-trajan-bold text-xl mb-4">¿Qué palanca era?</p>
              <div className="h-32 border-2 border-foreground bg-muted flex items-center justify-center">
                <p className="font-trajan text-muted-foreground">Imagen oculta</p>
              </div>
            </div>

            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <p className={`font-trajan-bold text-lg mb-2 ${
                  selectedOption && normalizeString(selectedOption) === normalizeString(currentPalanca.name)
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedOption && normalizeString(selectedOption) === normalizeString(currentPalanca.name)
                    ? '¡Correcto!' : 'Incorrecto'}
                </p>
                <p className="font-trajan text-sm">La respuesta correcta es: {currentPalanca.name} (Nº {currentPalanca.number})</p>
              </motion.div>
            )}

            {!isAnswered && (
              <>
                <div className="grid-row gap-2 mb-4">
                  {options.map((option, index) => {
                    const optionId = getQuestionIdByAnswer(option)
                    return (
                      <div key={index} className="grid-col grid-col-12">
                        <button
                          onClick={() => handleSelect(option)}
                          className={`w-full text-left border-2 border-foreground p-3 transition-colors ${
                            selectedOption === option
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background hover:bg-secondary'
                          }`}
                        >
                          <span className="inline-block w-5 h-5 mr-2 leading-5 text-center border-2 align-text-top font-trajan text-xs">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="font-trajan">
                            {option}
                            {optionId && (
                              <span className="ml-2 text-sm opacity-70">(Nº {optionId})</span>
                            )}
                          </span>
                        </button>
                      </div>
                    )
                  })}
                </div>

                {selectedOption && (
                  <button
                    onClick={handleSubmit}
                    className="w-full border-2 border-foreground p-2 font-trajan-bold bg-primary text-primary-foreground"
                  >
                    Verificar
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="border-t-2 border-foreground pt-3 mt-4 flex gap-2 flex-shrink-0">
        <button
          onClick={onReset}
          className="flex-1 border-2 border-foreground p-2 font-trajan-bold bg-background hover:bg-secondary"
        >
          <RotateCcw className="h-4 w-4 inline mr-1" />
          Salir
        </button>
      </div>
    </div>
  )
}

