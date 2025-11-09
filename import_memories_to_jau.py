#!/usr/bin/env python3
"""
Script to import memories from JSON into JAUmemory via MCP.
This is a helper script - actual import must be done via MCP tool calls.
"""
import json

with open('JAUMEMORY_TAGGED_MEMORIES.json', 'r') as f:
    memories = json.load(f)

# Import status
imported = [
    "COMP Method Adherence Requirement",
    "Sidepanel Orchestration-Only Architecture",
    "File Removal Protocol",
    "Logger Removal Mandate",
    "StateManager Replaces chrome.storage.local",
    "No Gravatar Images Policy",
    "No Hardcoding Policy for SD1 SD2 SD4",
    "Chrome Profile Authentication Method",
    "Avatar Retrieval Source - StateManager.supabaseSession.user.picture",
    "Global Function Exposure Requirement",
    "User Identity Isolation Requirement",
    "Agent Specializations - TA1 SD2 SD3 SD4",
    "Presence Tracking Single Source of Truth",
    "Database Architecture - Supabase Only",
    "SD2 Prevention Plan for Repeated Mistakes",
    "Background.js and Content.js Must Stay",
    "Authentication Architecture Using authManager",
    "Module Loading Order Critical",
    "Profile Avatar Display Issue Pattern",
    "Console Logging Diagnostic Strategy"
]

remaining = [m for m in memories if m['title'] not in imported]
print(f"Total memories: {len(memories)}")
print(f"Imported: {len(imported)}")
print(f"Remaining: {len(remaining)}")
print(f"\nNext 20 to import:")
for i, m in enumerate(remaining[:20], 1):
    print(f"{i}. {m['title']}")

