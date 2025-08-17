import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Thermometer, 
  Clock, 
  AlertCircle, 
  Shield, 
  Activity,
  Brain,
  Users,
  Baby,
  User
} from 'lucide-react';
import { useWizardStore } from '@/store/useWizardStore';
import { calcAgeBand } from '@/domain/tbsa';

interface AnalgesiaTipsProps {
  className?: string;
}

interface PainManagementTip {
  category: string;
  icon: React.ComponentType<any>;
  tips: string[];
  ageSpecific?: {
    pediatric?: string[];
    adult?: string[];
  };
}

const PAIN_MANAGEMENT_TIPS: PainManagementTip[] = [
  {
    category: 'Non-Pharmacological Methods',
    icon: Heart,
    tips: [
      'Positioning for comfort and function',
      'Cool (not cold) compresses for immediate relief',
      'Distraction techniques during procedures',
      'Relaxation and breathing exercises',
      'Music therapy or other comfort measures'
    ],
    ageSpecific: {
      pediatric: [
        'Age-appropriate distraction (toys, games, videos)',
        'Parent/caregiver presence during care',
        'Child life specialist involvement',
        'Comfort positioning and swaddling for infants'
      ],
      adult: [
        'Guided imagery and meditation',
        'Progressive muscle relaxation',
        'Cognitive behavioral techniques',
        'Patient education about pain expectations'
      ]
    }
  },
  {
    category: 'Pharmacological Considerations',
    icon: Shield,
    tips: [
      'Pre-medicate before painful procedures',
      'Around-the-clock scheduling for severe burns',
      'Multimodal approach combining different drug classes',
      'Regular pain assessment and documentation'
    ],
    ageSpecific: {
      pediatric: [
        'Weight-based dosing calculations',
        'Age-appropriate pain scales (FLACC, Wong-Baker)',
        'Consider developmental stage for medication delivery',
        'Monitor for adverse effects more closely'
      ],
      adult: [
        'Consider patient-controlled analgesia (PCA)',
        'Assess for substance abuse history',
        'Monitor for tolerance and dependence',
        'Evaluate comorbidities affecting drug metabolism'
      ]
    }
  },
  {
    category: 'Procedural Pain Management',
    icon: Activity,
    tips: [
      'Adequate pre-medication 30-60 minutes before procedures',
      'Topical anesthetics when appropriate',
      'Efficient, gentle technique during dressing changes',
      'Consider procedural sedation for extensive debridement'
    ]
  },
  {
    category: 'Environmental Modifications',
    icon: Thermometer,
    tips: [
      'Maintain optimal room temperature',
      'Minimize unnecessary exposure',
      'Reduce environmental stimuli (noise, bright lights)',
      'Ensure privacy and dignity during care'
    ]
  },
  {
    category: 'Psychological Support',
    icon: Brain,
    tips: [
      'Acknowledge and validate pain experience',
      'Provide clear explanations of procedures',
      'Encourage patient participation in pain management',
      'Consider referral to mental health specialists for complex cases'
    ]
  }
];

const PAIN_ASSESSMENT_SCALES = {
  pediatric: [
    { name: 'FLACC Scale', age: '0-3 years', description: 'Face, Legs, Activity, Cry, Consolability' },
    { name: 'Wong-Baker FACES', age: '3+ years', description: 'Pictorial faces showing pain levels' },
    { name: 'Numeric Rating', age: '8+ years', description: '0-10 pain scale for older children' }
  ],
  adult: [
    { name: 'Numeric Rating Scale', age: 'Adults', description: '0-10 pain intensity scale' },
    { name: 'Visual Analog Scale', age: 'Adults', description: 'Line scale from no pain to worst pain' },
    { name: 'Behavioral Pain Scale', age: 'Intubated/Sedated', description: 'For patients unable to self-report' }
  ]
};

