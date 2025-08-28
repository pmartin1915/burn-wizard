import { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, MapPin, Sparkles } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Burn Wizard! 🧙‍♂️',
    description: 'Let me guide you through burn assessment! This quick tour will show you how to use the interactive body map and calculate TBSA in just a few minutes.',
    target: 'body',
    position: 'bottom'
  },
  {
    id: 'patient-info',
    title: 'Patient Information',
    description: 'Start here! Enter the patient\'s age and weight. Age is especially important because children have different body proportions than adults for TBSA calculations.',
    target: '[data-tour="patient-info"]',
    position: 'right',
    highlight: true
  },
  {
    id: 'body-map',
    title: 'Interactive Body Map',
    description: 'This is the heart of Burn Wizard! Click on any body region to mark burn involvement. Each click cycles through: 0% → 25% → 50% → 75% → 100%.',
    target: '[data-tour="body-map"]',
    position: 'top',
    highlight: true
  },
  {
    id: 'tbsa-display',
    title: 'Real-time TBSA Calculation',
    description: 'Watch this area! As you select burned regions, the Total Body Surface Area percentage updates automatically using the medically-accurate Lund-Browder method.',
    target: '[data-tour="tbsa-display"]',
    position: 'bottom',
    highlight: true
  },
  {
    id: 'scenarios',
    title: 'Practice with Real Cases',
    description: 'Ready to practice? Click here to try realistic clinical scenarios with different types of burns. Perfect for learning and training!',
    target: '[data-tour="scenarios"]',
    position: 'right',
    highlight: true
  },
  {
    id: 'complete',
    title: 'You\'re Ready! 🎉',
    description: 'That\'s it! You now know how to assess burns and calculate TBSA. Remember: this is an educational tool - always verify with institutional protocols. Happy learning!',
    target: 'body',
    position: 'bottom'
  }
];

