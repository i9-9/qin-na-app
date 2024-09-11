'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { questions } from './questions'

type Question = {
  type: 'text' | 'image' | 'multipleChoice';
  text: string;
  answer: string;
  imageUrl?: string;
  options?: string[];
};

function normalizeString(str: string): string {
  return str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function EnhancedQuizApp() {
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    setShuffledQuestions(shuffled)
  }, [])

  useEffect(() => {
    if (inputRef.current && !isAnswered && shuffledQuestions[currentQuestionIndex]?.type !== 'multipleChoice') {
      inputRef.current.focus()
    }
  }, [currentQuestionIndex, isAnswered, shuffledQuestions])

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isAnswered && shuffledQuestions[currentQuestionIndex]) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const isCorrect = normalizeString(userAnswer) === normalizeString(currentQuestion.answer);
    setFeedback(isCorrect ? 'Correcto!' : `Incorrecto. La respuesta correcta es: ${currentQuestion.answer}.`);
    setIsAnswered(true);
    if (isCorrect) setScore(prevScore => prevScore + 1);
    
    setTimeout(() => {
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setUserAnswer('');
        setFeedback('');
        setIsAnswered(false);
      } else {
        setQuizCompleted(true);
        setFeedback(`Cuestionario completado! Tu puntuación es ${score + (isCorrect ? 1 : 0)}/${shuffledQuestions.length}`);
      }
    }, 2500);
  }

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setUserAnswer('')
      setFeedback('')
      setIsAnswered(false)
    } else {
      setQuizCompleted(true)
      setFeedback(`Cuestionario completado! Tu puntuación es ${score + (isAnswered && userAnswer.toLowerCase() === shuffledQuestions[currentQuestionIndex].answer.toLowerCase() ? 1 : 0)}/${shuffledQuestions.length}`)
    }
  }

  const renderQuestion = () => {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'text':
        return <p className="mb-4">{currentQuestion.text}</p>
      case 'image':
        return (
          <div className="mb-4">
            <p className="mb-2">{currentQuestion.text}</p>
            {currentQuestion.imageUrl && (
              <Image 
                src={currentQuestion.imageUrl}
                alt="Question Image" 
                width={400} 
                height={200} 
                className="rounded-md"
              />
            )}
          </div>
        )
      case 'multipleChoice':
        return (
          <div className="mb-4">
            <p className="mb-2">{currentQuestion.text}</p>
            <RadioGroup value={userAnswer} onValueChange={setUserAnswer}>
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} disabled={isAnswered} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      default:
        return <p>Invalid question type</p>
    }
  }

  const renderAnswerInput = () => {
    if (shuffledQuestions[currentQuestionIndex]?.type === 'multipleChoice') return null
    return (
      <Input
        ref={inputRef}
        type="text"
        placeholder="Respuesta"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={isAnswered}
        className="mb-4"
      />
    )
  }

  if (shuffledQuestions.length === 0) {
    return <div className='text-center my-10 border border-gray-300 p-4 rounded-md text-gray-300'>Cargando preguntas...</div>
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground p-4">
      <div className="flex items-center justify-center w-full max-w-2xl mb-4">
        <Label htmlFor="dark-mode" className="mr-2">
        </Label>
        <Switch
          id="dark-mode"
          checked={theme === 'dark'}
          onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Progress value={(currentQuestionIndex + 1) / shuffledQuestions.length * 100} className="w-full" />
        </CardHeader>
        <CardContent className="min-h-[200px]">
          {!quizCompleted ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">Pregunta {currentQuestionIndex + 1} de {shuffledQuestions.length}</p>
              {renderQuestion()}
              {renderAnswerInput()}
              {feedback && (
                <p className="mt-4 text-sm font-medium break-words overflow-hidden" role="alert">
                  {feedback}
                </p>
              )}
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Cuestionario completado!</h2>
              <p className="text-lg">Tu puntuación es: {score}/{shuffledQuestions.length}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Volver a empezar
              </Button>
            </div>
          )}
        </CardContent>
        {!quizCompleted && (
          <CardFooter className="flex justify-between">
            <Button onClick={handleSubmit} disabled={isAnswered || userAnswer.trim() === ''}>
              Enviar
            </Button>
            <Button onClick={handleNext} disabled={!isAnswered}>
              {currentQuestionIndex < shuffledQuestions.length - 1 ? 'Próxima' : 'Terminar'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}