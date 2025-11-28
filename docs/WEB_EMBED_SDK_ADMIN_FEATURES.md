# Web-Embed SDK Admin Features & Workflow

## Overview

This document outlines the admin interface, public request system, status management, admin assignment, and word blacklist features for the Web-Embed SDK.

---

## 1. Admin Dashboard View

### 1.1 Canopies Management Table

**Layout**: Similar to existing Canopies view

```
┌─────────────────────────────────────────────────────────────┐
│ Presence Developer beta                    [User Avatar]    │
├──────────┬──────────────────────────────────────────────────┤
│          │ Canopies                              [+ New]    │
│ Canopies │ ─────────────────────────────────────────────── │
│ [Active] │                                                  │
│          │ ┌──────────────────────────────────────────────┐ │
│ Canopi   │ │ Website Name │ Website URL │ Status │ Actions│ │
│ Events   │ ├──────────────┼─────────────┼────────┼────────┤ │
│          │ │ ▼ Meta Layer │ themetalayer│ Active │  ⋮     │ │
│ Analytics│ │   Initiative  │ .org        │        │        │ │
│          │ │ ▼ Text Racing │ textracing │ Active │  ⋮     │ │
│ Widgets  │ │   .com        │             │        │        │ │
│          │ │ ▼ Pending     │ example.com │Pending │  ⋮     │ │
│          │ │   Request     │             │        │        │ │
│          │ └──────────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────┘
```

### 1.2 Table Columns

1. **Website Name** - Name of the Canopi instance
2. **Website URL** - Domain where embed is used
3. **Canopi URL** - Backend domain (e.g., themetalayer.org)
4. **Status** - Badge showing status (Active, Pending, Rejected, Suspended)
5. **Created** - Date created
6. **Owner** - User who created/owns it
7. **Actions** - Dropdown menu (⋮)

### 1.3 Actions Menu

**For Admin Users:**
- View Details
- Edit Configuration
- Manage Admins
- Manage Blacklist
- Generate Embed Code
- View Analytics
- Change Status (Approve/Reject/Suspend)
- Delete

**For Canopi Owners:**
- View Details
- Edit Configuration
- Manage Admins
- Manage Blacklist
- Generate Embed Code
- View Analytics
- Delete (if allowed)

### 1.4 Filters & Search

- **Status Filter**: All, Active, Pending, Rejected, Suspended
- **Search**: By name, URL, or owner
- **Sort**: By name, date, status
- **Pagination**: 20 per page

---

## 2. Public Request System

### 2.1 Request Form (Public Access)

**URL**: `/canopies/request` or `/request-canopi`

```
┌─────────────────────────────────────────────────────────────┐
│ Request a Canopi Embed                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Fill out the form below to request a Canopi embed for     │
│ your website. Our team will review your request.           │
│                                                             │
│ Your Information                                            │
│ ─────────────────────────────────────                      │
│ Name *:                                                     │
│ [Your Name                                    ]             │
│                                                             │
│ Email *:                                                    │
│ [your@email.com                                ]            │
│                                                             │
│ Website Information                                         │
│ ─────────────────────────────────────                      │
│ Website Name *:                                             │
│ [My Awesome Website                            ]            │
│                                                             │
│ Website URL *:                                              │
│ [https://mywebsite.com                          ]            │
│                                                             │
│ Canopi URL *:                                               │
│ [https://themetalayer.org                        ]          │
│ (Domain where your Canopi community operates)              │
│                                                             │
│ Use Case                                                    │
│ ─────────────────────────────────────                      │
│ How will you use this embed? *:                             │
│ [Textarea - 500 chars max                      ]            │
│                                                             │
│ Expected Traffic:                                           │
│ [Low ▼] (Low / Medium / High)                              │
│                                                             │
│ Terms & Conditions                                          │
│ ─────────────────────────────────────                      │
│ ☑ I agree to the Terms of Service                         │
│ ☑ I agree to the Community Guidelines                     │
│                                                             │
│ [Cancel]  [Submit Request]                                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Request Submission Flow

1. User fills out form
2. Request created with status: `pending`
3. Email notification sent to:
   - Request submitter (confirmation)
   - Platform admins (new request alert)
4. Request appears in admin dashboard
5. Admin reviews and approves/rejects
6. User receives email notification of decision

### 2.3 Request Confirmation Page

```
┌─────────────────────────────────────────────────────────────┐
│ Request Submitted Successfully!                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ✓ Your request has been received                         │
│                                                             │
│   Request ID: #12345                                       │
│   Website: My Awesome Website                             │
│   Status: Pending Review                                   │
│                                                             │
│   We'll review your request and get back to you within    │
│   24-48 hours. You'll receive an email notification      │
│   when your request is reviewed.                           │
│                                                             │
│   [View My Requests]  [Back to Home]                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Status Management

