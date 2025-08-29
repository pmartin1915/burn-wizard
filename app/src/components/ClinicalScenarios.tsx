import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  BookOpen, 
  Users, 
  AlertTriangle, 
  CheckCircle2,
  RotateCcw,
  ChevronRight 
} from 'lucide-react';
import { useWizardStore } from '@/store/useWizardStore';
import { 
  getAllScenarios, 
  type ClinicalScenario 
} from '@/domain/clinicalScenarios';

interface ClinicalScenariosProps {
  className?: string;
}

export default function ClinicalScenarios({ className }: ClinicalScenariosProps) {
  const [selectedScenario, setSelectedScenario] = React.useState<ClinicalScenario | null>(null);
  const [isActive, setIsActive] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const { setPatientData, clearAllData } = useWizardStore();
  
  const scenarios = getAllScenarios();

  const getDifficultyColor = (difficulty: ClinicalScenario['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    }
  };

  const getCategoryIcon = (category: ClinicalScenario['category']) => {
    switch (category) {
      case 'pediatric': return '👶';
      case 'adult': return '👤';  
      case 'elderly': return '👴';
      case 'special': return '⚠️';
      default: return '📋';
    }
  };

  const loadScenario = (scenario: ClinicalScenario) => {
    // Clear existing data
    clearAllData();
    
    // Load patient data
    setPatientData(scenario.patientData);
    
    // Load burn regions
    scenario.burnRegions.forEach(region => {
      useWizardStore.getState().setRegionSelection(
        region.region, 
        region.fraction, 
        region.depth
      );
    });
    
    setSelectedScenario(scenario);
    setIsActive(true);
    setShowResults(false);
  };

  const resetScenario = () => {
    clearAllData();
    setIsActive(false);
    setShowResults(false);
    setSelectedScenario(null);
  };

  const showExpectedResults = () => {
    setShowResults(true);
  };

  if (!selectedScenario && !isActive) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" />
              Clinical Training Scenarios
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Practice burn assessment with realistic clinical cases. Each scenario includes learning objectives and teaching points.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((scenario) => (
                <Card key={scenario.id} className="medical-card hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium text-sm">{scenario.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {scenario.description}
                          </p>
                        </div>
                        <div className="text-lg ml-2">
                          {getCategoryIcon(scenario.category)}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(scenario.difficulty)}>
                          {scenario.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {scenario.category}
                        </Badge>
                      </div>

                      {/* Key details */}
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {scenario.patientData.ageMonths >= 216 ? 'Adult' : 'Pediatric'} 
                          ({Math.round(scenario.patientData.ageMonths / 12)}y, {scenario.patientData.weightKg}kg)
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Expected TBSA: {scenario.expectedTbsa}%
                        </div>
                      </div>

                      {/* Action button */}
                      <Button
                        onClick={() => loadScenario(scenario)}
                        className="w-full h-8 text-xs"
                        size="sm"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start Scenario
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active scenario view
  if (selectedScenario && isActive) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Scenario Header */}
        <Card className="medical-card border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(selectedScenario.difficulty)}>
                    {selectedScenario.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {getCategoryIcon(selectedScenario.category)} {selectedScenario.category}
                  </Badge>
                  <Badge variant="outline" className="text-primary">
                    Active Scenario
                  </Badge>
                </div>
                <CardTitle className="text-lg">{selectedScenario.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedScenario.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showExpectedResults}
                  disabled={showResults}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Show Results
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetScenario}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Clinical Presentation */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="text-base text-primary">Clinical Presentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-1">Backstory</h4>
              <p className="text-sm text-muted-foreground">{selectedScenario.backstory}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Presenting Complaint</h4>
              <p className="text-sm text-muted-foreground">{selectedScenario.presentingComplaint}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Physical Examination</h4>
              <p className="text-sm text-muted-foreground">{selectedScenario.physicalExam}</p>
            </div>
          </CardContent>
        </Card>

        {/* Learning Objectives */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="text-base text-primary">Learning Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {selectedScenario.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  {objective}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Expected Results (if shown) */}
        {showResults && (
          <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Expected Results & Teaching Points
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Expected outcomes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-background rounded-md border">
                <div>
                  <div className="text-xs text-muted-foreground">Expected TBSA</div>
                  <div className="text-lg font-bold text-primary">{selectedScenario.expectedTbsa}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Initial Fluid Rate</div>
                  <div className="text-lg font-bold text-primary">{selectedScenario.expectedFluidRate} ml/hr</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Burn Center Transfer</div>
                  <div className={`text-lg font-bold ${selectedScenario.expectedTransfer ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedScenario.expectedTransfer ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>

              {/* Teaching points */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Key Teaching Points</h4>
                  <ul className="space-y-1 text-sm">
                    {selectedScenario.keyTeachingPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Clinical Pearls</h4>
                  <ul className="space-y-1 text-sm">
                    {selectedScenario.clinicalPearls.map((pearl, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        {pearl}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Common Mistakes</h4>
                  <ul className="space-y-1 text-sm">
                    {selectedScenario.commonMistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Use the Body Map and other tools to assess this case. Click "Show Results" when ready to see the expected outcomes and teaching points.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}