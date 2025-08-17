"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, RotateCcw, Mail, Calendar, Award, History } from "lucide-react"
import type { UserData, UserAnswer, QuestionData } from "@/app/page"

// Updated interface to match database schema
interface CompletionRecord {
  id: number
  name: string
  company: string
  host_name: string
  phone?: string
  score: number
  passed: boolean // Changed from 'pass' to 'passed'
  completed_at: string
}

interface ResultsProps {
  userData: UserData
  answers: UserAnswer[]
  questions: QuestionData[]
  onRestart: () => void
  onRetakeTraining: () => void
  existingResults?: {
    latestCompletion: CompletionRecord
    allCompletions: CompletionRecord[]
  } | null
}

export default function Results({ userData, answers, questions, onRestart, onRetakeTraining, existingResults }: ResultsProps) {
  // If we have existing results, use those. Otherwise, calculate from current answers
  const isExistingResults = !!existingResults
  
  let correctAnswers: number
  let totalQuestions: number
  let passed: boolean
  let completionDate: string
  let allAttempts: CompletionRecord[] = []

  if (isExistingResults && existingResults) {
    // Use database results
    const latestCompletion = existingResults.latestCompletion
    correctAnswers = latestCompletion.score
    totalQuestions = 6 // Assuming 6 questions based on your question array
    passed = latestCompletion.passed // Changed from 'pass' to 'passed'
    completionDate = latestCompletion.completed_at
    allAttempts = existingResults.allCompletions
  } else {
    // Use current attempt results
    correctAnswers = answers.filter((answer) => answer.isCorrect).length
    totalQuestions = questions.length
    passed = correctAnswers === totalQuestions
    completionDate = new Date().toISOString()
  }

  const percentage = Math.round((correctAnswers / totalQuestions) * 100)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays < 1) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="p-4 sm:p-6 lg:p-8 bg-white shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center ${
              passed ? "bg-emerald-100" : "bg-red-100"
            }`}
          >
            {passed ? (
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-emerald-600" />
            ) : (
              <XCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-600" />
            )}
          </div>

          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 ${passed ? "text-emerald-600" : "text-red-600"}`}>
            {isExistingResults ? "Training Records Found" : (passed ? "Congratulations!" : "Assessment Not Passed")}
          </h2>

          <p className="text-lg text-gray-600 mb-2">
            {isExistingResults 
              ? `Your most recent assessment was completed ${getTimeAgo(completionDate)}`
              : (passed
                ? "You have successfully completed the safety training assessment."
                : "You did not meet the passing requirements for this assessment.")
            }
          </p>

          <div className="text-2xl font-bold text-gray-800 mb-2">
            {correctAnswers} / {totalQuestions} ({percentage}%)
          </div>

          {isExistingResults && (
            <p className="text-sm text-gray-500">
              Completed on {formatDate(completionDate)}
            </p>
          )}
        </div>

        {/* User Information */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Assessment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Name:</span>
              <span className="ml-2 text-gray-800">{userData.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Company/Role:</span>
              <span className="ml-2 text-gray-800">{userData.company}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Phone:</span>
              <span className="ml-2 text-gray-800">{userData.phone}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Host:</span>
              <span className="ml-2 text-gray-800">{userData.hostName}</span>
            </div>
          </div>
        </div>

        {/* Training History (if existing results) */}
        {isExistingResults && allAttempts.length > 1 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              All Training Attempts ({allAttempts.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {allAttempts.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className={`p-4 rounded-lg border-2 ${
                    attempt.passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          attempt.passed ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        {attempt.passed ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <XCircle className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${
                            attempt.passed ? "text-green-700" : "text-red-700"
                          }`}>
                            {attempt.passed ? "PASSED" : "FAILED"}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-gray-600">Score: {attempt.score}/6</span>
                          {index === 0 && (
                            <>
                              <span className="text-gray-500">•</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Most Recent</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Host: {attempt.host_name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-800">
                        {getTimeAgo(attempt.completed_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(attempt.completed_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Results (only for new attempts) */}
        {!isExistingResults && questions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Results</h3>
            <div className="space-y-4">
              {questions.map((question, index) => {
                const userAnswer = answers[index]
                const isCorrect = userAnswer.isCorrect

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          isCorrect ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <XCircle className="w-4 h-4 text-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-2">
                          Question {index + 1}: {question.question}
                        </h4>

                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium text-gray-600">Your answer:</span>
                            <span className={`ml-2 ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                              {question.options[userAnswer.selectedAnswer]}
                            </span>
                          </div>

                          {!isCorrect && (
                            <div>
                              <span className="font-medium text-gray-600">Correct answer:</span>
                              <span className="ml-2 text-green-700">{question.options[question.correctAnswer]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Certification Status */}
        {isExistingResults && existingResults && (
          <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-6 h-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-amber-800">Certification Status</h3>
            </div>
            
            {passed ? (
              <div>
                <p className="text-amber-700 mb-2">
                  <strong>✅ Certified:</strong> Your safety training certification is valid.
                </p>
                <p className="text-sm text-amber-600">
                  Training completed: {formatDate(completionDate)}
                </p>
                <p className="text-sm text-amber-600">
                  Certification expires: {formatDate(
                    new Date(new Date(completionDate).setMonth(new Date(completionDate).getMonth() + 6)).toISOString()
                  )}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-red-700 mb-2">
                  <strong>❌ Not Certified:</strong> Your last attempt did not meet the passing requirements.
                </p>
                <p className="text-sm text-red-600">
                  You need to retake the assessment to become certified.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Email Notification */}
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-800">Email Notification</span>
          </div>
          <p className="text-sm text-amber-700">
            {isExistingResults 
              ? `Your training records have been reviewed. Host: ${userData.hostName}`
              : `Your assessment results have been automatically sent to ${userData.hostName} via email.`
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button onClick={onRestart} variant="outline" className="flex items-center gap-2 bg-transparent text-sm sm:text-base py-2 sm:py-2.5">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isExistingResults ? "Check Another Name" : "Start Over"}
            </span>
            <span className="sm:hidden">
              {isExistingResults ? "Check Another Name" : "Start Over"}
            </span>
          </Button>

          {(!passed || !isExistingResults) && (
            <Button onClick={onRetakeTraining} className="bg-emerald-600 hover:bg-emerald-700 text-sm sm:text-base py-2 sm:py-2.5">
              <span className="hidden sm:inline">
                {isExistingResults ? "Retake Assessment" : "Take Assessment Again"}
              </span>
              <span className="sm:hidden">
                {isExistingResults ? "Retake Assessment" : "Retake"}
              </span>
            </Button>
          )}

          {isExistingResults && passed && (
            <Button onClick={onRetakeTraining} variant="outline" className="flex items-center gap-2 text-sm sm:text-base py-2 sm:py-2.5">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Retake Assessment (Optional)</span>
              <span className="sm:hidden">Retake (Optional)</span>
            </Button>
          )}
        </div>

        {/* Training Validity Info */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-800 font-medium mb-1">Training Validity</p>
            <p className="text-xs text-gray-600">
              Safety training certifications are valid for 6 months from the date of successful completion.
              {isExistingResults && passed && existingResults && (
                <span className="block mt-1">
                  Your certification is valid until{" "}
                  <span className="font-medium">
                    {new Date(
                      new Date(existingResults.latestCompletion.completed_at).setMonth(
                        new Date(existingResults.latestCompletion.completed_at).getMonth() + 6
                      )
                    ).toLocaleDateString()}
                  </span>
                </span>
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}