### 3.1 Status Types

| Status | Description | Who Can Set | Actions Available |
|--------|-------------|-------------|-------------------|
| **pending** | Request submitted, awaiting review | System (on create) | Admin: Approve/Reject |
| **approved** | Request approved, ready to configure | Admin | Owner: Configure, Admin: Activate |
| **active** | Live and working | Admin/Owner | All actions available |
| **suspended** | Temporarily disabled | Admin | Admin: Reactivate/Delete |
| **rejected** | Request denied | Admin | Admin: Delete, User: Can re-request |

### 3.2 Status Workflow

```
[User Submits Request]
        ↓
    [pending]
        ↓
[Admin Reviews]
    ↙    ↘
[approved]  [rejected]
    ↓
[Owner Configures]
    ↓
[active]
    ↓
[Admin Can Suspend]
    ↓
[suspended]
```

### 3.3 Status Badge Design

```css
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-pending { background: #fff3cd; color: #856404; }
.status-approved { background: #d1ecf1; color: #0c5460; }
.status-active { background: #d4edda; color: #155724; }
.status-suspended { background: #f8d7da; color: #721c24; }
.status-rejected { background: #f8d7da; color: #721c24; }
```

### 3.4 Status Change Actions

**Admin Actions:**
- Approve pending → `approved`
- Reject pending → `rejected`
- Activate approved → `active`
- Suspend active → `suspended`
- Reactivate suspended → `active`
- Delete any status → (soft delete)

**Owner Actions:**
- Configure approved → (stays `approved`)
- Request activation → (admin must activate)

---

## 4. Admin Management

### 4.1 Admin Roles

| Role | Permissions |
|------|-------------|
| **Platform Admin** | All Canopis, approve/reject requests, suspend any Canopi |
| **Canopi Owner** | Full control of their Canopi(s) |
| **Canopi Admin** | Manage specific Canopi (assigned by owner) |

### 4.2 Add Admins Interface

**Location**: Canopi Details → "Manage Admins" tab

```
┌─────────────────────────────────────────────────────────────┐
│ Manage Admins - Meta Layer Initiative                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Current Admins                                              │
│ ─────────────────────────────────────                      │
│                                                             │
│ [Avatar] Daveed Benjamin (Owner)              [Remove]     │
│ daveed@example.com                                         │
│                                                             │
│ [Avatar] Jane Smith                          [Remove]      │
│ jane@example.com                                           │
│                                                             │
│ Add New Admin                                               │
│ ─────────────────────────────────────                      │
│ Search for user:                                            │
│ [Type name or email...                    ] [Search]      │
│                                                             │
│ [Search Results]                                           │
│ [Avatar] John Doe                          [Add Admin]    │
│ john@example.com                                           │
│                                                             │
│ [Avatar] Sarah Wilson                      [Add Admin]    │
│ sarah@example.com                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Admin Permissions Matrix

| Action | Platform Admin | Canopi Owner | Canopi Admin |
|--------|----------------|--------------|--------------|
| View Canopi | ✅ All | ✅ Own | ✅ Assigned |
| Edit Configuration | ✅ All | ✅ Own | ✅ Assigned |
| Manage Admins | ✅ All | ✅ Own | ❌ |
| Manage Blacklist | ✅ All | ✅ Own | ✅ Assigned |
| Generate Embed Code | ✅ All | ✅ Own | ✅ Assigned |
| View Analytics | ✅ All | ✅ Own | ✅ Assigned |
| Change Status | ✅ All | ❌ | ❌ |
| Delete | ✅ All | ✅ Own | ❌ |

### 4.4 Database Schema for Admins

```sql
CREATE TABLE canopi_embed_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES canopi_embed_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(instance_id, user_id)
);

