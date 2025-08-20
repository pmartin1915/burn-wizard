import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  X,
  CheckCircle2,
  Clock,
  Star,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getAvailableTutorials,
  getTutorialById,
  validateTutorialStep,
  shouldAutoAdvanceStep,
  type Tutorial,
  type TutorialStep
} from '@/domain/tutorialSteps';
import { useWizardStore } from '@/store/useWizardStore';

interface InteractiveTutorialProps {
  className?: string;
  onNavigate?: (tab: string) => void;
}

interface TutorialOverlayProps {
  step: TutorialStep;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  isFirst: boolean;
  isLast: boolean;
  stepNumber: number;
  totalSteps: number;
  onNavigate?: (tab: string) => void;
  validationContext?: {
    currentRoute?: string;
    patientData?: Record<string, unknown>;
    regionSelections?: unknown[];
  };
}

function TutorialOverlay({
  step,
  onNext,
  onPrevious,
  onClose,
  isFirst,
  isLast,
  stepNumber,
  totalSteps,
  onNavigate,
  validationContext
}: TutorialOverlayProps) {
  const [targetElement, setTargetElement] = React.useState<Element | null>(null);
  const [additionalElements, setAdditionalElements] = React.useState<Element[]>([]);

  // Check if current step validation is satisfied
  const isStepValid = validationContext 
    ? validateTutorialStep(step, validationContext)
    : true;

  React.useEffect(() => {
    // Auto-navigate to the correct tab for specific tutorial steps
    if (onNavigate) {
      if (step.id === 'patient-data' || step.id === 'body-map-intro' || step.id === 'tbsa-calculation') {
        // These steps require being on the TBSA tab
        onNavigate('tbsa');
      }
    }
    
    if (step.target) {
      // Wait a bit for navigation to complete before finding target element
      const findTarget = () => {
        const element = document.querySelector(step.target!);
        setTargetElement(element);
        
        // Find additional target elements
        const additionalEls: Element[] = [];
        if (step.additionalTargets) {
          step.additionalTargets.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) additionalEls.push(el);
          });
        }
        setAdditionalElements(additionalEls);
        
        // Scroll primary target into view
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      
      // Delay to allow navigation to complete
      setTimeout(findTarget, 100);
    }
  }, [step.target, step.id, step.additionalTargets, onNavigate]);

  // Recalculate position on window resize
  React.useEffect(() => {
    const handleResize = () => {
      // Force re-render to recalculate position
      if (targetElement) {
        setTargetElement(targetElement);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [targetElement]);

  const getPositionClasses = () => {
    // Always use fixed positioning with smart placement and high z-index
    return 'fixed';
  };

  const getPositionStyles = () => {
    if (!targetElement || step.position === 'center') {
      // Center on screen
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const margin = 20;
    const dialogWidth = 384; // max-w-md is roughly 384px
    const dialogHeight = 300; // estimated dialog height
    
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let top = 0;
    let left = 0;
    let transform = '';

    // Calculate preferred position
    switch (step.position) {
      case 'top':
        top = rect.top - dialogHeight - margin;
        left = rect.left + rect.width / 2;
        transform = 'translateX(-50%)';
        
        // If too high, move below target
        if (top < margin) {
          top = rect.bottom + margin;
        }
        break;
        
      case 'bottom':
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2;
        transform = 'translateX(-50%)';
        
        // If too low, move above target
        if (top + dialogHeight > viewport.height - margin) {
          top = rect.top - dialogHeight - margin;
        }
        break;
        
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - dialogWidth - margin;
        transform = 'translateY(-50%)';
        
        // If too far left, move to right side
        if (left < margin) {
          left = rect.right + margin;
        }
        break;
        
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + margin;
        transform = 'translateY(-50%)';
        
        // If too far right, move to left side
        if (left + dialogWidth > viewport.width - margin) {
          left = rect.left - dialogWidth - margin;
        }
        break;
        
      default:
        // Fallback to center
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }

    // Final boundary checks - if still off screen, center it
    if (left < margin || left + dialogWidth > viewport.width - margin ||
        top < margin || top + dialogHeight > viewport.height - margin) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
      transform
    };
  };

  React.useEffect(() => {
    // Add highlight to primary target element
    if (targetElement) {
      targetElement.classList.add('tutorial-highlight');
      
      // Add action type for enhanced styling
      if (step.action) {
        targetElement.setAttribute('data-action', step.action);
      }
      
      // Ensure the element and its parents have proper z-index for visibility above backdrop
      const originalStyles = new Map();
      let element = targetElement.parentElement;
      while (element && element !== document.body) {
        if (element.tagName.toLowerCase() === 'aside') {
          // Found the sidebar container
          originalStyles.set(element, element.style.zIndex);
          element.style.zIndex = '9999';
          break;
        }
        element = element.parentElement;
      }
      
      // Add click handler for clickable tutorial steps
      const handleTutorialClick = (_event: Event) => {
        if (step.action === 'click') {
          // Handle navigation for specific tutorial steps
          if (step.id === 'navigation' && onNavigate) {
            // Step 2: Navigate to TBSA tab
            onNavigate('tbsa');
          }
          
          // Don't prevent the default action - let the normal click behavior happen
          // Then advance the tutorial after a brief delay
          setTimeout(() => {
            onNext();
          }, 500);
        }
      };
      
      if (step.action === 'click') {
        targetElement.addEventListener('click', handleTutorialClick, false);
      }
      
      return () => {
        targetElement.classList.remove('tutorial-highlight');
        if (step.action) {
          targetElement.removeAttribute('data-action');
        }
        if (step.action === 'click') {
          targetElement.removeEventListener('click', handleTutorialClick, false);
        }
        
        // Restore original z-index values
        for (const [element, originalZIndex] of originalStyles) {
          if (originalZIndex) {
            element.style.zIndex = originalZIndex;
          } else {
            element.style.removeProperty('z-index');
          }
        }
      };
    }
  }, [targetElement, step.action, step.id, onNext, onNavigate]);

  // Add highlighting to additional target elements
  React.useEffect(() => {
    if (additionalElements.length > 0) {
      additionalElements.forEach(element => {
        element.classList.add('tutorial-highlight-secondary');
      });

      return () => {
        additionalElements.forEach(element => {
          element.classList.remove('tutorial-highlight-secondary');
        });
      };
    }
  }, [additionalElements]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990]" />
      
      {/* Tutorial Card */}
      <Card 
        className={cn(
          'w-full max-w-md shadow-2xl border-primary/20 bg-white dark:bg-card',
          step.emphasize && 'border-primary',
          getPositionClasses()
        )}
        style={{...getPositionStyles(), zIndex: 9999}}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Step {stepNumber} of {totalSteps}
                </Badge>
                {step.emphasize && (
                  <Star className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <CardTitle className="text-lg">{step.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Content */}
          <div className="prose prose-sm max-w-none">
            {step.content.split('\n').map((paragraph, index) => {
              if (paragraph.trim().startsWith('•')) {
                return (
                  <ul key={index} className="my-2 space-y-1">
                    <li className="text-sm text-muted-foreground">
                      {paragraph.trim().substring(1).trim()}
                    </li>
                  </ul>
                );
              }
              if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
                return (
                  <h4 key={index} className="font-medium text-sm mt-3 mb-1">
                    {paragraph.trim().slice(2, -2)}
                  </h4>
                );
              }
              if (paragraph.trim()) {
                return (
                  <p key={index} className="text-sm text-muted-foreground">
                    {paragraph.trim()}
                  </p>
                );
              }
              return null;
            })}
          </div>

          {/* Action hint */}
          {step.action && step.action !== 'observe' && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">
                {step.action === 'click' && 'Click the highlighted element to continue'}
                {step.action === 'input' && 'Enter the required information'}
                {step.action === 'navigate' && 'Navigate to the specified section'}
              </span>
            </div>
          )}

          {/* Validation status */}
          {step.validation && (
            <div className={cn(
              "flex items-center gap-2 p-2 rounded-md text-xs",
              isStepValid 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-amber-50 text-amber-700 border border-amber-200"
            )}>
              {isStepValid ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Step completed! You can proceed to the next step.
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  {step.validation.type === 'route' && 'Navigate to the correct section first'}
                  {step.validation.type === 'value' && 'Complete the required information'}
                  {step.validation.type === 'element' && 'Complete the required action'}
                  {step.validation.type === 'custom' && 'Complete the required task'}
                </>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={isFirst}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={onNext}
              size="sm"
              className={cn(
                "flex items-center gap-1",
                step.validation && !isStepValid && "bg-muted text-muted-foreground",
                step.validation && isStepValid && "bg-green-600 hover:bg-green-700 text-white"
              )}
              disabled={step.validation && !isStepValid}
            >
              {step.validation && isStepValid && <CheckCircle2 className="h-4 w-4" />}
              {isLast ? (
                "Complete"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function InteractiveTutorial({ className, onNavigate }: InteractiveTutorialProps) {
  const { 
    tutorials,
    patientData,
    regionSelections,
    startTutorial: startTutorialAction,
    completeTutorial: completeTutorialAction,
    updateTutorialProgress,
    closeTutorial: closeTutorialAction,
    markIntroductionSeen
  } = useWizardStore();
  
  const [currentRoute, setCurrentRoute] = React.useState<string>('tbsa'); // Default route

  const availableTutorials = getAvailableTutorials(tutorials.completedTutorials);
  
  // Get current tutorial and step from store
  const selectedTutorial = tutorials.currentProgress
    ? getTutorialById(tutorials.currentProgress.tutorialId)
    : null;
    
  const currentStepIndex = selectedTutorial && tutorials.currentProgress
    ? selectedTutorial.steps.findIndex(step => step.id === tutorials.currentProgress!.currentStepId)
    : 0;

  // Create validation context for current app state
  const validationContext = React.useMemo(() => ({
    currentRoute,
    patientData: patientData as unknown as Record<string, unknown>,
    regionSelections,
  }), [currentRoute, patientData, regionSelections]);

  const startTutorial = (tutorial: Tutorial) => {
    startTutorialAction(tutorial.id);
    // Set to first step
    if (tutorial.steps.length > 0) {
      updateTutorialProgress(tutorial.steps[0].id);
    }
  };

  const handleNavigate = (tab: string) => {
    setCurrentRoute(tab);
    onNavigate?.(tab);
  };

  const closeTutorial = () => {
    closeTutorialAction();
  };

  const nextStep = () => {
    if (!selectedTutorial || !tutorials.currentProgress) return;
    
    if (currentStepIndex >= selectedTutorial.steps.length - 1) {
      // Tutorial completed
      completeTutorialAction(selectedTutorial.id);
    } else {
      const nextStepId = selectedTutorial.steps[currentStepIndex + 1]?.id;
      if (nextStepId) {
        updateTutorialProgress(nextStepId);
      }
    }
  };

  const previousStep = () => {
    if (!selectedTutorial || !tutorials.currentProgress || currentStepIndex <= 0) return;
    
    const previousStepId = selectedTutorial.steps[currentStepIndex - 1]?.id;
    if (previousStepId) {
      updateTutorialProgress(previousStepId);
    }
  };

  const getDifficultyColor = (category: Tutorial['category']) => {
    switch (category) {
      case 'basics': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'assessment': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'scenarios': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    }
  };

  const currentStep = selectedTutorial?.steps[currentStepIndex];

  // Auto-advancement effect
  React.useEffect(() => {
    if (!currentStep || !selectedTutorial || !tutorials.currentProgress) return;
    
    // Check if current step should auto-advance
    if (shouldAutoAdvanceStep(currentStep, validationContext)) {
      // Add a small delay to make the user experience smoother
      const timer = setTimeout(() => {
        nextStep();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [validationContext, currentStep, selectedTutorial, tutorials.currentProgress]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Tutorial List */}
      {!tutorials.isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Interactive Tutorials
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Step-by-step guides to master burn assessment. Perfect for beginners and those wanting to refresh their knowledge.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableTutorials.map((tutorial) => (
                <Card key={tutorial.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{tutorial.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {tutorial.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {tutorial.estimatedTime} min
                          </span>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(tutorial.category)}>
                          {tutorial.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {tutorial.steps.length} steps
                        </Badge>
                        {tutorials.completedTutorials.includes(tutorial.id) && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>

                      {/* Prerequisites */}
                      {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Prerequisites:</span>{' '}
                          {tutorial.prerequisites.join(', ')}
                        </div>
                      )}

                      {/* Action button */}
                      <Button
                        onClick={() => startTutorial(tutorial)}
                        className="w-full h-8"
                        size="sm"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        {tutorials.completedTutorials.includes(tutorial.id) ? 'Replay Tutorial' : 'Start Tutorial'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Tutorial Overlay */}
      {tutorials.isActive && selectedTutorial && currentStep && (
        <TutorialOverlay
          step={currentStep}
          onNext={nextStep}
          onPrevious={previousStep}
          onClose={closeTutorial}
          isFirst={currentStepIndex === 0}
          isLast={currentStepIndex === selectedTutorial.steps.length - 1}
          stepNumber={currentStepIndex + 1}
          totalSteps={selectedTutorial.steps.length}
          onNavigate={handleNavigate}
          validationContext={validationContext}
        />
      )}

      {/* Tutorial highlight styles */}
      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 9999 !important;
          border-radius: 8px;
          transition: all 0.3s ease-in-out;
          box-shadow: 
            0 0 0 3px #2d9e8e,
            0 0 20px 5px rgba(45, 158, 142, 0.4),
            0 0 40px 10px rgba(45, 158, 142, 0.2),
            0 0 60px 15px rgba(45, 158, 142, 0.1);
          animation: tutorial-glow 2s ease-in-out infinite;
        }
        
        /* Ensure parent containers of highlighted elements also have proper z-index */
        .tutorial-highlight,
        .tutorial-highlight * {
          z-index: 9999 !important;
        }
        
        /* Special handling for sidebar during tutorials */
        aside:has(.tutorial-highlight) {
          z-index: 9999 !important;
        }
        
        .tutorial-highlight::before {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 14px;
          background: linear-gradient(
            45deg,
            #2d9e8e 0%,
            rgba(45, 158, 142, 0.8) 25%,
            rgba(45, 158, 142, 0.6) 50%,
            rgba(45, 158, 142, 0.8) 75%,
            #2d9e8e 100%
          );
          background-size: 200% 100%;
          opacity: 0.3;
          animation: tutorial-shimmer 3s linear infinite;
          pointer-events: none;
        }
        
        .tutorial-highlight::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 11px;
          background: rgba(45, 158, 142, 0.1);
          backdrop-filter: blur(1px);
          animation: tutorial-pulse-bg 2s ease-in-out infinite;
          pointer-events: none;
        }
        
        @keyframes tutorial-glow {
          0%, 100% { 
            box-shadow: 
              0 0 0 3px #2d9e8e,
              0 0 20px 5px rgba(45, 158, 142, 0.4),
              0 0 40px 10px rgba(45, 158, 142, 0.2),
              0 0 60px 15px rgba(45, 158, 142, 0.1);
          }
          50% { 
            box-shadow: 
              0 0 0 4px #2d9e8e,
              0 0 30px 8px rgba(45, 158, 142, 0.6),
              0 0 50px 15px rgba(45, 158, 142, 0.3),
              0 0 80px 20px rgba(45, 158, 142, 0.15);
          }
        }
        
        @keyframes tutorial-shimmer {
          0% { 
            background-position: -200% 0;
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
          100% { 
            background-position: 200% 0;
            opacity: 0.2;
          }
        }
        
        @keyframes tutorial-pulse-bg {
          0%, 100% { 
            opacity: 0.1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.2;
            transform: scale(1.02);
          }
        }
        
        /* Enhanced highlighting for clickable elements */
        .tutorial-highlight[data-action="click"] {
          cursor: pointer;
          transform: scale(1.02);
        }
        
        .tutorial-highlight[data-action="click"]:hover {
          transform: scale(1.05);
          box-shadow: 
            0 0 0 4px #2d9e8e,
            0 0 25px 8px rgba(45, 158, 142, 0.5),
            0 0 50px 15px rgba(45, 158, 142, 0.3),
            0 0 80px 20px rgba(45, 158, 142, 0.2);
        }
        
        /* Secondary highlight for additional elements - more subtle */
        .tutorial-highlight-secondary {
          position: relative;
          z-index: 9998 !important;
          border-radius: 8px;
          transition: all 0.3s ease-in-out;
          box-shadow: 
            0 0 0 2px rgba(45, 158, 142, 0.6),
            0 0 15px 3px rgba(45, 158, 142, 0.2),
            0 0 30px 6px rgba(45, 158, 142, 0.1);
          animation: tutorial-glow-secondary 3s ease-in-out infinite;
        }
        
        .tutorial-highlight-secondary::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 11px;
          background: linear-gradient(
            45deg,
            rgba(45, 158, 142, 0.4) 0%,
            rgba(45, 158, 142, 0.2) 50%,
            rgba(45, 158, 142, 0.4) 100%
          );
          background-size: 200% 100%;
          opacity: 0.15;
          animation: tutorial-shimmer 4s linear infinite;
          pointer-events: none;
        }
        
        @keyframes tutorial-glow-secondary {
          0%, 100% { 
            box-shadow: 
              0 0 0 2px rgba(45, 158, 142, 0.6),
              0 0 15px 3px rgba(45, 158, 142, 0.2),
              0 0 30px 6px rgba(45, 158, 142, 0.1);
          }
          50% { 
            box-shadow: 
              0 0 0 3px rgba(45, 158, 142, 0.8),
              0 0 20px 5px rgba(45, 158, 142, 0.3),
              0 0 40px 8px rgba(45, 158, 142, 0.15);
          }
        }
      `}</style>
    </div>
  );
}