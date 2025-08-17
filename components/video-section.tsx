"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

interface VideoSectionProps {
  onComplete: () => void
}

const videoSections = [
  {
    title: "Introduction to Workplace Safety",
    videoFile: "/videos/2025-08-14 10-44-26.mov",
    imgFile: "/img/safety-img-1.png",
    description: "Learn the fundamentals of workplace safety",
    estimatedDuration: 11,
  },
  {
    title: "Personal Protective Equipment",
    videoFile: "/videos/safety-2.mov",
    imgFile: "/img/safety-img-2.png",
    description: "Proper use and maintenance of PPE",
    estimatedDuration: 45,
  },
  {
    title: "Emergency Procedures",
    videoFile: "/videos/safety-3.mov",
    imgFile: "/img/safety-img-3.png",
    description: "What to do in case of workplace emergencies",
    estimatedDuration: 41,
  },
  {
    title: "Hazard Identification",
    videoFile: "/videos/safety-4.mov",
    imgFile: "/img/safety-img-4.png",
    description: "How to identify and report workplace hazards",
    estimatedDuration: 24,
  },
  {
    title: "Safe Work Practices",
    videoFile: "/videos/safety-5.mov",
    imgFile: "/img/safety-img-5.png",
    description: "Daily practices for maintaining safety",
    estimatedDuration: 27,
  },
  {
    title: "Chemical Safety",
    videoFile: "/videos/safety-6.mov",
    imgFile: "/img/safety-img-6.png",
    description: "Handling and storage of hazardous materials",
    estimatedDuration: 36,
  },
  {
    title: "Equipment Operation",
    videoFile: "/videos/safety-7.mov",
    imgFile: "/img/safety-img-7.png",
    description: "Safe operation of workplace equipment",
    estimatedDuration: 20,
  },
  {
    title: "Safety Compliance",
    videoFile: "/videos/safety-8.mov",
    imgFile: "/img/safety-img-8.png",
    description: "Understanding safety regulations and compliance",
    estimatedDuration: 17,
  },
]

export default function VideoSection({ onComplete }: VideoSectionProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [sectionDuration, setSectionDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const volumeContainerRef = useRef<HTMLDivElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  // Calculate total duration from estimated durations
  const totalDuration = videoSections.reduce((sum, section) => sum + section.estimatedDuration, 0)

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Get progress for individual section (0-100%)
  const getSectionProgress = (sectionIndex: number) => {
    if (sectionIndex < currentSection) {
      return 100 // Completed sections
    } else if (sectionIndex === currentSection && sectionDuration > 0) {
      return Math.min((currentTime / sectionDuration) * 100, 100) // Current section
    }
    return 0 // Future sections
  }

  // Get width for each section based on duration
  const getSectionWidth = (sectionIndex: number) => {
    return (videoSections[sectionIndex].estimatedDuration / totalDuration) * 100
  }

  // Get current overall time
  const getCurrentOverallTime = () => {
    const completedTime = videoSections
      .slice(0, currentSection)
      .reduce((sum, section) => sum + section.estimatedDuration, 0)
    return completedTime + currentTime
  }

  // Calculate overall completion percentage
  const getOverallCompletionPercentage = () => {
    let totalProgress = 0
    for (let i = 0; i < videoSections.length; i++) {
      totalProgress += getSectionProgress(i)
    }
    return Math.round(totalProgress / videoSections.length)
  }

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setSectionDuration(videoRef.current.duration)
      setIsLoading(false)
    }
  }

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  // Handle video ended
  const handleVideoEnded = () => {
    setIsPlaying(false)
    console.log(`Section ${currentSection + 1} completed. Progress: ${getOverallCompletionPercentage()}%`)
  }

  // Reset video when section changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
      setIsLoading(true)
      setCurrentTime(0)
      videoRef.current.load()
      
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [currentSection])

  // Update volume when changed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleNext = () => {
    if (currentSection < videoSections.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      onComplete()
    }
  }

  const togglePlay = () => {
    if (videoRef.current && !isLoading) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch(error => {
            console.error("Error playing video:", error)
          })
      }
    }
  }

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      setCurrentTime(0)
      if (!isPlaying) {
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch(error => {
            console.error("Error replaying video:", error)
          })
      }
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Handle clicking on progress bar to seek
  const handleProgressBarClick = (event: React.MouseEvent, sectionIndex: number) => {
    event.stopPropagation()
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const barWidth = rect.width
    const clickPercentage = Math.max(0, Math.min(1, clickX / barWidth))
    
    // If clicking on a different section, switch to it
    if (sectionIndex !== currentSection) {
      setCurrentSection(sectionIndex)
      // After switching sections, we'll seek to the clicked position
      setTimeout(() => {
        if (videoRef.current) {
          const targetTime = clickPercentage * (sectionDuration || videoSections[sectionIndex].estimatedDuration)
          videoRef.current.currentTime = targetTime
          setCurrentTime(targetTime)
        }
      }, 100)
    } else {
      // Same section - just seek within current video
      if (videoRef.current && sectionDuration > 0) {
        const targetTime = clickPercentage * sectionDuration
        videoRef.current.currentTime = targetTime
        setCurrentTime(targetTime)
      }
    }
  }

  // Handle progress bar hover for preview
  const [hoverProgress, setHoverProgress] = useState<{sectionIndex: number, percentage: number} | null>(null)

  const handleProgressBarHover = (event: React.MouseEvent, sectionIndex: number) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const hoverX = event.clientX - rect.left
    const barWidth = rect.width
    const hoverPercentage = Math.max(0, Math.min(1, hoverX / barWidth))
    
    setHoverProgress({ sectionIndex, percentage: hoverPercentage })
  }

  const handleProgressBarLeave = () => {
    setHoverProgress(null)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    if (isMuted) setIsMuted(false)
  }

  // Handle clicking outside volume container to close slider
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeContainerRef.current && !volumeContainerRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false)
      }
    }

    if (showVolumeSlider) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showVolumeSlider])

  // Handle fullscreen functionality
  const toggleFullscreen = async () => {
    if (!videoContainerRef.current) return

    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (videoContainerRef.current.requestFullscreen) {
          await videoContainerRef.current.requestFullscreen()
        } else if ((videoContainerRef.current as any).webkitRequestFullscreen) {
          await (videoContainerRef.current as any).webkitRequestFullscreen()
        } else if ((videoContainerRef.current as any).mozRequestFullScreen) {
          await (videoContainerRef.current as any).mozRequestFullScreen()
        } else if ((videoContainerRef.current as any).msRequestFullscreen) {
          await (videoContainerRef.current as any).msRequestFullscreen()
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  return (
              <div className="w-full max-w-4xl mx-auto">
      <Card className="p-0 sm:p-4 lg:p-6 bg-white shadow-lg border border-slate-200 mb-0">
        

        {/* Video Player */}
        <div 
          ref={videoContainerRef}
          className={`relative bg-black overflow-hidden mb-0 w-full ${
            isFullscreen 
              ? 'fixed inset-0 z-50 rounded-none' 
              : 'rounded-lg aspect-video'
          }`}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Background Image Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={videoSections[currentSection].imgFile}
              alt={videoSections[currentSection].title}
              className={`w-full h-full ${
                isFullscreen ? 'object-contain' : 'object-cover'
              }`}
            />
          </div>
          
          {/* Audio Player (hidden but functional) */}
          <video
            key={`video-${currentSection}`}
            ref={videoRef}
            className="w-full h-full opacity-0"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            preload="metadata"
            controls={false}
            playsInline
          >
            <source src={videoSections[currentSection].videoFile} type="video/quicktime" />
            <source src={videoSections[currentSection].videoFile} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          

          {/* Clickable Overlay for Play/Pause */}
          <div 
            className="absolute inset-0 cursor-pointer z-10"
            onClick={togglePlay}
          >
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                <div className="text-white text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Loading video...</p>
                </div>
              </div>
            )}

            {/* Play/Pause Button */}
            {!isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-emerald-600 bg-opacity-90 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-emerald-700 hover:bg-opacity-100 hover:scale-110 ${
                  isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
                }`}>
                  {isPlaying ? (
                    <Pause className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  ) : (
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white ml-1" />
                  )}
                </div>
              </div>
            )}

            {/* Fullscreen Center Navigation (for mobile) */}
            {isFullscreen && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-between px-4 z-15 pointer-events-none">
                {/* Left Navigation Area */}
                <div className="w-16 h-16 flex items-center justify-center pointer-events-auto">
                  {currentSection > 0 && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePrevious()
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </Button>
                  )}
                </div>

                {/* Right Navigation Area */}
                <div className="w-16 h-16 flex items-center justify-center pointer-events-auto">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNext()
                    }}
                    variant="ghost"
                    size="sm"
                    className="w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controls Overlay */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3 lg:p-4 z-20 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            
                        {/* Time Display */}
            <div className="flex justify-between items-center text-white text-xs sm:text-sm mb-2">
              <span>{formatTime(getCurrentOverallTime())}</span>
              <span className="text-white-400">Total: {formatTime(totalDuration)}</span>
            </div>

            {/* 8 Individual Progress Bars Side by Side - Clickable */}
            <div className="w-full flex gap-0.5 mb-3 h-2">
              {videoSections.map((section, index) => (
                <div 
                  key={index}
                  className="bg-gray-600 bg-opacity-30 rounded-sm relative overflow-hidden cursor-pointer hover:bg-gray-500 hover:bg-opacity-40 transition-colors"
                  style={{ width: `${getSectionWidth(index)}%` }}
                  onClick={(e) => handleProgressBarClick(e, index)}
                  onMouseMove={(e) => handleProgressBarHover(e, index)}
                  onMouseLeave={handleProgressBarLeave}
                >
                  {/* Individual progress bar fill */}
                  <div
                                      className={`h-full transition-all duration-300 rounded-sm ${
                    index < currentSection ? 'bg-emerald-600' : 
                    index === currentSection ? 'bg-emerald-600' : 'bg-gray-600 bg-opacity-20'
                  }`}
                    style={{ 
                      width: `${getSectionProgress(index)}%`,
                      minWidth: getSectionProgress(index) > 0 ? '2px' : '0px'
                    }}
                  />
                  
                  {/* Hover preview indicator */}
                  {hoverProgress && hoverProgress.sectionIndex === index && (
                    <div 
                      className="absolute top-0 bottom-0 bg-white bg-opacity-40 w-0.5 pointer-events-none"
                      style={{ left: `${hoverProgress.percentage * 100}%` }}
                    />
                  )}
                  
                  {/* Current section indicator */}
                  {index === currentSection && (
                    <div className="absolute inset-0 ring-1 ring-amber-400 ring-opacity-70 rounded-sm pointer-events-none" />
                  )}
                </div>
              ))}
            </div>

            {/* Control Buttons */}
            <div className="flex justify-between items-center">
              {/* Left side - Replay button */}
                              <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReplay()
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-emerald-600/20 p-2"
                >
                <RotateCcw className="w-5 h-5" />
              </Button>

              {/* Center - Section indicator */}
              <div className="text-white text-sm bg-black/40 px-3 py-1 rounded-full">
                Section {currentSection + 1} of {videoSections.length}
              </div>

              {/* Right side - Volume and Fullscreen controls */}
              <div className="flex items-center gap-1">
                {/* Volume control */}
                <div className="relative" ref={volumeContainerRef}>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowVolumeSlider(!showVolumeSlider)
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-emerald-600/20 p-2"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>

                  {/* Volume Slider */}
                  {showVolumeSlider && (
                    <div className="absolute bottom-full right-0 mb-2 p-3 bg-black/90 rounded-lg shadow-lg border border-gray-600">
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMute()
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-emerald-600/20 p-1"
                        >
                          {isMuted ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>
                        <div className="w-25">
                          <Slider
                            value={[isMuted ? 0 : volume]}
                            onValueChange={handleVolumeChange}
                            max={1}
                            step={0.05}
                            className="w-full [&_[data-slot=slider-track]]:bg-gray-600 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-emerald-600 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-thumb]]:border-amber-500 [&_[data-slot=slider-thumb]]:h-3 [&_[data-slot=slider-thumb]]:w-3 [&_[data-slot=slider-thumb]]:shadow-xs"
                          />
                        </div>
                        <span className="text-white text-xs font-medium min-w-[2rem] text-center">
                          {Math.round((isMuted ? 0 : volume) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fullscreen button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFullscreen()
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-emerald-600/20 p-2"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentSection === 0}
            variant="outline"
            className="flex items-center gap-2 border-emerald-300 text-black hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Video
          </Button>

          <Button
            onClick={handleNext}
            className="flex items-center text-white gap-2 bg-emerald-600 hover:bg-emerald-700 transition-colors w-full sm:w-auto"
          >
            {currentSection === videoSections.length - 1 ? "Start Assessment" : "Next Video"}
            <ChevronRight className="w-4 h-4 text-white" />
          </Button>
        </div>
      </Card>
    </div>
  )
}