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
import { Circle } from 'lucide-react'
import { MobileMenu } from "@/components/MobileMenu"

type Question = {
  type: 'text' | 'image' | 'multipleChoice';
  text: string;
  answer: string;
  imageUrl?: string;
  options?: string[];
};

const normalizeString = (str: string) => 
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const isAnswerCorrect = (userAnswer: string, correctAnswer: string) => {
  const normalizedUserAnswer = normalizeString(userAnswer);
  return correctAnswer.split('|').some(answer => normalizeString(answer) === normalizedUserAnswer);
};

export default function EnhancedQuizApp() {
  const [quizType, setQuizType] = useState<'blanco' | 'avanzado' | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { theme, setTheme } = useTheme()

  const resetQuiz = () => {
    setQuizType(null);
    setShuffledQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setFeedback('');
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  useEffect(() => {
    if (quizType) {
      const filteredQuestions = quizType === 'blanco' 
        ? questions.filter(q => parseInt(q.text.split(' ').pop() || '0') <= 18)
        : questions;
      const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
      setShuffledQuestions(shuffled);
    }
  }, [quizType]);

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
    const isCorrect = userAnswer.trim() !== '' && isAnswerCorrect(userAnswer, currentQuestion.answer);
    const correctAnswer = currentQuestion.answer.split('|')[0]; // Use the first correct answer
    setFeedback(isCorrect ? 'Correcto!' : `Incorrecto.\nLa respuesta correcta es:\n\n${correctAnswer}`);
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
    if (!isAnswered) {
      const correctAnswer = shuffledQuestions[currentQuestionIndex].answer.split('|')[0]; // Use the first correct answer
      setFeedback(`Pregunta salteada.\nLa respuesta correcta es:\n\n${correctAnswer}`);
      setIsAnswered(true);
      setTimeout(() => {
        moveToNextQuestion();
      }, 2500);
    } else {
      moveToNextQuestion();
    }
  }

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setUserAnswer('');
      setFeedback('');
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
      setFeedback(`Cuestionario completado! Tu puntuación es ${score}/${shuffledQuestions.length}`);
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

  const renderFeedback = () => {
    if (!feedback) return null;
    const isCorrect = feedback.startsWith('Correcto');
    return (
      <div className="mt-4 flex items-start space-x-2">
        <Circle
          className={`w-4 h-4 mt-1 ${isCorrect ? 'text-green-500' : 'text-red-500'} fill-current`}
        />
        <p className="text-sm font-medium break-words overflow-hidden whitespace-pre-line" role="alert">
          {feedback}
        </p>
      </div>
    );
  };

  if (!quizType) {
    return (
      <div className="flex flex-col items-center justify-center bg-background text-foreground mt-4">
        <h2 className="text-2xl font-bold mb-4">Elige el tipo de cuestionario:</h2>
        <div className="space-x-4">
          <Button onClick={() => setQuizType('blanco')}>Blanco (1-18)</Button>
          <Button onClick={() => setQuizType('avanzado')}>Avanzado (1-32)</Button>
        </div>
      </div>
    );
  }

  if (shuffledQuestions.length === 0) {
    return <div className="text-center my-10">Cargando preguntas...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="flex justify-around items-center p-4 border-b">
        <div className="flex flex-row items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
            <Label htmlFor="dark-mode" className="sr-only">
              Toggle theme
            </Label>
          </div>
          <MobileMenu resetQuiz={resetQuiz} />
        </div>
      </header>
      <main className="flex justify-center items-center p-4">
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
                {renderFeedback()}
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
              <Button onClick={handleNext}>
                {currentQuestionIndex < shuffledQuestions.length - 1 ? 'Próxima' : 'Terminar'}
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  )
}