/**
 * Documentation Generator for Burn Management
 * Generates comprehensive clinical documentation and educational materials
 */

import type { PatientData, RegionSelection, TbsaResult, FluidResult } from './types';
import { calculateTBSA } from './tbsa';
import { calculateFluids } from './fluids';
import { generateEducationalContent } from './protocolTemplates';
// Decision tree functions removed to reduce unused imports

export interface ClinicalDocumentation {
  patientSummary: string;
  assessmentFindings: string;
  treatmentPlan: string;
  monitoringPlan: string;
  educationalNotes: string;
  references: string;
  disclaimer: string;
}

export interface EducationalReport {
  title: string;
  executiveSummary: string;
  clinicalScenario: string;
  keyLearningPoints: string[];
  protocolExplanations: string[];
  clinicalPearls: string[];
  safetyConsiderations: string[];
  furtherReading: string[];
}

/**
 * Generates comprehensive clinical documentation
 */
export function generateClinicalDocumentation(
  patient: PatientData,
  selections: RegionSelection[],
  tbsaResult: TbsaResult,
  fluidResult: FluidResult,
  _vitals?: {
    heartRate?: number;
    systolicBP?: number; 
    diastolicBP?: number;
    oxygenSat?: number;
  }
): ClinicalDocumentation {
  
  const patientSummary = generatePatientSummary(patient, tbsaResult);
  const assessmentFindings = generateAssessmentFindings(selections, tbsaResult, patient);
  const treatmentPlan = generateTreatmentPlan(fluidResult, tbsaResult, patient);
  const monitoringPlan = generateMonitoringPlan(patient, tbsaResult, fluidResult);
  const educationalNotes = generateEducationalNotes(patient, tbsaResult);
  const references = generateReferences();
  const disclaimer = generateDisclaimer();

  return {
    patientSummary,
    assessmentFindings,
    treatmentPlan,
    monitoringPlan,
    educationalNotes,
    references,
    disclaimer
  };
}

/**
 * Generates educational report for clinical scenario
 */
export function generateEducationalReport(
  patient: PatientData,
  selections: RegionSelection[],
  tbsaResult: TbsaResult,
  fluidResult: FluidResult
): EducationalReport {
  
  const ageYears = patient.ageMonths / 12;
  const currentPhase = determineCurrentPhase(patient.hoursSinceInjury);
  
  const educationalContent = generateEducationalContent({
    patientWeight: patient.weightKg,
    tbsaPct: tbsaResult.tbsaPct,
    currentPhase
  });

  const title = `Burn Management Case Study: ${Math.round(ageYears)}-year-old, ${tbsaResult.tbsaPct}% TBSA`;
  
  const executiveSummary = generateExecutiveSummary(patient, tbsaResult, fluidResult);
  const clinicalScenario = generateClinicalScenario(patient, selections, tbsaResult);
  
  return {
    title,
    executiveSummary,
    clinicalScenario,
    keyLearningPoints: educationalContent.keyEducationalPoints,
    protocolExplanations: generateProtocolExplanations(patient, tbsaResult),
    clinicalPearls: educationalContent.clinicalPearls,
    safetyConsiderations: generateSafetyConsiderations(patient, tbsaResult),
    furtherReading: generateFurtherReading()
  };
}

/**
 * Generate patient summary section
 */
function generatePatientSummary(patient: PatientData, tbsaResult: TbsaResult): string {
  const ageYears = Math.round(patient.ageMonths / 12);
  const hoursSinceText = patient.hoursSinceInjury > 0 
    ? ` occurring ${patient.hoursSinceInjury} hours ago`
    : ' (time of injury assessment)';
    
  return `
**PATIENT SUMMARY**
- Age: ${ageYears} years (${patient.ageMonths} months)
- Weight: ${patient.weightKg} kg
- Time of injury: ${patient.hoursSinceInjury}h ago
- Total Body Surface Area: ${tbsaResult.tbsaPct}% TBSA
- Age Group: ${tbsaResult.ageGroup} (Lund-Browder classification)
- Burn injury${hoursSinceText}
`.trim();
}

