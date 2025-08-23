# MessagePedia - The Collective Intelligence App

**Status: Specification Phase (SPARC Methodology)**

A next-generation decentralized content collaboration platform for trusted advisors, creative professionals, and enterprise teams.

## 🎯 Vision

MessagePedia enables powerful ideas and productivity to emerge from collaboration, expertise, and competition of ideas from teams — enhanced by AI — while adhering to data privacy and sovereignty laws.

## 🏗️ Architecture Overview

### Multi-Tier Product Offering
- **Personal (FREE)**: Basic P2P collaboration, 3 topic limit
- **Professional ($6/$60)**: Unlimited topics + AI content summarization
- **Business ($12/$120)**: + Audit trails + Web/Mobile access
- **Enterprise (CALL)**: + Self-hosting + Admin console

### Core Technologies
- **P2P Foundation**: WebRTC for direct peer connections
- **Desktop Apps**: Electron (Mac/Windows/Linux)
- **Web/Mobile**: Content Service (Business+ tiers)
- **Authentication**: AWS Cognito integration
- **AI Processing**: Local content summarization
- **Enterprise**: Self-hosting (native install or optional Docker)

## 📋 Current Phase: S ✅ → P (Transition to Planning)

**IMPORTANT**: S (Specification) phase COMPLETE! Ready to begin P (Planning) phase.

### S Phase Completed ✅:
- ✅ System assertions extracted from vision documents (370+ requirements)
- ✅ BDD feature files for all major scenarios
- ✅ Multi-tier architecture fully defined
- ✅ Product offering matrix fully incorporated
- ✅ Technical feasibility validation completed
- ✅ Architecture tensions resolved
- ✅ All documentation aligned and consistent

### Next Phase - P (Planning):
- 📋 **P (Planning)**: Detailed implementation roadmap (4 weeks)
- 🏗️ **A (Architecture)**: System development (12 weeks)
- 🔧 **R (Refinement)**: Optimization and polish (2 weeks)
- ✅ **C (Completion)**: Production deployment (2 weeks)

## 🔍 Key Features

### Universal (All Tiers)
- End-to-end encryption
- Unlimited file sizes
- Role-based access control
- File versioning
- Cross-platform desktop access (Mac/Windows/Linux)

### Tier-Specific
- **AI Agent**: Content summarization (Professional+)
- **Audit Trails**: Compliance tracking (Business+)
- **Web/Mobile**: Multi-platform access (Business+)
- **Self-hosting**: Native install or optional Docker (Enterprise)

## 📖 Documentation

### S Phase Deliverables (COMPLETE)
- [System Assertions](SYSTEM-ASSERTIONS.md) - Complete requirements analysis (370+ assertions)
- [Technical Architecture](docs/ARCHITECTURE.md) - Multi-tier platform architecture
- [Authentication Strategy](docs/AUTHENTICATION-STRATEGY.md) - AWS Cognito integration
- [SPARC Strategy](docs/SPARC-STRATEGY.md) - Development methodology
- [Feature Files](features/) - BDD scenarios for all functionality
- [Technical Feasibility](TECHNICAL-FEASIBILITY-ANALYSIS.md) - Implementation validation
- [S Phase Completion](S-PHASE-COMPLETION.md) - Specification phase summary

## 🚫 What We DON'T Do

- Upload content to cloud (except Business+ web/mobile)
- Store content on central servers (except Enterprise self-hosting)
- Compromise content privacy
- Limit file sizes or storage
- Require complex setup procedures

## 🎯 Target Users by Tier

### Personal (FREE)
- All users seeking basic P2P collaboration
- Individuals and families
- Students and researchers

### Professional ($6/$60)
- Prosumers needing AI enhancement
- Content creators and knowledge workers
- Independent professionals

### Business ($12/$120)
- Teams and SMBs
- Organizations needing compliance
- Mobile-first teams

### Enterprise (CALL)
- Large organizations
- Highly regulated industries
- IT departments needing full control

## 🔧 Key Architectural Tensions to Resolve

1. **P2P vs. Web/Mobile Access**: How Content Service bridges P2P and web clients
2. **Zero-knowledge vs. AWS Cognito**: Centralized auth vs. privacy claims  
3. **Topic Limits vs. P2P**: Enforcing freemium limits in decentralized system
4. **Self-hosting vs. Managed**: Enterprise control vs. ease of deployment

## 🛠️ Development Methodology

This project uses the **SPARC methodology** enhanced by AI collaboration:
- **S**pecification: Comprehensive requirements analysis ← **CURRENT PHASE**
- **P**lanning: Detailed implementation plan
- **A**rchitecture: System design and component interactions
- **R**efinement: Continuous optimization and improvement
- **C**ompletion: Testing, documentation, and deployment

---

**Note**: This repository contains specifications and will contain implementation once the S (Specification) phase is complete.