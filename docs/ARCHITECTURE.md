# MessagePedia - The Collective Intelligence App: Architecture

**Date**: 2025-08-20  
**Purpose**: Multi-tier decentralized content collaboration platform architecture  
**Context**: Comprehensive system design for Personal/Professional/Business/Enterprise tiers

## Executive Summary

MessagePedia is a next-generation decentralized content collaboration platform that enables powerful ideas and productivity to emerge from collaboration, expertise, and competition of ideas from teams — enhanced by AI — while adhering to data privacy and sovereignty laws.

## Multi-Tier Product Architecture

### Product Offering Matrix

| Feature | Personal (FREE) | Professional ($6/$60) | Business ($12/$120) | Enterprise (CALL) |
|---------|-----------------|----------------------|-------------------|------------------|
| **Core Features** |
| File Sharing with Unshare | ✅ | ✅ | ✅ | ✅ |
| Messaging with Recall | ✅ | ✅ | ✅ | ✅ |
| Role-based Access Control | ✅ | ✅ | ✅ | ✅ |
| File Versioning | ✅ | ✅ | ✅ | ✅ |
| End-to-End Encryption | ✅ | ✅ | ✅ | ✅ |
| Search (Messages and meta-data) | ✅ | ✅ | ✅ | ✅ |
| UNLIMITED File Size, Storage, Time | ✅ | ✅ | ✅ | ✅ |
| Desktop Access (Mac/Windows/Linux) | ✅ | ✅ | ✅ | ✅ |
| **Tier-Specific Features** |
| Topic Membership | Unlimited | Unlimited | Unlimited | Unlimited |
| Topic Ownership | 3 Topics | Unlimited | Unlimited | Unlimited |
| AI Agent (Content Summarization) | ❌ | ✅ | ✅ | ✅ |
| Audit Trail | ❌ | ❌ | ✅ | ✅ |
| Web/Mobile Access | ❌ | ❌ | ✅ | ✅ |
| Customer Self-hosting | ❌ | ❌ | ❌ | ✅ |
| Admin Console | ❌ | ❌ | ❌ | ✅ |
| **Target Users** | All | Prosumers | Teams/SMBs | Enterprises |

## System Architecture Overview

### Decentralized Content Services Platform

```mermaid
architecture-beta
    group platform[Decentralized Content Services Platform]
    
    group client_tier[Client Applications] in platform
    service desktop[Desktop Apps<br/>Electron (Mac/Windows/Linux)] in client_tier
    service web[Web Apps<br/>React SPA] in client_tier
    service mobile[Mobile Apps<br/>iOS/Android] in client_tier
    
    group core_services[Core Services Layer] in platform
    service auth[Identity & Access<br/>AWS Cognito] in core_services
    service messaging[Messaging & File Sharing<br/>WebRTC P2P] in core_services
    service ai[AI Agent<br/>Local Processing] in core_services
    
    group enterprise_services[Enterprise Services] in platform
    service federation[User & Content Federation<br/>Cross-org Sync] in enterprise_services
    service encryption[End-to-End Encryption<br/>All Tiers] in enterprise_services
    service compliance[Compliance & Reporting<br/>Business+ Tiers] in enterprise_services
    
    group infrastructure[Infrastructure Layer] in platform
    service rendezvous[Rendezvous Service<br/>Peer Discovery] in infrastructure
    service relay[Relay Service<br/>Message/File Sync] in infrastructure
    service content[Content Service<br/>Web/Mobile Bridge] in infrastructure
    service audit[Audit Service<br/>Compliance Tracking] in infrastructure
    service admin[Admin Service<br/>Enterprise Management] in infrastructure
    service container[Containerization<br/>Self-hosting] in infrastructure
    
    desktop:B --> T:messaging
    web:B --> T:content
    mobile:B --> T:content
    
    messaging:B --> T:auth
    messaging:R --> L:encryption
    ai:B --> T:messaging
    
    auth:B --> T:rendezvous
    messaging:B --> T:relay
    compliance:B --> T:audit
    
    federation:R --> L:admin
    admin:B --> T:container
```

