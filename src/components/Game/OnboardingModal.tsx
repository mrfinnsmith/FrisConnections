'use client';

import React, { useState } from 'react';

interface OnboardingModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isVisible, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: "Welcome to FrisConnections!",
            content: "Find four groups of four related San Francisco items from this 16-term grid."
        },
        {
            title: "Select Four Terms",
            content: "Click on four terms that you think belong together. Selected terms will be highlighted."
        },
        {
            title: "Submit Your Guess",
            content: "When you have exactly 4 terms selected, click Submit. You get 4 wrong guesses before the game ends. We'll tell you if you're off by just one!"
        }
    ];

    if (!isVisible) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                >
                    ×
                </button>

                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    {steps[currentStep].title}
                </h2>

                <div className="mb-6">
                    <p className="text-gray-600 text-center leading-relaxed">
                        {steps[currentStep].content}
                    </p>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className="text-gray-500 hover:text-gray-700 text-sm flex items-center"
                            >
                                ← Back
                            </button>
                        )}
                    </div>

                    <div className="flex space-x-2">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        {currentStep === steps.length - 1 ? "Got it!" : "→"}
                    </button>
                </div>

                {/* How to Play link on last step */}
                {currentStep === steps.length - 1 && (
                    <div className="mt-6 text-center">
                        <a
                            href="/how-to-play"
                            className="text-blue-600 hover:text-blue-800 underline text-sm hover:no-underline"
                        >
                            Need more help? Check out How to Play
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingModal;