# Code Migration Guide: UUID Foreign Keys Only

## Overview
Clean migration to UUID foreign keys only. No backward compatibility - simpler, cleaner code.

## What Changes

### Database
- **Removes**: `user_email` columns from all tables
- **Adds**: `user_id` (UUID) foreign keys to `AppUser.id`
- **Changes**: `user_presence` primary key from `[user_email, page_id]` to `id`

### Code
- **All queries**: Use `user_id` for foreign key relationships
- **All joins**: Join via `AppUser` using `user_id`
- **All filtering**: Filter by `user_id` (lookup email first if needed)
- **All display**: Get user details from joined `AppUser` table

## Migration Patterns

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
// Get user_id from email first
const user = await prisma.appUser.findUnique({
  where: { email: userEmail },
  select: { id: true }
});

if (!user) {
  throw new Error('User not found');
}

await prisma.messages.create({
  data: {
    page_id: pageId,
    user_id: user.id,  // UUID foreign key
    content: content,
    // ...
  }
});
```

**Helper Function:**
```typescript
async function getUserIdFromEmail(email: string): Promise<string> {
  const user = await prisma.appUser.findUnique({
    where: { email },
    select: { id: true }
  });
  
  if (!user) {
    throw new Error(`User not found: ${email}`);
  }
  
  return user.id;
}

// Usage
const userId = await getUserIdFromEmail(userEmail);
await prisma.messages.create({
  data: {
    page_id: pageId,
    user_id: userId,
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
const userId = await getUserIdFromEmail(userEmail);

await prisma.user_presence.update({
  where: {
    unique_user_presence_user_page: {
      user_id: userId,
      page_id: pageId
    }
  },
  data: {
    is_active: true
  }
});

// OR use id if you have it
await prisma.user_presence.update({
  where: { id: presenceId },
  data: {
    is_active: true
  }
});
```

### 3. SELECT with JOINs

**Before:**
```typescript
const messages = await prisma.messages.findMany({
  where: { page_id: pageId }
  // user_email directly available
});
```

**After:**
```typescript
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

// Access user data via join
messages.forEach(msg => {
  console.log(msg.AppUser.email);  // From join
  console.log(msg.AppUser.name);   // From join
});
```

### 4. Filtering by User

**Before:**
```typescript
const userMessages = await prisma.messages.findMany({
  where: {
    user_email: userEmail
  }
});
```

**After:**
```typescript
const userId = await getUserIdFromEmail(userEmail);

const userMessages = await prisma.messages.findMany({
  where: {
    user_id: userId
  },
  include: {
    AppUser: true
  }
});
```

### 5. Aggregations

**Before:**
```typescript
const messageCount = await prisma.messages.groupBy({
  by: ['user_email'],
  _count: true
});
```

**After:**
```typescript
const messageCount = await prisma.messages.groupBy({
  by: ['user_id'],
  _count: true,
  include: {
    AppUser: {
      select: {
        email: true,
        name: true
      }
    }
  }
});
```

## Frontend Code Updates

### API Response Handling

**Before:**
```javascript
const messages = await api.request('/v1/messages');
messages.forEach(msg => {
  console.log(msg.user_email);  // Direct access
});
```

**After:**
```javascript
const messages = await api.request('/v1/messages');
messages.forEach(msg => {
  console.log(msg.user.email);  // From joined AppUser
  console.log(msg.user.name);   // From joined AppUser
});
```

### Display Logic

**Before:**
```javascript
<span>{message.user_email}</span>
```

**After:**
```javascript
<span>{message.user.email}</span>
```

## API Endpoints

### GET Endpoints
- Always include joined `AppUser` data
- Return user details in `user` object

### POST/PUT Endpoints
- Accept `user_email` or `user_id`
- If `user_email` provided, look up `user_id` automatically
- Store only `user_id` in database

**Example:**
```typescript
app.post('/v1/messages', async (req, res) => {
  const { content, page_id, user_email, user_id } = req.body;
  
  // Get user_id
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
  
  // Create with user_id only
  const message = await prisma.messages.create({
    data: {
      content,
      page_id,
      user_id: userId,
      // ...
    },
    include: {
      AppUser: true  // Include user data in response
    }
  });
  
  res.json(message);
});
```

## Database Queries

### Common Patterns

```typescript
// Get user by email (for lookups)
const user = await prisma.appUser.findUnique({
  where: { email: userEmail }
});

// Get messages with user data
const messages = await prisma.messages.findMany({
  include: {
    AppUser: {
      select: {
        email: true,
        name: true,
        avatarUrl: true
      }
    }
  }
});

// Filter by user
const userId = await getUserIdFromEmail(userEmail);
const userMessages = await prisma.messages.findMany({
  where: { user_id: userId }
});

// Join across tables
const reactions = await prisma.reactions.findMany({
  where: { message_id: messageId },
  include: {
    AppUser: {
      select: {
        email: true,
        name: true,
        avatarUrl: true
      }
    }
  }
});
```

## Testing Checklist

- [ ] All INSERT statements use `user_id`
- [ ] All UPDATE statements use `user_id`
- [ ] All SELECT statements include `AppUser` join
- [ ] All filtering uses `user_id`
- [ ] API endpoints return joined user data
- [ ] Frontend displays user data from joins
- [ ] Foreign key constraints work
- [ ] Performance is acceptable

## Benefits of Clean Migration

1. **Simpler Code**: No dual fields to maintain
2. **Standard Design**: Proper foreign key relationships
3. **Better Performance**: UUID indexes, proper joins
4. **Privacy**: No PII in foreign keys
5. **Future-Proof**: Email changes don't break relationships
6. **Cleaner Schema**: Single source of truth for user data

## Migration Steps

1. Run database migration: `./prisma/run-migration-uuid-only.sh`
2. Update Prisma schema (copy from `schema-uuid-only.prisma`)
3. Run `npx prisma generate`
4. Update all code to use `user_id` and joins
5. Test everything
6. Deploy

No rollback needed - this is a clean, forward-only migration.
