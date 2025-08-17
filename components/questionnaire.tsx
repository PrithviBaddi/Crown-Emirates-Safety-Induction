"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle } from "lucide-react"
import type { QuestionData, UserAnswer } from "@/app/page"

interface QuestionnaireProps {
  questions: QuestionData[]
  onComplete: (answers: UserAnswer[]) => void
}

export default function Questionnaire({ questions, onComplete }: QuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [showFeedback, setShowFeedback] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleConfirm = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    const answer: UserAnswer = {
      questionIndex: currentQuestionIndex,
      selectedAnswer,
      isCorrect,
    }

    const newAnswers = [...userAnswers, answer]
    setUserAnswers(newAnswers)
    setShowFeedback(true)

    // Show feedback for 2 seconds, then move to next question or complete
    setTimeout(() => {
      setShowFeedback(false)
      setSelectedAnswer(null)

      if (isLastQuestion) {
        onComplete(newAnswers)
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }
    }, 2000)
  }

  if (showFeedback) {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Card className="p-4 sm:p-6 lg:p-8 bg-white shadow-lg">
          <div className="text-center">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center ${
                isCorrect ? "bg-emerald-100" : "bg-red-100"
              }`}
            >
              {isCorrect ? (
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
              ) : (
                <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
              )}
            </div>

            <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isCorrect ? "text-emerald-600" : "text-red-600"}`}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </h3>

            {!isCorrect && (
              <div className="mb-4">
                <p className="text-gray-600 mb-2">The correct answer was:</p>
                <p className="font-semibold text-gray-800">{currentQuestion.options[currentQuestion.correctAnswer]}</p>
              </div>
            )}

            <p className="text-gray-600">
              {isLastQuestion ? "Completing assessment..." : "Moving to next question..."}
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="p-4 sm:p-6 lg:p-8 bg-white shadow-lg">
        {/* Progress Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Safety Assessment</h2>
            <span className="text-xs sm:text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
            <div
              className="bg-emerald-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 leading-relaxed">
            {currentQuestion.question}
          </h3>

          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
            className="space-y-3 sm:space-y-4"
          >
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50 ${
                  selectedAnswer === index ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
                }`}
                onClick={() => handleAnswerSelect(index)}
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1" />
                <Label htmlFor={`option-${index}`} className="flex-1 text-sm sm:text-base text-gray-700 cursor-pointer leading-relaxed">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Confirm Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleConfirm}
            disabled={selectedAnswer === null}
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base sm:text-lg"
          >
            {isLastQuestion ? "Complete Assessment" : "Confirm Answer"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
