import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ArrowRight, ArrowLeft, MapPin, Sparkles, RotateCcw, Keyboard } from 'lucide-react';
import { useKeyboardShortcuts, SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { useFocusTrap, useFocusRestore } from '@/hooks/useFocusManagement';
import { useLiveAnnouncer } from '@/components/ui/LiveAnnouncer';

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
  onNavigate?: (tab: string) => void;
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

export const GuidedTour = ({ isOpen, onClose, onComplete, onNavigate }: GuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialWindowPos, setInitialWindowPos] = useState({ x: 0, y: 0 });
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Accessibility hooks
  const { announce } = useLiveAnnouncer();
  const { saveFocus, restoreFocus } = useFocusRestore();
  
  // Focus trap for the guided tour modal
  useFocusTrap(tooltipRef, {
    isActive: isOpen,
    initialFocusRef: closeButtonRef,
    onEscape: onClose
  });

  useEffect(() => {
    if (isOpen && tooltipRef.current) {
      // Save focus when tour opens
      saveFocus();
      
      const rect = tooltipRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2
      });

      // Announce tour start to screen readers
      announce('Guided tour started. Use arrow keys or Space to navigate between steps. Press Escape to close.', 'polite');
    } else if (!isOpen) {
      // Restore focus when tour closes
      restoreFocus();
    }
  }, [isOpen, saveFocus, restoreFocus, announce]);

  // Ensure we're on the TBSA tab when tour starts
  useEffect(() => {
    if (isOpen && onNavigate && currentStep === 0) {
      // Navigate to TBSA tab and wait for the navigation to complete
      onNavigate('tbsa');
      
      // Small delay to ensure tab switching is complete before tour elements are positioned
      const timer = setTimeout(() => {
        // Reset step to trigger repositioning if needed
        setCurrentStep(0);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onNavigate, currentStep]);

  // Auto-position window based on current step with intelligent placement
  useEffect(() => {
    if (!isOpen || !tooltipRef.current) return;
    
    const step = tourSteps[currentStep];
    const targetElement = document.querySelector(step.target) as HTMLElement;
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportPadding = 20;
    
    const calculateOptimalPosition = (): { x: number; y: number } => {
      // Default centered position
      if (!targetElement || step.target === 'body') {
        return {
          x: (window.innerWidth - tooltipRect.width) / 2,
          y: (window.innerHeight - tooltipRect.height) / 2
        };
      }
      
      const targetRect = targetElement.getBoundingClientRect();
      
      // Calculate position based on step configuration
      switch (step.position) {
        case 'top':
          // Check if there's enough space above the target
          const topY = targetRect.top - tooltipRect.height - 10;
          
          return {
            x: Math.max(viewportPadding, 
                Math.min(window.innerWidth - tooltipRect.width - viewportPadding, 
                targetRect.left + (targetRect.width - tooltipRect.width) / 2)),
            y: topY < viewportPadding ? 
              // If not enough space above, position below the target instead
              Math.min(window.innerHeight - tooltipRect.height - viewportPadding, targetRect.bottom + 10) :
              topY
          };
        
        case 'bottom':
          // Check if there's enough space below the target
          const bottomY = targetRect.bottom + 10;
          const maxBottomY = window.innerHeight - tooltipRect.height - viewportPadding;
          
          return {
            x: Math.max(viewportPadding, 
                Math.min(window.innerWidth - tooltipRect.width - viewportPadding, 
                targetRect.left + (targetRect.width - tooltipRect.width) / 2)),
            y: bottomY > maxBottomY ? 
              // If not enough space below, position above the target instead
              Math.max(viewportPadding, targetRect.top - tooltipRect.height - 10) :
              bottomY
          };
        
        case 'left':
          // Check if there's enough space to the left of the target
          const leftX = targetRect.left - tooltipRect.width - 10;
          
          return {
            x: leftX < viewportPadding ? 
              // If not enough space left, position to the right instead
              Math.min(window.innerWidth - tooltipRect.width - viewportPadding, targetRect.right + 10) :
              leftX,
            y: Math.max(viewportPadding, 
                Math.min(window.innerHeight - tooltipRect.height - viewportPadding, 
                targetRect.top + (targetRect.height - tooltipRect.height) / 2))
          };
        
        case 'right':
          // Check if there's enough space to the right of the target
          const rightX = targetRect.right + 10;
          const maxRightX = window.innerWidth - tooltipRect.width - viewportPadding;
          
          return {
            x: rightX > maxRightX ? 
              // If not enough space right, position to the left instead
              Math.max(viewportPadding, targetRect.left - tooltipRect.width - 10) :
              rightX,
            y: Math.max(viewportPadding, 
                Math.min(window.innerHeight - tooltipRect.height - viewportPadding, 
                targetRect.top + (targetRect.height - tooltipRect.height) / 2))
          };
        
        default:
          return {
            x: (window.innerWidth - tooltipRect.width) / 2,
            y: (window.innerHeight - tooltipRect.height) / 2
          };
      }
    };
    
    const newPosition = calculateOptimalPosition();
    setPosition(newPosition);
  }, [currentStep, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const step = tourSteps[currentStep];
    const targetElement = document.querySelector(step.target) as HTMLElement;
    
    if (targetElement && step.highlight) {
      setHighlightedElement(targetElement);
      const computedStyle = window.getComputedStyle(targetElement);
      
      // Store original classes and styles for cleanup
      targetElement.dataset.originalClasses = targetElement.className;
      targetElement.dataset.originalPosition = targetElement.style.position || '';
      targetElement.dataset.originalZIndex = targetElement.style.zIndex || '';
      
      // Add highlight class instead of inline styles
      targetElement.classList.add('tour-highlight');
      
      // Ensure proper positioning for the highlight effect
      if (computedStyle.position !== 'fixed') {
        targetElement.style.position = targetElement.style.position || 'relative';
      }
      targetElement.style.zIndex = '9997';
      
      // Scroll element into view
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      if (highlightedElement) {
        // Restore original classes and styles
        highlightedElement.className = highlightedElement.dataset.originalClasses || '';
        highlightedElement.style.position = highlightedElement.dataset.originalPosition || '';
        highlightedElement.style.zIndex = highlightedElement.dataset.originalZIndex || '';
        
        // Clean up data attributes
        delete highlightedElement.dataset.originalClasses;
        delete highlightedElement.dataset.originalPosition;
        delete highlightedElement.dataset.originalZIndex;
      }
    };
  }, [currentStep, isOpen, highlightedElement]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      // Announce step change to screen readers
      const step = tourSteps[newStep];
      announce(`Step ${newStep + 1} of ${tourSteps.length}: ${step.title}`, 'polite');
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      // Announce step change to screen readers
      const step = tourSteps[newStep];
      announce(`Step ${newStep + 1} of ${tourSteps.length}: ${step.title}`, 'polite');
    }
  };

  const restartTour = () => {
    // Clean up any current highlights
    if (highlightedElement) {
      highlightedElement.className = highlightedElement.dataset.originalClasses || '';
      highlightedElement.style.position = highlightedElement.dataset.originalPosition || '';
      highlightedElement.style.zIndex = highlightedElement.dataset.originalZIndex || '';
      
      delete highlightedElement.dataset.originalClasses;
      delete highlightedElement.dataset.originalPosition;
      delete highlightedElement.dataset.originalZIndex;
      setHighlightedElement(null);
    }
    
    // Reset to first step
    setCurrentStep(0);
    
    // Navigate to TBSA tab if navigation function is available
    if (onNavigate) {
      onNavigate('tbsa');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setInitialWindowPos({ x: rect.left, y: rect.top });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setInitialMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setInitialWindowPos({ x: rect.left, y: rect.top });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - initialMousePos.x;
    const deltaY = e.clientY - initialMousePos.y;
    
    let newX = initialWindowPos.x + deltaX;
    let newY = initialWindowPos.y + deltaY;
    
    // Enhanced boundary constraints with padding
    const padding = 20;
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      newX = Math.max(padding, Math.min(window.innerWidth - rect.width - padding, newX));
      newY = Math.max(padding, Math.min(window.innerHeight - rect.height - padding, newY));
    }
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, initialMousePos.x, initialMousePos.y, initialWindowPos.x, initialWindowPos.y]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - initialMousePos.x;
    const deltaY = e.touches[0].clientY - initialMousePos.y;
    
    let newX = initialWindowPos.x + deltaX;
    let newY = initialWindowPos.y + deltaY;
    
    // Enhanced boundary constraints with padding
    const padding = 20;
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      newX = Math.max(padding, Math.min(window.innerWidth - rect.width - padding, newX));
      newY = Math.max(padding, Math.min(window.innerHeight - rect.height - padding, newY));
    }
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, initialMousePos.x, initialMousePos.y, initialWindowPos.x, initialWindowPos.y]);

  const stopDrag = () => {
    setIsDragging(false);
  };

  const handleMouseUp = useCallback(() => {
    stopDrag();
  }, []);

  const handleTouchEnd = useCallback(() => {
    stopDrag();
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const completeTour = () => {
    if (highlightedElement) {
      // Restore original classes and styles
      highlightedElement.className = highlightedElement.dataset.originalClasses || '';
      highlightedElement.style.position = highlightedElement.dataset.originalPosition || '';
      highlightedElement.style.zIndex = highlightedElement.dataset.originalZIndex || '';
      
      // Clean up data attributes
      delete highlightedElement.dataset.originalClasses;
      delete highlightedElement.dataset.originalPosition;
      delete highlightedElement.dataset.originalZIndex;
    }
    onComplete();
    onClose();
  };

  const skipTour = () => {
    if (highlightedElement) {
      // Restore original classes and styles
      highlightedElement.className = highlightedElement.dataset.originalClasses || '';
      highlightedElement.style.position = highlightedElement.dataset.originalPosition || '';
      highlightedElement.style.zIndex = highlightedElement.dataset.originalZIndex || '';
      
      // Clean up data attributes
      delete highlightedElement.dataset.originalClasses;
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from closing the tour
  };

  // Keyboard shortcuts for tour navigation
  useKeyboardShortcuts([
    {
      ...SHORTCUTS.TOUR_NEXT,
      action: nextStep,
    },
    {
      ...SHORTCUTS.TOUR_PREVIOUS,
      action: prevStep,
    },
    {
      ...SHORTCUTS.TOUR_CLOSE,
      action: skipTour,
    },
    {
      ...SHORTCUTS.TOUR_RESTART,
      action: restartTour,
    },
    {
      key: '?',
      description: 'Toggle keyboard shortcuts help',
      action: () => setShowKeyboardHelp(!showKeyboardHelp),
      context: 'tour',
    },
  ], {
    enabled: isOpen,
    context: 'tour',
  });

  if (!isOpen) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Lighter backdrop overlay - prevent click to close */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-15 z-[9996]"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Tooltip - Burn Wizard themed with smooth transitions */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-orange-200 dark:border-orange-700 p-6 max-w-sm w-full"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`
        }}
        role="dialog"
        aria-labelledby="tour-step-title"
        aria-describedby="tour-step-description"
        aria-live="polite"
        aria-modal="true"
      >
        {/* Drag handle bar - spans full width for better usability */}
        <div 
          className="absolute -top-2 left-0 right-0 h-6 bg-orange-200 dark:bg-orange-800 hover:bg-orange-300 dark:hover:bg-orange-700 rounded-t cursor-move transition-all duration-200 flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={resetWindowPosition}
          title="Drag to move • Double-click to center"
        >
          <div className="w-8 h-1 bg-orange-400 dark:bg-orange-500 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
              <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-300" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Step {currentStep + 1} of {tourSteps.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
              className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              title="Keyboard shortcuts (Press ?)"
              aria-label={showKeyboardHelp ? "Hide keyboard shortcuts" : "Show keyboard shortcuts"}
              aria-expanded={showKeyboardHelp}
              aria-controls="keyboard-help-panel"
            >
              <Keyboard className="w-4 h-4" />
            </button>
            <button
              onClick={restartTour}
              className="text-orange-400 hover:text-orange-600 dark:text-orange-500 dark:hover:text-orange-300 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded"
              title="Restart tour from beginning (Press R)"
              aria-label="Restart guided tour from the beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              ref={closeButtonRef}
              onClick={skipTour}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
              title="Close tour (Press Esc)"
              aria-label="Close guided tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 id="tour-step-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {step.title}
          </h3>
          <p id="tour-step-description" className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress Bar - Orange theme */}
        <div className="mb-4" role="region" aria-labelledby="tour-progress-label">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span id="tour-progress-label">Progress</span>
            <span aria-label="Progress percentage">{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
          </div>
          <div 
            className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2"
            role="progressbar"
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={tourSteps.length}
            aria-label={`Step ${currentStep + 1} of ${tourSteps.length}`}
          >
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous step (Shift+Space)"
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
            title={currentStep === tourSteps.length - 1 ? 'Finish tour (Space)' : 'Next step (Space)'}
          >
            <span>{currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}</span>
            {currentStep === tourSteps.length - 1 ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Additional Options */}
        <div className="mt-4 text-center space-x-4">
          <button
            onClick={restartTour}
            className="text-sm text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-200 transition-colors"
            title="Restart tour from beginning"
          >
            Restart tour
          </button>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <button
            onClick={skipTour}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Skip guided tour"
          >
            Skip tour
          </button>
        </div>

        {/* Keyboard Shortcuts Help Panel */}
        {showKeyboardHelp && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Keyboard Shortcuts</h4>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-blue-800 dark:text-blue-200">Next step</span>
                <kbd className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded font-mono text-blue-900 dark:text-blue-100">Space</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-800 dark:text-blue-200">Previous step</span>
                <kbd className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded font-mono text-blue-900 dark:text-blue-100">Shift+Space</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-800 dark:text-blue-200">Restart tour</span>
                <kbd className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded font-mono text-blue-900 dark:text-blue-100">R</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-800 dark:text-blue-200">Close tour</span>
                <kbd className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded font-mono text-blue-900 dark:text-blue-100">Esc</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-800 dark:text-blue-200">Toggle this help</span>
                <kbd className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded font-mono text-blue-900 dark:text-blue-100">?</kbd>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* CSS for the highlight effect and animation */}
      <style>{`
        .tour-highlight {
          background-color: rgba(249, 115, 22, 0.12) !important;
          border-radius: 12px !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          transform: scale(1.05) !important;
          box-shadow: 
            0 0 0 3px rgba(249, 115, 22, 0.4),
            0 0 20px rgba(249, 115, 22, 0.3),
            0 15px 35px -5px rgba(249, 115, 22, 0.25),
            0 25px 65px -15px rgba(249, 115, 22, 0.15) !important;
          filter: brightness(1.15) saturate(1.2) contrast(1.05) !important;
          animation: tour-highlight-pulse 2s ease-in-out infinite !important;
        }

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
