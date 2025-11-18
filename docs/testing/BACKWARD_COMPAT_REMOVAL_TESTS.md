# Test Plan: Backward Compatibility Removal

## Test Objectives

Verify that all backward compatibility code has been removed and the system works correctly with UUID-only community IDs.

## Test Environment

- Database: `legacyId` column removed
- Backend: All `legacyId` queries removed
- Frontend: All `'comm-001'` fallbacks removed
- Prisma Schema: Updated

## Test Cases

### 1. Backend API Tests

#### 1.1 Get User Communities
**Endpoint:** `GET /api/communities`
**Test:** Verify communities are returned with UUID `id` only (no `legacyId`)
**Expected:** 
- Communities array returned
- Each community has `id` (UUID format)
- No `legacyId` field in response

#### 1.2 Select Community
**Endpoint:** `POST /api/communities/select`
**Test:** Select community using UUID
**Expected:**
- Community found by UUID
- Returns `communityId` as UUID
- No `legacyId` fallback used

#### 1.3 Get Manageable Communities
**Endpoint:** `GET /api/communities/manageable`
**Test:** Get communities user can manage
**Expected:**
- Communities returned with UUID `id` only
- No `legacyId` in response

#### 1.4 Create Community
**Endpoint:** `POST /api/communities`
**Test:** Create new community
**Expected:**
- Community created with UUID `id`
- Response contains UUID `id` (no `legacyId`)

#### 1.5 Update Community
**Endpoint:** `PUT /api/communities/:id`
**Test:** Update community using UUID
**Expected:**
- Community found by UUID
- Updated successfully
- Response contains UUID `id` only

#### 1.6 Delete Community
**Endpoint:** `DELETE /api/communities/:id`
**Test:** Delete community using UUID
**Expected:**
- Community found by UUID
- Deleted successfully

#### 1.7 Error Cases
**Test:** Try to query by `legacyId` (should fail)
**Expected:**
- 404 error if community not found
- No fallback to `legacyId` lookup

### 2. Frontend Tests

#### 2.1 Load Communities
**Test:** Load communities on page load
**Expected:**
- Communities loaded successfully
- No `'comm-001'` fallback used
- If communities fail to load, error shown (no fallback)

#### 2.2 Community Selection
**Test:** Select a community
**Expected:**
- Community selected using UUID
- No `'comm-001'` fallback

#### 2.3 Visibility Data
**Test:** Load user visibility data
**Expected:**
- Uses actual `communityId` from context
- No hardcoded `'comm-001'` values

#### 2.4 Error Handling
**Test:** Communities API fails
**Expected:**
- Error logged clearly
- No `'comm-001'` fallback
- UI shows error state (no fake data)

### 3. Database Tests

#### 3.1 Schema Verification
**Test:** Verify `legacyId` column removed
**SQL:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'MetaCommunity' 
AND column_name = 'legacyId';
```
**Expected:** No rows returned

#### 3.2 Index Verification
**Test:** Verify `legacyId` index removed
**SQL:**
```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'MetaCommunity' 
AND indexname LIKE '%legacyId%';
```
**Expected:** No rows returned

#### 3.3 Data Integrity
**Test:** Verify all communities have UUID `id`
**SQL:**
```sql
SELECT id, name 
FROM "MetaCommunity" 
WHERE id IS NULL OR length(id::text) != 36;
```
**Expected:** No rows returned (all have valid UUIDs)

### 4. Integration Tests

#### 4.1 End-to-End Flow
**Test:** Complete user flow
1. User logs in
2. Communities load
3. User selects community
4. Chat history loads
5. User sends message
**Expected:**
- All steps work with UUIDs only
- No `legacyId` or `'comm-001'` references

#### 4.2 Reply Loading
**Test:** Load replies for a message
**Expected:**
- Replies load using actual `communityId` from message
- No `'comm-001'` fallback
- If `communityId` missing, error shown (fail fast)

## Test Scripts

### Backend Test Script

```javascript
// Test backend endpoints
async function testBackendEndpoints() {
  const baseUrl = 'http://localhost:3000/api';
  
  // Test 1: Get communities
  const communities = await fetch(`${baseUrl}/communities`);
  const communitiesData = await communities.json();
  console.assert(!communitiesData.communities.some(c => c.legacyId), 'No legacyId in response');
  console.assert(communitiesData.communities.every(c => c.id && c.id.length === 36), 'All have UUID id');
  
  // Test 2: Select community (use first community UUID)
  const firstCommunityId = communitiesData.communities[0].id;
  const selectResponse = await fetch(`${baseUrl}/communities/select`, {
    method: 'POST',
    body: JSON.stringify({ userId: 'test-user', communityId: firstCommunityId })
  });
  const selectData = await selectResponse.json();
  console.assert(selectData.communityId === firstCommunityId, 'Returns correct UUID');
  console.assert(!selectData.legacyId, 'No legacyId in response');
  
  console.log('✅ Backend tests passed');
}
```

### Frontend Test Script

```javascript
// Test frontend (run in browser console)
async function testFrontend() {
  // Test 1: Verify no 'comm-001' in activeCommunities
  const activeCommunities = window.activeCommunities || [];
  console.assert(!activeCommunities.includes('comm-001'), 'No comm-001 in activeCommunities');
  
  // Test 2: Verify communities load
  if (window.loadCommunities) {
    await window.loadCommunities();
    const communities = await window.getState('communities') || [];
    console.assert(communities.every(c => c.id && c.id.length === 36), 'All communities have UUID');
    console.assert(!communities.some(c => c.id === 'comm-001'), 'No comm-001 in communities');
  }
  
  // Test 3: Check for hardcoded 'comm-001' in code
  const codeCheck = document.querySelectorAll('script').forEach(script => {
    if (script.textContent && script.textContent.includes("'comm-001'")) {
      console.warn('⚠️ Found comm-001 in script:', script.src || 'inline');
    }
  });
  
  console.log('✅ Frontend tests passed');
}
```

### Database Test Script

```sql
-- Test 1: Verify legacyId column removed
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'MetaCommunity' 
AND column_name = 'legacyId';
-- Expected: 0 rows

-- Test 2: Verify all communities have UUID
SELECT id, name 
FROM "MetaCommunity" 
WHERE id IS NULL OR length(id::text) != 36;
-- Expected: 0 rows

-- Test 3: Verify index removed
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'MetaCommunity' 
AND indexname LIKE '%legacyId%';
-- Expected: 0 rows
```

## Manual Test Checklist

- [ ] Backend API returns communities with UUID only
- [ ] Frontend loads communities without 'comm-001' fallback
- [ ] Community selection works with UUID
- [ ] Chat history loads with correct communityId
- [ ] Replies load with actual communityId from message
- [ ] Error handling works (fail fast, no fallbacks)
- [ ] Database schema verified (no legacyId column)
- [ ] No 'comm-001' in console logs
- [ ] No legacyId queries in network requests

## Expected Results

✅ **All tests pass**
✅ **No `legacyId` references**
✅ **No `'comm-001'` fallbacks**
✅ **Fail fast on errors**
✅ **UUID-only community IDs**

## Rollback Plan

If tests fail:
1. Restore `legacyId` column (if needed)
2. Revert backend code changes
3. Revert frontend code changes
4. Check error logs for specific issues

