# Burn Wizard Architecture

## Overview

Burn Wizard is an offline-first Progressive Web App (PWA) built for educational burn assessment and documentation support. The application follows a clean domain-driven architecture with strict separation between business logic and UI components.

## Architecture Layers

### 1. Domain Layer (`/src/domain/`)
Pure TypeScript functions with no external dependencies. This layer contains all business logic and calculations.

**Key Files:**
- `types.ts` - Core type definitions and interfaces
- `tbsa.ts` - Total Body Surface Area calculations using Lund-Browder method
- `fluids.ts` - Fluid resuscitation calculations (Parkland formula + maintenance)
- `notes.ts` - Clinical note generation and formatting
- `validation.ts` - Zod schemas for input validation
- `__tests__/` - Comprehensive unit tests (100% coverage target)

**Design Principles:**
- Pure functions with clear inputs/outputs
- Full TypeScript type safety
- Comprehensive unit test coverage
- No side effects or external dependencies

### 2. UI Layer (`/src/components/` & `/src/routes/`)
React components built with accessibility and responsiveness in mind.

**Core Components:**
- `BodyMap.tsx` - Interactive SVG body diagram for burn region selection
- `InputForm.tsx` - Patient data input with validation
- `FluidPlan.tsx` - Fluid resuscitation plan display
- `DressingGuide.tsx` - Wound care recommendations
- `AnalgesiaTips.tsx` - Pain management education
- `NotePreview.tsx` - Generated clinical notes with copy functionality

**UI Framework:**
- shadcn/ui components (Radix-based)
- Tailwind CSS for styling
- Lucide React icons
- Framer Motion for transitions

### 3. State Management (`/src/store/`)
Zustand for lightweight, type-safe state management with persistence.

**Key Features:**
- Local-only data storage
- Automatic persistence to IndexedDB
- No network state (offline-first)
- Structured around clinical workflow

### 4. Core Services (`/src/core/`)
Application-level services and utilities.

**Services:**
- `safety.ts` - Clinical safety disclaimers and warnings
- `storage.ts` - IndexedDB wrapper using localforage
- `i18n.ts` - Internationalization setup (EN/ES)
- `pwa.ts` - Progressive Web App utilities

### 5. Constants (`/src/constants/`)
Clinical data and configuration values.

**Data Files:**
- `lundBrowder.ts` - Age-adjusted TBSA percentages
- `ageBands.ts` - Age classification definitions
- `dressing.ts` - Wound care recommendations by region
- `discharge.ts` - Patient education content
- `copy.ts` - UI text and labels

## Data Flow

```
User Input → Form Validation → Domain Calculations → State Update → UI Refresh
     ↓
Local Storage (IndexedDB) ← State Persistence
```

## Clinical Safety Architecture

### Educational-Only Scope
- All calculations labeled as educational
- Prominent disclaimers on every page
- No prescription or diagnostic functionality
- Verification reminders for institutional protocols

### Data Security
- No network transmission of patient data
- Local storage only (IndexedDB)
- Clear data functionality in settings
- No PHI (Protected Health Information) handling

### Calculation Integrity
- Pure functions with comprehensive tests
- Input validation at multiple levels
- Error handling with graceful fallbacks
- Clear documentation of limitations

## PWA Architecture

### Offline-First Design
- All functionality works without network
- Service worker caches app shell
- Static assets cached locally
- Update notifications when new version available

### Performance
- Vite build system for optimal bundling
- Tree-shaking for minimal bundle size
- Lazy loading where appropriate
- Responsive design for all screen sizes

## Testing Strategy

### Unit Tests
- 100% coverage target for domain functions
- Edge case testing for clinical calculations
- Input validation testing
- Error handling verification

### Integration Tests
- User workflow testing
- Component interaction testing
- PWA functionality testing
- Accessibility testing

### Clinical Validation
- Educational disclaimer compliance
- Safety warning verification
- Calculation accuracy within tolerance
- Protocol reminder implementation

## Development Workflow

### Code Quality
- TypeScript strict mode
- ESLint with clinical safety rules
- Prettier for consistent formatting
- Pre-commit hooks for quality gates

### Build Process
- Vite for development and production builds
- PWA plugin for service worker generation
- TypeScript compilation with strict checking
- Asset optimization and compression

## Future Extensibility

### Planned Features
- Additional clinical calculations
- Enhanced note templates
- Multiple language support
- Accessibility improvements

### Architecture Support
- Clean domain layer for easy feature addition
- Modular component structure
- Flexible state management
- Comprehensive test coverage for regression prevention

## Security Considerations

### Data Handling
- No external data transmission
- Local storage encryption (future consideration)
- Audit trail for calculation changes
- Clear data policies and user control

### Clinical Compliance
- Educational use disclaimers
- Professional judgment reminders
- Institution protocol verification
- Regular accuracy validation requirements