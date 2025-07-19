"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Linkedin,
  Sparkles,
  Users,
  Target,
  Download,
  Camera,
  Home,
  User,
  Calendar,
  RotateCcw,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { storeTPHResult } from "@/lib/supabase"

type AppState = "landing" | "userInfo" | "quiz" | "results" | "about"

interface Question {
  id: number
  question: string
  options: {
    text: string
    value: number
  }[]
}

interface UserInfo {
  name: string
  age: string
}

interface QuizResult {
  name: string
  age: string
  score: number
  persona: string
  badgeImage: string
  completedAt: string
  referralCode?: string
}

interface ReferralCode {
  code: string
  ownerName: string
  ownerScore: number
  createdAt: string
  isValid: boolean
}

const questions: Question[] = [
  {
    id: 1,
    question: "When you make a promise, how often do you deliver?",
    options: [
      { text: "Always, without fail", value: 5 },
      { text: "Most of the time", value: 3 },
      { text: "Sometimes", value: 1 },
      { text: "I often forget or delay", value: 0 },
    ],
  },
  {
    id: 2,
    question: "Do people seek you out for advice or support during tough moments?",
    options: [
      { text: "Frequently", value: 5 },
      { text: "Occasionally", value: 3 },
      { text: "Rarely", value: 1 },
      { text: "Almost never", value: 0 },
    ],
  },
  {
    id: 3,
    question: "How transparent are you in your intentions?",
    options: [
      { text: "Always clear and upfront", value: 5 },
      { text: "Mostly clear", value: 3 },
      { text: "Sometimes vague", value: 1 },
      { text: "I often keep things to myself", value: 0 },
    ],
  },
  {
    id: 4,
    question: "How do you handle mistakes or conflicts?",
    options: [
      { text: "I acknowledge and take responsibility openly", value: 5 },
      { text: "I try to fix it quietly", value: 3 },
      { text: "I deflect or defend myself", value: 1 },
      { text: "I often deny or avoid", value: 0 },
    ],
  },
  {
    id: 5,
    question: "How consistent is your behavior across different environments (work, friends, public)?",
    options: [
      { text: "Very consistent", value: 5 },
      { text: "Mostly consistent", value: 3 },
      { text: "Varies a lot", value: 1 },
      { text: "I behave differently everywhere", value: 0 },
    ],
  },
  {
    id: 6,
    question: "When someone shares something vulnerable with you, how do you react?",
    options: [
      { text: "I listen fully and without judgment", value: 5 },
      { text: "I try to help but sometimes shift the topic", value: 3 },
      { text: "I feel awkward and avoid it", value: 1 },
      { text: "I downplay or make it transactional", value: 0 },
    ],
  },
  {
    id: 7,
    question: "Do you show appreciation or acknowledgment to others regularly?",
    options: [
      { text: "Yes, all the time", value: 5 },
      { text: "Occasionally", value: 3 },
      { text: "Rarely", value: 1 },
      { text: "Almost never", value: 0 },
    ],
  },
  {
    id: 8,
    question: "How often do you communicate with clarity and intention (emails, conversations, posts)?",
    options: [
      { text: "Always", value: 5 },
      { text: "Most of the time", value: 3 },
      { text: "I try but struggle", value: 1 },
      { text: "I rarely think about it", value: 0 },
    ],
  },
  {
    id: 9,
    question: "When someone criticizes or disagrees with you, how do you respond?",
    options: [
      { text: "I listen, reflect, and respond maturely", value: 5 },
      { text: "I listen but get defensive sometimes", value: 3 },
      { text: "I usually argue my case strongly", value: 1 },
      { text: "I get reactive or avoid them", value: 0 },
    ],
  },
  {
    id: 10,
    question: "Do people follow your lead or direction in groups or teams?",
    options: [
      { text: "Yes, they trust my presence", value: 5 },
      { text: "Sometimes", value: 3 },
      { text: "Rarely", value: 1 },
      { text: "I avoid leadership roles", value: 0 },
    ],
  },
]

interface TPHPersona {
  title: string
  description: string
  color: string
  bgGradient: string
  icon: React.ReactNode
  badgeImage: string
}

