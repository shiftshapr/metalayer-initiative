# Top Enterprise SSO Providers

## Market Leaders (2024)

### Tier 1: Most Popular (Cover ~80% of Enterprise Market)

#### 1. **Microsoft Entra ID (Azure AD)** 🥇
- **Market Share:** ~40-50% of enterprise SSO
- **Protocols:** SAML 2.0, OIDC, OAuth 2.0, WS-Federation
- **Why Popular:**
  - Deep Microsoft 365 integration
  - Included with Microsoft 365 subscriptions
  - Large enterprise adoption
  - Conditional access policies
- **Adapter Priority:** 🔴 **HIGHEST** - Must have
- **Coverage:** If you support Azure AD, you cover the largest enterprise segment

#### 2. **Okta** 🥈
- **Market Share:** ~15-20% of enterprise SSO
- **Protocols:** SAML 2.0, OIDC, OAuth 2.0
- **Why Popular:**
  - 7,000+ pre-built app integrations
  - Strong developer tools
  - Excellent documentation
  - Popular with tech companies
- **Adapter Priority:** 🔴 **HIGH** - Very important
- **Coverage:** Covers many tech-forward enterprises

#### 3. **OneLogin** 🥉
- **Market Share:** ~5-10% of enterprise SSO
- **Protocols:** SAML 2.0, OIDC, OAuth 2.0
- **Why Popular:**
  - User-friendly interface
  - Strong security features
  - Good for mid-market companies
  - Competitive pricing
- **Adapter Priority:** 🟡 **MEDIUM** - Important
- **Coverage:** Popular with mid-market enterprises

---

### Tier 2: Significant Market Presence

#### 4. **Ping Identity**
- **Market Share:** ~3-5%
- **Protocols:** SAML 2.0, OIDC, OAuth 2.0, WS-Federation
- **Why Used:**
  - Enterprise-focused
  - Strong security features
  - Scalable for large organizations
- **Adapter Priority:** 🟡 **MEDIUM**
- **Note:** Uses standard SAML/OIDC, covered by generic adapters

#### 5. **Auth0 (now part of Okta)**
- **Market Share:** ~3-5%
- **Protocols:** OIDC, OAuth 2.0 (primarily OIDC)
- **Why Used:**
  - Developer-friendly
  - Highly customizable
  - Good for modern applications
- **Adapter Priority:** 🟡 **MEDIUM**
- **Note:** Uses OIDC, covered by OIDC adapter

#### 6. **Google Workspace (Google Cloud Identity)**
- **Market Share:** ~5-8%
- **Protocols:** OIDC, OAuth 2.0, SAML 2.0
- **Why Used:**
  - Included with Google Workspace
  - Popular with startups and tech companies
  - Easy to set up
- **Adapter Priority:** 🟢 **LOW** (OIDC adapter covers it)
- **Note:** Primarily OIDC, already covered if you have OIDC adapter

#### 7. **JumpCloud**
- **Market Share:** ~2-3%
- **Protocols:** SAML 2.0, OIDC, OAuth 2.0
- **Why Used:**
  - Cloud directory platform
  - Good for mid-market
  - Active Directory alternative
- **Adapter Priority:** 🟡 **MEDIUM**
- **Note:** Standard SAML/OIDC, covered by generic adapters

---

### Tier 3: Niche/Enterprise-Specific

#### 8. **IBM Security Verify**
- **Market Share:** ~1-2%
- **Protocols:** SAML 2.0, OIDC, OAuth 2.0
- **Why Used:**
  - Large enterprise focus
  - IBM ecosystem integration
- **Adapter Priority:** 🟢 **LOW** (standard protocols)

#### 9. **ForgeRock**
- **Market Share:** ~1-2%
- **Protocols:** SAML 2.0, OIDC, OAuth 2.0
- **Why Used:**
  - Open-source options
  - Large enterprise deployments
- **Adapter Priority:** 🟢 **LOW** (standard protocols)

#### 10. **Gluu**
- **Market Share:** <1%
- **Protocols:** SAML 2.0, OIDC, OAuth 2.0
- **Why Used:**
  - Open-source
  - Security-focused organizations
- **Adapter Priority:** 🟢 **LOW** (standard protocols)

---

## Protocol Coverage Analysis

### If You Build These 2 Adapters, You Cover:

