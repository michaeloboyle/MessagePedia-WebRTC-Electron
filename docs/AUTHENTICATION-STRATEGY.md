# MessagePedia Authentication Strategy

**Date**: 2025-08-20  
**Purpose**: Multi-tier authentication architecture for The Collective Intelligence App  
**Context**: AWS Cognito integration with enterprise identity management

## Executive Summary

MessagePedia implements a comprehensive authentication strategy using **AWS Cognito** as the primary identity provider, supporting multi-tier access control, enterprise integration, and self-hosting options. This approach balances security, scalability, and user experience across all product tiers.

## Multi-Tier Authentication Architecture

### Authentication by Tier

| Tier | Authentication Method | Identity Separation | Features |
|------|----------------------|-------------------|----------|
| **Personal (FREE)** | AWS Cognito Personal | Personal email | Basic P2P access |
| **Professional ($6/$60)** | AWS Cognito Personal | Personal email | Unlimited topics + AI |
| **Business ($12/$120)** | AWS Cognito Organization | Work email domains | Web/Mobile + Audit |
| **Enterprise (CALL)** | AWS Cognito + Self-hosted | SSO integration | Full control + Admin |

## AWS Cognito Integration Architecture

### Core Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as MessagePedia App
    participant C as AWS Cognito
    participant R as Rendezvous Service
    participant P as P2P Network
    
    Note over U,P: Initial Authentication
    U->>A: Launch MessagePedia
    A->>C: Check existing session
    C->>A: No valid session
    A->>U: Show login screen
    
    Note over U,P: AWS Cognito Authentication
    U->>A: Enter credentials
    A->>C: Authenticate user
    C->>C: Validate credentials
    C->>A: Return JWT tokens (ID, Access, Refresh)
    
    Note over U,P: Session Establishment
    A->>A: Extract user claims (email, tier, groups)
    A->>A: Store tokens securely (Electron SafeStorage)
    A->>R: Register peer with verified identity
    R->>A: Return peer credentials
    A->>P: Initialize P2P with authenticated identity
```

### Multi-Tier User Pool Architecture

```mermaid
architecture-beta
    group cognito[AWS Cognito User Pools]
    
    group personal_pool[Personal User Pool] in cognito
    service personal_users[Personal Users<br/>@gmail.com, @yahoo.com] in personal_pool
    service personal_groups[User Groups<br/>Personal, Professional] in personal_pool
    
    group business_pool[Business User Pool] in cognito
    service business_users[Business Users<br/>@company.com domains] in business_pool
    service business_groups[User Groups<br/>Business, Teams] in business_pool
    
    group enterprise_pool[Enterprise User Pool] in cognito
    service enterprise_users[Enterprise Users<br/>SSO Federation] in enterprise_pool
    service enterprise_groups[User Groups<br/>Admin, Employee] in enterprise_pool
    
    group federation[Identity Federation] in cognito
    service saml[SAML 2.0<br/>Enterprise SSO] in federation
    service oidc[OpenID Connect<br/>Third-party IdP] in federation
    service ldap[LDAP/AD<br/>Directory Services] in federation
    
    personal_users:B --> T:personal_groups
    business_users:B --> T:business_groups
    enterprise_users:B --> T:enterprise_groups
    
    enterprise_users:R --> L:saml
    saml:B --> T:oidc
    oidc:B --> T:ldap
```

## Tier-Specific Authentication Details

### Personal & Professional Tiers

**Authentication Method**: AWS Cognito User Pool (Personal)

```mermaid
flowchart TD
    A[User Registration] --> B[Email Verification]
    B --> C[Basic Profile Setup]
    C --> D{Tier Selection}
    
    D -->|Free| E[Personal Tier<br/>3 Topic Limit]
    D -->|$6/$60| F[Professional Tier<br/>Unlimited + AI]
    
    E --> G[Desktop App Access]
    F --> G
    
    G --> H[P2P Network Join]
    H --> I[Topic Creation/Joining]
```

**User Attributes**:
```json
{
  "sub": "user-uuid",
  "email": "user@gmail.com",
  "email_verified": true,
  "custom:tier": "personal|professional",
  "custom:topic_limit": 3,
  "custom:features": ["p2p", "encryption", "ai_summary"],
  "cognito:groups": ["personal_users", "professional_users"]
}
```

### Business Tier

**Authentication Method**: AWS Cognito User Pool (Business)

```mermaid
sequenceDiagram
    participant U as Business User
    participant A as MessagePedia App
    participant C as AWS Cognito Business Pool
    participant W as Web/Mobile Content Service
    participant P as P2P Network
    
    Note over U,P: Business Authentication
    U->>A: Login with work email
    A->>C: Authenticate (@company.com)
    C->>A: Return JWT with business claims
    A->>A: Validate business domain
    
    Note over U,P: Multi-Platform Access
    A->>W: Register for web/mobile access
    W->>C: Validate JWT tokens
    W->>A: Provision Content Service access
    A->>P: Join P2P with business identity