CREATE INDEX idx_canopi_admins_instance ON canopi_embed_admins(instance_id);
CREATE INDEX idx_canopi_admins_user ON canopi_embed_admins(user_id);
```

---

## 5. Word Blacklist

### 5.1 Blacklist Management Interface

**Location**: Canopi Details → "Manage Blacklist" tab

```
┌─────────────────────────────────────────────────────────────┐
│ Manage Blacklist - Meta Layer Initiative                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Blacklisted Words                                           │
│ ─────────────────────────────────────                      │
│                                                             │
│ Words that will be automatically filtered from messages    │
│ in this Canopi.                                            │
│                                                             │
│ Current Blacklist:                                          │
│                                                             │
│ spam        [Remove]                                        │
│ scam        [Remove]                                        │
│ phishing    [Remove]                                        │
│ [empty]                                                     │
│                                                             │
│ Add Word(s)                                                 │
│ ─────────────────────────────────────                      │
│ [Enter word or phrase...              ] [Add]              │
│                                                             │
│ Options:                                                    │
│ ☑ Case insensitive (default: enabled)                      │
│ ☑ Block partial matches (e.g., "spam" blocks "spammer")    │
│ ☐ Require exact word match only                            │
│                                                             │
│ Bulk Import:                                               │
│ [Paste words (one per line)...        ] [Import]           │
│                                                             │
│ [Save Changes]                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Blacklist Features

1. **Word/Phrase Blocking**
   - Single words: `spam`, `scam`
   - Phrases: `get rich quick`, `click here now`
   - Regex support (advanced): `\b(spam|scam)\b`

2. **Matching Options**
   - Case insensitive (default)
   - Partial match (e.g., "spam" blocks "spammer", "spamming")
   - Exact word match only (word boundaries)

3. **Bulk Import**
   - Paste list of words (one per line)
   - Import from file
   - Common blacklist templates

