"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Search, Loader2 } from "lucide-react"

interface NameCheckProps {
  onProceedToVideo: () => void
  onShowResults: (userData: { name: string; latestCompletion: CompletionRecord; allCompletions: CompletionRecord[] }) => void
}

export interface CompletionRecord {
  id: number
  name: string
  company: string
  host_name: string
  phone?: string
  score: number
  passed: boolean // Changed from 'pass' to 'passed' to match database
  completed_at: string
  answers?: any[] // Store the user's answers if available
  questions?: any[] // Store the questions if available
}

export default function NameCheck({ onProceedToVideo, onShowResults }: NameCheckProps) {
  const [name, setName] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stripHTML = (input: string): string => {
    return input.replace(/<\/?[^>]+(>|$)/g, "").trim()
  }

  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s]{2,}$/ // letters and spaces, at least 2 chars
    return nameRegex.test(name.trim())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const sanitizedName = stripHTML(name)
    
    if (!sanitizedName.trim()) {
      setError("Please enter your full name")
      return
    }

    if (!validateName(sanitizedName)) {
      setError("Please enter a valid full name (letters and spaces only)")
      return
    }

    setIsChecking(true)

    try {
      console.log("🔍 Checking for existing records for:", sanitizedName)
      
      const response = await fetch('/api/check-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: sanitizedName }),
      })

      console.log("📡 Check response status:", response.status)

      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`
        
        // Clone the response so we can try different parsing methods
        const responseClone = response.clone()
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.details || errorData.error || errorMessage
        } catch (jsonError) {
          // If JSON parsing fails, try text on the cloned response
          try {
            const errorText = await responseClone.text()
            errorMessage = errorText || errorMessage
          } catch (textError) {
            console.error("Failed to read error response:", textError)
            // Keep the default error message
          }
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("✅ Check result:", result)

      if (result.hasCompletions && result.completions.length > 0) {
        // Sort completions by date (most recent first)
        const sortedCompletions = result.completions.sort((a: CompletionRecord, b: CompletionRecord) => {
          return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
        })

        // Check if there's a recent completion (within 6 months)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        
        const recentCompletion = sortedCompletions.find((completion: CompletionRecord) => {
          const completedDate = new Date(completion.completed_at)
          return completedDate >= sixMonthsAgo // Use 'passed' instead of 'pass'
        })

        if (recentCompletion) {
          // Show results page with their latest completion
          onShowResults({ 
            name: sanitizedName, 
            latestCompletion: recentCompletion, 
            allCompletions: sortedCompletions 
          })
        } else {
          // No recent completion - proceed to video
          console.log("📅 No recent completion found, proceeding to video")
          onProceedToVideo()
        }
      } else {
        // No previous completions - proceed to video
        console.log("📝 No previous completions found, proceeding to video")
        onProceedToVideo()
      }

    } catch (error: any) {
      console.error("❌ Error checking name:", error)
      setError(error.message || "Failed to check records. Please try again.")
    } finally {
      setIsChecking(false)
    }
  }

  const handleInputChange = (value: string) => {
    setName(value)
    if (error) {
      setError(null)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="p-4 sm:p-6 lg:p-8 bg-white shadow-lg">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
            <Search className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Safety Training Check</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Enter your name to check your training status and view previous results.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Full Name *
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name as it appears in records"
              value={name}
              onChange={(e) => handleInputChange(e.target.value)}
              className={error ? "border-red-500" : ""}
              disabled={isChecking}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <p className="text-xs text-gray-500">
              This will be used to check your training history and display your results.
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isChecking || !name.trim()} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 sm:py-3 text-base sm:text-lg font-medium disabled:opacity-50"
          >
            {isChecking ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking Records...
              </div>
            ) : (
              "Check Training Status"
            )}
          </Button>
        </form>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-amber-800 font-medium mb-1">What happens next?</p>
            <p className="text-xs text-amber-700">
              • If you have recent training records, you'll see your results and history<br/>
              • If you haven't completed training recently, you'll start the assessment process
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}