```

**Business Domain Validation**:
```javascript
// Business tier domain validation
const businessDomains = [
  "company.com",
  "enterprise.org", 
  "business.net"
];

function validateBusinessEmail(email) {
  const domain = email.split('@')[1];
  return businessDomains.includes(domain);
}
```

### Enterprise Tier

**Authentication Method**: AWS Cognito + Enterprise SSO Federation

```mermaid
architecture-beta
    group enterprise[Enterprise Authentication]
    
    group sso[Enterprise SSO] in enterprise
    service ad[Active Directory<br/>Corporate LDAP] in sso
    service saml_idp[SAML Identity Provider<br/>Okta, Azure AD] in sso
    service oidc_provider[OpenID Connect<br/>Custom IdP] in sso
    
    group cognito_enterprise[AWS Cognito Enterprise] in enterprise
    service federation[Identity Federation<br/>SAML + OIDC] in cognito_enterprise
    service user_pool[Enterprise User Pool<br/>Federated Users] in cognito_enterprise
    service admin_groups[Admin Groups<br/>Policy Management] in cognito_enterprise
    
    group self_hosted[Self-hosted Components] in enterprise
    service local_auth[Local Auth Service<br/>On-premise] in self_hosted
    service admin_console[Admin Console<br/>Policy Management] in self_hosted
    
    ad:R --> T:federation
    saml_idp:B --> T:federation
    oidc_provider:L --> R:federation
    
    federation:B --> T:user_pool
    user_pool:B --> T:admin_groups
    
    admin_groups:B --> T:local_auth
    local_auth:R --> L:admin_console
```

## Corporate vs Personal Identity Separation

### Identity Architecture

```mermaid
flowchart TD
    A[User Identity] --> B{Identity Type}
    
    B -->|Personal| C[Personal AWS Cognito Pool]
    B -->|Corporate| D[Business AWS Cognito Pool]
    B -->|Enterprise| E[Federated Enterprise Identity]
    
    C --> F[Personal Topics Only]
    D --> G[Business Topics + Audit]
    E --> H[Enterprise Topics + Admin]
    
    F --> I[Personal Device Registration]
    G --> J[Managed Device Registration]
    H --> K[Enterprise Device Management]
    
    I --> L[Basic P2P Access]
    J --> M[Web/Mobile + P2P Access]
    K --> N[Full Platform Access]
```

### Topic Access Control

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant AC as Access Control
    participant T as Topic
    
    Note over U,T: Topic Access Validation
    U->>A: Request topic access
    A->>AC: Validate user identity + tier
    AC->>AC: Check topic permissions
    AC->>AC: Validate identity type (personal/corporate)
    
    Note over U,T: Access Decision
    alt Corporate Topic + Personal Identity
        AC->>A: Access Denied (Identity Mismatch)
    else Personal Topic + Corporate Identity  
        AC->>A: Access Denied (Policy Violation)
    else Matching Identity Types
        AC->>T: Grant access with role
        T->>A: Topic content available
    end
```

## Security Implementation

### Token Management

```mermaid
flowchart TD
    A[AWS Cognito JWT] --> B[Token Validation]
    B --> C[Claims Extraction]
    C --> D[Tier Determination]
    
    D --> E{Token Storage}
    E -->|Desktop| F[Electron SafeStorage<br/>Encrypted Keychain]
    E -->|Web| G[Secure HTTP-Only Cookies<br/>SameSite Strict]
    E -->|Mobile| H[Platform Keystore<br/>iOS/Android Secure]
    
    F --> I[Local Token Refresh]
    G --> I
    H --> I
    
    I --> J[Background Refresh<br/>Seamless Experience]
```

### End-to-End Encryption Integration

```mermaid
sequenceDiagram
    participant A as Alice (Authenticated)
    participant E as Encryption Layer
    participant P as P2P Channel
    participant B as Bob (Authenticated)
    
    Note over A,B: Authenticated P2P with E2E Encryption
    A->>E: Content + User Identity Claims
    E->>E: Generate per-topic encryption keys
    E->>P: Encrypted content + authenticated metadata
    P->>B: Encrypted transmission
    B->>E: Decrypt with topic keys
    E->>B: Plain content + verified sender identity
```

## Enterprise Admin Console Authentication

### Admin Role Architecture