export const GuidedTour = ({ isOpen, onClose, onComplete }: GuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialWindowPos, setInitialWindowPos] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const step = tourSteps[currentStep];
    const targetElement = document.querySelector(step.target) as HTMLElement;
    
    if (targetElement && step.highlight) {
      setHighlightedElement(targetElement);
      const originalPosition = targetElement.style.position;
      const originalZIndex = targetElement.style.zIndex;
      const computedStyle = window.getComputedStyle(targetElement);
      
      // Burn-wizard themed highlight effect - warm orange glow
      if (computedStyle.position !== 'fixed') {
        targetElement.style.position = originalPosition || 'relative';
      }
      targetElement.style.zIndex = '9997';
      targetElement.style.backgroundColor = 'rgba(249, 115, 22, 0.12)'; // Orange background
      targetElement.style.borderRadius = '12px';
      targetElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      targetElement.style.transform = 'scale(1.05)';
      targetElement.style.boxShadow = `
        0 0 0 3px rgba(249, 115, 22, 0.4),
        0 0 20px rgba(249, 115, 22, 0.3),
        0 15px 35px -5px rgba(249, 115, 22, 0.25),
        0 25px 65px -15px rgba(249, 115, 22, 0.15)
      `;
      targetElement.style.filter = 'brightness(1.15) saturate(1.2) contrast(1.05)';
      
      // Set transform origin based on element position to prevent shifting
      const rect = targetElement.getBoundingClientRect();
      const isBottomRight = rect.right > window.innerWidth * 0.8 && rect.bottom > window.innerHeight * 0.8;
      targetElement.style.transformOrigin = isBottomRight ? 'bottom right' : 'center';
      
      // Add a subtle pulsing animation with burn-themed colors
      targetElement.style.animation = 'tour-highlight-pulse 2s ease-in-out infinite';
      
      // Store original values for cleanup
      targetElement.dataset.originalPosition = originalPosition || '';
      targetElement.dataset.originalZIndex = originalZIndex || '';
      
      // Scroll element into view
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      if (highlightedElement) {
        highlightedElement.style.position = highlightedElement.dataset.originalPosition || '';
        highlightedElement.style.zIndex = highlightedElement.dataset.originalZIndex || '';
        highlightedElement.style.backgroundColor = '';
        highlightedElement.style.borderRadius = '';
        highlightedElement.style.transform = '';
        highlightedElement.style.boxShadow = '';
        highlightedElement.style.filter = '';
        highlightedElement.style.animation = '';
        highlightedElement.style.transformOrigin = '';
        highlightedElement.style.transition = '';
        delete highlightedElement.dataset.originalPosition;
        delete highlightedElement.dataset.originalZIndex;
      }
    };
  }, [currentStep, isOpen, highlightedElement]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setInitialWindowPos({ x: rect.left, y: rect.top });
      
      // Improve dragging performance by disabling animations during drag
      tooltipRef.current.style.transition = 'none';
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Use requestAnimationFrame for smoother movement
    requestAnimationFrame(() => {
      const deltaX = e.clientX - initialMousePos.x;
      const deltaY = e.clientY - initialMousePos.y;
      
      let newX = initialWindowPos.x + deltaX;
      let newY = initialWindowPos.y + deltaY;
      
      // Ensure the modal stays within viewport boundaries with some padding
      const padding = 10;
      if (tooltipRef.current) {
        const rect = tooltipRef.current.getBoundingClientRect();
        newX = Math.max(padding, Math.min(window.innerWidth - rect.width - padding, newX));
        newY = Math.max(padding, Math.min(window.innerHeight - rect.height - padding, newY));
      }
      
      setPosition({
        x: newX,
        y: newY
      });
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Restore animations and cursor after drag
    if (tooltipRef.current) {
      tooltipRef.current.style.transition = '';
    }
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, initialMousePos, initialWindowPos]);

  const completeTour = () => {
    if (highlightedElement) {
      highlightedElement.style.position = highlightedElement.dataset.originalPosition || '';
      highlightedElement.style.zIndex = highlightedElement.dataset.originalZIndex || '';
      highlightedElement.style.backgroundColor = '';
      highlightedElement.style.borderRadius = '';
      highlightedElement.style.transform = '';
      highlightedElement.style.boxShadow = '';
      highlightedElement.style.filter = '';
      highlightedElement.style.animation = '';
      highlightedElement.style.transformOrigin = '';
      highlightedElement.style.transition = '';
      delete highlightedElement.dataset.originalPosition;
      delete highlightedElement.dataset.originalZIndex;
    }
    onComplete();
    onClose();
  };

  const skipTour = () => {
    if (highlightedElement) {
      highlightedElement.style.position = highlightedElement.dataset.originalPosition || '';
      highlightedElement.style.zIndex = highlightedElement.dataset.originalZIndex || '';
      highlightedElement.style.backgroundColor = '';
      highlightedElement.style.borderRadius = '';
      highlightedElement.style.transform = '';
      highlightedElement.style.boxShadow = '';
      highlightedElement.style.filter = '';
      highlightedElement.style.animation = '';
      highlightedElement.style.transformOrigin = '';
      highlightedElement.style.transition = '';
      delete highlightedElement.dataset.originalPosition;
      delete highlightedElement.dataset.originalZIndex;
    }
    onClose();
  };

  const resetWindowPosition = () => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2
      });
    }
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Lighter backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-15 z-[9996]" 
        onClick={skipTour}
      />
      
      {/* Tooltip - Burn Wizard themed with smooth transitions */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-orange-200 dark:border-orange-700 p-6 max-w-sm w-full transition-all duration-200 ease-out"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          transform: isDragging ? 'scale(1.02)' : 'scale(1)'
        }}
      >
        {/* Emergency reset handle - warm orange theme with better feedback */}
        <div 
          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-orange-300 hover:bg-orange-400 rounded-t cursor-pointer transition-all duration-200"
          onDoubleClick={resetWindowPosition}
          title="Double-click to reset window position"
        />
        
        {/* Header - Draggable area with better cursor feedback */}
        <div 
          className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2">
            <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
              <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-300" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Step {currentStep + 1} of {tourSteps.length}
            </span>
          </div>
          <button
            onClick={skipTour}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            title="Close tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {step.title}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress Bar - Orange theme */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex space-x-2">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-orange-600'
                    : index < currentStep
                    ? 'bg-orange-300'
                    : 'bg-gray-300 dark:bg-gray-500'
                }`}
                title={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            title={currentStep === tourSteps.length - 1 ? 'Finish tour' : 'Next step'}
          >
            <span>{currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}</span>
            {currentStep === tourSteps.length - 1 ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Skip Option */}
        <div className="mt-4 text-center">
          <button
            onClick={skipTour}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Skip guided tour"
          >
            Skip tour
          </button>
        </div>
      </div>
      
      {/* CSS for the pulsing animation */}
      <style>{`
        @keyframes tour-highlight-pulse {
          0% {
            box-shadow: 
              0 0 0 3px rgba(249, 115, 22, 0.4),
              0 0 20px rgba(249, 115, 22, 0.3),
              0 15px 35px -5px rgba(249, 115, 22, 0.25),
              0 25px 65px -15px rgba(249, 115, 22, 0.15);
          }
          50% {
            box-shadow: 
              0 0 0 3px rgba(249, 115, 22, 0.6),
              0 0 25px rgba(249, 115, 22, 0.4),
              0 15px 35px -5px rgba(249, 115, 22, 0.35),
              0 25px 65px -15px rgba(249, 115, 22, 0.25);
          }
          100% {
            box-shadow: 
              0 0 0 3px rgba(249, 115, 22, 0.4),
              0 0 20px rgba(249, 115, 22, 0.3),
              0 15px 35px -5px rgba(249, 115, 22, 0.25),
              0 25px 65px -15px rgba(249, 115, 22, 0.15);
          }
        }
      `}</style>
    </>
  );
};