const getTPHPersona = (score: number): TPHPersona => {
  if (score >= 90) {
    return {
      title: "The Trusted Guide",
      description: "You lead with deep consistency, clarity, and care. People instinctively trust you.",
      color: "text-emerald-800",
      bgGradient: "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300",
      icon: <Sparkles className="w-8 h-8 text-emerald-600" />,
      badgeImage: "/badges/the_trusted_guide.jpeg",
    }
  } else if (score >= 75) {
    return {
      title: "The Reliable Rock",
      description: "Dependable, emotionally present, and grounded. People feel safe around you.",
      color: "text-blue-800",
      bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300",
      icon: <Users className="w-8 h-8 text-blue-600" />,
      badgeImage: "/badges/the_reliable_rock.jpeg",
    }
  } else if (score >= 50) {
    return {
      title: "The Emerging Voice",
      description: "You're on your way. Refine your presence and build deeper intentionality.",
      color: "text-amber-800",
      bgGradient: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300",
      icon: <Target className="w-8 h-8 text-amber-600" />,
      badgeImage: "/badges/the_emerging_voice.jpeg",
    }
  } else {
    return {
      title: "The Hidden Flame",
      description: "You have untapped trust potential. Begin with small, consistent actions.",
      color: "text-purple-800",
      bgGradient: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300",
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      badgeImage: "/badges/the_hidden_flame.jpeg",
    }
  }
}

// X (Twitter) Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Telegram Icon Component
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
)

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
  </svg>
)

// Typewriter Animation Component
const TypewriterText = ({ text, speed = 100 }: { text: string; speed?: number }) => {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed])

  return (
    <span>
      {displayText}
      {currentIndex < text.length && <span className="animate-pulse">|</span>}
    </span>
  )
}

// Animated Score Counter Component
const AnimatedScore = ({ finalScore, onComplete }: { finalScore: number; onComplete: () => void }) => {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60 // 60 steps for smooth animation
    const increment = finalScore / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const newScore = Math.min(Math.round(increment * currentStep), finalScore)
      setDisplayScore(newScore)

      if (newScore >= finalScore) {
        clearInterval(timer)
        onComplete()
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [finalScore, onComplete])

  return (
    <div className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      {displayScore}/100
    </div>
  )
}

// Confetti Component
const Confetti = () => {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      color: string
      size: number
      speedX: number
      speedY: number
      rotation: number
      rotationSpeed: number
    }>
  >([])

  useEffect(() => {
    const colors = ["#4f46e5", "#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      speedX: (Math.random() - 0.5) * 4,
      speedY: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    }))

    setParticles(newParticles)

    const animateParticles = () => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.speedX,
            y: particle.y + particle.speedY,
            rotation: particle.rotation + particle.rotationSpeed,
            speedY: particle.speedY + 0.1, // gravity
          }))
          .filter((particle) => particle.y < window.innerHeight + 20),
      )
    }

    const interval = setInterval(animateParticles, 16)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setParticles([])
    }, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? "50%" : "0%",
          }}
        />
      ))}
    </div>
  )
}

