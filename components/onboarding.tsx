"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ChevronDown, FileText, Search, Map, Star } from "lucide-react"

interface PremiumOnboardingProps {
  onComplete: () => void
}

export function PremiumOnboarding({ onComplete }: PremiumOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const steps = [
    {
      id: "hero",
      title: "NoRide",
      subtitle: "MUMBAI",
      description: "Report. Verify. Protect.",
      tagline: "Your voice matters in making Mumbai safer",
      icon: null,
      features: [],
    },
    {
      id: "report",
      title: "Report Misconduct",
      description: "Help keep Mumbai's auto-rickshaw services safe and accountable",
      features: ["Vehicle Number", "Location & Time", "Photo Evidence", "Anonymous Option"],
      icon: FileText,
    },
    {
      id: "verify",
      title: "Smart Verification",
      description: "AI-powered credibility analysis ensures quality reports",
      features: ["Duplicate Detection", "Geolocation Validation", "Pattern Analysis", "Auto-Scoring"],
      icon: Search,
    },
    {
      id: "map",
      title: "Interactive Map",
      description: "Visualize incidents across Mumbai with real-time data",
      features: ["Live Clustering", "Heatmap View", "Search & Filter", "Incident Details"],
      icon: Map,
    },
    {
      id: "impact",
      title: "Make an Impact",
      description: "Every report contributes to safer transportation",
      features: ["RTO Integration", "Action Tracking", "Community Stats", "Real Change"],
      icon: Star,
    },
  ]

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else if (diff < 0 && currentStep > 0) {
        setCurrentStep(currentStep - 1)
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isAutoScrolling) return
      if (e.deltaY > 0 && currentStep < steps.length - 1) {
        setIsAutoScrolling(true)
        setCurrentStep(currentStep + 1)
        setTimeout(() => setIsAutoScrolling(false), 800)
      } else if (e.deltaY < 0 && currentStep > 0) {
        setIsAutoScrolling(true)
        setCurrentStep(currentStep - 1)
        setTimeout(() => setIsAutoScrolling(false), 800)
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: true })
    return () => window.removeEventListener("wheel", handleWheel)
  }, [currentStep, isAutoScrolling])

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  const Icon = step.icon

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      <div className="absolute inset-0">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />

        {/* Animated gradient orbs */}
        <div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: "radial-gradient(circle, #efcd45 0%, transparent 70%)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-15 animate-pulse"
          style={{
            background: "radial-gradient(circle, #efcd45 0%, transparent 70%)",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(255, 205, 69, 0.05) 25%, rgba(255, 205, 69, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 205, 69, 0.05) 75%, rgba(255, 205, 69, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 205, 69, 0.05) 25%, rgba(255, 205, 69, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 205, 69, 0.05) 75%, rgba(255, 205, 69, 0.05) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative h-full flex flex-col items-center justify-center px-6 text-white overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 backdrop-blur-sm">
          <div
            className="h-full transition-all duration-700 ease-out shadow-lg"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #efcd45 0%, #ffd700 50%, #efcd45 100%)",
              boxShadow: "0 0 20px rgba(239, 205, 69, 0.6)",
            }}
          />
        </div>

        {/* Step Counter */}
        <div className="absolute top-8 right-8 text-xs font-bold tracking-widest opacity-50 uppercase">
          {String(currentStep + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
        </div>

        {/* Main Content */}
        <div className="text-center max-w-2xl mx-auto w-full">
          {currentStep === 0 ? (
            <div className="space-y-8 animate-in fade-in duration-1000">
              {/* Animated Logo */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
                    style={{
                      background: "linear-gradient(135deg, #efcd45 0%, #ffd700 100%)",
                      animation: "pulse 3s ease-in-out infinite",
                    }}
                  />
                  <img
                    src="/logo.png"
                    alt="NoRide Logo"
                    className="relative w-40 h-40 rounded-3xl shadow-2xl border-2 border-white/20 backdrop-blur-sm hover:border-white/40 transition-all duration-500 hover:scale-105"
                  />
                </div>
              </div>

              {/* Title with premium styling */}
              <div className="space-y-4">
                <h1
                  className="text-7xl tracking-wider leading-tight"
                  style={{
                    background: "linear-gradient(135deg, #efcd45 0%, #ffd700 50%, #efcd45 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontFamily: "'Neue Augenblick Ultra Bold', sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  NoRide
                </h1>
                <p className="text-3xl font-bold tracking-widest text-white/70 mt-6">{step.subtitle}</p>
              </div>

              {/* Tagline */}
              <p className="text-lg text-white/60 font-light tracking-wide max-w-md mx-auto leading-relaxed">
                {step.tagline}
              </p>

              {/* Scroll Indicator with animation */}
              <div className="pt-12 flex flex-col items-center gap-2">
                <div className="animate-bounce">
                  <ChevronDown className="w-6 h-6 text-white/60" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Feature Icon with glow */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full blur-2xl opacity-40"
                    style={{
                      background: "linear-gradient(135deg, #efcd45 0%, #ffd700 100%)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                  <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:border-white/40 transition-all duration-300">
                    {Icon && <Icon className="w-14 h-14" style={{ color: "#efcd45" }} />}
                  </div>
                </div>
              </div>

              {/* Title and Description */}
              <div className="space-y-4 mt-8">
                <h2 className="text-5xl font-black tracking-tight leading-tight">{step.title}</h2>
                <p className="text-xl text-white/60 font-light">{step.description}</p>
              </div>

              {/* Features Grid with premium styling */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8">
                {step.features?.map((feature, idx) => (
                  <div
                    key={idx}
                    className="group p-4 rounded-xl border border-white/10 backdrop-blur-xl hover:border-white/30 transition-all duration-300 animate-in fade-in"
                    style={{
                      animationDelay: `${idx * 100}ms`,
                      background: "linear-gradient(135deg, rgba(255, 205, 69, 0.05) 0%, rgba(255, 205, 69, 0.02) 100%)",
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: "#efcd45" }} />
                      <p className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                        {feature}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-8">
          {/* Dot Navigation with premium styling */}
          <div className="flex gap-3">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentStep ? "w-8 h-2" : "w-2 h-2 hover:w-3 hover:h-3 opacity-40 hover:opacity-70"
                }`}
                style={{
                  background:
                    idx === currentStep ? "linear-gradient(90deg, #efcd45, #ffd700)" : "rgba(255, 255, 255, 0.2)",
                  boxShadow: idx === currentStep ? "0 0 12px rgba(239, 205, 69, 0.5)" : "none",
                }}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 w-full max-w-xs px-4">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 py-3 px-6 rounded-lg border border-white/20 text-white font-semibold hover:border-white/50 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
              >
                Back
              </button>
            )}

            {currentStep === steps.length - 1 ? (
              <button
                onClick={onComplete}
                className="flex-1 py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-110 relative group overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #efcd45 0%, #ffd700 50%, #efcd45 100%)",
                  color: "#000",
                }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                      animation: "shimmer 2s infinite",
                    }}
                  />
                </div>

                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"
                  style={{
                    background: "linear-gradient(135deg, #efcd45 0%, #ffd700 100%)",
                    zIndex: -1,
                  }}
                />

                <span className="relative z-10 flex items-center justify-center gap-2">
                  Get Started
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/50 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #efcd45 0%, #ffd700 100%)",
                  color: "#000",
                }}
              >
                Next
              </button>
            )}
          </div>

          {/* Skip Option */}
          {currentStep < steps.length - 1 && (
            <button
              onClick={onComplete}
              className="text-sm text-white/40 hover:text-white/70 transition-colors font-medium"
            >
              Skip Tour
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-40px) translateX(-10px);
          }
          75% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(239, 205, 69, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(239, 205, 69, 0.8);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-in {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