/**
 * Generate assessment findings section
 */
function generateAssessmentFindings(
  selections: RegionSelection[],
  tbsaResult: TbsaResult,
  _patient: PatientData
): string {
  
  let findings = '**ASSESSMENT FINDINGS**\n\n';
  
  findings += `**Total Body Surface Area Assessment:**\n`;
  findings += `- Overall TBSA: ${tbsaResult.tbsaPct}% using Lund-Browder method\n`;
  findings += `- Age group: ${tbsaResult.ageGroup}\n\n`;
  
  findings += `**Regional Burn Assessment:**\n`;
  
  if (selections.length === 0) {
    findings += '- No burns identified\n';
  } else {
    for (const selection of selections) {
      const regionPercent = tbsaResult.breakdown[selection.region];
      const fullRegionPercent = regionPercent / selection.fraction;
      
      findings += `- ${selection.region}: ${selection.fraction * 100}% involvement `;
      findings += `(${regionPercent}% TBSA), ${selection.depth} thickness\n`;
      findings += `  • Base region percentage: ${fullRegionPercent}% for age group ${tbsaResult.ageGroup}\n`;
    }
  }
  
  return findings.trim();
}

/**
 * Generate treatment plan section
 */
function generateTreatmentPlan(
  fluidResult: FluidResult,
  tbsaResult: TbsaResult,
  patient: PatientData
): string {
  
  let plan = '**TREATMENT PLAN**\n\n';
  
  if (tbsaResult.tbsaPct < 10) {
    plan += `**Fluid Resuscitation:**\n`;
    plan += `- TBSA <10% - Consider local protocol for minor burns\n`;
    plan += `- May not require formal Parkland formula resuscitation\n`;
    plan += `- Maintain adequate hydration and monitor closely\n\n`;
  } else if (patient.weightKg <= 20) {
    plan += `**Fluid Resuscitation:**\n`;
    plan += `- Weight ≤20kg - Consider pediatric burn protocol modifications\n`;
    plan += `- Parkland calculation: ${fluidResult.parkland.totalMl}ml total over 24h\n`;
    plan += `- Use weight-based monitoring targets\n`;
    plan += `- Consider pediatric burn center consultation\n\n`;
  } else {
    plan += `**Fluid Resuscitation (Parkland Formula):**\n`;
    plan += `- Total 24h requirement: ${fluidResult.parkland.totalMl}ml\n`;
    plan += `- First 8 hours: ${fluidResult.parkland.first8hMl}ml (${Math.round(fluidResult.parkland.first8hMl/8)}ml/hr average)\n`;
    plan += `- Next 16 hours: ${fluidResult.parkland.next16hMl}ml (${Math.round(fluidResult.parkland.next16hMl/16)}ml/hr average)\n`;
    plan += `- Current rate needed: ${fluidResult.parkland.rateNowMlPerHr}ml/hr\n`;
    plan += `- Primary fluid: Lactated Ringers (LR)\n\n`;
  }
  
  plan += `**Maintenance Fluids (if indicated):**\n`;
  plan += `- Rate: ${fluidResult.maintenance.mlPerHr}ml/hr (${fluidResult.maintenance.method} method)\n`;
  plan += `- Fluid type: D5 1/2 NS + 20mEq KCl/L\n`;
  plan += `- Route: Oral preferred if tolerated, IV if needed\n`;
  
  return plan.trim();
}

/**
 * Generate monitoring plan section
 */
