# RED-LINE RULE: No Backward Compatibility in Pre-Launch Phase

## Rule
**NO BACKWARD COMPATIBILITY IN PRE-LAUNCH PHASE**

We do NOT maintain support for:
- Legacy formats
- Old IDs (e.g., `comm-001` vs UUIDs)
- Deprecated data structures
- Multiple ID formats

## Policy
All data must be migrated to the current format. No exceptions.

## Rationale
- Pre-launch phase is for rapid iteration
- Backward compatibility adds complexity
- Clean data structure is essential
- Migration is preferred over dual support

## Enforcement
- Code reviews must reject backward compatibility patches
- All legacy formats must be migrated
- No "OR" conditions for old/new formats
- Single source of truth only

## Migration Strategy
When encountering legacy data:
1. **Migrate the data** (not the code)
2. Update database records to new format
3. Remove legacy format support
4. Use SQL scripts for bulk updates

## Example
❌ **WRONG:**
```javascript
// Query for both UUID and legacyId
query = query.in('community_id', [communityId, legacyCommunityId]);
```

✅ **CORRECT:**
```javascript
// Query for UUID only - data has been migrated
query = query.eq('community_id', communityId);
```

## Status
✅ Rule established
✅ Backward compatibility code removed
✅ Migration SQL provided

