# Burn Wizard

A comprehensive offline-first Progressive Web App for pediatric burn assessment and fluid management, designed specifically for educational and documentation support in clinical training environments.

## ⚠️ Critical Safety Notice

**EDUCATIONAL TOOL ONLY - NOT FOR DIRECT PATIENT CARE**

This application is designed exclusively for educational purposes and documentation support. It does not diagnose, prescribe medications, or replace clinical decision-making. See [SAFETY.md](docs/SAFETY.md) for complete safety information.

## Features

### 🔥 Burn Assessment
- **Interactive Body Map**: Click-based region selection with fractional burn involvement (0-100% in 25% increments)
- **Age-Adjusted TBSA**: Lund-Browder method with pediatric through adult age bands
- **Real-time Calculations**: Live TBSA updates as you select burn regions
- **Special Site Tracking**: Face, hands, feet, perineum, and major joints

### 💧 Fluid Management
- **Parkland Formula**: Educational fluid resuscitation calculations
- **Maintenance Fluids**: Holliday-Segar (4-2-1) method
- **Temporal Tracking**: Accounts for hours since injury with phase management
- **Visual Timeline**: Clear progression through first 8h and next 16h phases
- **Urine Output Targets**: Age-appropriate monitoring goals

### 📝 Clinical Documentation
- **Note Templates**: Burn assessment, procedure notes, discharge teaching
- **Copy Functionality**: Easy export for educational documentation
- **Structured Format**: Professional clinical note organization
- **Educational Disclaimers**: Integrated safety reminders

### 🛡️ Safety & Privacy
- **100% Offline**: No network transmission of any data
- **Local Storage Only**: All data stays on your device
- **Clear Data Option**: Complete data removal available
- **Educational Scope**: Prominent disclaimers throughout

### 📱 Progressive Web App
- **Offline-First**: Full functionality without internet
- **Mobile Responsive**: Works on phones, tablets, and desktops
- **Install Prompt**: Add to home screen capability
- **Fast Performance**: Optimized for clinical workflows

## Screenshots

*Coming Soon - Screenshots will be added to document the user interface*

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or pnpm package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pmartin1915/burn-wizard.git
   cd burn-wizard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm test` | Run comprehensive unit test suite |
| `npm run lint` | Check code quality with ESLint |
| `npm run typecheck` | Verify TypeScript types |

## Development Status

### ✅ Completed Features
- **Core Architecture**: Clean domain layer with pure functions
- **TBSA Calculations**: Age-adjusted Lund-Browder implementation
- **Fluid Calculations**: Parkland formula with temporal tracking
- **Interactive Body Map**: Region selection with visual feedback
- **State Management**: Zustand store with local persistence
- **Unit Tests**: Comprehensive coverage of domain logic
- **PWA Configuration**: Offline-first service worker setup
- **Safety Framework**: Educational disclaimers and scope limitations

### 🚧 In Development
- **Enhanced Navigation**: Sidebar layout for desktop, hamburger for mobile
- **Additional Note Templates**: Expanded clinical documentation options
- **Internationalization**: English/Spanish language support
- **Advanced Body Map**: SVG-based interactive diagram
- **Dressing Guides**: Region-specific wound care recommendations
- **Analgesia Tips**: Pain management educational content

### 📋 Planned Features
- **Export Options**: PDF and formatted text export
- **Demo Mode**: Sample patient data for training
- **Offline Updates**: Background app updates
- **Enhanced Accessibility**: Screen reader optimization
- **Clinical Scenarios**: Educational case studies

## Architecture

This application follows a clean domain-driven architecture:

- **Domain Layer** (`/src/domain/`): Pure TypeScript functions for all calculations
- **UI Layer** (`/src/components/`): React components with accessibility focus
- **State Management** (`/src/store/`): Zustand for type-safe state handling
- **Core Services** (`/src/core/`): PWA utilities and safety frameworks

For detailed architecture information, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Clinical Safety

### Educational Scope
- Designed for training and education only
- Not intended for direct patient care
- Requires verification with institutional protocols
- Includes comprehensive safety disclaimers

### Data Handling
- No PHI (Protected Health Information) transmission
- Local device storage only
- User-controlled data retention
- No external dependencies for calculations

For complete safety information, see [SAFETY.md](docs/SAFETY.md).

## Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18 + TypeScript |
| **Build System** | Vite with PWA plugin |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State Management** | Zustand with persistence |
| **Testing** | Vitest + Testing Library |
| **Code Quality** | ESLint + Prettier + TypeScript strict |
| **Storage** | IndexedDB via localforage |
| **PWA** | Workbox service worker |

## Accessibility & QA Checklist

### ✅ Implemented
- [x] Keyboard-only navigation support
- [x] Focus outlines and indicators
- [x] ARIA labels for interactive elements
- [x] 44px minimum touch targets
- [x] Dark mode support
- [x] Responsive design (mobile/tablet/desktop)

### 🚧 In Progress
- [ ] Screen reader optimization
- [ ] High contrast mode testing
- [ ] Voice navigation support
- [ ] Comprehensive accessibility audit

### 📋 Testing Requirements
- [ ] Offline functionality verification
- [ ] Local data persistence testing
- [ ] Cross-browser compatibility
- [ ] Performance optimization validation

## Contributing

### Development Guidelines
1. Maintain educational focus and safety disclaimers
2. Follow clinical accuracy requirements
3. Include comprehensive unit tests
4. Ensure accessibility compliance
5. Document all clinical calculations

### Code Standards
- TypeScript strict mode required
- 100% test coverage for domain functions
- ESLint and Prettier compliance
- Comprehensive JSDoc documentation

### Clinical Validation
All clinical calculations and content must be:
- Educationally appropriate
- Clearly marked as non-diagnostic
- Verified against published standards
- Include appropriate safety disclaimers

## License

This project is intended for educational use only. Users must comply with institutional policies regarding clinical decision support tools and maintain appropriate professional licensing and supervision.

## Support & Contact

- **Issues**: [GitHub Issues](https://github.com/pmartin1915/burn-wizard/issues)
- **Documentation**: See `/docs` folder for detailed information
- **Clinical Questions**: Consult with institutional burn specialists

---

**Remember**: This tool supports education and documentation but does not replace clinical judgment, institutional protocols, or professional medical advice. Always verify calculations and follow appropriate clinical guidelines.