const MEDICATION_CLASSES = [
  {
    class: 'NSAIDs',
    examples: 'Ibuprofen, Ketorolac',
    notes: 'Anti-inflammatory effects, use with caution in renal impairment',
    education: 'Take with food, monitor for GI bleeding'
  },
  {
    class: 'Opioids',
    examples: 'Morphine, Oxycodone, Fentanyl',
    notes: 'For moderate to severe pain, monitor respiratory status',
    education: 'May cause drowsiness, constipation common side effect'
  },
  {
    class: 'Topical Anesthetics',
    examples: 'Lidocaine, Benzocaine preparations',
    notes: 'For procedural pain relief, avoid on large surface areas',
    education: 'Temporary numbness is normal, avoid touching eyes'
  },
  {
    class: 'Adjuvants',
    examples: 'Gabapentin, Pregabalin',
    notes: 'For neuropathic pain components',
    education: 'May take days to weeks for full effect'
  }
];

export default function AnalgesiaTips({ className }: AnalgesiaTipsProps) {
  const { patientData, tbsaResult } = useWizardStore();
  
  const ageBand = React.useMemo(() => {
    return calcAgeBand(patientData.ageMonths);
  }, [patientData.ageMonths]);
  
  const isPediatric = ageBand !== '15plus';
  const painAssessmentScales = isPediatric ? PAIN_ASSESSMENT_SCALES.pediatric : PAIN_ASSESSMENT_SCALES.adult;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Patient-Specific Overview */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            {isPediatric ? <Baby className="h-5 w-5" /> : <User className="h-5 w-5" />}
            Pain Management Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Patient Age:</p>
              <p className="font-medium">{isPediatric ? 'Pediatric' : 'Adult'} ({Math.floor(patientData.ageMonths / 12)} years)</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">TBSA Involved:</p>
              <p className="font-medium">{tbsaResult?.tbsaPct || 0}%</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Expected Pain Level:</p>
              <p className="font-medium">
                {!tbsaResult || tbsaResult.tbsaPct === 0 ? 'Minimal' :
                 tbsaResult.tbsaPct < 10 ? 'Mild to Moderate' :
                 tbsaResult.tbsaPct < 20 ? 'Moderate to Severe' : 'Severe'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pain Assessment Scales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recommended Pain Assessment Scales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {painAssessmentScales.map((scale, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{scale.name}</h4>
                  <span className="text-xs bg-secondary px-2 py-1 rounded">{scale.age}</span>
                </div>
                <p className="text-sm text-muted-foreground">{scale.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Assessment Frequency:</strong> Every 15-30 minutes during acute phase, 
              hourly when stable, and before/after interventions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pain Management Strategies */}
      {PAIN_MANAGEMENT_TIPS.map((category, index) => {
        const Icon = category.icon;
        return (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* General Tips */}
                <div>
                  <h4 className="font-medium mb-2 text-sm">General Approaches:</h4>
                  <ul className="space-y-1">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Age-Specific Tips */}
                {category.ageSpecific && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm">
                      {isPediatric ? 'Pediatric-Specific:' : 'Adult-Specific:'}
                    </h4>
                    <ul className="space-y-1">
                      {(isPediatric ? category.ageSpecific.pediatric : category.ageSpecific.adult)?.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Medication Classes Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Medication Classes (Educational Reference)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MEDICATION_CLASSES.map((med, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-primary">{med.class}</h4>
                    <p className="text-sm text-muted-foreground mt-1">Examples: {med.examples}</p>
                    <p className="text-sm mt-2">{med.notes}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-1">Patient Education:</h5>
                    <p className="text-sm text-muted-foreground">{med.education}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
            <p className="text-xs text-red-800 dark:text-red-200">
              <strong>Important:</strong> Specific medications, dosages, and protocols must be prescribed by 
              licensed healthcare providers. Always follow institutional guidelines and obtain appropriate orders.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Pain Management */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5" />
            When to Escalate Pain Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
              <span>Pain score consistently >7/10 despite interventions</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
              <span>Signs of inadequate pain control (hypertension, tachycardia, agitation)</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
              <span>Patient unable to participate in necessary care due to pain</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
              <span>Adverse reactions to current pain management regimen</span>
            </li>
          </ul>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            Contact Pain Management Team: {{PAIN_TEAM_CONTACT}}
          </Button>
        </CardContent>
      </Card>

      {/* Educational Disclaimer */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <CardContent className="p-4">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Educational Disclaimer:</strong> These pain management guidelines are for educational purposes only. 
            Pain management must be individualized based on patient assessment, medical history, and institutional protocols. 
            All medication orders must come from licensed prescribers following appropriate clinical evaluation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}