4. **Action on Match**
   - Block message (don't send)
   - Replace with asterisks: `s***`
   - Flag for moderation (send but mark)

### 5.3 Blacklist Implementation

```javascript
class WordBlacklist {
  constructor(words, options = {}) {
    this.words = words.map(w => w.toLowerCase());
    this.caseInsensitive = options.caseInsensitive !== false;
    this.partialMatch = options.partialMatch !== false;
  }
  
  check(message) {
    const text = this.caseInsensitive ? message.toLowerCase() : message;
    
    for (const word of this.words) {
      if (this.partialMatch) {
        if (text.includes(word)) {
          return { blocked: true, word };
        }
      } else {
        // Exact word match with word boundaries
        const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'i');
        if (regex.test(text)) {
          return { blocked: true, word };
        }
      }
    }
    
    return { blocked: false };
  }
  
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
```

### 5.4 Database Schema for Blacklist

```sql
CREATE TABLE canopi_embed_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES canopi_embed_instances(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  case_insensitive BOOLEAN DEFAULT true,
  partial_match BOOLEAN DEFAULT true,
  action VARCHAR(20) DEFAULT 'block' CHECK (action IN ('block', 'replace', 'flag')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(instance_id, word)
);

CREATE INDEX idx_blacklist_instance ON canopi_embed_blacklist(instance_id);
CREATE INDEX idx_blacklist_word ON canopi_embed_blacklist(word);
```

### 5.5 Blacklist in Message Flow

```javascript
// In message sending handler
async function sendMessage(message, canopiId) {
  // Get blacklist for this Canopi
  const blacklist = await getBlacklist(canopiId);
  const checker = new WordBlacklist(blacklist.words, {
    caseInsensitive: blacklist.caseInsensitive,
    partialMatch: blacklist.partialMatch
  });
  
  // Check message
  const result = checker.check(message.content);
  
  if (result.blocked) {
    // Handle based on action
    if (blacklist.action === 'block') {
      throw new Error('Message contains blocked word');
    } else if (blacklist.action === 'replace') {
      message.content = replaceBlockedWords(message.content, result.word);
    } else if (blacklist.action === 'flag') {
      message.flagged = true;
      message.flagReason = `Contains blocked word: ${result.word}`;
    }
  }
  
  // Continue with message sending
  return await saveMessage(message);
}
```

---

## 6. Updated Database Schema

### 6.1 Enhanced `canopi_embed_instances` Table

```sql
ALTER TABLE canopi_embed_instances
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'active', 'suspended', 'rejected')),
  ADD COLUMN canopi_url TEXT NOT NULL,
  ADD COLUMN sidebar_title VARCHAR(255),
  ADD COLUMN welcome_message TEXT,
  ADD COLUMN request_info JSONB, -- Original request data
  ADD COLUMN requested_by UUID REFERENCES users(id),
  ADD COLUMN approved_by UUID REFERENCES users(id),
  ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN rejected_reason TEXT,
  ADD COLUMN suspended_reason TEXT;

CREATE INDEX idx_embed_instances_status ON canopi_embed_instances(status);
CREATE INDEX idx_embed_instances_requested_by ON canopi_embed_instances(requested_by);
```

### 6.2 New Tables

```sql
-- Admin management
CREATE TABLE canopi_embed_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES canopi_embed_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(instance_id, user_id)
);

-- Word blacklist
CREATE TABLE canopi_embed_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES canopi_embed_instances(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  case_insensitive BOOLEAN DEFAULT true,
  partial_match BOOLEAN DEFAULT true,
  action VARCHAR(20) DEFAULT 'block' CHECK (action IN ('block', 'replace', 'flag')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(instance_id, word)
);
```

---

## 7. API Endpoints

### 7.1 Request Endpoints

```
POST   /api/embeds/requests          - Submit public request
GET    /api/embeds/requests         - List user's requests (if authenticated)
GET    /api/embeds/requests/:id     - Get request details
```

### 7.2 Status Management

```
PUT    /api/embeds/instances/:id/status  - Change status (admin only)
POST   /api/embeds/instances/:id/approve  - Approve request
POST   /api/embeds/instances/:id/reject   - Reject request
POST   /api/embeds/instances/:id/suspend  - Suspend Canopi
POST   /api/embeds/instances/:id/activate - Activate Canopi
```

### 7.3 Admin Management

```
GET    /api/embeds/instances/:id/admins     - List admins
POST   /api/embeds/instances/:id/admins      - Add admin
DELETE /api/embeds/instances/:id/admins/:userId - Remove admin
```

### 7.4 Blacklist Management

```
GET    /api/embeds/instances/:id/blacklist   - Get blacklist
POST   /api/embeds/instances/:id/blacklist   - Add word(s)
DELETE /api/embeds/instances/:id/blacklist/:wordId - Remove word
PUT    /api/embeds/instances/:id/blacklist/options - Update options
```

---

## 8. UI Components Needed

### 8.1 Admin Dashboard
- [ ] Canopies table with filters
- [ ] Status badges
- [ ] Actions dropdown menu
- [ ] Search and pagination
- [ ] Bulk actions (if needed)

### 8.2 Request Form
- [ ] Public request form
- [ ] Form validation
- [ ] Success confirmation page
- [ ] Email notifications

### 8.3 Canopi Details View
- [ ] Overview tab
- [ ] Configuration tab
- [ ] Manage Admins tab
- [ ] Manage Blacklist tab
- [ ] Analytics tab
- [ ] Embed Code tab

### 8.4 Admin Management
- [ ] Admin list
- [ ] User search/autocomplete
- [ ] Add/remove admin actions

### 8.5 Blacklist Management
- [ ] Word list display
- [ ] Add word form
- [ ] Bulk import
- [ ] Options toggle
- [ ] Remove word action

---

## 9. Email Notifications

### 9.1 Request Submitted
**To**: Requester  
**Subject**: "Your Canopi Request Has Been Received"  
**Content**: Confirmation with request ID and next steps

### 9.2 Request Approved
**To**: Requester  
**Subject**: "Your Canopi Request Has Been Approved"  
**Content**: Approval notification with link to configure

### 9.3 Request Rejected
**To**: Requester  
**Subject**: "Update on Your Canopi Request"  
**Content**: Rejection with reason (if provided)

### 9.4 New Request Alert
**To**: Platform Admins  
**Subject**: "New Canopi Request: [Website Name]"  
**Content**: Request details with approve/reject links

---

## 10. Implementation Checklist

### Phase 1: Core Admin Features
- [ ] Update database schema (status, admins, blacklist)
- [ ] Create admin dashboard table view
- [ ] Implement status badges and filters
- [ ] Add actions dropdown menu
- [ ] Create Canopi details view

### Phase 2: Request System
- [ ] Create public request form
- [ ] Implement request submission API
- [ ] Add email notifications
- [ ] Create request confirmation page
- [ ] Add request list view (for users)

### Phase 3: Status Management
- [ ] Implement status workflow
- [ ] Add approve/reject actions
- [ ] Add suspend/activate actions
- [ ] Add status change notifications
- [ ] Update UI based on status

### Phase 4: Admin Management
- [ ] Create admin management UI
- [ ] Implement user search
- [ ] Add/remove admin functionality
- [ ] Implement permission checks
- [ ] Add admin activity logging

### Phase 5: Blacklist
- [ ] Create blacklist management UI
- [ ] Implement word checking logic
- [ ] Integrate into message flow
- [ ] Add bulk import
- [ ] Add blacklist options (case/partial match)
- [ ] Test blacklist effectiveness

---

**Status**: Ready for Implementation  
**Priority**: High - Core features for launch






