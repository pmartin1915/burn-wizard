/**
 * Data Export Utilities for Burn Wizard
 * 
 * Provides functionality to export patient assessments and app state
 * in various formats for backup, sharing, and clinical documentation.
 */

import type { WizardState } from '@/store/useWizardStore';
import type { PatientData, RegionSelection, TbsaResult, FluidResult } from '@/domain/types';

export interface ExportData {
  metadata: {
    appName: string;
    version: string;
    exportDate: string;
    exportType: 'full' | 'assessment-only' | 'settings-only';
  };
  patientData?: PatientData;
  regionSelections?: RegionSelection[];
  tbsaResult?: TbsaResult;
  fluidResult?: FluidResult;
  settings?: any;
  tutorials?: any;
}

export type ExportFormat = 'json' | 'csv' | 'txt';

/**
 * Export assessment data to JSON format
 */
export function exportToJSON(state: Partial<WizardState>, exportType: 'full' | 'assessment-only' | 'settings-only' = 'assessment-only'): string {
  const exportData: ExportData = {
    metadata: {
      appName: 'Burn Wizard',
      version: '0.1.0',
      exportDate: new Date().toISOString(),
      exportType,
    },
  };

  if (exportType === 'full' || exportType === 'assessment-only') {
    exportData.patientData = state.patientData;
    exportData.regionSelections = state.regionSelections;
    exportData.tbsaResult = state.tbsaResult;
    exportData.fluidResult = state.fluidResult;
  }

  if (exportType === 'full' || exportType === 'settings-only') {
    exportData.settings = state.settings;
    exportData.tutorials = state.tutorials;
  }

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export assessment data to CSV format
 */
export function exportToCSV(state: Partial<WizardState>): string {
  const lines: string[] = [];
  
  // Header
  lines.push('Type,Key,Value');
  lines.push(`Metadata,Export Date,${new Date().toISOString()}`);
  lines.push(`Metadata,App Name,Burn Wizard`);
  lines.push(`Metadata,Version,0.1.0`);
  
  // Patient Data
  if (state.patientData) {
    const { patientData } = state;
    lines.push(`Patient,Age (months),${patientData.ageMonths}`);
    lines.push(`Patient,Weight (kg),${patientData.weightKg}`);
    lines.push(`Patient,Hours since injury,${patientData.hoursSinceInjury}`);
    lines.push(`Patient,Mechanism,"${patientData.mechanism || 'N/A'}"`);
    
    if (patientData.specialSites) {
      Object.entries(patientData.specialSites).forEach(([site, affected]) => {
        lines.push(`Special Sites,${site},${affected ? 'Yes' : 'No'}`);
      });
    }
  }
  
  // Region Selections
  if (state.regionSelections && state.regionSelections.length > 0) {
    state.regionSelections.forEach((selection, index) => {
      lines.push(`Burn Region ${index + 1},Area,${selection.region}`);
      lines.push(`Burn Region ${index + 1},Fraction,${selection.fraction}`);
      lines.push(`Burn Region ${index + 1},Depth,${selection.depth}`);
    });
  }
  
  // TBSA Result
  if (state.tbsaResult) {
    lines.push(`Results,Total TBSA (%),${state.tbsaResult.totalTbsa}`);
    lines.push(`Results,Total Surface Area (cm²),${state.tbsaResult.totalSurfaceArea}`);
    lines.push(`Results,Burned Surface Area (cm²),${state.tbsaResult.burnedSurfaceArea}`);
  }
  
  // Fluid Result
  if (state.fluidResult) {
    lines.push(`Fluid Calculation,Total 24h (mL),${state.fluidResult.total24h}`);
    lines.push(`Fluid Calculation,First 8h (mL),${state.fluidResult.first8h}`);
    lines.push(`Fluid Calculation,Next 16h (mL),${state.fluidResult.next16h}`);
    lines.push(`Fluid Calculation,Rate per hour first 8h (mL/h),${state.fluidResult.ratePerHourFirst8h}`);
    lines.push(`Fluid Calculation,Rate per hour next 16h (mL/h),${state.fluidResult.ratePerHourNext16h}`);
  }
  
  return lines.join('\n');
}

/**
 * Export assessment data to human-readable text format
 */
export function exportToText(state: Partial<WizardState>): string {
  const lines: string[] = [];
  const date = new Date();
  
  lines.push('BURN WIZARD ASSESSMENT EXPORT');
  lines.push('================================');
  lines.push(`Export Date: ${date.toLocaleString()}`);
  lines.push('');
  
  // Patient Information
  if (state.patientData) {
    const { patientData } = state;
    lines.push('PATIENT INFORMATION');
    lines.push('-------------------');
    lines.push(`Age: ${patientData.ageMonths} months`);
    lines.push(`Weight: ${patientData.weightKg} kg`);
    lines.push(`Hours since injury: ${patientData.hoursSinceInjury}`);
    lines.push(`Mechanism: ${patientData.mechanism || 'Not specified'}`);
    lines.push('');
    
    if (patientData.specialSites) {
      lines.push('Special Sites:');
      Object.entries(patientData.specialSites).forEach(([site, affected]) => {
        lines.push(`  ${site}: ${affected ? 'Yes' : 'No'}`);
      });
      lines.push('');
    }
  }
  
  // Burn Assessment
  if (state.regionSelections && state.regionSelections.length > 0) {
    lines.push('BURN ASSESSMENT');
    lines.push('---------------');
    state.regionSelections.forEach((selection, index) => {
      lines.push(`Region ${index + 1}:`);
      lines.push(`  Area: ${selection.region}`);
      lines.push(`  Fraction: ${selection.fraction}`);
      lines.push(`  Depth: ${selection.depth}`);
      lines.push('');
    });
  }
  
  // Calculations
  if (state.tbsaResult) {
    lines.push('TBSA CALCULATION');
    lines.push('----------------');
    lines.push(`Total TBSA: ${state.tbsaResult.totalTbsa}%`);
    lines.push(`Total Surface Area: ${state.tbsaResult.totalSurfaceArea} cm²`);
    lines.push(`Burned Surface Area: ${state.tbsaResult.burnedSurfaceArea} cm²`);
    lines.push('');
  }
  
  if (state.fluidResult) {
    lines.push('FLUID CALCULATION');
    lines.push('-----------------');
    lines.push(`Total 24 hours: ${state.fluidResult.total24h} mL`);
    lines.push(`First 8 hours: ${state.fluidResult.first8h} mL`);
    lines.push(`Next 16 hours: ${state.fluidResult.next16h} mL`);
    lines.push(`Rate (first 8h): ${state.fluidResult.ratePerHourFirst8h} mL/h`);
    lines.push(`Rate (next 16h): ${state.fluidResult.ratePerHourNext16h} mL/h`);
    lines.push('');
  }
  
  lines.push('Generated by Burn Wizard v0.1.0');
  lines.push('Educational tool only - verify with clinical protocols');
  
  return lines.join('\n');
}

/**
 * Download exported data as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string, extension: string): string {
  const date = new Date();
  const timestamp = date.toISOString().replace(/[:.]/g, '-').split('T')[0];
  const time = date.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${prefix}-${timestamp}-${time}.${extension}`;
}

/**
 * Export and download assessment data
 */
export function exportAssessment(
  state: Partial<WizardState>, 
  format: ExportFormat = 'json',
  exportType: 'full' | 'assessment-only' | 'settings-only' = 'assessment-only'
) {
  let content: string;
  let filename: string;
  let mimeType: string;
  
  switch (format) {
    case 'json':
      content = exportToJSON(state, exportType);
      filename = generateFilename('burn-assessment', 'json');
      mimeType = 'application/json';
      break;
    case 'csv':
      content = exportToCSV(state);
      filename = generateFilename('burn-assessment', 'csv');
      mimeType = 'text/csv';
      break;
    case 'txt':
      content = exportToText(state);
      filename = generateFilename('burn-assessment', 'txt');
      mimeType = 'text/plain';
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
  
  downloadFile(content, filename, mimeType);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📄 Exported assessment as ${format.toUpperCase()}: ${filename}`);
  }
}