function generateMonitoringPlan(
  patient: PatientData,
  _tbsaResult: TbsaResult,
  _fluidResult: FluidResult
): string {
  
  let plan = '**MONITORING PLAN**\n\n';
  
  plan += `**Hourly Monitoring:**\n`;
  if (patient.weightKg > 20) {
    plan += `- Urine output target: 30-50ml/hr\n`;
  } else {
    plan += `- Urine output target: 1-2ml/kg/hr (${patient.weightKg}-${patient.weightKg * 2}ml/hr)\n`;
  }
  plan += `- Vital signs: HR <120, BP >90/60, SaO2 >90%\n`;
  plan += `- Document fluid intake and output\n`;
  plan += `- Record any rate adjustments with rationale\n\n`;
  
  plan += `**Fluid Rate Adjustments:**\n`;
  plan += `- Urine output <30ml/hr → Increase IV rate by 20%\n`;
  plan += `- Urine output 30-50ml/hr → Maintain current rate\n`;
  plan += `- Urine output >50ml/hr → Decrease IV rate by 20%\n`;
  plan += `- Reassess hourly after any rate change\n\n`;
  
  plan += `**Additional Monitoring:**\n`;
  plan += `- Daily weight if possible\n`;
  plan += `- Electrolytes as clinically indicated\n`;
  plan += `- Signs of fluid overload or under-resuscitation\n`;
  plan += `- Burn wound assessment and care\n`;
  
  return plan.trim();
}

/**
 * Generate educational notes
 */
function generateEducationalNotes(patient: PatientData, tbsaResult: TbsaResult): string {
  let notes = '**EDUCATIONAL NOTES**\n\n';
  
  if (tbsaResult.ageGroup !== 'Adult') {
    notes += `**Age-Specific Considerations:**\n`;
    notes += `- Head percentage for age group ${tbsaResult.ageGroup}: varies significantly from adult\n`;
    notes += `- Body proportions change with age - use appropriate charts\n`;
    notes += `- Pediatric patients have higher risk of complications\n\n`;
  }
  
  notes += `**Clinical Pearls:**\n`;
  notes += `- Urine output is the most reliable resuscitation endpoint\n`;
  notes += `- Parkland formula provides starting point - adjust based on response\n`;
  notes += `- Time is calculated from injury, not hospital arrival\n`;
  notes += `- Large burns (>20% TBSA) may benefit from burn center care\n\n`;
  
  notes += `**Key Learning Points:**\n`;
  notes += `- TBSA assessment accuracy is critical for fluid calculations\n`;
  notes += `- Systematic monitoring prevents both under- and over-resuscitation\n`;
  notes += `- Protocol adherence improves outcomes but clinical judgment is paramount\n`;
  
  return notes.trim();
}

/**
 * Helper functions
 */
function determineCurrentPhase(hoursSinceInjury: number): 'assessment' | 'resuscitation' | 'monitoring' {
  if (hoursSinceInjury === 0) return 'assessment';
  if (hoursSinceInjury <= 8) return 'resuscitation';
  return 'monitoring';
}

function generateExecutiveSummary(patient: PatientData, tbsaResult: TbsaResult, _fluidResult: FluidResult): string {
  const ageYears = Math.round(patient.ageMonths / 12);
  const needsResuscitation = tbsaResult.tbsaPct >= 10 && patient.weightKg > 20;
  
  return `This case presents a ${ageYears}-year-old patient weighing ${patient.weightKg}kg with ${tbsaResult.tbsaPct}% TBSA burns. ${needsResuscitation ? 'Standard Parkland formula fluid resuscitation is indicated.' : 'Consider alternative management approaches due to burn size or patient weight.'} Key educational focus includes TBSA assessment using age-appropriate methods and systematic fluid management protocols.`;
}

function generateClinicalScenario(patient: PatientData, selections: RegionSelection[], tbsaResult: TbsaResult): string {
  const ageYears = Math.round(patient.ageMonths / 12);
  
  let scenario = `A ${ageYears}-year-old patient presents with burns affecting `;
  
  if (selections.length === 0) {
    scenario += 'no specific regions (assessment scenario).';
  } else {
    const regions = selections.map(s => `${s.region} (${s.fraction * 100}% involvement, ${s.depth})`);
    scenario += regions.join(', ') + '.';
  }
  
  scenario += ` Total assessed TBSA is ${tbsaResult.tbsaPct}%. The injury occurred ${patient.hoursSinceInjury} hours ago.`;
  
  return scenario;
}

