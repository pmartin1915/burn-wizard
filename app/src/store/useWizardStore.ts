import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PatientData, RegionSelection, TbsaResult, FluidResult, AppSettings } from '@/domain/types';

interface WizardState {
  // Patient data
  patientData: PatientData;
  regionSelections: RegionSelection[];
  
  // Calculated results
  tbsaResult: TbsaResult | null;
  fluidResult: FluidResult | null;
  
  // App settings
  settings: AppSettings;
  
  // Actions
  setPatientData: (data: Partial<PatientData>) => void;
  setRegionSelection: (region: string, fraction: number) => void;
  clearRegionSelection: (region: string) => void;
  setTbsaResult: (result: TbsaResult | null) => void;
  setFluidResult: (result: FluidResult | null) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearAllData: () => void;
}

const initialPatientData: PatientData = {
  ageMonths: 12,
  weightKg: 10,
  hoursSinceInjury: 0,
  mechanism: '',
  specialSites: {
    face: false,
    hands: false,
    feet: false,
    perineum: false,
    majorJoints: false,
  },
};

const initialSettings: AppSettings = {
  units: { weight: 'kg', temperature: 'celsius' },
  language: 'en',
  darkMode: false,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      patientData: initialPatientData,
      regionSelections: [],
      tbsaResult: null,
      fluidResult: null,
      settings: initialSettings,

      setPatientData: (data) =>
        set((state) => ({
          patientData: { ...state.patientData, ...data },
        })),

      setRegionSelection: (region, fraction) =>
        set((state) => {
          const newSelections = state.regionSelections.filter(
            (sel) => sel.region !== region
          );
          if (fraction > 0) {
            newSelections.push({
              region: region as any,
              fraction: fraction as any,
            });
          }
          return { regionSelections: newSelections };
        }),

      clearRegionSelection: (region) =>
        set((state) => ({
          regionSelections: state.regionSelections.filter(
            (sel) => sel.region !== region
          ),
        })),

      setTbsaResult: (result) => set({ tbsaResult: result }),

      setFluidResult: (result) => set({ fluidResult: result }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      clearAllData: () =>
        set({
          patientData: initialPatientData,
          regionSelections: [],
          tbsaResult: null,
          fluidResult: null,
        }),
    }),
    {
      name: 'burn-wizard-storage',
      partialize: (state) => ({
        patientData: state.patientData,
        regionSelections: state.regionSelections,
        settings: state.settings,
      }),
    }
  )
);