## Core Technology Stack

### Universal Components (All Tiers)
- **P2P Foundation**: WebRTC for direct peer connections
- **Authentication**: AWS Cognito user management
- **Encryption**: End-to-end encryption for all content
- **Desktop**: Electron applications (Mac/Windows/Linux)
- **Database**: SQLite for local storage
- **Signaling**: Rendezvous/Relay services for connection establishment

### Tier-Specific Components

#### Professional+ Tiers
- **AI Processing**: Local content summarization (Professional+)
- **Search Enhancement**: AI-powered content discovery

#### Business+ Tiers  
- **Web/Mobile Access**: Content Service bridges P2P to web/mobile
- **Audit System**: Compliance tracking and reporting
- **Multi-platform**: iOS/Android/Web applications

#### Enterprise Tier
- **Self-hosting**: Containerized deployment options
- **Admin Console**: User, content, and policy management
- **Federation**: Cross-organization collaboration

## Technical Architecture Details

### 1. P2P Messaging Foundation

```mermaid
sequenceDiagram
    participant A as Alice (Peer A)
    participant R as Rendezvous Service
    participant B as Bob (Peer B)
    
    Note over A,B: Peer Discovery
    A->>R: Register peer with AWS Cognito identity
    B->>R: Register peer with AWS Cognito identity
    R->>A: Notify: Bob available for P2P
    R->>B: Notify: Alice available for P2P
    
    Note over A,B: WebRTC Connection
    A->>R: Send WebRTC offer to Bob
    R->>B: Forward offer
    B->>R: Send WebRTC answer
    R->>A: Forward answer
    
    Note over A,B: ICE Negotiation
    A<-->R: Exchange ICE candidates
    R<-->B: Forward ICE candidates
    
    Note over A,B: Direct P2P Established
    A<-->B: Direct encrypted WebRTC connection
    A<-->B: Topic-based messaging
    A<-->B: File sharing with versioning
```

### 2. Multi-Tier Authentication

```mermaid
flowchart TD
    A[User Login] --> B{User Type}
    
    B -->|Personal/Professional| C[AWS Cognito<br/>Personal Email]
    B -->|Business| D[AWS Cognito<br/>Organization Email]
    B -->|Enterprise| E[Self-hosted Identity<br/>or AWS Cognito]
    
    C --> F[Desktop App Access]
    D --> G[Desktop + Web/Mobile]
    E --> H[Full Platform Access]
    
    F --> I[Basic P2P Features]
    G --> J[Business Features<br/>+ Audit Trails]
    H --> K[Enterprise Management<br/>+ Self-hosting]
    
    I --> L[Topic Limit: 3]
    J --> M[Unlimited Topics]
    K --> N[Admin Console]
```

### 3. Topics: P2P Workspaces

```mermaid
architecture-beta
    group topic[Topic: "Project Alpha"]
    
    service owner[Owner<br/>Complete Control] in topic
    service contributor[Contributors<br/>Edit + Share] in topic
    service reviewer[Reviewers<br/>View + Comment] in topic
    
    group content[Content Management] in topic
    service files[Files<br/>Unlimited Size] in content
    service messages[Messages<br/>with Recall] in content
    service versions[Version History<br/>All Changes] in content
    
    group access[Access Control] in topic
    service encryption[End-to-End<br/>Encryption] in access
    service permissions[Role-based<br/>Permissions] in access
    service lifecycle[Topic Lifecycle<br/>Archive/Delete] in access
    
    owner:R --> T:contributor
    contributor:R --> T:reviewer
    
    owner:B --> T:files
    files:R --> L:messages
    messages:R --> L:versions
    
    permissions:B --> T:encryption
    encryption:R --> T:lifecycle
```

### 4. AI Integration Architecture

