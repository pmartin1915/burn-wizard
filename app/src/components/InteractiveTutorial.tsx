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
  clearStepTimings,
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
  const [targetElement, setTargetElement] = React.useState<HTMLElement | null>(null);
  const [additionalElements, setAdditionalElements] = React.useState<HTMLElement[]>([]);
  
  // Drag functionality state
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Check if current step validation is satisfied
  const isStepValid = validationContext 
    ? validateTutorialStep(step, validationContext)
    : true;

  // Drag event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragOffset({ x: offsetX, y: offsetY });
    
    // Set initial position if not already set
    if (!position) {
      setPosition({ x: rect.left, y: rect.top });
    }
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging || !cardRef.current) return;
    
    const cardWidth = cardRef.current.offsetWidth;
    const cardHeight = cardRef.current.offsetHeight;
    
    // Calculate new position
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;
    
    // Apply boundary constraints
    const margin = 10;
    newX = Math.max(margin, Math.min(window.innerWidth - cardWidth - margin, newX));
    newY = Math.max(margin, Math.min(window.innerHeight - cardHeight - margin, newY));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragOffset]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Reset position when step changes to allow smart positioning
  React.useEffect(() => {
    setPosition(null);
    setIsDragging(false);
  }, [step.id]);

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
      const findTarget = (attempt = 1, maxAttempts = 5) => {
        const element = document.querySelector(step.target!) as HTMLElement;
        
        if (!element && attempt < maxAttempts) {
          // Element not found, try again after a short delay
          setTimeout(() => findTarget(attempt + 1, maxAttempts), 200);
          return;
        }
        
        setTargetElement(element);
        
        // Find additional target elements
        const additionalEls: HTMLElement[] = [];
        if (step.additionalTargets) {
          step.additionalTargets.forEach(selector => {
            const el = document.querySelector(selector) as HTMLElement;
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
      setTimeout(() => findTarget(), 300);
    }
  }, [step.target, step.id, step.additionalTargets, onNavigate]);

  // Recalculate position on window resize and step changes
  React.useEffect(() => {
    const handleResize = () => {
      // Force re-render to recalculate position
      if (targetElement && step.target) {
        const freshElement = document.querySelector(step.target) as HTMLElement;
        if (freshElement) {
          setTargetElement(freshElement);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [targetElement, step.target]);

  // Force position recalculation when step changes (for previous/next navigation)
  React.useEffect(() => {
    if (step.target && targetElement) {
      // Small delay to ensure DOM is ready, then refresh target element
      const refreshTimer = setTimeout(() => {
        const freshElement = document.querySelector(step.target!) as HTMLElement;
        if (freshElement && freshElement !== targetElement) {
          setTargetElement(freshElement);
        }
      }, 50);
      
      return () => clearTimeout(refreshTimer);
    }
  }, [step.id, step.target]);

  const getPositionClasses = () => {
    // Always use fixed positioning with smart placement and high z-index
    return 'fixed';
  };

  const getPositionStyles = () => {
    // Use dragged position if available
    if (position) {
      return {
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'none'
      };
    }
    
    // Always center if no target element or center position specified
    if (!targetElement || step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const margin = 20; // Reduced margin for better fit
    const dialogWidth = 384; // max-w-md is roughly 384px
    const maxDialogHeight = Math.min(600, window.innerHeight * 0.8); // Dynamic height
    
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Simplified positioning: try preferred position, then center as fallback
    // Reduced from 6 positions to 2 to prevent visual jumping
    const positions = [step.position || 'bottom', 'center'];
    
    for (const position of positions) {
      let top = 0;
      let left = 0;
      let transform = '';
      let isValid = true;

      switch (position) {
        case 'top':
          top = rect.top - maxDialogHeight - margin;
          left = Math.max(margin, Math.min(viewport.width - dialogWidth - margin, rect.left + rect.width / 2 - dialogWidth / 2));
          transform = 'translateY(0)';
          isValid = top >= margin;
          break;
          
        case 'bottom':
          top = rect.bottom + margin;
          left = Math.max(margin, Math.min(viewport.width - dialogWidth - margin, rect.left + rect.width / 2 - dialogWidth / 2));
          transform = 'translateY(0)';
          isValid = top + maxDialogHeight <= viewport.height - margin;
          break;
          
        case 'left':
          top = Math.max(margin, Math.min(viewport.height - maxDialogHeight - margin, rect.top + rect.height / 2 - maxDialogHeight / 2));
          left = rect.left - dialogWidth - margin;
          transform = 'translateX(0)';
          isValid = left >= margin;
          break;
          
        case 'right':
          top = Math.max(margin, Math.min(viewport.height - maxDialogHeight - margin, rect.top + rect.height / 2 - maxDialogHeight / 2));
          left = rect.right + margin;
          transform = 'translateX(0)';
          isValid = left + dialogWidth <= viewport.width - margin;
          break;
          
        case 'center':
          return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          };
      }

      if (isValid) {
        return {
          top: `${Math.max(margin, top)}px`,
          left: `${Math.max(margin, left)}px`,
          transform
        };
      }
    }

    // Ultimate fallback: center on screen
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  };

  React.useEffect(() => {
    // Add highlight to primary target element
    if (targetElement) {
      // Store original styles for cleanup
      const originalStyles = new Map();
      originalStyles.set('position', targetElement.style.position);
      originalStyles.set('zIndex', targetElement.style.zIndex);
      originalStyles.set('backgroundColor', targetElement.style.backgroundColor);
      originalStyles.set('borderRadius', targetElement.style.borderRadius);
      originalStyles.set('transition', targetElement.style.transition);
      originalStyles.set('transform', targetElement.style.transform);
      originalStyles.set('boxShadow', targetElement.style.boxShadow);
      originalStyles.set('filter', targetElement.style.filter);
      originalStyles.set('isolation', targetElement.style.isolation);
      
      // Apply bright highlighting like the tutorial dialog - all primary targets get same treatment
      const computedStyle = window.getComputedStyle(targetElement);
      if (computedStyle.position !== 'fixed') {
        targetElement.style.position = originalStyles.get('position') || 'relative';
      }
      targetElement.style.zIndex = '9999';
      targetElement.style.isolation = 'isolate'; // Create new stacking context
      targetElement.style.backgroundColor = 'white'; // Same as tutorial dialog
      targetElement.style.borderRadius = '12px';
      targetElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      targetElement.style.transform = 'scale(1.05)';
      targetElement.style.boxShadow = `
        0 0 0 3px rgba(45, 158, 142, 0.4),
        0 0 20px rgba(45, 158, 142, 0.3),
        0 15px 35px -5px rgba(45, 158, 142, 0.25),
        0 25px 65px -15px rgba(45, 158, 142, 0.15)
      `;
      targetElement.style.filter = 'brightness(1.15) saturate(1.2) contrast(1.05)';
      
      // Add action type for enhanced styling
      if (step.action) {
        targetElement.setAttribute('data-action', step.action);
      }
      
      // Set transform origin to prevent shifting
      const rect = targetElement.getBoundingClientRect();
      const isBottomRight = rect.right > window.innerWidth * 0.8 && rect.bottom > window.innerHeight * 0.8;
      targetElement.style.transformOrigin = isBottomRight ? 'bottom right' : 'center';
      
      // Store original styles for cleanup
      targetElement.dataset.originalStyles = JSON.stringify(Object.fromEntries(originalStyles));
      
      // Ensure parent containers have proper z-index
      const parentOriginalStyles = new Map();
      let element = targetElement.parentElement;
      while (element && element !== document.body) {
        if (element.tagName.toLowerCase() === 'aside' || 
            element.classList.contains('burn-wizard-card') ||
            element.getAttribute('data-element') === 'patient-info' ||
            element.getAttribute('data-element') === 'body-map' ||
            element.getAttribute('data-element') === 'tbsa-display' ||
            element.getAttribute('data-field') === 'burn-depth-selector' ||
            element.getAttribute('data-region') === 'Head' ||
            element.classList.contains('card') ||
            element.classList.contains('bg-card')) {
          // Found a container that needs elevated z-index (above backdrop at 9990)
          parentOriginalStyles.set(element, element.style.zIndex);
          element.style.zIndex = '9999';
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
        // Restore original styles
        if (targetElement.dataset.originalStyles) {
          const originalStyles = JSON.parse(targetElement.dataset.originalStyles);
          targetElement.style.position = originalStyles.position || '';
          targetElement.style.zIndex = originalStyles.zIndex || '';
          targetElement.style.backgroundColor = originalStyles.backgroundColor || '';
          targetElement.style.borderRadius = originalStyles.borderRadius || '';
          targetElement.style.transition = originalStyles.transition || '';
          targetElement.style.transform = originalStyles.transform || '';
          targetElement.style.boxShadow = originalStyles.boxShadow || '';
          targetElement.style.filter = originalStyles.filter || '';
          targetElement.style.isolation = originalStyles.isolation || '';
          targetElement.style.transformOrigin = '';
          delete targetElement.dataset.originalStyles;
        }
        
        if (step.action) {
          targetElement.removeAttribute('data-action');
        }
        if (step.action === 'click') {
          targetElement.removeEventListener('click', handleTutorialClick, false);
        }
        
        // Restore parent container z-index values
        for (const [element, originalZIndex] of parentOriginalStyles) {
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
      const elementsData = new Map();
      
      additionalElements.forEach((element, index) => {
        // Give main container elements the same bright highlighting as primary targets
        const isMainContainer = element.getAttribute('data-element') === 'patient-info' ||
                               element.getAttribute('data-element') === 'body-map' ||
                               element.getAttribute('data-element') === 'tbsa-display' ||
                               element.getAttribute('data-field') === 'burn-depth-selector' ||
                               element.getAttribute('data-region') === 'Head';
        
        if (isMainContainer) {
          // Store original styles
          const originalStyles = {
            position: element.style.position,
            zIndex: element.style.zIndex,
            backgroundColor: element.style.backgroundColor,
            borderRadius: element.style.borderRadius,
            transition: element.style.transition,
            transform: element.style.transform,
            boxShadow: element.style.boxShadow,
            filter: element.style.filter,
            isolation: element.style.isolation
          };
          elementsData.set(element, originalStyles);
          
          // Apply bright highlighting like tutorial dialog
          const computedStyle = window.getComputedStyle(element);
          if (computedStyle.position !== 'fixed') {
            element.style.position = originalStyles.position || 'relative';
          }
          element.style.zIndex = '9999';
          element.style.isolation = 'isolate'; // Create new stacking context
          element.style.backgroundColor = 'white'; // Same as tutorial dialog
          element.style.borderRadius = '12px';
          element.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
          element.style.transform = 'scale(1.05)';
          element.style.boxShadow = `
            0 0 0 3px rgba(45, 158, 142, 0.4),
            0 0 20px rgba(45, 158, 142, 0.3),
            0 15px 35px -5px rgba(45, 158, 142, 0.25),
            0 25px 65px -15px rgba(45, 158, 142, 0.15)
          `;
          element.style.filter = 'brightness(1.15) saturate(1.2) contrast(1.05)';
          element.style.transformOrigin = 'center';
        } else {
          // Other additional elements get secondary highlighting (keep CSS-based)
          element.classList.add('tutorial-highlight-secondary');
        }
      });

      return () => {
        additionalElements.forEach(element => {
          const originalStyles = elementsData.get(element);
          if (originalStyles) {
            // Restore bright highlighted elements
            element.style.position = originalStyles.position || '';
            element.style.zIndex = originalStyles.zIndex || '';
            element.style.backgroundColor = originalStyles.backgroundColor || '';
            element.style.borderRadius = originalStyles.borderRadius || '';
            element.style.transition = originalStyles.transition || '';
            element.style.transform = originalStyles.transform || '';
            element.style.boxShadow = originalStyles.boxShadow || '';
            element.style.filter = originalStyles.filter || '';
            element.style.isolation = originalStyles.isolation || '';
            element.style.transformOrigin = '';
          } else {
            // Remove CSS-based secondary highlighting
            element.classList.remove('tutorial-highlight-secondary');
          }
        });
      };
    }
  }, [additionalElements, step.id]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-[9990]" />
      
      {/* Tutorial Card */}
      <Card 
        ref={cardRef}
        className={cn(
          'w-full max-w-md shadow-2xl border-primary/20 bg-white dark:bg-card max-h-[80vh] overflow-y-auto',
          step.emphasize && 'border-primary',
          getPositionClasses(),
          isDragging && 'cursor-grabbing select-none',
          !isDragging && 'cursor-grab'
        )}
        style={{...getPositionStyles(), zIndex: 9999, maxHeight: `${Math.min(600, window.innerHeight * 0.8)}px`}}
      >
        <CardHeader className="pb-3" onMouseDown={handleMouseDown}>
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
              onMouseDown={(e) => e.stopPropagation()}
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
              onMouseDown={(e) => e.stopPropagation()}
              disabled={isFirst}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={onNext}
              onMouseDown={(e) => e.stopPropagation()}
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
    // Clear any previous step timings for clean restart
    clearStepTimings();
    
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
      // Increased delay to give users time to read and understand the step
      // Previous: 2500ms (2.5s) was too fast for users to read instructions
      const timer = setTimeout(() => {
        nextStep();
      }, 6000); // Increased to 6 seconds for better user experience
      
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
          z-index: 9995 !important;
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
          z-index: 9995 !important;
        }
        
        /* Special handling for sidebar during tutorials */
        aside:has(.tutorial-highlight) {
          z-index: 9995 !important;
        }
        
        /* Special handling for patient info cards and other containers */
        .burn-wizard-card:has(.tutorial-highlight),
        [data-element="patient-info"]:has(.tutorial-highlight),
        [data-element="body-map"]:has(.tutorial-highlight),
        [data-element="tbsa-display"]:has(.tutorial-highlight),
        [data-field="burn-depth-selector"]:has(.tutorial-highlight),
        [data-region="Head"]:has(.tutorial-highlight),
        .card:has(.tutorial-highlight) {
          z-index: 9995 !important;
        }
        
        /* Special handling for SVG elements in tutorials */
        svg .tutorial-highlight,
        svg path.tutorial-highlight {
          stroke: #2d9e8e !important;
          stroke-width: 4 !important;
          filter: drop-shadow(0 0 8px rgba(45, 158, 142, 0.6));
        }
        
        /* Make all main tutorial target containers glow with bright highlighting */
        [data-element="patient-info"].tutorial-highlight,
        [data-element="body-map"].tutorial-highlight,
        [data-element="tbsa-display"].tutorial-highlight,
        [data-field="burn-depth-selector"].tutorial-highlight,
        [data-region="Head"].tutorial-highlight {
          transform: scale(1.05);
          background-color: white !important;
          border-radius: 12px !important;
          box-shadow: 
            0 0 0 3px rgba(45, 158, 142, 0.4),
            0 0 20px rgba(45, 158, 142, 0.3),
            0 15px 35px -5px rgba(45, 158, 142, 0.25),
            0 25px 65px -15px rgba(45, 158, 142, 0.15) !important;
          filter: brightness(1.15) saturate(1.2) contrast(1.05) !important;
        }
        
        /* Ensure nested elements also get proper highlighting */
        [data-element="patient-info"] .tutorial-highlight,
        [data-element="body-map"] .tutorial-highlight,
        [data-element="tbsa-display"] .tutorial-highlight,
        [data-field="burn-depth-selector"] .tutorial-highlight,
        [data-region="Head"] .tutorial-highlight {
          transform: scale(1.05);
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
          z-index: 9995 !important;
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