```mermaid
architecture-beta
    group admin[Enterprise Admin Console]
    
    group roles[Admin Roles] in admin
    service super_admin[Super Admin<br/>Full System Control] in roles
    service it_admin[IT Admin<br/>User Management] in roles
    service security_admin[Security Admin<br/>Policy Management] in roles
    service audit_admin[Audit Admin<br/>Compliance Review] in roles
    
    group permissions[Admin Permissions] in admin
    service user_mgmt[User Management<br/>Create/Delete/Modify] in permissions
    service policy_mgmt[Policy Management<br/>Security Policies] in permissions
    service audit_access[Audit Access<br/>Log Review] in permissions
    service system_config[System Config<br/>Enterprise Settings] in permissions
    
    super_admin:R --> T:user_mgmt
    it_admin:B --> T:user_mgmt
    security_admin:B --> T:policy_mgmt
    audit_admin:B --> T:audit_access
    
    user_mgmt:R --> L:system_config
    policy_mgmt:B --> T:audit_access
```

### Admin Authentication Flow

```mermaid
sequenceDiagram
    participant A as Admin User
    participant AC as Admin Console
    participant C as AWS Cognito
    participant M as MFA Provider
    participant AS as Admin Service
    
    Note over A,AS: High-Security Admin Login
    A->>AC: Access admin console
    AC->>C: Require admin authentication
    C->>A: Request credentials + MFA
    A->>M: Provide MFA token
    M->>C: Validate MFA
    C->>AC: Admin JWT with elevated claims
    AC->>AS: Access admin functions
    AS->>AC: Admin dashboard + controls
```

## Self-Hosting Authentication

### On-Premise Identity Integration

```mermaid
architecture-beta
    group self_hosted[Self-hosted Enterprise]
    
    group identity[Identity Services] in self_hosted
    service local_cognito[Local AWS Cognito<br/>Enterprise Account] in identity
    service ldap_connector[LDAP Connector<br/>Active Directory] in identity
    service saml_bridge[SAML Bridge<br/>Enterprise SSO] in identity
    
    group services[MessagePedia Services] in self_hosted
    service auth_service[Auth Service<br/>Local Validation] in services
    service p2p_relay[P2P Relay<br/>Internal Network] in services
    service admin_service[Admin Service<br/>Policy Enforcement] in services
    
    group network[Network Layer] in self_hosted
    service firewall[Corporate Firewall<br/>Network Security] in network
    service vpn[VPN Gateway<br/>Remote Access] in network
    
    local_cognito:R --> T:auth_service
    ldap_connector:B --> T:auth_service
    saml_bridge:L --> R:auth_service
    
    auth_service:B --> T:p2p_relay
    p2p_relay:B --> T:admin_service
    
    admin_service:B --> T:firewall
    firewall:R --> L:vpn
```

## Privacy and Compliance

### Data Minimization

```mermaid
flowchart TD
    A[User Authentication] --> B[Extract Minimal Claims]
    B --> C{Required Data Only}
    
    C -->|Identity| D[User ID + Email]
    C -->|Authorization| E[Tier + Groups]
    C -->|Audit| F[Login Time + Location]
    
    D --> G[P2P Identity Verification]
    E --> H[Feature Access Control]
    F --> I[Compliance Logging]
    
    G --> J[Zero-Knowledge P2P]
    H --> J
    I --> K[Audit Trail Storage]
```

### GDPR Compliance

- **Right to Access**: Export user authentication data
- **Right to Rectification**: Update user profile information
- **Right to Erasure**: Delete user accounts and associated data
- **Data Portability**: Export user data in machine-readable format
- **Consent Management**: Explicit consent for data processing

## Implementation Considerations

### Technical Requirements

1. **AWS Cognito Setup**: Multi-pool architecture for different tiers
2. **JWT Validation**: Secure token verification across all services
3. **Session Management**: Seamless token refresh and rotation
4. **MFA Integration**: Multi-factor authentication for enterprise tiers
5. **SSO Federation**: SAML/OIDC integration for enterprise customers

### Security Best Practices

1. **Token Security**: Short-lived access tokens, secure refresh tokens
2. **Transport Security**: TLS 1.3 for all authentication traffic
3. **Storage Security**: Platform-native secure storage for tokens
4. **Audit Logging**: Comprehensive authentication event logging
5. **Rate Limiting**: Protection against brute force attacks

## Next Steps for P Phase

1. **AWS Cognito Configuration**: Set up multi-tier user pools
2. **SDK Integration**: Implement AWS Cognito SDKs in Electron/Web/Mobile
3. **Token Management**: Secure storage and refresh mechanisms
4. **Admin Console**: Enterprise management interface development
5. **SSO Integration**: SAML/OIDC federation for enterprise customers

---

**Authentication Status**: Comprehensive multi-tier strategy defined  
**Next Phase**: P (Planning) - Detailed implementation planning and AWS setup