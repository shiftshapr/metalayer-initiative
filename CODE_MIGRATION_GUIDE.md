# Code Migration Guide: Email → UUID Foreign Keys

## Overview
After the database migration is complete, update all code to use `user_id` (UUID) for foreign keys while keeping `user_email` for readability and backward compatibility.

## Migration Principles

1. **Foreign Keys**: Always use `user_id` (UUID) for foreign key relationships
2. **Readability**: Keep `user_email` for queries, logging, and human-readable references
3. **INSERT/UPDATE**: Always set both `user_id` and `user_email` (user_id is primary, user_email is denormalized)
4. **Queries**: Use `user_id` for joins to AppUser, use `user_email` for filtering/display

## Tables Changed

- `messages`: Add `user_id`, keep `user_email`
- `reactions`: Add `user_id`, keep `user_email`
- `user_presence`: Add `user_id`, keep `user_email` (primary key changed to `id`)
- `message_deletions`: Add `user_id`, keep `deleted_by`

## Code Patterns to Update

### 1. INSERT Statements

**Before:**
```typescript
await prisma.messages.create({
  data: {
    page_id: pageId,
    user_email: userEmail,
    content: content,
    // ...
  }
});
```

**After:**
```typescript
// Get user_id from AppUser first
const user = await prisma.appUser.findUnique({
  where: { email: userEmail },
  select: { id: true }
});

await prisma.messages.create({
  data: {
    page_id: pageId,
    user_id: user.id,      // NEW: UUID foreign key (primary)
    user_email: userEmail,  // KEPT: Denormalized for readability
    content: content,
    // ...
  }
});
```

**Better: Helper Function:**
```typescript
async function getUserIdFromEmail(email: string): Promise<string | null> {
  const user = await prisma.appUser.findUnique({
    where: { email },
    select: { id: true }
  });
  return user?.id || null;
}

// Usage
const userId = await getUserIdFromEmail(userEmail);
await prisma.messages.create({
  data: {
    page_id: pageId,
    user_id: userId,
    user_email: userEmail,
    content: content,
    // ...
  }
});
```

### 2. UPDATE Statements

**Before:**
```typescript
await prisma.user_presence.update({
  where: {
    user_email_page_id: {
      user_email: userEmail,
      page_id: pageId
    }
  },
  data: {
    is_active: true
  }
});
```

**After:**
```typescript
// Use user_id for primary operations
const userId = await getUserIdFromEmail(userEmail);

await prisma.user_presence.update({
  where: {
    user_email_page_id: {  // Still works - unique constraint remains
      user_email: userEmail,
      page_id: pageId
    }
  },
  data: {
    user_id: userId,  // Ensure user_id is set
    is_active: true
  }
});

// OR use id if you have it:
await prisma.user_presence.update({
  where: { id: presenceId },
  data: {
    is_active: true
  }
});
```

### 3. JOIN Queries

**Before:**
```typescript
const messages = await prisma.messages.findMany({
  where: { page_id: pageId },
  // No join needed - user_email directly visible
});
```

**After:**
```typescript
// Use user_id for joins to AppUser
const messages = await prisma.messages.findMany({
  where: { page_id: pageId },
  include: {
    AppUser: {
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true
      }
    }
  }
});

// user_email is still available directly for display
messages.forEach(msg => {
  console.log(msg.user_email);  // Direct access
  console.log(msg.AppUser?.name);  // From join
});
```

### 4. Filtering Queries

**Before:**
```typescript
// Filter by email directly
const userMessages = await prisma.messages.findMany({
  where: {
    user_email: userEmail
  }
});
```

**After:**
```typescript
// Option 1: Still works - user_email is indexed
const userMessages = await prisma.messages.findMany({
  where: {
    user_email: userEmail  // Still works, but user_id is faster
  }
});

// Option 2: Use user_id (faster, requires lookup first)
const userId = await getUserIdFromEmail(userEmail);
const userMessages = await prisma.messages.findMany({
  where: {
    user_id: userId  // Faster - uses UUID index
  },
  include: {
    AppUser: true  // Can still join for user details
  }
});
```

### 5. Aggregations and Counts

**Before:**
```typescript
const messageCount = await prisma.messages.groupBy({
  by: ['user_email'],
  _count: true
});
```

**After:**
```typescript
// Option 1: Group by user_email (still works, shows email directly)
const messageCount = await prisma.messages.groupBy({
  by: ['user_email'],
  _count: true
});

// Option 2: Group by user_id (faster, need to join for email)
const messageCount = await prisma.messages.groupBy({
  by: ['user_id'],
  _count: true
});
// Then join to AppUser to get emails if needed
```

## Frontend Code Updates

### API Response Handling

**Before:**
```javascript
// Direct access to user_email
const messages = await api.request('/v1/messages');
messages.forEach(msg => {
  console.log(msg.user_email);  // Direct
});
```

**After:**
```javascript
// user_email still available directly
const messages = await api.request('/v1/messages');
messages.forEach(msg => {
  console.log(msg.user_email);  // Still works!
  console.log(msg.user_id);     // Also available
  console.log(msg.user);        // If API includes joined AppUser data
});
```

### Display Logic

**Before:**
```javascript
// Display user email directly
<span>{message.user_email}</span>
```

**After:**
```javascript
// Both available - use email for display, UUID for operations
<span>{message.user_email}</span>  // Still works
// Use user_id for user operations (if needed)
```

## API Endpoints

### GET Endpoints
- Continue returning both `user_id` and `user_email`
- Optionally include full `user` object from AppUser join

### POST/PUT Endpoints
- Accept either `user_id` or `user_email`
- If `user_email` provided, look up `user_id` automatically
- Always store both fields

**Example:**
```typescript
// POST /v1/messages
app.post('/v1/messages', async (req, res) => {
  const { content, page_id, user_email, user_id } = req.body;
  
  // If user_email provided, get user_id
  let userId = user_id;
  if (!userId && user_email) {
    const user = await prisma.appUser.findUnique({
      where: { email: user_email },
      select: { id: true }
    });
    userId = user?.id;
  }
  
  if (!userId) {
    return res.status(400).json({ error: 'User not found' });
  }
  
  // Create with both fields
  const message = await prisma.messages.create({
    data: {
      content,
      page_id,
      user_id: userId,      // UUID FK
      user_email: user_email, // Denormalized
      // ...
    }
  });
  
  res.json(message);
});
```

## Testing Checklist

- [ ] All INSERT statements set both `user_id` and `user_email`
- [ ] All UPDATE statements maintain both fields
- [ ] JOIN queries use `user_id` for AppUser relationships
- [ ] Filtering still works with `user_email`
- [ ] Display logic shows `user_email` for readability
- [ ] API endpoints accept both `user_id` and `user_email`
- [ ] Foreign key constraints work correctly
- [ ] Performance tests: UUID joins vs email filtering

## Rollback Strategy

If issues arise:
1. Database triggers auto-populate `user_id` from `user_email`
2. Code can continue using `user_email` exclusively
3. Foreign key constraints can be dropped if needed
4. No data loss - all `user_email` data preserved

