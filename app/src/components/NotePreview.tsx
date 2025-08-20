import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  File
} from 'lucide-react';
import { useWizardStore } from '@/store/useWizardStore';
import { 
  makeBurnAssessmentNote, 
  makeDischargeTeachingNote, 
  makeBurnProcedureNote, 
  makeBurnHandoffNote 
} from '@/domain/notes';
import type { BurnNoteData } from '@/domain/types';
import { generatePDFReport, redactPHI } from '@/lib/pdfGenerator'; // Import PDF functions
import BodyMap from '@/components/BodyMap'; // Import BodyMap component

interface NotePreviewProps {
  className?: string;
}

type NoteType = 'assessment' | 'procedure' | 'discharge' | 'handoff';

const NOTE_TYPES: Array<{
  type: NoteType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    type: 'assessment',
    label: 'Burn Assessment Note',
    description: 'Complete burn evaluation with TBSA and fluid calculations',
    icon: FileText
  },
  {
    type: 'procedure',
    label: 'Procedure Note',
    description: 'Burn care procedure documentation template',
    icon: FileText
  },
  {
    type: 'discharge',
    label: 'Discharge Teaching',
    description: 'Patient education and home care instructions',
    icon: FileText
  },
  {
    type: 'handoff',
    label: 'Patient Handoff',
    description: 'Shift change or transfer communication',
    icon: FileText
  }
];

export default function NotePreview({ className }: NotePreviewProps) {
  const { patientData, regionSelections, tbsaResult, fluidResult } = useWizardStore();
  const [selectedNoteType, setSelectedNoteType] = React.useState<NoteType>('assessment');
  const [copiedStates, setCopiedStates] = React.useState<Record<NoteType, boolean>>({
    assessment: false,
    procedure: false,
    discharge: false,
    handoff: false
  });
  const [isPreviewCollapsed, setIsPreviewCollapsed] = React.useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false); // PDF loading state
  const bodyMapRef = React.useRef<HTMLDivElement>(null); // Ref for BodyMap capture

  // Generate note data
  const noteData: BurnNoteData | null = React.useMemo(() => {
    if (!tbsaResult || !fluidResult) return null;
    
    return {
      patient: patientData,
      tbsa: tbsaResult,
      fluids: fluidResult,
      regions: regionSelections,
      timestamp: new Date()
    };
  }, [patientData, tbsaResult, fluidResult, regionSelections]);

  // Generate the current note content
  const currentNoteContent = React.useMemo(() => {
    if (!noteData) return '';
    
    switch (selectedNoteType) {
      case 'assessment':
        return makeBurnAssessmentNote(noteData);
      case 'procedure':
        return makeBurnProcedureNote(noteData);
      case 'discharge':
        return makeDischargeTeachingNote(noteData);
      case 'handoff':
        return makeBurnHandoffNote(noteData);
      default:
        return '';
    }
  }, [noteData, selectedNoteType]);

  const handleCopyToClipboard = async (noteType: NoteType, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates(prev => ({ ...prev, [noteType]: true }));
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [noteType]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedStates(prev => ({ ...prev, [noteType]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [noteType]: false }));
      }, 2000);
    }
  };

  const handleDownloadNote = (noteType: NoteType, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `burn-${noteType}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle PDF export
  const handleExportPDF = async (noteType: NoteType, content: string) => {
    if (!noteData) return;
    
    try {
      setIsGeneratingPDF(true);
      
      // Redact PHI from content
      const redactedContent = redactPHI(content);
      
      // Capture BodyMap element if available
      let bodyMapElement: HTMLElement | undefined = undefined;
      if (bodyMapRef.current) {
        bodyMapElement = bodyMapRef.current;
      }
      
      // Generate PDF
        const pdfBytes = await generatePDFReport(
          redactedContent,
          bodyMapElement, // Pass captured body map element
          'Burn Center' // Default institution name
      );
      
      // Create and download PDF using the Uint8Array directly
      // @ts-expect-error - TypeScript has issues with Uint8Array in Blob constructor
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `burn-${noteType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. See console for details.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!noteData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Complete patient assessment to generate clinical notes</p>
            <p className="text-sm mt-2">Enter patient information and select burn regions to enable note generation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Note Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Clinical Note Generator
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
            >
              {isPreviewCollapsed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {isPreviewCollapsed ? 'Show Preview' : 'Hide Preview'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {NOTE_TYPES.map(({ type, label, description, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setSelectedNoteType(type)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedNoteType === type
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-accent'
                }`}
              >
                <div className="flex items-start gap-2">
                  <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm">{label}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Note Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {NOTE_TYPES.find(n => n.type === selectedNoteType)?.label}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadNote(selectedNoteType, currentNoteContent)}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportPDF(selectedNoteType, currentNoteContent)}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <File className="h-4 w-4 mr-1" />
                    Export PDF
                  </>
                )}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleCopyToClipboard(selectedNoteType, currentNoteContent)}
                disabled={copiedStates[selectedNoteType]}
              >
                {copiedStates[selectedNoteType] ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Note
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {NOTE_TYPES.find(n => n.type === selectedNoteType)?.description}
          </p>
          
          {/* Character count and word count */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span>Characters: {currentNoteContent.length}</span>
            <span>Words: {currentNoteContent.split(/\s+/).length}</span>
            <span>Lines: {currentNoteContent.split('\n').length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Note Preview */}
      {!isPreviewCollapsed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Note Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                {currentNoteContent}
              </pre>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyToClipboard(selectedNoteType, currentNoteContent)}
                disabled={copiedStates[selectedNoteType]}
              >
                {copiedStates[selectedNoteType] ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadNote(selectedNoteType, currentNoteContent)}
              >
                <Download className="h-4 w-4 mr-1" />
                Download as Text
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportPDF(selectedNoteType, currentNoteContent)}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <File className="h-4 w-4 mr-1" />
                    Export as PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Placeholders Info */}
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <AlertCircle className="h-5 w-5" />
            Template Placeholders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
            The generated notes contain placeholders marked with {`{{PLACEHOLDER_NAME}}`} that need to be 
            completed with specific clinical information:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Common Placeholders:</h4>
              <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                <li>• {`{{CLINICAL_ASSESSMENT_PLACEHOLDER}}`}</li>
                <li>• {`{{CLEANSING_SOLUTION}}`}</li>
                <li>• {`{{TOPICAL_AGENT}}`}</li>
                <li>• {`{{DRESSING_TYPE}}`}</li>
                <li>• {`{{PAIN_SCORE}}`}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Contact Information:</h4>
              <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                <li>• {`{{BURN_TEAM_CONTACT}}`}</li>
                <li>• {`{{ATTENDING_CONTACT}}`}</li>
                <li>• {`{{FOLLOW_UP_DATE}}`}</li>
                <li>• {`{{CLINICIAN_NAME}}`}</li>
              </ul>
            </div>
          </div>
          
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-3">
            Replace these placeholders with actual clinical data before using the notes in patient care.
          </p>
        </CardContent>
      </Card>

      {/* Hidden BodyMap for PDF capture */}
      <div ref={bodyMapRef} className="sr-only absolute -left-[9999px]">
        <BodyMap />
      </div>
      
      {/* Educational Disclaimer */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <CardContent className="p-4">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Educational Disclaimer:</strong> These note templates are for educational and training purposes only. 
            They must be customized with actual clinical findings and verified against institutional documentation requirements. 
            All clinical notes must include appropriate clinical assessment and follow local policies for patient documentation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