function generateProtocolExplanations(patient: PatientData, tbsaResult: TbsaResult): string[] {
  const explanations: string[] = [];
  
  explanations.push('Lund-Browder method accounts for age-related changes in body proportions');
  
  if (tbsaResult.tbsaPct >= 10 && patient.weightKg > 20) {
    explanations.push('Parkland formula: 4ml/kg × %TBSA × weight provides initial fluid estimate');
    explanations.push('First 8 hours receive half the total volume due to increased capillary leak');
  }
  
  explanations.push('Urine output monitoring reflects tissue perfusion better than vital signs alone');
  
  return explanations;
}

function generateSafetyConsiderations(patient: PatientData, tbsaResult: TbsaResult): string[] {
  const considerations: string[] = [
    'This educational tool does not replace clinical judgment or medical training',
    'Individual patient factors may require protocol modifications',
    'Always consult appropriate specialists when available'
  ];
  
  if (tbsaResult.tbsaPct > 20) {
    considerations.push('Large burns typically require burn center management');
  }
  
  if (patient.weightKg < 20) {
    considerations.push('Pediatric burns have higher complication risk - consider specialist consultation');
  }
  
  return considerations;
}

function generateFurtherReading(): string[] {
  return [
    'American Burn Association Advanced Burn Life Support Course',
    'Baxter CR, Shires T. Physiological response to crystalloid resuscitation of severe burns',
    'Herndon DN. Total Burn Care, 5th Edition',
    'International Society for Burn Injuries Practice Guidelines'
  ];
}

function generateReferences(): string {
  return `
**REFERENCES**
1. Baxter CR, Shires T. Physiological response to crystalloid resuscitation of severe burns. Ann N Y Acad Sci. 1968;150(3):874-94.
2. American Burn Association. Advanced Burn Life Support Course. Chicago: American Burn Association; 2018.
3. Lund CC, Browder NC. The estimation of areas of burns. Surg Gynecol Obstet. 1944;79:352-358.
4. Herndon DN, editor. Total Burn Care. 5th ed. Edinburgh: Elsevier; 2018.
`.trim();
}

function generateDisclaimer(): string {
  return `
**IMPORTANT DISCLAIMER**
This educational tool is designed for learning purposes only and does not replace professional medical judgment, training, or clinical experience. Patient care decisions remain the sole responsibility of qualified healthcare providers. Local protocols, institutional guidelines, and individual patient factors should always take precedence over general educational content. This tool should not be used as the primary basis for patient care decisions.
`.trim();
}

/**
 * Export comprehensive report as formatted text
 */
export function exportClinicalReport(
  patient: PatientData,
  selections: RegionSelection[],
  tbsaResult?: TbsaResult,
  fluidResult?: FluidResult,
  vitals?: {
    heartRate?: number;
    systolicBP?: number;
    diastolicBP?: number; 
    oxygenSat?: number;
  }
): string {
  
  // Calculate results if not provided
  const tbsa = tbsaResult || calculateTBSA(patient.ageMonths, selections);
  const fluids = fluidResult || calculateFluids({
    weightKg: patient.weightKg,
    tbsaPct: tbsa.tbsaPct,
    hoursSinceInjury: patient.hoursSinceInjury
  });
  
  const documentation = generateClinicalDocumentation(patient, selections, tbsa, fluids, vitals);
  const educational = generateEducationalReport(patient, selections, tbsa, fluids);
  
  const timestamp = new Date().toLocaleString();
  
  return `
BURN MANAGEMENT CLINICAL REPORT
Generated: ${timestamp}

${documentation.patientSummary}

${documentation.assessmentFindings}

${documentation.treatmentPlan}

${documentation.monitoringPlan}

${documentation.educationalNotes}

${educational.executiveSummary}

${documentation.references}

${documentation.disclaimer}
`.trim();
}