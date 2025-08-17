"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import type { UserData } from "@/app/page"

function stripHTML(input: string): string {
  return input.replace(/<\/?[^>]+(>|$)/g, "").trim()
}



interface UserFormProps {
  onSubmit: (data: UserData) => void
}

export default function UserForm({ onSubmit }: UserFormProps) {
  const [formData, setFormData] = useState<UserData>({
    name: "",
    company: "",
    phone: "",
    hostName: "",
  })

  const [errors, setErrors] = useState<Partial<UserData>>({})

  const validateForm = () => {
    const newErrors: Partial<UserData> = {}

    const nameRegex = /^[a-zA-Z\s]{2,}$/ // letters and spaces, at least 2 chars
    const companyRegex = /^[a-zA-Z\s]{2,}$/ // letters and spaces, at least 2 chars
    const phoneRegex = /^\d{10}$/ // exactly 10 digits

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (!nameRegex.test(formData.name.trim())) {
      newErrors.name = "Enter a valid full name (letters only)"
    }


    if (!formData.company.trim()) {
      newErrors.company = "Company name is required"
    } else if (!companyRegex.test(formData.company.trim())) {
      newErrors.company = "Enter a valid full company name (letters only)"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be 10 digits"
    }

    if (!formData.hostName.trim()) {
      newErrors.hostName = "Host name is required"
    } else if (formData.hostName.trim().length < 2) {
      newErrors.hostName = "Host name is too short"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const sanitizedData: UserData = {
        name: stripHTML(formData.name),
        company: stripHTML(formData.company),
        phone: stripHTML(formData.phone),
        hostName: stripHTML(formData.hostName),
      }
      onSubmit(sanitizedData)
    }
  }


  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="p-4 sm:p-6 lg:p-8 bg-white shadow-lg">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Your Information</h2>
          <p className="text-sm sm:text-base text-gray-600">Please provide your details before starting the assessment.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium text-gray-700">
              Company *
            </Label>
            <Input
              id="company"
              type="text"
              placeholder="Enter your company name"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              className={errors.company ? "border-red-500" : ""}
            />
            {errors.company && <p className="text-sm text-red-600">{errors.company}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostName" className="text-sm font-medium text-gray-700">
              Host Name *
            </Label>
            <Input
              id="hostName"
              type="text"
              placeholder="Enter your host's name"
              value={formData.hostName}
              onChange={(e) => handleInputChange("hostName", e.target.value)}
              className={errors.hostName ? "border-red-500" : ""}
            />
            {errors.hostName && <p className="text-sm text-red-600">{errors.hostName}</p>}
            <p className="text-xs text-gray-500">The person who will receive your assessment results</p>
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 sm:py-3 text-base sm:text-lg font-medium">
            Start Assessment
          </Button>
        </form>
      </Card>
    </div>
  )
}
