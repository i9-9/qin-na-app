'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { questions } from './questions'

// Define the Question type if not already defined
type Question = {
  type: 'text' | 'image' | 'multipleChoice';
  text: string;
  answer: string;
  imageUrl?: string;
  options?: string[];
};

// Add this helper function at the top of your file
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

  useEffect(() => {
    // Shuffle questions when component mounts
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    setShuffledQuestions(shuffled)
  }, [])

  useEffect(() => {
    // Focus on the input field when a new question is presented
    if (inputRef.current && !isAnswered && shuffledQuestions[currentQuestionIndex]?.type !== 'multipleChoice') {
      inputRef.current.focus()
    }
  }, [currentQuestionIndex, isAnswered, shuffledQuestions])

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isAnswered && shuffledQuestions[currentQuestionIndex]) {
      const currentQuestion = shuffledQuestions[currentQuestionIndex];
      const isCorrect = normalizeString(userAnswer) === normalizeString(currentQuestion.answer);
      setFeedback(isCorrect ? 'Correcto!' : `Incorrecto. La respuesta correcta es: ${currentQuestion.answer}.`);
      setIsAnswered(true);
      if (isCorrect) setScore(prevScore => prevScore + 1);
      
      // Move to next question after a short delay
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
      }, 1500); // 1.5 second delay
    }
  };

  if (shuffledQuestions.length === 0) {
    return <div>Loading questions...</div>
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'text':
        return <p className="mb-4">{currentQuestion.text}</p>
      case 'image':
        return (
          <div className="mb-4">
            <p className="mb-2">{currentQuestion.text}</p>
            <Image 
              src={currentQuestion.imageUrl} 
              alt="Question Image" 
              width={400} 
              height={200} 
              className="rounded-md"
            />
          </div>
        )
      case 'multipleChoice':
        return (
          <div className="mb-4">
            <p className="mb-2">{currentQuestion.text}</p>
            <RadioGroup value={userAnswer} onValueChange={setUserAnswer}>
              {currentQuestion.options.map((option, index) => (
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
    if (currentQuestion.type === 'multipleChoice') return null
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

  return (
    <div className="flex justify-center items-center max-h-screen" onKeyDown={handleKeyPress}>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="w-full" />
        </CardHeader>
        <CardContent>
          {!quizCompleted ? (
            <>
              <p className="mb-4 text-sm text-gray-500">Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
              {renderQuestion()}
              {renderAnswerInput()}
              {feedback && <p className="mt-4 text-sm font-medium" role="alert">{feedback}</p>}
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Cuestionario completado!</h2>
              <p className="text-lg">Tu puntuación es: {score}/{questions.length}</p>
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
              {currentQuestionIndex < questions.length - 1 ? 'Próxima' : 'Terminar'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

const handleSubmit = () => {
  const isCorrect = normalizeString(userAnswer) === normalizeString(currentQuestion.answer);
  setFeedback(isCorrect ? 'Correcto!' : `Incorrecto. La respuesta correcta es: ${currentQuestion.answer}.`);
  setIsAnswered(true);
  if (isCorrect) setScore(prevScore => prevScore + 1);
}

const handleNext = () => {
  if (currentQuestionIndex < questions.length - 1) {
    setCurrentQuestionIndex(currentQuestionIndex + 1)
    setUserAnswer('')
    setFeedback('')
    setIsAnswered(false)
  } else {
    setQuizCompleted(true)
    setFeedback(`Quiz completed! Your score: ${score + (isAnswered && userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase() ? 1 : 0)}/${questions.length}`)
  }
}