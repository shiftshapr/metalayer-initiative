# Web-Embed SDK Security & Privacy

## Overview

This document outlines security measures, privacy considerations, and compliance requirements for the Web-Embed SDK.

---

## Security Architecture

### 1. Domain Whitelisting

**Purpose**: Prevent unauthorized use of embed instances on unintended domains.

**Implementation**:
- Each embed instance has a `domain_whitelist` array
- SDK validates current domain against whitelist before loading
- Backend API validates domain on config requests
- CORS headers restrict cross-origin requests

**Validation Logic**:
```javascript
function isDomainAllowed(currentDomain, whitelist) {
  // Normalize domains (remove protocol, www, trailing slash)
  const normalized = normalizeDomain(currentDomain);
  
  return whitelist.some(allowed => {
    const normalizedAllowed = normalizeDomain(allowed);
    // Exact match or subdomain match
    return normalized === normalizedAllowed || 
           normalized.endsWith('.' + normalizedAllowed);
  });
}
```

**Admin Controls**:
- Admins can only add domains they own (verified via DNS TXT record or meta tag)
- Domain verification required before activation
- Domain changes require re-verification

---

### 2. Content Security Policy (CSP)

**Challenge**: Many websites have strict CSP policies that may block SDK.

**Solutions**:

1. **Nonce Support**:
   ```html
   <script 
     src="https://cdn.canopi.live/embed/v1.js"
     nonce="[nonce-value]"
     data-canopi-id="..."
   ></script>
   ```

2. **Hash Support**:
   - Document script hash for inline code
   - Provide hash values for website owners

3. **CSP-Compatible Loading**:
   - Use `document.createElement('script')` instead of inline scripts
   - Avoid `eval()` and `new Function()`
   - Use `data:` URIs sparingly

4. **Documentation**:
   - Provide CSP directives needed
   - Example CSP configuration for website owners

**Required CSP Directives**:
```
script-src 'self' https://cdn.canopi.live;
connect-src 'self' https://api.canopi.live;
frame-src 'self' https://cdn.canopi.live;
```

---

### 3. Authentication & Authorization

### 3.1 Admin Authentication
- JWT tokens for API authentication
- Token expiration (1 hour)
- Refresh tokens for longer sessions
- Role-based access control (RBAC)

### 3.2 End User Authentication
- OAuth flows (Google, GitHub, etc.)
- Magic link authentication
- Guest mode (anonymous viewing)
- Session management

### 3.3 Instance Ownership
- Users can only access their own instances
- RLS policies enforce ownership at database level
- API validates ownership on all operations

---

### 4. Data Isolation

### 4.1 Instance Isolation
- Each embed instance is isolated
- No cross-instance data access
- Separate analytics per instance
- Community-scoped data

### 4.2 User Data Isolation
- User data scoped to community
- No cross-community data leakage
- Proper data partitioning

---

### 5. Input Validation & Sanitization

### 5.1 Configuration Validation
- Validate all JSONB configuration data
- Schema validation for page rules
- Schema validation for trigger config
- Domain validation (format, ownership)

### 5.2 User Input
- Sanitize all user-generated content
- XSS prevention in messages
- SQL injection prevention (parameterized queries)
- CSRF protection

**Example Validation**:
```javascript
function validatePageRules(rules) {
  const schema = {
    type: 'object',
    required: ['type'],
    properties: {
      type: { enum: ['all', 'specific', 'patterns'] },
      urls: { type: 'array', items: { type: 'string' } },
      patterns: { type: 'array', items: { type: 'string' } }
    }
  };
  
  return validate(schema, rules);
}
```

---

### 6. Rate Limiting

### 6.1 API Rate Limits
- **Authenticated endpoints**: 1000 req/hour per user
- **Public config**: 100 req/minute per IP
- **Analytics events**: 100 events/minute per IP

### 6.2 SDK Rate Limits
- Limit sidebar load attempts (prevent abuse)
- Throttle analytics events
- Backoff on errors

**Implementation**:
```javascript
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean old entries
    for (const [key, timestamp] of this.requests.entries()) {
      if (timestamp < windowStart) {
        this.requests.delete(key);
      }
    }
    
    // Check limit
    const count = Array.from(this.requests.values())
      .filter(ts => ts >= windowStart).length;
    
    if (count >= this.maxRequests) {
      return false;
    }
    
    this.requests.set(identifier, now);
    return true;
  }
}
```

---

### 7. Secure Communication

### 7.1 HTTPS Only
- All API endpoints HTTPS only
- CDN serves SDK over HTTPS
- Enforce HTTPS redirects
- HSTS headers

### 7.2 CORS Configuration
- Restrictive CORS policies
- Whitelist specific origins
- No wildcard origins in production

