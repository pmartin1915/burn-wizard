import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersistStorage } from 'zustand/middleware';
import { createEncryptedStorageAdapter } from '@/core/encryptedStorage';
import type { PatientData, RegionSelection, TbsaResult, FluidResult, AppSettings, BurnDepth, BodyArea, BurnFraction } from '@/domain/types';

// Simplified tutorial state - just track if user has seen the guided tour
interface TutorialState {
  hasSeenGuidedTour: boolean;
}

interface WizardState {
  // Patient data
  patientData: PatientData;
  regionSelections: RegionSelection[];
  
  // Calculated results
  tbsaResult: TbsaResult | null;
  fluidResult: FluidResult | null;
  
  // App settings
  settings: AppSettings;
  
  // Tutorial state
  tutorials: TutorialState;
  
  // Metadata for auto-save tracking
  metadata?: {
    lastAutoSave?: string;
  };
  
  // Patient data actions
  setPatientData: (data: Partial<PatientData>) => void;
  setRegionSelection: (region: string, fraction: number, depth?: BurnDepth) => void;
  clearRegionSelection: (region: string) => void;
  updateAllRegionDepths: (depth: BurnDepth) => void;
  setTbsaResult: (result: TbsaResult | null) => void;
  setFluidResult: (result: FluidResult | null) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Tutorial actions (simplified)
  markGuidedTourSeen: () => void;
  
  // Metadata actions
  setMetadata: (metadata: { lastAutoSave?: string }) => void;
  
  // General actions
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

const initialTutorialState: TutorialState = {
  hasSeenGuidedTour: false,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, _get) => ({
      patientData: initialPatientData,
      regionSelections: [],
      tbsaResult: null,
      fluidResult: null,
      settings: initialSettings,
      tutorials: initialTutorialState,

      setPatientData: (data) =>
        set((state) => ({
          patientData: { ...state.patientData, ...data },
        })),

      setRegionSelection: (region, fraction, depth = 'superficial-partial') =>
        set((state) => {
          const newSelections = state.regionSelections.filter(
            (sel) => sel.region !== region
          );
          if (fraction > 0) {
            newSelections.push({
              region: region as BodyArea,
              fraction: fraction as BurnFraction,
              depth,
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

      updateAllRegionDepths: (depth) =>
        set((state) => ({
          regionSelections: state.regionSelections.map((sel) => ({
            ...sel,
            depth,
          })),
        })),

      setTbsaResult: (result) => set({ tbsaResult: result }),

      setFluidResult: (result) => set({ fluidResult: result }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Tutorial actions (simplified)
      markGuidedTourSeen: () =>
        set((state) => ({
          tutorials: {
            ...state.tutorials,
            hasSeenGuidedTour: true,
          },
        })),

      // Metadata actions
      setMetadata: (metadata) =>
        set((state) => ({
          metadata: { ...state.metadata, ...metadata },
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
      storage: createEncryptedStorageAdapter({
        encryptionEnabled: true,
        storageKey: 'burn-wizard-encrypted-store',
        version: 1
      }) as PersistStorage<Partial<WizardState>>,
      partialize: (state): Partial<WizardState> => ({
        patientData: state.patientData,
        regionSelections: state.regionSelections,
        settings: state.settings,
        tutorials: state.tutorials,
        metadata: state.metadata,
        // Note: tbsaResult and fluidResult are not persisted for security
        // (they can be recalculated from patient data)
      }),
      onRehydrateStorage: () => (state) => {
        if (process.env.NODE_ENV === 'development') {
          if (state) {
            console.info('🔒 Encrypted store rehydrated successfully');
          } else {
            console.warn('🔒 Store rehydration failed - starting with fresh state');
          }
        }
      },
    }
  )
);
