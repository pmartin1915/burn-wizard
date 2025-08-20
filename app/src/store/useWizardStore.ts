import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createEncryptedStorageAdapter } from '@/core/encryptedStorage';
import type { PatientData, RegionSelection, TbsaResult, FluidResult, AppSettings, BurnDepth, BodyArea, BurnFraction } from '@/domain/types';

// Tutorial state interfaces
interface TutorialProgress {
  tutorialId: string;
  currentStepId: string;
  completedSteps: string[];
  startedAt: number;
  lastActiveAt: number;
}

interface TutorialState {
  completedTutorials: string[];
  currentProgress: TutorialProgress | null;
  isActive: boolean;
  hasSeenIntroduction: boolean;
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
  
  // Patient data actions
  setPatientData: (data: Partial<PatientData>) => void;
  setRegionSelection: (region: string, fraction: number, depth?: BurnDepth) => void;
  clearRegionSelection: (region: string) => void;
  updateAllRegionDepths: (depth: BurnDepth) => void;
  setTbsaResult: (result: TbsaResult | null) => void;
  setFluidResult: (result: FluidResult | null) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Tutorial actions
  startTutorial: (tutorialId: string) => void;
  completeTutorial: (tutorialId: string) => void;
  updateTutorialProgress: (stepId: string) => void;
  closeTutorial: () => void;
  markIntroductionSeen: () => void;
  
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
  completedTutorials: [],
  currentProgress: null,
  isActive: false,
  hasSeenIntroduction: false,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
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

      // Tutorial actions
      startTutorial: (tutorialId) =>
        set((state) => ({
          tutorials: {
            ...state.tutorials,
            currentProgress: {
              tutorialId,
              currentStepId: '',
              completedSteps: [],
              startedAt: Date.now(),
              lastActiveAt: Date.now(),
            },
            isActive: true,
          },
        })),

      completeTutorial: (tutorialId) =>
        set((state) => ({
          tutorials: {
            ...state.tutorials,
            completedTutorials: [...state.tutorials.completedTutorials, tutorialId],
            currentProgress: null,
            isActive: false,
          },
        })),

      updateTutorialProgress: (stepId) =>
        set((state) => {
          if (!state.tutorials.currentProgress) return state;
          
          const updatedCompletedSteps = state.tutorials.currentProgress.completedSteps.includes(stepId)
            ? state.tutorials.currentProgress.completedSteps
            : [...state.tutorials.currentProgress.completedSteps, stepId];

          return {
            tutorials: {
              ...state.tutorials,
              currentProgress: {
                ...state.tutorials.currentProgress,
                currentStepId: stepId,
                completedSteps: updatedCompletedSteps,
                lastActiveAt: Date.now(),
              },
            },
          };
        }),

      closeTutorial: () =>
        set((state) => ({
          tutorials: {
            ...state.tutorials,
            currentProgress: null,
            isActive: false,
          },
        })),

      markIntroductionSeen: () =>
        set((state) => ({
          tutorials: {
            ...state.tutorials,
            hasSeenIntroduction: true,
          },
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
      }) as any,
      partialize: (state): Partial<WizardState> => ({
        patientData: state.patientData,
        regionSelections: state.regionSelections,
        settings: state.settings,
        tutorials: state.tutorials,
        // Note: tbsaResult and fluidResult are not persisted for security
        // (they can be recalculated from patient data)
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.info('🔒 Encrypted store rehydrated successfully');
        } else {
          console.warn('🔒 Store rehydration failed - starting with fresh state');
        }
      },
    }
  )
);