export default function TPHCalculatorClient() {
  const [state, setState] = useState<AppState>("landing")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", age: "" })
  const [showConfetti, setShowConfetti] = useState(false)
  const [scoreAnimationComplete, setScoreAnimationComplete] = useState(false)
  const [myReferralCode, setMyReferralCode] = useState<string>("")
  const [canJoinCommunity, setCanJoinCommunity] = useState(false)
  const shareableCardRef = useRef<HTMLDivElement>(null)

  // Generate referral code
  const generateReferralCode = (name: string): string => {
    const cleanName = name.replace(/\s+/g, "").toUpperCase().slice(0, 4)
    const randomNum = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0")
    return `TPH${cleanName}${randomNum}`
  }

  // Store referral code in localStorage
  const storeReferralCode = (code: string, ownerName: string, ownerScore: number) => {
    const referralCode: ReferralCode = {
      code,
      ownerName,
      ownerScore,
      createdAt: new Date().toISOString(),
      isValid: ownerScore >= 80,
    }

    const existingCodes = JSON.parse(localStorage.getItem("tph-referral-codes") || "{}")
    existingCodes[code] = referralCode
    localStorage.setItem("tph-referral-codes", JSON.stringify(existingCodes))
  }

  // Set community access based on score
  useEffect(() => {
    setCanJoinCommunity(score >= 80)
  }, [score])

  // Load saved progress on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem("tph-quiz-progress")
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        if (progress.state && progress.state !== "results") {
          setState(progress.state)
          setCurrentQuestion(progress.currentQuestion || 0)
          setAnswers(progress.answers || [])
          setUserInfo(progress.userInfo || { name: "", age: "" })
        }
      } catch (error) {
        console.error("Error loading saved progress:", error)
      }
    }
  }, [])

  // Trigger confetti when score animation completes
  useEffect(() => {
    if (scoreAnimationComplete) {
      setShowConfetti(true)
      const timeout = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timeout)
    }
  }, [scoreAnimationComplete])

  // Save progress to localStorage
  const saveProgress = (currentState: AppState, questionIndex?: number, currentAnswers?: number[]) => {
    const progress = {
      state: currentState,
      currentQuestion: questionIndex ?? currentQuestion,
      answers: currentAnswers ?? answers,
      userInfo,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("tph-quiz-progress", JSON.stringify(progress))
  }

  // Save quiz result to localStorage and Supabase
  const saveQuizResult = async (finalScore: number, persona: TPHPersona) => {
    let referralCode = ""

    // Generate referral code if score >= 80
    if (finalScore >= 80) {
      referralCode = generateReferralCode(userInfo.name)
      setMyReferralCode(referralCode)
    }

    // Store in Supabase
    const supabaseResult = await storeTPHResult({
      name: userInfo.name,
      age: Number.parseInt(userInfo.age),
      score: finalScore,
      persona: persona.title,
      referralCode: referralCode || undefined,
    })

    if (!supabaseResult.success) {
      console.error("Failed to store result in Supabase:", supabaseResult.error)
    }

    const result: QuizResult = {
      name: userInfo.name,
      age: userInfo.age,
      score: finalScore,
      persona: persona.title,
      badgeImage: persona.badgeImage,
      completedAt: new Date().toISOString(),
      referralCode: referralCode || undefined,
    }

    // Get existing results
    const existingResults = localStorage.getItem("tph-quiz-results")
    let results: QuizResult[] = []
    if (existingResults) {
      try {
        results = JSON.parse(existingResults)
      } catch (error) {
        console.error("Error parsing existing results:", error)
      }
    }

    // Add new result
    results.unshift(result) // Add to beginning of array

    // Keep only last 10 results
    if (results.length > 10) {
      results = results.slice(0, 10)
    }

    // Save back to localStorage
    localStorage.setItem("tph-quiz-results", JSON.stringify(results))

    // Clear progress since quiz is completed
    localStorage.removeItem("tph-quiz-progress")
  }

  const startQuiz = () => {
    setState("userInfo")
  }

  const handleUserInfoSubmit = () => {
    if (userInfo.name.trim() && userInfo.age.trim()) {
      setState("quiz")
      saveProgress("quiz", 0, [])
    }
  }

  const handleAnswer = (value: number) => {
    setSelectedOption(value)
  }

  const nextQuestion = () => {
    if (selectedOption === null) return

    const newAnswers = [...answers, selectedOption]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      const nextQuestionIndex = currentQuestion + 1
      setCurrentQuestion(nextQuestionIndex)
      setSelectedOption(null)
      saveProgress("quiz", nextQuestionIndex, newAnswers)
    } else {
      // Calculate final score
      const finalScore = newAnswers.reduce((sum, answer) => sum + answer, 0) * 2 // Multiply by 2 to get out of 100
      setScore(finalScore)
      const persona = getTPHPersona(finalScore)
      saveQuizResult(finalScore, persona)
      setScoreAnimationComplete(false) // Reset animation state
      setState("results")
    }
  }

  const captureAndDownloadImage = async () => {
    if (!shareableCardRef.current) return

    setIsCapturing(true)

    try {
      // Wait for fonts to load
      await document.fonts.ready

      // Dynamically import html2canvas
      const html2canvas = (await import("html2canvas")).default

      const canvas = await html2canvas(shareableCardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: shareableCardRef.current.offsetWidth,
        height: shareableCardRef.current.offsetHeight,
        onclone: (clonedDoc) => {
          // Fix text alignment in cloned document
          const clonedElement = clonedDoc.querySelector("[data-screenshot-card]") as HTMLElement
          if (clonedElement) {
            // Ensure proper font rendering
            clonedElement.style.fontFamily = "system-ui, -apple-system, sans-serif"
            clonedElement.style.color = "#000000"

            // Fix gradient text for screenshot
            const gradientTexts = clonedElement.querySelectorAll("[data-gradient-text]")
            gradientTexts.forEach((el) => {
              const htmlEl = el as HTMLElement
              htmlEl.style.background = "linear-gradient(to right, #4f46e5, #7c3aed)"
              htmlEl.style.webkitBackgroundClip = "text"
              htmlEl.style.backgroundClip = "text"
              htmlEl.style.webkitTextFillColor = "transparent"
              htmlEl.style.color = "transparent"
            })

            // Ensure score text is visible
            const scoreTexts = clonedElement.querySelectorAll("[data-score-text]")
            scoreTexts.forEach((el) => {
              const htmlEl = el as HTMLElement
              htmlEl.style.color = "#1e293b"
              htmlEl.style.fontWeight = "900"
            })
          }
        },
      })

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `tph-badge-${userInfo.name.replace(/\s+/g, "-")}-${score}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, "image/png")
    } catch (error) {
      console.error("Error capturing image:", error)
    } finally {
      setIsCapturing(false)
    }
  }

  const handleShare = (platform: "twitter" | "linkedin") => {
    const persona = getTPHPersona(score)
    const text = `I just took the TPH Calculator and scored ${score}/100 as "${persona.title}"! Find out your Trust Per Human score. #TPHScore`
    const url = window.location.href

    if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        "_blank",
      )
    } else {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
        "_blank",
      )
    }
  }

  const handleTelegramShare = () => {
    const persona = getTPHPersona(score)
    let text = `🎯 I just took the TPH Calculator and scored ${score}/100 as "${persona.title}"! 

Find out your Trust Per Human score: ${window.location.origin}`

    // Add referral code if user has one
    if (myReferralCode) {
      text += `

🔑 Use my referral code: ${myReferralCode} to join our exclusive community!`
    }

    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`
    window.open(telegramUrl, "_blank")
  }

  const handleWhatsAppShare = () => {
    const persona = getTPHPersona(score)
    let text = `🎯 I just took the TPH Calculator and scored ${score}/100 as "${persona.title}"! 

Find out your Trust Per Human score: ${window.location.origin}`

    // Add referral code if user has one
    if (myReferralCode) {
      text += `

🔑 Use my referral code: ${myReferralCode} to join our exclusive community!`
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, "_blank")
  }

  const resetQuiz = () => {
    setState("landing")
    setCurrentQuestion(0)
    setAnswers([])
    setSelectedOption(null)
    setScore(0)
    setUserInfo({ name: "", age: "" })
    setScoreAnimationComplete(false)
    setMyReferralCode("")
    setCanJoinCommunity(false)
    localStorage.removeItem("tph-quiz-progress")
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-3 md:p-4 overflow-auto">
        {state === "userInfo" && (
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-3 md:p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"></div>

            {/* Modal */}
            <div className="relative z-50 w-full max-w-sm mx-auto animate-in fade-in zoom-in duration-300">
              <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl shadow-indigo-500/20">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="text-center space-y-3 mb-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <User className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Let's Get Started!
                      </h2>
                      <p className="text-sm text-slate-600">Tell us about yourself</p>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Your Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={userInfo.name}
                        onChange={(e) => setUserInfo((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 transition-colors text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Your Age
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Enter age"
                        value={userInfo.age}
                        onChange={(e) => setUserInfo((prev) => ({ ...prev, age: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 transition-colors text-sm"
                        min="13"
                        max="120"
                      />
                    </div>

                    {/* Privacy Note */}
                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                      <p className="text-xs text-indigo-700 text-center">🔒 Stored locally, never shared</p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => setState("landing")}
                        variant="outline"
                        className="flex-1 py-2.5 rounded-lg border-2 hover:bg-slate-50 text-sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUserInfoSubmit}
                        disabled={!userInfo.name.trim() || !userInfo.age.trim()}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 text-sm"
                      >
                        Start Quiz
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {state === "about" && (
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-3 md:p-4 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-3 md:space-y-4 animate-in fade-in duration-1000">
              {/* Header */}
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  What Is Trust Per Human?
                </h1>
              </div>

              {/* Content */}
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardContent className="p-5 md:p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          Trust is what enables human connection, collaboration, and belonging at scale. It's what makes
                          people feel safe, open, and willing to invest - emotionally, socially, or financially.
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          <strong>Trust Per Human</strong> is a framework created by Kapil Dhiman to measure this
                          foundational currency through your actions, communication, and consistency, one person at a
                          time.
                        </p>
                      </div>

                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <p className="text-indigo-800 font-medium text-center italic text-sm">
                          "TPH is how much someone would bet on you, without a contract, just based on who you are."
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">The Psychology of Trust</h3>
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                            <div className="text-sm">
                              <strong>Consistency</strong> - Can I predict your behavior?
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                            <div className="text-sm">
                              <strong>Integrity</strong> - Do your actions align with your words?
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                            <div className="text-sm">
                              <strong>Empathy</strong> - Do I feel seen, safe, and understood by you?
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">How TPH Score Works</h3>
                        <p className="text-sm text-slate-700 leading-relaxed mb-3">
                          Using 10 evidence-informed questions, the TPH Score assesses:
                        </p>
                        <div className="space-y-1 text-sm">
                          <div>
                            • <strong>Cognitive clarity:</strong> Do you communicate intentions well?
                          </div>
                          <div>
                            • <strong>Emotional presence:</strong> Do others feel safe opening up?
                          </div>
                          <div>
                            • <strong>Behavioral reliability:</strong> Do you follow through?
                          </div>
                          <div>
                            • <strong>Conflict response:</strong> How do you handle criticism?
                          </div>
                          <div>
                            • <strong>Authenticity signal:</strong> Are you consistent everywhere?
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">What TPH Measures</h3>
                        <p className="text-sm text-slate-700 leading-relaxed mb-3">
                          Not popularity! It measures <strong>predictability + presence + emotional safety</strong>.
                          This trust:
                        </p>
                        <div className="space-y-1 text-sm">
                          <div>• Builds loyalty</div>
                          <div>• Drives real referrals</div>
                          <div>• Deepens relationships</div>
                          <div>• Becomes your human "credit score"</div>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-bold text-purple-800 mb-2 text-sm">The Age of TPH</h4>
                        <p className="text-purple-700 text-sm">
                          AI can automate content. Ads can manufacture reach. But trust cannot be faked. Your real edge
                          isn't scale - it's trust per human.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-slate-200">
                    <Button
                      onClick={startQuiz}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Your TPH Assessment
                    </Button>
                    <Button
                      onClick={() => setState("landing")}
                      variant="outline"
                      className="px-6 py-2.5 rounded-xl hover:bg-white/80"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {state === "landing" && (
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-3 md:p-4">
            <div className="max-w-2xl mx-auto text-center space-y-4 md:space-y-8 animate-in fade-in duration-1000">
              {/* Hero Section */}
              <div className="space-y-3 md:space-y-4">
                <button
                  onClick={() => setState("about")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-sm font-medium text-indigo-700 border border-indigo-200 hover:from-indigo-200 hover:to-purple-200 transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4" />
                  What is TPH Score?
                </button>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent tracking-tight">
                  <TypewriterText text="TPH Calculator" speed={150} />
                </h1>

                <h2 className="text-xl md:text-2xl lg:text-3xl text-slate-700 font-semibold">
                  What's Your Trust Per Human Score?
                </h2>

                <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto px-4">
                  Discover how much trust you're creating - one person at a time.
                  <br />
                  <span className="font-medium text-indigo-600">10 questions. Instant insights.</span>
                </p>
              </div>

              {/* Main CTA Card */}
              <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-2xl shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-500">
                <CardContent className="p-4 md:p-8 space-y-4 md:space-y-5">
                  <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Quick Assessment
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Instant Results
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Actionable Insights
                    </div>
                  </div>

                  <Button
                    onClick={startQuiz}
                    size="lg"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 md:py-6 text-lg md:text-xl rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Your TPH Assessment
                  </Button>

                  <p className="text-sm text-slate-500 italic">
                    Join thousands discovering their trust-building potential
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {state === "quiz" && (
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-3 md:p-4">
            <div className="max-w-2xl mx-auto w-full space-y-4 md:space-y-5 animate-in slide-in-from-right duration-500">
              {/* Progress Header */}
              <div className="text-center space-y-2 md:space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-indigo-700 border border-indigo-200">
                  Question {currentQuestion + 1} of {questions.length}
                </div>
                <div className="max-w-md mx-auto">
                  <Progress value={progress} className="w-full h-2 bg-indigo-100" />
                </div>
                {userInfo.name && (
                  <p className="text-sm text-slate-600">
                    Hi <span className="font-medium text-indigo-600">{userInfo.name}</span>! 👋
                  </p>
                )}
              </div>

              {/* Question Card */}
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl shadow-indigo-500/10">
                <CardContent className="p-6 space-y-5">
                  <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-slate-900 leading-relaxed text-center">
                    {questions[currentQuestion].question}
                  </h2>

                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(option.value)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 hover:scale-[1.01] group ${
                          selectedOption === option.value
                            ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg shadow-indigo-500/20"
                            : "border-slate-200 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center font-semibold text-xs md:text-sm transition-colors ${
                              selectedOption === option.value
                                ? "border-indigo-500 bg-indigo-500 text-white"
                                : "border-slate-300 text-slate-600 group-hover:border-indigo-400"
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="font-medium text-slate-800 text-sm md:text-base">{option.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={nextQuestion}
                    disabled={selectedOption === null}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold py-3 text-base md:text-lg rounded-xl transition-all duration-300 disabled:hover:scale-100 hover:scale-105"
                  >
                    {currentQuestion === questions.length - 1 ? "Get My TPH Score" : "Next Question"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {state === "results" && (
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-3 md:p-4 overflow-auto">
            {showConfetti && <Confetti />}
            <div className="max-w-5xl mx-auto w-full space-y-3 md:space-y-4 animate-in fade-in duration-1000">
              {/* Results Header */}
              <div className="text-center space-y-2 md:space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-indigo-700 border border-indigo-200">
                  <Sparkles className="w-4 h-4" />
                  {userInfo.name ? `${userInfo.name}'s TPH Results` : "Your TPH Results"}
                </div>
                <div className="space-y-2">
                  <AnimatedScore finalScore={score} onComplete={() => setScoreAnimationComplete(true)} />
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                {/* Badge Display */}
                <div className="text-center">
                  <img
                    src={getTPHPersona(score).badgeImage || "/placeholder.svg"}
                    alt={`${getTPHPersona(score).title} Badge`}
                    className="w-full h-auto max-w-sm mx-auto rounded-2xl shadow-2xl"
                    crossOrigin="anonymous"
                  />
                </div>

                {/* Description & Actions */}
                <div className="space-y-4 md:space-y-5">
                  <div className={`${getTPHPersona(score).bgGradient} border-2 rounded-xl p-5`}>
                    <h2 className={`text-xl md:text-2xl font-bold ${getTPHPersona(score).color} mb-3 text-center`}>
                      {getTPHPersona(score).title}
                    </h2>
                    <p className="text-slate-700 leading-relaxed text-center text-sm md:text-base">
                      {getTPHPersona(score).description}
                    </p>
                  </div>

                  {/* Share Section */}
                  <Card className="bg-white/80 backdrop-blur-xl border-white/20">
                    <CardContent className="p-5 text-center space-y-4">
                      <p className="font-medium text-slate-700 text-sm md:text-base">Share your TPH badge! 🚀</p>

                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={captureAndDownloadImage}
                          disabled={isCapturing}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 text-sm w-full"
                        >
                          {isCapturing ? (
                            <>
                              <Camera className="w-4 h-4 mr-2" />
                              Capturing Badge...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download the Badge
                            </>
                          )}
                        </Button>

                        <div className="flex justify-center gap-3">
                          <Button
                            onClick={() => handleShare("twitter")}
                            className="bg-black hover:bg-gray-800 text-white font-semibold w-12 h-12 p-0 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center"
                            title="Share on X"
                          >
                            <XIcon className="w-5 h-5" />
                          </Button>

                          <Button
                            onClick={() => handleShare("linkedin")}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-12 h-12 p-0 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center"
                            title="Share on LinkedIn"
                          >
                            <Linkedin className="w-5 h-5" />
                          </Button>

                          <Button
                            onClick={handleTelegramShare}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold w-12 h-12 p-0 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center"
                            title="Share on Telegram"
                          >
                            <TelegramIcon className="w-5 h-5" />
                          </Button>

                          <Button
                            onClick={handleWhatsAppShare}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold w-12 h-12 p-0 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center"
                            title="Share on WhatsApp"
                          >
                            <WhatsAppIcon className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Your Referral Code - Only for scores 80+ */}
                  {score >= 80 && myReferralCode && (
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                      <CardContent className="p-5 space-y-3">
                        <div className="text-center">
                          <h3 className="font-bold text-green-800 mb-2">🎉 Your Referral Code</h3>
                          <p className="text-sm text-green-700 mb-3">
                            Share this code with others to help them join the TPH community!
                          </p>
                          <div className="bg-white/80 p-3 rounded-lg border border-green-200">
                            <code className="text-lg font-mono bg-green-100 px-3 py-2 rounded text-green-800 block">
                              {myReferralCode}
                            </code>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Community Access Section */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                    <CardContent className="p-5 space-y-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-blue-800 mb-2">Join the TPH Community</h3>
                        <p className="text-sm text-blue-700 mb-4">
                          Access our exclusive Telegram community for high-trust individuals
                        </p>
                      </div>

                      {/* Requirements */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          {score >= 80 ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className={score >= 80 ? "text-green-700" : "text-red-600"}>
                            Score 80+ (Your score: {score})
                          </span>
                        </div>
                      </div>

                      {/* Telegram Button with Tooltip */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full">
                              <Button
                                onClick={
                                  canJoinCommunity
                                    ? () => window.open("https://t.me/TrustedHumans", "_blank")
                                    : undefined
                                }
                                disabled={!canJoinCommunity}
                                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ${
                                  canJoinCommunity
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-105"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                <TelegramIcon className="w-4 h-4" />
                                {canJoinCommunity ? "Join TPH Community" : "Requirements Not Met"}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {!canJoinCommunity && (
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-2">
                                <p className="font-semibold text-sm">Requirement to join:</p>
                                <ul className="text-xs space-y-1">
                                  <li className="flex items-center gap-2">
                                    {score >= 80 ? (
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                    ) : (
                                      <AlertCircle className="w-3 h-3 text-red-500" />
                                    )}
                                    Score 80+ (You: {score}/100)
                                  </li>
                                </ul>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>

                      {score < 80 && (
                        <p className="text-xs text-blue-600 text-center">
                          Score 80+ to unlock community access and get your referral code!
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <div className="text-center">
                    <Button
                      onClick={resetQuiz}
                      variant="outline"
                      className="flex items-center gap-2 mx-auto hover:bg-white/80 bg-white/60 backdrop-blur-sm border-slate-300 hover:border-indigo-300 text-sm md:text-base"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Fresh Assessment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Hidden Shareable Card for Download */}
              <div
                ref={shareableCardRef}
                data-screenshot-card
                className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg mx-auto"
                style={{
                  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                  width: "600px",
                  height: "800px",
                  position: "absolute",
                  left: "-9999px",
                  top: "-9999px",
                }}
              >
                <div className="text-center space-y-8 h-full flex flex-col justify-center">
                  {/* User Info - Only Name, No Age */}
                  {userInfo.name && (
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold text-slate-900">{userInfo.name}</h1>
                    </div>
                  )}

                  {/* Score */}
                  <div className="space-y-2">
                    <div
                      data-score-text
                      className="text-5xl font-black text-slate-900"
                      style={{
                        fontWeight: "900",
                        lineHeight: "1",
                        letterSpacing: "-0.025em",
                        color: "#1e293b",
                      }}
                    >
                      TPH Score: {score}/100
                    </div>
                  </div>

                  {/* Badge Image */}
                  <div className="flex justify-center">
                    <img
                      src={getTPHPersona(score).badgeImage || "/placeholder.svg"}
                      alt={`${getTPHPersona(score).title} Badge`}
                      className="w-80 h-80 object-contain"
                      crossOrigin="anonymous"
                      style={{ maxWidth: "320px", maxHeight: "320px" }}
                    />
                  </div>

                  {/* Title and Description */}
                  <div className="space-y-4 px-8">
                    <h2 className="text-3xl font-bold text-slate-900">{getTPHPersona(score).title}</h2>
                    <p className="text-lg text-slate-700 leading-relaxed">{getTPHPersona(score).description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
