'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { questions } from './questions'

export default function EnhancedQuizApp() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    if (quizCompleted) {
      // You can add any post-quiz actions here, like saving the score
      console.log(`Quiz completed! Final score: ${score}/${questions.length}`)
    }
  }, [quizCompleted, score])

  const handleSubmit = () => {
    const isCorrect = userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase()
    setFeedback(isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${currentQuestion.answer}.`)
    setIsAnswered(true)
    if (isCorrect) setScore(prevScore => prevScore + 1)
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
    }
  }

  const renderAnswerInput = () => {
    if (currentQuestion.type === 'multipleChoice') return null
    return (
      <Input
        type="text"
        placeholder="Your answer"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        disabled={isAnswered}
        className="mb-4"
      />
    )
  }

  return (
    <div className="flex justify-center items-center max-h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Qin-Na</CardTitle>
          <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="w-full" />
        </CardHeader>
        <CardContent>
          {!quizCompleted ? (
            <>
              <p className="mb-4 text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
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