```mermaid
flowchart LR
    A[Topic Content] --> B{AI Processing}
    
    B -->|Professional+| C[Local AI Agent<br/>Content Summarization]
    B -->|Business+| D[Enhanced Search<br/>AI-powered Discovery]
    B -->|Enterprise| E[Advanced AI<br/>Custom Models]
    
    C --> F[Summary Generation<br/>Privacy Preserved]
    D --> G[Intelligent Search<br/>Encrypted Content]
    E --> H[Custom AI Workflows<br/>Enterprise Policies]
    
    F --> I[P2P Distribution]
    G --> I
    H --> I
    
    I --> J[Zero-Knowledge<br/>AI Enhancement]
```

### 5. Web/Mobile Bridge Architecture (Business+ Tiers)

```mermaid
sequenceDiagram
    participant M as Mobile App
    participant C as Content Service
    participant P as P2P Desktop Peer
    participant T as Topic Members
    
    Note over M,T: Content Access from Mobile
    M->>C: Request topic content
    C->>C: Authenticate user (AWS Cognito)
    C->>P: Query peer for topic content
    P->>C: Encrypted content stream
    C->>M: Decrypted content (HTTPS)
    
    Note over M,T: Content Sharing from Mobile
    M->>C: Share file to topic
    C->>C: Encrypt and chunk file
    C->>P: Distribute to P2P network
    P->>T: Propagate to topic members
    T->>P: Acknowledge receipt
    P->>C: Confirm distribution
    C->>M: Share complete
```

## Enterprise Self-Hosting Architecture

### Containerized Deployment

```mermaid
architecture-beta
    group enterprise[Enterprise Deployment]
    
    group containers[Container Stack] in enterprise
    service app[MessagePedia App<br/>Electron Container] in containers
    service auth_local[Local Auth Service<br/>Enterprise SSO] in containers
    service relay_local[Local Relay Service<br/>Internal P2P] in containers
    service admin_local[Admin Console<br/>Policy Management] in containers
    
    group storage[Storage Layer] in enterprise
    service db[Enterprise Database<br/>Audit Trails] in storage
    service files[File Storage<br/>Corporate Assets] in storage
    service backup[Backup System<br/>Compliance] in storage
    
    group network[Network Layer] in enterprise
    service firewall[Corporate Firewall<br/>Security Policies] in network
    service vpn[VPN Access<br/>Remote Workers] in network
    service federation[External Federation<br/>Partner Orgs] in network
    
    app:B --> T:auth_local
    app:R --> L:relay_local
    admin_local:B --> T:auth_local
    
    auth_local:B --> T:db
    relay_local:B --> T:files
    admin_local:B --> T:backup
    
    relay_local:B --> T:firewall
    firewall:R --> L:vpn
    vpn:R --> L:federation
```

## Data Architecture

### SQLite Schema (All Tiers)

```sql
-- Core P2P Tables
CREATE TABLE peers (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    email TEXT,
    tier TEXT CHECK(tier IN ('personal', 'professional', 'business', 'enterprise')),
    topic_limit INTEGER DEFAULT 3,
    is_online BOOLEAN DEFAULT FALSE,
    reputation_score INTEGER DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id TEXT REFERENCES peers(id),
    is_private BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE topic_members (
    topic_id TEXT REFERENCES topics(id),
    peer_id TEXT REFERENCES peers(id),
    role TEXT CHECK(role IN ('owner', 'contributor', 'reviewer')),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (topic_id, peer_id)
);

-- Business+ Tier Tables
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    peer_id TEXT REFERENCES peers(id),
    topic_id TEXT REFERENCES topics(id),
    action TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Enterprise Tier Tables  
CREATE TABLE admin_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_name TEXT NOT NULL,
    policy_data TEXT NOT NULL,
    applied_by TEXT REFERENCES peers(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Security Architecture

### End-to-End Encryption (All Tiers)

```mermaid
flowchart TD
    A[Content Creation] --> B[Local Encryption<br/>AES-256]
    B --> C[WebRTC Channel<br/>DTLS Transport]
    C --> D[Peer Reception<br/>Encrypted]
    D --> E[Local Decryption<br/>Recipient Only]
    
    F[Key Management] --> G[Per-Topic Keys]
    G --> H[Key Rotation]
    H --> I[Forward Secrecy]
    
    B -.-> F
    E -.-> F
    
    J[Zero-Knowledge<br/>Signaling] --> K[Metadata Protection]
    K --> L[Content Privacy]
    
    C -.-> J
