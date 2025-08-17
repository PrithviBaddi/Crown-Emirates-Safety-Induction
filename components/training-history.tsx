"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, Calendar, Award, RotateCcw, ArrowLeft } from "lucide-react"

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

interface TrainingHistoryProps {
  userData: {
    name: string
    completions: CompletionRecord[]
  }
  onRetakeTraining: () => void
  onGoBack: () => void
}

export default function TrainingHistory({ userData, onRetakeTraining, onGoBack }: TrainingHistoryProps) {
  const { name, completions } = userData
  const passedCount = completions.filter(completion => completion.passed).length // Changed from 'pass' to 'passed'
  const failedCount = completions.filter(completion => completion.passed === false).length // Changed from 'pass' to 'passed'
  const totalAttempts = completions.length

  // Check for recent valid completion (within 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  
  const recentValidCompletion = completions
    .filter(completion => completion.passed === true) // Changed from 'pass' to 'passed'
    .find(completion => {
      const completedDate = new Date(completion.completed_at)
      return completedDate >= sixMonthsAgo
    })

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
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 md:p-8 bg-white shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
            recentValidCompletion ? "bg-green-100" : "bg-orange-100"
          }`}>
            {recentValidCompletion ? (
              <Award className="w-12 h-12 text-green-600" />
            ) : (
              <Calendar className="w-12 h-12 text-orange-600" />
            )}
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Welcome back, {name}!
          </h2>

          {recentValidCompletion ? (
            <div className="text-center">
              <p className="text-lg text-green-600 font-semibold mb-2">
                ✅ Training Up to Date
              </p>
              <p className="text-gray-600 mb-2">
                You successfully completed the safety training on{" "}
                <span className="font-medium">
                  {formatDate(recentValidCompletion.completed_at)}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Your training is valid and you don't need to retake it at this time.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg text-orange-600 font-semibold mb-2">
                🔄 Training Update Required
              </p>
              <p className="text-gray-600 mb-2">
                Your last successful training was more than 6 months ago, or you haven't passed yet.
              </p>
              <p className="text-sm text-gray-500">
                Please complete the training again to stay compliant.
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-800 mb-1">{totalAttempts}</div>
            <div className="text-sm text-gray-600">Total Attempts</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{passedCount}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{failedCount}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>

        {/* Training History */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Training History</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {completions
              .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
              .map((completion, index) => (
                <div
                  key={completion.id}
                  className={`p-4 rounded-lg border-2 ${
                    completion.passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          completion.passed ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        {completion.passed ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <XCircle className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${
                            completion.passed ? "text-green-700" : "text-red-700"
                          }`}>
                            {completion.passed ? "PASSED" : "FAILED"}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-gray-600">Score: {completion.score}/6</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Company: {completion.company} • Host: {completion.host_name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-800">
                        {getTimeAgo(completion.completed_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(completion.completed_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onGoBack} 
            variant="outline" 
            className="flex items-center gap-2 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            Check Different Name
          </Button>

          {!recentValidCompletion && (
            <Button 
              onClick={onRetakeTraining} 
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Start Training
            </Button>
          )}

          {recentValidCompletion && (
            <Button 
              onClick={onRetakeTraining} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Training (Optional)
            </Button>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-blue-800 font-medium mb-1">Training Validity</p>
            <p className="text-xs text-blue-700">
              Safety training certifications are valid for 6 months from the date of successful completion.
              {recentValidCompletion && (
                <span className="block mt-1 font-medium">
                  Your current certification expires on{" "}
                  {new Date(new Date(recentValidCompletion.completed_at).setMonth(
                    new Date(recentValidCompletion.completed_at).getMonth() + 6
                  )).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}