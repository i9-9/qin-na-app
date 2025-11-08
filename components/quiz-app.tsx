'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react'
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { questions } from './questions'
import { Circle, Clock, HelpCircle, Award, RotateCcw, XCircle, ClipboardCheck, ArrowRight, BookOpen } from 'lucide-react'
import { MobileMenu } from "@/components/MobileMenu"
import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import confetti from 'canvas-confetti'
import Link from 'next/link'
import Image from 'next/image'

type Question = {
  id: number;
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

// Mapping for special cases where answer doesn't match filename exactly
const answerToFilenameMap: Record<string, string> = {
  // ID 1: Variante sin "de" antes de "seda"
  'Muñeca de oro y seda': 'Muñeca de oro y de seda',
  
  // ID 2: Variante "que corta" vs "corta"
  'Mano que corta como cuchillo': 'Mano corta como cuchillo',
  
  // ID 8: Variante sin "El" al inicio
  'Rey del cielo sostiene la torre': 'El rey del cielo sostiene la torre',
  
  // ID 12: Mayúsculas en "Wang"
  'Ba wang indica la batalla': 'Ba Wang indica la batalla',
  
  // ID 13: Plural vs singular
  'Palmadas en el pecho y girar el codo': 'Palmada en el pecho y girar el codo',
  'Palmaditas en el pecho y girar el codo': 'Palmada en el pecho y girar el codo',
  
  // ID 14: "como" vs "de"
  'Manos como flor de ciruelo': 'Manos de flor de ciruelo',
  
  // ID 16: "con" vs "a lo largo de"
  'Girar el remo con la corriente': 'Girar el remo a lo largo de la corriente',
  
  // ID 19: Variante con "sostener" repetido
  'Sostener el brazo y sostener el codo': 'Sostener el brazo y el codo',
  
  // ID 20: "girar" vs "llevar"
  'Dar la vuelta y girar el codo': 'Dar la vuelta y llevar el codo',
  
  // ID 32: Variante sin "El" al inicio
  'Dragon azul inclina la cabeza': 'El dragon azul inclina la cabeza',
};

// Function to normalize Unicode characters (handles both precomposed and decomposed forms)
const normalizeUnicode = (str: string): string => {
  // Normalize to NFD (Canonical Decomposition) to handle both ñ (U+00F1) and n+̃ (U+006E+U+0303)
  return str.normalize('NFD');
};

// Function to map answer to image filename
const getImageUrlFromAnswer = (answer: string): string | null => {
  // Get the first part of the answer (before |)
  const mainAnswer = answer.split('|')[0].trim();
  
  // Check if there's a special mapping
  const mappedAnswer = answerToFilenameMap[mainAnswer] || mainAnswer;
  
  // Normalize Unicode to handle different encodings of special characters
  const normalizedAnswer = normalizeUnicode(mappedAnswer);
  
  // Convert to filename format and add .png
  const filename = normalizedAnswer + '.png';
  return `/palancas/${filename}`;
};

// Function to generate image-based questions
const generateImageQuestions = (baseQuestions: Question[]): Question[] => {
  return baseQuestions.map(q => {
    const imageUrl = getImageUrlFromAnswer(q.answer);
    if (imageUrl) {
      return {
        ...q,
        type: 'image' as const,
        imageUrl: imageUrl,
        text: `¿Cuál es esta palanca?`
      };
    }
    // Si no hay imagen, mantener la pregunta pero sin número en el texto
    return {
      ...q,
      text: `¿Cuál es esta palanca?`
    };
  });
};

// Function to get question ID by answer name
const getQuestionIdByAnswer = (answerName: string): number | null => {
  const question = questions.find(q => 
    q.answer.split('|').some(a => normalizeString(a) === normalizeString(answerName))
  );
  return question ? question.id : null;
};

// Function to generate multiple choice options
const generateMultipleChoiceOptions = (correctAnswer: string, allAnswers: string[], count = 4) => {
  // Get the first part if there are multiple correct answers
  const mainAnswer = correctAnswer.split('|')[0].trim();
  
  // Filter out the correct answer and select random wrong answers
  const wrongAnswers = allAnswers
    .filter(a => !correctAnswer.split('|').some(ca => normalizeString(ca) === normalizeString(a)))
    .sort(() => Math.random() - 0.5)
    .slice(0, count - 1);
  
  // Combine and shuffle
  return [...wrongAnswers, mainAnswer].sort(() => Math.random() - 0.5);
};

export interface QuizAppRef {
  resetQuiz: () => void;
}

const EnhancedQuizApp = forwardRef<QuizAppRef>((props, ref) => {
  const [quizType, setQuizType] = useState<'basico' | 'blanco' | 'avanzado' | 'basico-visual' | 'blanco-visual' | 'avanzado-visual' | null>(null);
  const [answerMode, setAnswerMode] = useState<'text' | 'multipleChoice'>('multipleChoice');
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [mistakes, setMistakes] = useState<number[]>([])
  const [statsVisible, setStatsVisible] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { theme, setTheme } = useTheme()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Retrieve previous scores from localStorage
  const [previousScores, setPreviousScores] = useState<{date: string, score: number, total: number}[]>([])

  const resetQuiz = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQuizType(null);
    // Mantenemos el modo de respuesta (no lo reseteamos) para que el usuario pueda
    // seguir usando el mismo modo en el próximo cuestionario
    setShuffledQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setSelectedOption('');
    setFeedback('');
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    setTimeRemaining(null);
    setIsPaused(false);
    setMistakes([]);
    setStatsVisible(false);
  };

  useImperativeHandle(ref, () => ({
    resetQuiz
  }));

  useEffect(() => {
    // Load previous scores on component mount
    const storedScores = localStorage.getItem('quizScores');
    if (storedScores) {
      setPreviousScores(JSON.parse(storedScores));
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            setQuizCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  useEffect(() => {
    if (quizType) {
      let filteredQuestions: Question[] = [];
      const isVisualMode = quizType.includes('-visual');
      
      // Filter questions based on quiz type
      if (quizType === 'basico' || quizType === 'basico-visual') {
        filteredQuestions = questions.filter(q => q.id <= 10);
      } else if (quizType === 'blanco' || quizType === 'blanco-visual') {
        filteredQuestions = questions.filter(q => q.id <= 18);
      } else if (quizType === 'avanzado' || quizType === 'avanzado-visual') {
        filteredQuestions = questions;
      }
      
      // Convert to image questions if visual mode
      if (isVisualMode) {
        filteredQuestions = generateImageQuestions(filteredQuestions);
      }
      
      // Apply answer mode if needed (only for non-visual quizzes)
      if (!isVisualMode) {
        if (answerMode === 'multipleChoice') {
          filteredQuestions = filteredQuestions.map(q => {
            if (q.type === 'text') {
              const allAnswers = questions.map(q => q.answer.split('|')[0].trim());
              return {
                ...q,
                type: 'multipleChoice',
                options: generateMultipleChoiceOptions(q.answer, allAnswers)
              };
            }
            return q;
          });
        } else if (answerMode === 'text') {
          // If in text mode, convert multiple choice questions to text
          filteredQuestions = filteredQuestions.map(q => {
            if (q.type === 'multipleChoice') {
              return {
                ...q,
                type: 'text'
              };
            }
            return q;
          });
        }
      } else {
        // For visual mode, always use multiple choice
        filteredQuestions = filteredQuestions.map(q => {
          if (q.type === 'image') {
            const allAnswers = questions.map(q => q.answer.split('|')[0].trim());
            return {
              ...q,
              type: 'image',
              options: generateMultipleChoiceOptions(q.answer, allAnswers)
            };
          }
          return q;
        });
      }
      
      const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
      setShuffledQuestions(shuffled);
      
      // Set timer - all quiz types have 10 minutes
      setTimeRemaining(60 * 10);
      
      startTimer();
    }
  }, [quizType, answerMode, startTimer]);

  useEffect(() => {
    if (inputRef.current && !isAnswered && shuffledQuestions[currentQuestionIndex]?.type === 'text') {
      inputRef.current.focus();
    }
  }, [currentQuestionIndex, isAnswered, shuffledQuestions]);

  const handleNextQuestion = useCallback(() => {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    
    // Determinar qué respuesta usar según el tipo de pregunta
    const answerToCheck = (currentQuestion.type === 'multipleChoice' || currentQuestion.type === 'image') ? selectedOption : userAnswer;
    
    // Verificar que hay una respuesta
    if (!answerToCheck.trim()) return;
    
    const isCorrect = isAnswerCorrect(answerToCheck, currentQuestion.answer);
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      // Celebrar respuesta correcta
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      // Guardar ID de pregunta errónea
      setMistakes(prev => [...prev, currentQuestion.id]);
    }
    
    // Avanzar a la siguiente pregunta o mostrar resultados
    if (currentQuestionIndex === shuffledQuestions.length - 1) {
      // Guardar resultado en localStorage
      const newScore = {
        date: new Date().toLocaleDateString(),
        score: isCorrect ? score + 1 : score,
        total: shuffledQuestions.length
      };
      
      const updatedScores = [...previousScores, newScore];
      setPreviousScores(updatedScores);
      localStorage.setItem('quizScores', JSON.stringify(updatedScores));
      
      // Mostrar resultados
      setQuizCompleted(true);
    } else {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOption('');
      setUserAnswer('');
    }
  }, [shuffledQuestions, currentQuestionIndex, selectedOption, userAnswer, score, previousScores]);

  const handleSubmit = () => {
    handleNextQuestion();
  };

  const handleNext = useCallback(() => {
    handleNextQuestion();
  }, [handleNextQuestion]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnswered) {
      timer = setTimeout(() => {
        handleNext();
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [isAnswered, handleNext]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isAnswered) {
      handleSubmit();
    }
  };

  // Global keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip when in input field or quiz completed
      if (document.activeElement?.tagName === 'INPUT' || quizCompleted) return;
      
      if (e.key === '?' && !isAnswered) {
        setHelpModalOpen(true);
      } else if (e.key === 'n' && isAnswered) {
        handleNext();
      } else if (e.key === 'p' && !isAnswered) {
        setIsPaused(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, quizCompleted, handleNext]);

  const handleAnswerSelect = (option: string) => {
    setSelectedOption(option);
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = () => {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    
    return (
      <div className="w-full flex flex-col">
        <div className="flex-1 flex flex-col p-3">
          <div className="border-2 border-foreground p-3 mb-3">
            <p className="font-trajan text-lg md:text-xl">{currentQuestion.text}</p>
          </div>
          
          {currentQuestion.type === 'image' && currentQuestion.imageUrl && (
            <div className="mb-4 flex justify-center items-center border-2 border-foreground p-2 bg-background">
              <div className="relative w-full max-w-md h-auto">
                <Image
                  src={currentQuestion.imageUrl}
                  alt="Palanca"
                  width={600}
                  height={400}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>
          )}
          
          {(currentQuestion.type === 'multipleChoice' || currentQuestion.type === 'image') && currentQuestion.options && (
            <div className="grid-row gap-2">
              {currentQuestion.options.map((option, index) => {
                const optionId = getQuestionIdByAnswer(option);
                const isVisualMode = currentQuestion.type === 'image';
                return (
                  <div key={index} className="grid-col grid-col-12">
                    <button
                      className={`w-full text-left border-2 border-foreground p-2 transition-colors ${
                        selectedOption === option ? 'bg-primary text-primary-foreground' : ''
                      }`}
                      onClick={() => handleAnswerSelect(option)}
                    >
                      <span className="inline-block w-5 h-5 mr-2 leading-5 text-center border-2 align-text-top font-trajan text-xs">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-trajan">
                        {option}
                        {isVisualMode && optionId && (
                          <span className="ml-2 text-sm opacity-70">(Nº {optionId})</span>
                        )}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          
          {currentQuestion.type === 'text' && (
            <div className="w-full mt-2">
              <div className="w-full relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Escribe tu respuesta aquí..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isAnswered}
                  className="w-full p-2 border-2 border-foreground bg-background font-mono outline-none"
                />
              </div>
              <button 
                className="w-full border-2 border-foreground p-2 font-trajan-bold bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                disabled={!userAnswer.trim()}
                onClick={handleNextQuestion}
              >
                <div className="flex items-center justify-center">
                  {currentQuestionIndex === shuffledQuestions.length - 1 ? (
                    <>
                      <ClipboardCheck className="mr-1 h-3 w-3" />
                      Enviar respuesta
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-1 h-3 w-3" />
                      Enviar respuesta
                    </>
                  )}
                </div>
              </button>
            </div>
          )}
        </div>
        
        {(currentQuestion.type === 'multipleChoice' || currentQuestion.type === 'image') && (
          <div className="p-2 border-t-2 border-foreground flex-shrink-0 bg-background sticky bottom-0">
            <button 
              className="w-full border-2 border-foreground p-2 font-trajan-bold bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedOption}
              onClick={handleNextQuestion}
            >
              <div className="flex items-center justify-center">
                {currentQuestionIndex === shuffledQuestions.length - 1 ? (
                  <>
                    <ClipboardCheck className="mr-1 h-3 w-3" />
                    Finalizar
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-1 h-3 w-3" />
                    Siguiente
                  </>
                )}
              </div>
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderFeedback = () => {
    if (!feedback) return null;
    const isCorrect = feedback.startsWith('Correcto');
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 flex items-start space-x-2 p-3 rounded-md bg-opacity-10 w-full max-w-md mx-auto"
        style={{ backgroundColor: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}
      >
        <Circle
          className={`w-4 h-4 mt-1 flex-shrink-0 ${isCorrect ? 'text-green-500' : 'text-red-500'} fill-current`}
        />
        <p className="text-sm font-trajan-regular break-words overflow-hidden whitespace-pre-line" role="alert">
          {feedback}
        </p>
      </motion.div>
    );
  };

  const renderQuizTypeSelector = () => {
    const isVisualMode = quizType?.includes('-visual') || false;
    
    return (
      <div 
        className="h-full flex flex-col items-center justify-center w-full p-4"
      >
        <h2 className="text-xl md:text-2xl font-trajan-black uppercase mb-4 tracking-wide text-center">
          Elige el tipo de cuestionario
        </h2>
        
        <div className="w-full mb-4 border-2 border-foreground p-3">
          <h3 className="text-base font-trajan-bold mb-3 text-center">Modo Texto</h3>
          <div className="grid-row gap-2">
            <div className="grid-col grid-col-12 md:grid-col-4">
              <button 
                onClick={() => setQuizType('basico')}
                className="w-full font-trajan-bold text-center py-3 border-2 border-foreground bg-background hover:bg-secondary"
              >
                Básico (1-10)
              </button>
            </div>
            <div className="grid-col grid-col-12 md:grid-col-4">
              <button 
                onClick={() => setQuizType('blanco')}
                className="w-full font-trajan-bold text-center py-3 border-2 border-foreground bg-background hover:bg-secondary"
              >
                Blanco (1-18)
              </button>
            </div>
            <div className="grid-col grid-col-12 md:grid-col-4">
              <button 
                onClick={() => setQuizType('avanzado')}
                className="w-full font-trajan-bold text-center py-3 border-2 border-foreground bg-background hover:bg-secondary"
              >
                Avanzado (1-32)
              </button>
            </div>
          </div>
        </div>
        
        <div className="w-full mb-4 border-2 border-foreground p-3">
          <h3 className="text-base font-trajan-bold mb-3 text-center">Modo Visual</h3>
          <div className="grid-row gap-2">
            <div className="grid-col grid-col-12 md:grid-col-4">
              <button 
                onClick={() => setQuizType('basico-visual')}
                className="w-full font-trajan-bold text-center py-3 border-2 border-foreground bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Básico Visual (1-10)
              </button>
            </div>
            <div className="grid-col grid-col-12 md:grid-col-4">
              <button 
                onClick={() => setQuizType('blanco-visual')}
                className="w-full font-trajan-bold text-center py-3 border-2 border-foreground bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Blanco Visual (1-18)
              </button>
            </div>
            <div className="grid-col grid-col-12 md:grid-col-4">
              <button 
                onClick={() => setQuizType('avanzado-visual')}
                className="w-full font-trajan-bold text-center py-3 border-2 border-foreground bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Avanzado Visual (1-32)
              </button>
            </div>
          </div>
        </div>
        
        {!isVisualMode && quizType && (
          <div className="w-full mb-4 border-2 border-foreground p-3">
            <h3 className="text-base font-trajan-bold mb-2 text-center">Modo de respuesta</h3>
            
            <div className="grid-row gap-3">
              <div className="grid-col grid-col-6">
                <button 
                  onClick={() => setAnswerMode('multipleChoice')}
                  className={`w-full font-trajan text-center py-2 px-2 border-2 border-foreground ${
                    answerMode === 'multipleChoice' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <span className="inline-block w-4 h-4 mr-2 border-2 flex items-center justify-center">
                      {answerMode === 'multipleChoice' && <span className="w-2 h-2 bg-primary-foreground"></span>}
                    </span>
                    Opción múltiple
                  </div>
                </button>
              </div>
              <div className="grid-col grid-col-6">
                <button 
                  onClick={() => setAnswerMode('text')}
                  className={`w-full font-trajan text-center py-2 px-2 border-2 border-foreground ${
                    answerMode === 'text' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <span className="inline-block w-4 h-4 mr-2 border-2 flex items-center justify-center">
                      {answerMode === 'text' && <span className="w-2 h-2 bg-primary-foreground"></span>}
                    </span>
                    Escribir respuesta
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {isVisualMode && (
          <div className="w-full mb-4 border-2 border-foreground p-3">
            <p className="text-sm font-trajan text-center text-muted-foreground">
              En el modo visual, se mostrarán imágenes de las palancas y deberás identificar su nombre.
            </p>
          </div>
        )}
        
        <Link 
          href="/palancas"
          className="mt-4 w-full border-2 border-foreground p-2 font-trajan-bold bg-background hover:bg-secondary flex items-center justify-center"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Ver listado de palancas
        </Link>
        
        {previousScores.length > 0 && (
          <button 
            className="mt-2 font-trajan flex items-center justify-center group"
            onClick={() => setStatsVisible(!statsVisible)}
          >
            <Award className="mr-2 h-5 w-5 group-hover:text-primary transition-colors" />
            <span className="underline-offset-4 group-hover:underline">
              {statsVisible ? 'Ocultar' : 'Ver'} estadísticas anteriores
            </span>
          </button>
        )}
        
        {statsVisible && (
          <div 
            className="mt-2 w-full max-w-md border-2 border-foreground p-2"
          >
            <h3 className="text-lg font-trajan-bold mb-2 tracking-wide text-center">Resultados Anteriores</h3>
            <div className="space-y-1 max-h-[30vh]">
              {previousScores.slice().reverse().map((result, idx) => (
                <div key={idx} className="flex justify-between font-mono border-b pb-1 text-sm">
                  <span>{result.date}</span>
                  <span className="font-bold">{result.score}/{result.total} ({Math.round(result.score/result.total*100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => (
    <div className="text-center w-full mx-auto h-full">
      <h2 className="text-xl md:text-2xl font-trajan-black uppercase tracking-wide mb-4">¡Cuestionario completado!</h2>
      
      <div className="grid-row">
        <div className="grid-col grid-col-12">
          {score === shuffledQuestions.length ? (
            <div className="border-2 border-foreground p-3 bg-primary mb-3">
              <div className="text-primary-foreground text-4xl md:text-5xl font-trajan-black">100%</div>
              <div className="mt-1 font-trajan text-primary-foreground">¡Puntuación perfecta!</div>
            </div>
          ) : (
            <div className="border-2 border-foreground p-3 mb-3">
              <div className="relative inline-block">
                <svg className="w-24 h-24 md:w-28 md:h-28">
                  <circle
                    className="text-muted stroke-[6]"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-primary stroke-[6]"
                    strokeLinecap="square"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - score / shuffledQuestions.length)}
                  />
                </svg>
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-trajan-bold">
                  {Math.round(score / shuffledQuestions.length * 100)}%
                </span>
              </div>
              
              <p className="text-sm md:text-base font-trajan mt-1">Tu puntuación final es:</p>
              <p className="text-xl md:text-2xl font-trajan-bold">{score}/{shuffledQuestions.length}</p>
            </div>
          )}
        </div>
      </div>
      
      {mistakes.length > 0 && (
        <div className="border-2 border-foreground p-3 mb-3">
          <h3 className="text-base font-trajan-bold tracking-wide text-center border-b pb-1 mb-2">Preguntas incorrectas</h3>
          <div className="text-left max-h-[25vh]">
            {mistakes.map(id => {
              const question = questions.find(q => q.id === id);
              return question ? (
                <div key={id} className="mb-2 pb-1 border-b last:border-0 last:pb-0 last:mb-0">
                  <p className="font-trajan text-sm">{question.text}</p>
                  <p className="text-xs text-muted-foreground font-mono">Respuesta: {question.answer.split('|')[0]}</p>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
      
      <div className="grid-row mt-2">
        <div className="grid-col grid-col-6">
          <button onClick={resetQuiz} className="w-full border-2 border-foreground p-2 font-trajan-bold bg-primary text-primary-foreground">
            <div className="flex items-center justify-center">
              <RotateCcw className="mr-1 h-3 w-3" />
              Reiniciar
            </div>
          </button>
        </div>
        <div className="grid-col grid-col-6">
          <button onClick={() => window.location.reload()} className="w-full border-2 border-foreground p-2 font-trajan-bold">
            <div className="flex items-center justify-center">
              <XCircle className="mr-1 h-3 w-3" />
              Salir
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const helpContent = (
    <div className="space-y-4">
      <p><strong>Modos de respuesta:</strong></p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Opción múltiple:</strong> Selecciona la respuesta correcta entre las opciones presentadas.</li>
        <li><strong>Escribir respuesta:</strong> Escribe manualmente la respuesta correcta.</li>
      </ul>
      
      <p><strong>Controles de teclado:</strong></p>
      <ul className="list-disc pl-5 space-y-1">
        <li><kbd className="px-2 py-1 bg-muted rounded">Enter</kbd> - Enviar respuesta</li>
        <li><kbd className="px-2 py-1 bg-muted rounded">N</kbd> - Siguiente pregunta (después de responder)</li>
        <li><kbd className="px-2 py-1 bg-muted rounded">P</kbd> - Pausar/reanudar el cronómetro</li>
        <li><kbd className="px-2 py-1 bg-muted rounded">?</kbd> - Mostrar/ocultar esta ayuda</li>
      </ul>
      
      <p><strong>Tipos de cuestionario:</strong></p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Básico (1-10):</strong> Incluye solo las primeras 10 preguntas.</li>
        <li><strong>Blanco (1-18):</strong> Incluye las primeras 18 preguntas.</li>
        <li><strong>Avanzado (1-32):</strong> Incluye todas las preguntas del 1 al 32.</li>
        <li><strong>Básico Visual (1-10):</strong> Muestra imágenes de las primeras 10 palancas.</li>
        <li><strong>Blanco Visual (1-18):</strong> Muestra imágenes de las primeras 18 palancas.</li>
        <li><strong>Avanzado Visual (1-32):</strong> Muestra imágenes de todas las palancas.</li>
      </ul>
      <p className="text-sm mt-2">Todos los cuestionarios tienen 10 minutos de duración.</p>
      
      <p className="text-xs text-muted-foreground mt-4">
        Diseñado para la Escuela Loto Blanco Lianhua - Qin-Na
      </p>
    </div>
  );

  if (!quizType) {
    return renderQuizTypeSelector();
  }

  if (shuffledQuestions.length === 0) {
    return <div className="h-full flex items-center justify-center">Cargando preguntas...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-background text-foreground border-0">
      <header className="flex justify-between items-center py-2 px-3 border-b-2 border-foreground flex-shrink-0">
        <div className="flex flex-row items-center space-x-3">
          <MobileMenu resetQuiz={resetQuiz} />
          <div className="flex items-center space-x-2">
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
            <Label htmlFor="dark-mode" className="sr-only">
              Cambiar tema
            </Label>
          </div>
        </div>
        
        {timeRemaining !== null && !quizCompleted && (
          <div className={`flex items-center ${timeRemaining < 60 ? 'text-red-500' : ''}`}>
            <Clock className="h-4 w-4 mr-1" />
            <span className={`font-mono text-sm ${isPaused ? 'opacity-50' : ''}`}>
              {formatTime(timeRemaining as number)}
            </span>
            <button 
              className="ml-1 h-7 w-7 flex items-center justify-center hover:bg-secondary" 
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? '▶' : '⏸'}
            </button>
          </div>
        )}
        
        <button className="h-8 w-8 flex items-center justify-center hover:bg-secondary" onClick={() => setHelpModalOpen(true)}>
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Ayuda</span>
        </button>
      </header>
      
      <Sheet open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="font-trajan-bold uppercase tracking-wide">Ayuda</SheetTitle>
            <SheetDescription>
              {helpContent}
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      
      <div className="flex-1 flex flex-col min-h-0">
        {!quizCompleted ? (
          <div className="flex flex-col h-full min-h-0">
            <div className="border-b-2 border-foreground pb-1 pt-1 flex-shrink-0">
              <div className="flex justify-between items-center px-3">
                <p className="text-xs md:text-sm font-mono">
                  Pregunta {currentQuestionIndex + 1} de {shuffledQuestions.length}
                </p>
                <p className="text-xs md:text-sm font-trajan-bold">
                  Puntuación: {score}/{currentQuestionIndex + (isAnswered ? 1 : 0)}
                </p>
              </div>
              <div className="relative h-2 bg-muted overflow-hidden w-full mt-1">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary transition-all" 
                  style={{ width: `${(currentQuestionIndex + (isAnswered ? 1 : 0)) / shuffledQuestions.length * 100}%` }} 
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {renderQuestion()}
              {renderFeedback()}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0 p-2">
            {renderResults()}
          </div>
        )}
      </div>
    </div>
  )
});

EnhancedQuizApp.displayName = 'EnhancedQuizApp';

export default EnhancedQuizApp;