```

## Performance Requirements

### Connection Performance
- **Peer Discovery**: <2 seconds via Rendezvous Service
- **WebRTC Establishment**: <3 seconds with ICE/STUN/TURN
- **File Transfer**: >50MB/s on local network, bandwidth-limited over internet
- **Topic Sync**: <1 second for message propagation

### Scalability Targets
- **Personal Tier**: Up to 3 owned topics, unlimited membership
- **Professional+ Tiers**: Unlimited topics, up to 1000 members per topic
- **Enterprise Tier**: Unlimited scale with self-hosting options

### Resource Usage
- **Desktop App**: <300MB RAM, <1GB disk for app
- **Mobile App**: <100MB RAM, <500MB disk
- **Enterprise Server**: Scalable based on user count and content volume

## Deployment Architecture

### Cloud Infrastructure (Managed Tiers)

```mermaid
architecture-beta
    group aws[AWS Infrastructure]
    
    service cognito[AWS Cognito<br/>User Authentication] in aws
    service lambda[AWS Lambda<br/>Rendezvous/Relay] in aws
    service s3[AWS S3<br/>Mobile Content Bridge] in aws
    service rds[AWS RDS<br/>Audit Trails] in aws
    
    group cdn[Content Delivery] in aws
    service cloudfront[CloudFront<br/>Web App Distribution] in aws
    service api[API Gateway<br/>Mobile/Web APIs] in aws
    
    cognito:R --> L:lambda
    lambda:B --> T:s3
    api:B --> T:rds
    cloudfront:R --> L:api
```

### Self-Hosting Options (Enterprise)

```mermaid
flowchart LR
    A[Enterprise Requirements] --> B{Deployment Option}
    
    B -->|Cloud Hybrid| C[AWS + On-Premise<br/>Data Bridge]
    B -->|Full Self-Host| D[Complete On-Premise<br/>All Services Local]
    B -->|Container Cloud| E[Kubernetes<br/>Private Cloud]
    
    C --> F[Corporate Data<br/>Stays On-Premise]
    D --> G[Complete Control<br/>No External Dependencies]
    E --> H[Scalable Infrastructure<br/>Container Orchestration]
```

## Development Considerations

### Technical Feasibility Analysis
1. **✅ WebRTC P2P**: Proven technology, handles NAT traversal
2. **✅ Multi-tier Features**: Feasible with conditional feature flags
3. **⚠️ Web/Mobile Bridge**: Complex but achievable with Content Service
4. **⚠️ Enterprise Self-hosting**: Requires containerization and deployment automation
5. **✅ AWS Integration**: Well-documented APIs and SDKs available

### Architecture Tensions Resolution
1. **P2P vs Web/Mobile**: Content Service acts as authenticated bridge
2. **Zero-knowledge vs Cognito**: Authentication separate from content encryption
3. **Freemium Limits**: Enforced at app level, verified by community/audit
4. **Self-hosting vs Managed**: Containerized deployment maintains feature parity

## Next Steps for P Phase

1. **Component Interface Design**: Define APIs between all architectural components
2. **Database Schema Refinement**: Complete multi-tier schema with migrations
3. **Authentication Flow Design**: Detailed AWS Cognito integration patterns
4. **Deployment Strategy**: Container specifications and cloud infrastructure
5. **Testing Strategy**: Multi-tier testing approach with different feature sets

---

**Architecture Status**: Comprehensive multi-tier platform design complete  
**Next Phase**: P (Planning) - Detailed implementation planning and component design