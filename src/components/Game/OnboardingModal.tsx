'use client'

import React, { useState, useEffect, useRef } from 'react'

interface OnboardingModalProps {
  isVisible: boolean
  onClose: () => void
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isVisible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)
  const prevButtonRef = useRef<HTMLButtonElement>(null)

  const steps = [
    {
      title: 'Welcome to FrisConnections!',
      content: 'Find four groups of four related San Francisco items from this 16-term grid.',
    },
    {
      title: 'Select Four Terms',
      content:
        'Click on four terms that you think belong together. Selected terms will be highlighted.',
    },
    {
      title: 'Submit Your Guess',
      content:
        "When you have exactly 4 terms selected, click Submit. You get 4 wrong guesses before the game ends. We'll tell you if you're off by just one!",
    },
  ]

  // Focus trap functionality
  useEffect(() => {
    if (!isVisible) return

    // Focus the close button when modal opens
    const focusCloseButton = () => {
      closeButtonRef.current?.focus()
    }

    // Small delay to ensure modal is rendered
    const timeoutId = setTimeout(focusCloseButton, 100)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>

        if (!focusableElements || focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey) {
          // Shift + Tab (backward)
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab (forward)
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Prevent background scrolling
    document.body.style.overflow = 'hidden'

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
      onClick={e => {
        // Close modal if clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Close onboarding tutorial"
        >
          ×
        </button>

        <h2 id="onboarding-title" className="text-2xl font-bold text-center mb-6 text-gray-800">
          {steps[currentStep].title}
        </h2>

        <div className="mb-6">
          <p id="onboarding-description" className="text-gray-600 text-center leading-relaxed">
            {steps[currentStep].content}
          </p>
        </div>

        <div className="sr-only">
          Step {currentStep + 1} of {steps.length}. Use Tab to navigate between elements or press
          Escape to close.
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {currentStep > 0 && (
              <button
                ref={prevButtonRef}
                onClick={handlePrev}
                className="text-gray-500 hover:text-gray-700 text-sm flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                aria-label={`Go back to step ${currentStep}`}
              >
                ← Back
              </button>
            )}
          </div>

          <div className="flex space-x-2" role="group" aria-label="Tutorial progress">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                aria-label={`Step ${index + 1}${index === currentStep ? ' (current)' : ''}`}
                aria-hidden="true"
              />
            ))}
          </div>

          <button
            ref={nextButtonRef}
            onClick={handleNext}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={
              currentStep === steps.length - 1
                ? 'Finish tutorial and start playing'
                : `Continue to step ${currentStep + 2}`
            }
          >
            {currentStep === steps.length - 1 ? 'Got it!' : '→'}
          </button>
        </div>

        {/* How to Play link on last step */}
        {currentStep === steps.length - 1 && (
          <div className="mt-6 text-center">
            <a
              href="/how-to-play"
              className="text-blue-600 hover:text-blue-800 underline text-sm hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
              aria-label="Open detailed how to play guide in new page"
            >
              Need more help? Check out How to Play
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default OnboardingModal
