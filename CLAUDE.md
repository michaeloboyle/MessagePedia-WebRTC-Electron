# Claude Code Configuration for MessagePedia WebRTC Electron

## Project Overview
**Repository**: MessagePedia-WebRTC-Electron  
**Purpose**: Modern WebRTC + Electron replacement for legacy JXTA-based P2P messaging system  
**Location**: `/Users/michaeloboyle/Documents/GitHub/MessagePedia-WebRTC-Electron`
MmvEG7Sqsaj0JGHJTK2_pvhHJyuZEwvQEHsbIVrJFAg
## Development Guidelines

### Authentication Integration
- **Sign in with Apple**: Primary authentication method for macOS users
- **OAuth Integration**: Support for multiple identity providers
- **Credentials Management**: Secure storage using Electron's safeStorage API
- **Account Email**: michaeloboyle@michaeloboyle.com (primary Apple ID)

### Mermaid Visualizations
All documentation should include comprehensive Mermaid.js diagrams:
- Architecture diagrams for system components
- Sequence diagrams for authentication flows
- State diagrams for connection management
- Flowcharts for user journeys
- Gantt charts for implementation timelines

### WebRTC Implementation
- **Connection Timeout**: Must be <2 seconds (vs JXTA's 15+ seconds)
- **File Transfer**: Chunked 64KB segments for optimal performance
- **NAT Traversal**: STUN/TURN server configuration required
- **P2P Architecture**: Direct peer connections with signaling server fallback

### Database Layer
- **SQLite**: Local persistence for messages and peer data
- **Schema**: 8 tables for complete P2P messaging support
- **Foreign Keys**: Proper constraint enforcement
- **Migrations**: Version-controlled schema changes

### Testing Requirements
- **TDD Approach**: Write tests before implementation
- **Coverage Target**: >95% for critical paths
- **Test Types**: Unit, integration, performance, cross-platform
- **CI/CD**: Automated testing on all commits

### Git Workflow
- **Commit Frequency**: After every significant change
- **Branch Strategy**: Feature branches off main
- **Worktrees**: Parallel development for different features
- **Issues**: GitHub issues for task tracking

### AI Agent Coordination
- **Claude Flow**: Orchestration layer for multi-agent collaboration
- **SPARC Methodology**: Specification → Pseudocode → Architecture → Refinement → Completion
- **Agent Types**: Architect, Coder, Analyst, Tester, Reviewer, Optimizer
- **Documentation**: Auto-generated from implementation

### Performance Targets
- **Connection Establishment**: <2 seconds
- **File Transfer Speed**: >50MB/s on local network
- **Memory Usage**: <200MB Electron footprint
- **Success Rate**: >95% connection reliability

### Security Considerations
- **End-to-End Encryption**: DTLS for all WebRTC traffic
- **Authentication**: OAuth 2.0 with PKCE flow
- **Credential Storage**: Electron safeStorage for sensitive data
- **Certificate Pinning**: For signaling server connections

### Documentation Standards
- **README.md**: Project overview with Mermaid block diagrams
- **ARCHITECTURE.md**: System design with architecture diagrams
- **SPARC-STRATEGY.md**: AI swarm methodology with state machines
- **PERFORMANCE-ANALYSIS.md**: Metrics with XY charts and quadrants
- **WEBRTC-CONNECTION-FLOW.md**: Detailed sequence diagrams

### Development Environment
- **Node.js**: v23.x (note: native module compatibility issues)
- **Electron**: Latest stable version
- **SQLite3**: Pure JavaScript implementation
- **React**: UI component framework
- **Socket.io**: Signaling server implementation

### Apple Integration Notes
- **Sign in with Apple**: Fast, secure authentication
- **Privacy**: Minimal data collection per Apple guidelines
- **Credential Export**: Not directly exportable, use OAuth tokens
- **Group Sharing**: "Not Shared" - individual user accounts
- **Security**: Biometric authentication support

## Quick Commands

```bash
# Start development
npm run dev

# Run tests
npm test

# Start multi-instance demo
./demo-p2p-messaging.sh

# Show agent dashboard
./show-agent-dashboard.sh

# Build for production
npm run build
```

## Current Status
- **Phase 1**: 75% Complete (WebRTC connection in progress)
- **Database**: ✅ Fully implemented with 8 tables
- **P2P Bridge**: ✅ File-based implementation (WebRTC pending)
- **UI**: ✅ Basic interface with database connectivity
- **Documentation**: ✅ Enhanced with 23 Mermaid diagram types

## Known Issues
- **Node.js 23**: Compilation issues with better-sqlite3 (using sqlite3 instead)
- **WebRTC**: Replacing file-based bridge with real WebRTC pending
- **Authentication**: Sign in with Apple integration pending

## Next Steps
1. Implement Sign in with Apple OAuth flow
2. Replace file-based P2P bridge with WebRTC DataChannels
3. Add STUN/TURN server configuration
4. Implement chunked file transfer protocol
5. Add end-to-end encryption layer

---
*Last Updated: 2025-08-11*
*Project Owner: Michael O'Boyle*