#### 1. **OIDC Adapter** (OpenID Connect)
**Covers:**
- ✅ Google Workspace SSO
- ✅ Auth0
- ✅ Keycloak (open-source)
- ✅ Many modern SSO providers
- ✅ ~25-30% of enterprise SSO

**Effort:** ~1 week

#### 2. **SAML 2.0 Adapter**
**Covers:**
- ✅ Microsoft Entra ID (Azure AD) - **LARGEST**
- ✅ Okta
- ✅ OneLogin
- ✅ Ping Identity
- ✅ JumpCloud
- ✅ IBM Security Verify
- ✅ ForgeRock
- ✅ Gluu
- ✅ Most legacy enterprise SSO
- ✅ ~70-75% of enterprise SSO

**Effort:** ~1 week

### Total Coverage with 2 Adapters: **~95%+ of Enterprise SSO**

---

## Implementation Priority for Canopi

### Phase 1: Consumer SSO (Already Done ✅)
- Google, Facebook, Twitter, GitHub, Discord
- **Status:** Included in Web3Auth Plug and Play
- **Coverage:** 90%+ of consumer use cases

### Phase 2: Enterprise SSO (If Needed)

#### Priority Order:

1. **SAML 2.0 Adapter** (Highest Priority)
   - **Why:** Covers Azure AD (largest market share)
   - **Covers:** ~70% of enterprise SSO
   - **Effort:** ~1 week
   - **ROI:** Highest - covers most enterprises

2. **OIDC Adapter** (Second Priority)
   - **Why:** Covers modern SSO providers
   - **Covers:** ~25% of enterprise SSO
   - **Effort:** ~1 week
   - **ROI:** High - covers tech-forward companies

3. **Custom Adapters** (Only if needed)
   - For proprietary systems
   - Effort varies

### Total Enterprise SSO Implementation: **2 weeks for 95%+ coverage**

---

## Market Share Summary

| Provider | Market Share | Protocol | Adapter Needed |
|----------|-------------|----------|----------------|
| Microsoft Entra ID (Azure AD) | ~40-50% | SAML/OIDC | SAML Adapter |
| Okta | ~15-20% | SAML/OIDC | SAML Adapter |
| Google Workspace | ~5-8% | OIDC | OIDC Adapter |
| OneLogin | ~5-10% | SAML/OIDC | SAML Adapter |
| Ping Identity | ~3-5% | SAML/OIDC | SAML Adapter |
| Auth0 | ~3-5% | OIDC | OIDC Adapter |
| JumpCloud | ~2-3% | SAML/OIDC | SAML Adapter |
| Others | ~5-10% | Various | Generic adapters |

**Key Insight:** 2 adapters (SAML + OIDC) cover 95%+ of the market.

---

## Recommendation for Canopi

### Start With:
1. ✅ **Web3Auth Built-in SSO** (Google, Facebook, Twitter, etc.)
   - Already done, no work needed
   - Covers consumer use cases

### Add Later (If Enterprise Demand):
1. **SAML 2.0 Adapter** (~1 week)
   - Covers Azure AD, Okta, OneLogin
   - Covers ~70% of enterprise SSO
   - **Highest ROI**

2. **OIDC Adapter** (~1 week)
   - Covers Google Workspace, Auth0, modern SSO
   - Covers ~25% of enterprise SSO
   - **Good ROI**

### Total Enterprise SSO Coverage:
- **2 adapters = 95%+ coverage**
- **2 weeks total effort**
- **Only build if/when enterprise customers request it**

---

## Quick Reference: Top 5 Enterprise SSO

1. **Microsoft Entra ID (Azure AD)** - 40-50% market share
2. **Okta** - 15-20% market share
3. **OneLogin** - 5-10% market share
4. **Google Workspace** - 5-8% market share
5. **Ping Identity** - 3-5% market share

**All covered by:** SAML 2.0 + OIDC adapters

---

## Conclusion

**For Canopi:**
- ✅ Consumer SSO: Already covered (Web3Auth built-in)
- ⏳ Enterprise SSO: 2 adapters needed (SAML + OIDC)
- 📊 Coverage: 95%+ with 2 weeks of work
- 🎯 Priority: Build only if enterprise customers need it

The good news: Most enterprise SSO providers use standard protocols (SAML/OIDC), so you don't need custom adapters for each provider - just 2 generic adapters cover almost everything!