**CORS Headers**:
```
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### 7.3 API Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

## Privacy Considerations

### 1. Data Collection

### 1.1 What We Collect
- **Analytics Events**: Page views, trigger impressions, sidebar opens
- **User Data**: Only if user authenticates
- **Session Data**: Anonymous session IDs
- **Technical Data**: User agent, page URL, referrer

### 1.2 What We Don't Collect
- Personal information without consent
- Browsing history outside embed context
- Form data from host website
- Payment information
- Sensitive user data

### 1.3 Data Minimization
- Collect only necessary data
- Anonymize where possible
- Use hashed identifiers for anonymous users
- Regular data cleanup (retention policies)

---

### 2. GDPR Compliance

### 2.1 Right to Access
- Users can request their data
- Provide data export functionality
- Clear data access procedures

### 2.2 Right to Deletion
- Users can delete their accounts
- Delete associated embed instances
- Delete analytics data (with retention exceptions)
- Clear deletion procedures

### 2.3 Consent Management
- Clear privacy policy
- Cookie consent (if using cookies)
- Opt-out mechanisms
- Consent withdrawal process

### 2.4 Data Processing Agreements
- DPA with data processors
- Subprocessor notifications
- Data transfer safeguards

---

### 3. CCPA Compliance

### 3.1 Consumer Rights
- Right to know what data is collected
- Right to delete personal information
- Right to opt-out of sale (if applicable)
- Non-discrimination for exercising rights

### 3.2 Implementation
- Privacy policy updates
- Opt-out mechanisms
- Data deletion processes
- Consumer request handling

---

### 4. Cookie Policy

### 4.1 Cookie Usage
- **Session Cookies**: For authentication
- **Analytics Cookies**: For tracking (with consent)
- **Preference Cookies**: For user preferences

### 4.2 Cookie Consent
- Cookie banner (if required)
- Consent management
- Opt-out options

---

### 5. Third-Party Services

### 5.1 Subprocessors
- List all third-party services
- Data processing agreements
- Subprocessor notifications
- Regular audits

### 5.2 CDN & Hosting
- CDN provider privacy policy
- Data residency requirements
- Encryption in transit and at rest

---

## Security Best Practices

### 1. Code Security

### 1.1 Dependency Management
- Regular dependency updates
- Security vulnerability scanning
- Use only trusted packages
- Lock dependency versions

### 1.2 Code Review
- All code reviewed before merge
- Security-focused reviews
- Automated security scanning
- Penetration testing

### 1.3 Secure Coding
- Input validation
- Output encoding
- Parameterized queries
- Secure defaults

---

### 2. Infrastructure Security

### 2.1 Server Security
- Regular security updates
- Firewall configuration
- Intrusion detection
- Log monitoring

### 2.2 Database Security
- Encrypted connections
- Encrypted at rest
- Access controls
- Regular backups
- Backup encryption

### 2.3 Network Security
- DDoS protection
- WAF (Web Application Firewall)
- SSL/TLS configuration
- Network segmentation

---

### 3. Incident Response

### 3.1 Incident Detection
- Monitoring and alerting
- Log analysis
- Anomaly detection
- Security event correlation

### 3.2 Response Plan
- Incident response team
- Escalation procedures
- Communication plan
- Recovery procedures
- Post-incident review

### 3.3 Breach Notification
- Legal requirements (GDPR, CCPA)
- User notification procedures
- Regulatory notification
- Public disclosure (if required)

---

## Compliance Checklist

### GDPR
- [ ] Privacy policy updated
- [ ] Data processing agreements in place
- [ ] Consent mechanisms implemented
- [ ] Data access procedures documented
- [ ] Data deletion procedures implemented
- [ ] DPO (Data Protection Officer) assigned (if required)
- [ ] Data breach notification procedures
- [ ] Regular compliance audits

### CCPA
- [ ] Privacy policy includes CCPA disclosures
- [ ] Opt-out mechanisms implemented
- [ ] Consumer request handling procedures
- [ ] Non-discrimination policy
- [ ] Regular compliance reviews

### SOC 2 (Future)
- [ ] Security controls implemented
- [ ] Access controls documented
- [ ] Monitoring and logging
- [ ] Incident response procedures
- [ ] Regular audits

---

## Security Testing

### 1. Vulnerability Scanning
- Regular automated scans
- Dependency vulnerability checks
- Infrastructure scans
- Application scans

### 2. Penetration Testing
- Annual penetration tests
- Third-party security audits
- Bug bounty program (future)

### 3. Security Audits
- Code security reviews
- Architecture reviews
- Compliance audits
- Third-party audits

---

## Monitoring & Alerting

### 1. Security Monitoring
- Failed authentication attempts
- Unusual API usage patterns
- Suspicious domain activity
- Error rate spikes

### 2. Alerting
- Real-time security alerts
- Incident notifications
- Performance degradation
- System failures

### 3. Logging
- Comprehensive audit logs
- Security event logs
- Access logs
- Error logs
- Log retention policies

---

## Documentation

### 1. Security Documentation
- Security architecture
- Threat model
- Security controls
- Incident response plan

### 2. Privacy Documentation
- Privacy policy
- Cookie policy
- Data processing agreements
- User rights documentation

### 3. Compliance Documentation
- GDPR compliance measures
- CCPA compliance measures
- Audit reports
- Compliance certifications

---

## Regular Reviews

### Quarterly
- Security vulnerability review
- Dependency updates
- Access control review
- Compliance status review

### Annually
- Full security audit
- Penetration testing
- Privacy policy review
- Compliance audit
- Incident response drill

---

## Contact

**Security Issues**: security@canopi.live  
**Privacy Questions**: privacy@canopi.live  
**Data Requests**: data-requests@canopi.live

---

**Last Updated**: [Current Date]  
**Version**: 1.0  
**Status**: Draft - Pending Review






