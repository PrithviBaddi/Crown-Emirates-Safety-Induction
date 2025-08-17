"use client"

import { useState } from "react"
import VideoSection from "@/components/video-section"
import NameCheck, { type CompletionRecord } from "@/components/name-check"
import UserForm from "@/components/user-form"
import Questionnaire from "@/components/questionnaire"
import Results from "@/components/results"
import Image from "next/image"

export type UserData = {
  name: string
  company: string
  phone: string
  hostName: string
}

export type QuestionData = {
  question: string
  options: string[]
  correctAnswer: number
}

export type UserAnswer = {
  questionIndex: number
  selectedAnswer: number
  isCorrect: boolean
}

const questions: QuestionData[] = [
  {
    question: "What is the site speed limit?",
    options: [
      "10 km/h",
      "20 km/h",
      "15 km/h",
    ],
    correctAnswer: 2,
  },
  {
    question: "Smoking is permitted inside the production area",
    options: [
      "True",
      "False",
    ],
    correctAnswer: 0,
  },
  {
    question: "Assembly area is located near to gate #1",
    options: [
      "True",
      "False",
    ],
    correctAnswer: 1,
  },
  {
    question: "Visitor badge must be kept visible at all times",
    options: [
      "True",
      "False",
    ],
    correctAnswer: 0,
  },
  {
    question: "Wearing a watch inside the plant and intervention with moving machinery are permitted.",
    options: [
      "True",
      "False",
    ],
    correctAnswer: 1,
  },
  {
    question: "When entering a high care area, you must:",
    options: [
      "Sanitize your hands",
      "Wear hair net",
      "Both",
      "None of the above",
    ],
    correctAnswer: 2,
  },
]

export default function TrainingApp() {
  const [currentStep, setCurrentStep] = useState<"nameCheck" | "video" | "form" | "quiz" | "results">("nameCheck")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [existingResults, setExistingResults] = useState<{
    latestCompletion: CompletionRecord
    allCompletions: CompletionRecord[]
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle when user has existing results (recent completion found)
  const handleShowResults = (data: { name: string; latestCompletion: CompletionRecord; allCompletions: CompletionRecord[] }) => {
    console.log("📊 Showing existing results for:", data.name)
    
    // Set the user data based on their latest completion
    const latestCompletion = data.latestCompletion
    setUserData({
      name: latestCompletion.name,
      company: latestCompletion.company,
      phone: latestCompletion.phone || '',
      hostName: latestCompletion.host_name
    })
    
    // Store the existing results
    setExistingResults({
      latestCompletion: data.latestCompletion,
      allCompletions: data.allCompletions
    })
    
    // Go directly to results page
    setCurrentStep("results")
  }

  // Handle when user needs to start new training (no name found or no recent completion)
  const handleStartNewTraining = () => {
    console.log("📹 Starting new training - no recent completion found")
    setExistingResults(null) // Clear any existing results
    setCurrentStep("video")
  }

  const handleVideoComplete = () => {
    setCurrentStep("form")
  }

  const handleFormSubmit = (data: UserData) => {
    setUserData(data)
    setCurrentStep("quiz")
  }

  const handleQuizComplete = async (answers: UserAnswer[]) => {
    if (!userData) {
      console.error("User data is missing, cannot submit results");
      alert("Error: User data is missing. Please restart the training.");
      return;
    }

    // Prevent double submissions
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring duplicate request");
      return;
    }

    setUserAnswers(answers);
    setIsLoading(true);
    setIsSubmitting(true);
    setSubmissionError(null);
    setExistingResults(null); // Clear existing results since this is a new attempt

    const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
    const passed = correctAnswers === questions.length;

    console.log("🎯 Starting submission:", {
      userData: userData,
      answersCount: answers.length,
      correctAnswers,
      passed,
      score: correctAnswers
    });

    try {
      console.log("📤 Making API request to /api/submit-results");
      
      const response = await fetch("/api/submit-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userData,
          answers,
          questions,
          passed,
          score: correctAnswers,
        }),
      });

      console.log("📡 Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        
        // Handle different error types
        if (response.status === 405) {
          errorMessage = "API route not found or method not allowed. Check your API setup.";
        } else if (response.status === 404) {
          errorMessage = "API endpoint not found. Check your file structure.";
        } else {
          // Try to read error details - but only read the response ONCE
          try {
            const errorData = await response.json(); // Try JSON first
            errorMessage = errorData.details || errorData.error || errorMessage;
          } catch (jsonError) {
            // If JSON parsing fails, try text (but clone the response first if needed)
            try {
              const responseClone = response.clone();
              const responseText = await responseClone.text();
              errorMessage = responseText || errorMessage;
            } catch (textError) {
              console.error("Failed to read error response:", textError);
            }
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("✅ Submission successful:", result);
      
      // Success! Show results page
      setCurrentStep("results");

    } catch (error: any) {
      console.error("❌ Submission error:", error);
      
      let userMessage = "Failed to submit results. ";
      
      if (error.message.includes('fetch failed') || error.message.includes('Failed to fetch')) {
        userMessage += "Please check your internet connection and try again.";
      } else if (error.message.includes('500')) {
        userMessage += "Server error. Please contact support if this persists.";
      } else {
        userMessage += error.message || "Unknown error occurred.";
      }
      
      setSubmissionError(userMessage);
      
      // Still show results page but with error message
      setCurrentStep("results");
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep("nameCheck")
    setUserData(null)
    setUserAnswers([])
    setSubmissionError(null)
    setExistingResults(null)
    setIsSubmitting(false)
  }

  const handleRetakeTraining = () => {
    setCurrentStep("video")
    setUserAnswers([])
    setSubmissionError(null)
    setIsSubmitting(false)
  }

  const handleRetrySubmission = () => {
    if (userAnswers.length > 0 && !isSubmitting) {
      handleQuizComplete(userAnswers);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Submitting your results...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait, this may take a moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Logo */}
      <header className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 flex justify-between items-center bg-white shadow-sm">
        <div className="flex-1" />
        <div className="flex-shrink-0">
          <img
            src="107338.webp"
            alt="Company Logo"
            width={120}
            height={50}
            className="h-8 sm:h-10 lg:h-12 w-auto"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {currentStep === "nameCheck" && (
          <NameCheck 
            onProceedToVideo={handleStartNewTraining} 
            onShowResults={handleShowResults}
          />
        )}

        {currentStep === "video" && <VideoSection onComplete={handleVideoComplete} />}

        {currentStep === "form" && <UserForm onSubmit={handleFormSubmit} />}

        {currentStep === "quiz" && <Questionnaire questions={questions} onComplete={handleQuizComplete} />}

        {currentStep === "results" && (
          <>
            {submissionError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Submission Error</h3>
                    <p className="mt-1 text-sm text-red-700">{submissionError}</p>
                    <div className="mt-3">
                      <button
                        onClick={handleRetrySubmission}
                        disabled={isSubmitting}
                        className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Retrying...' : 'Retry Submission'}
                      </button>
                      <button
                        onClick={handleRestart}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400 transition-colors"
                      >
                        Start Over
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Results 
              userData={userData!} 
              answers={userAnswers} 
              questions={questions} 
              onRestart={handleRestart}
              onRetakeTraining={handleRetakeTraining}
              existingResults={existingResults} // Pass existing results if they exist
            />
          </>
        )}
      </main>
    </div>
  )
}