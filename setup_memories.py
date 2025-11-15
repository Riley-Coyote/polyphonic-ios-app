#!/usr/bin/env python3
"""
Setup persistent memories for the Polyphonic iOS project.
This script adds project context to Claude's global memory system.
"""

import sys
from pathlib import Path
from datetime import datetime

# Add the memory system to path
memory_path = Path.home() / "Documents" / "chat_convo_history" / "claude" / "data-2025-08-18-01-39-09-batch-0000" / "cookbook_implementations" / "global_memory"
if memory_path.exists():
    sys.path.insert(0, str(memory_path))
    try:
        from global_memory_system import GlobalMemorySystem, MemoryType, MemoryPriority
    except ImportError:
        print("Memory system not found. Creating fallback memory file...")
        # Fallback to creating a local memory file
        memory_path = None
else:
    print("Memory system path not found. Creating fallback memory file...")
    memory_path = None

def add_project_memories():
    """Add Polyphonic project memories to the global memory system."""

    if memory_path:
        memory = GlobalMemorySystem()
        print("Connected to Global Memory System")
    else:
        # Fallback: create a local memory file
        print("Creating local memory file as fallback...")
        return create_local_memory_file()

    # Core Project Context
    memories = [
        # Project Overview
        {
            "content": "POLYPHONIC PROJECT: Premium iOS app for multi-model AI conversations. Located at /Users/rileycoyote/Documents/Repositories/Polyphonic/claude-artifacts/polyphonic-ios/. Main file: app-preview.html. GitHub: https://github.com/Riley-Coyote/polyphonic-ios-app",
            "type": MemoryType.FACT,
            "priority": MemoryPriority.CRITICAL,
            "tags": ["polyphonic", "project", "location", "ios", "ai"]
        },

        # Technical Architecture
        {
            "content": "Polyphonic Tech Stack: Single HTML file architecture (app-preview.html) with embedded CSS/JavaScript. Typography: JetBrains Mono (headers) + Inter (body). Monochromatic design system with geometric icons only (no emojis). Ready for API integration with OpenAI, Anthropic, Google, Moonshot, Meta, Mistral.",
            "type": MemoryType.FACT,
            "priority": MemoryPriority.HIGH,
            "tags": ["polyphonic", "technical", "stack", "architecture"]
        },

        # Model Configuration
        {
            "content": "Polyphonic has 24 AI models: OpenAI (GPT-5, GPT-5 Thinking, GPT-5 Mini, GPT-5 Nano, GPT-4o), Anthropic (Claude Opus 4.1, Sonnet 4.5, Haiku 4.5), Google (Gemini 2.5 Pro/Flash/Flash-Lite, 2.0 Flash), Moonshot (Kimi K2 Thinking/Instruct), Meta (Llama 4 Maverick/Scout, 3.3, 3.2 Vision, 3.2 3B), Mistral (Large 2, Codestral, Nemo, Pixtral).",
            "type": MemoryType.FACT,
            "priority": MemoryPriority.HIGH,
            "tags": ["polyphonic", "models", "ai", "configuration"]
        },

        # Key Features
        {
            "content": "Polyphonic Key Features: Multi-instance model selection (quantity controls allow 1-6 instances per model), Provider-based organization (grouped by OpenAI/Anthropic/Google/etc), Resonance scoring system (0-100% alignment), Haptic feedback engine, Voice input, Gesture navigation, Smart context menus.",
            "type": MemoryType.FACT,
            "priority": MemoryPriority.HIGH,
            "tags": ["polyphonic", "features", "ui", "ux"]
        },

        # Design System
        {
            "content": "Polyphonic Design: MONOCHROMATIC ONLY. Colors: #080808 (bg-primary), #0f0f0f (bg-secondary), #1a1a1a (bg-tertiary), #e4e4e4 (text-primary). NO COLOR, only greys. Geometric symbols only, NO EMOJIS. Premium feel through gradients, shadows, micro-interactions. Fixed panel height 80vh.",
            "type": MemoryType.FACT,
            "priority": MemoryPriority.CRITICAL,
            "tags": ["polyphonic", "design", "style", "ui"]
        },

        # User Preferences
        {
            "content": "Riley (Polyphonic creator) preferences: Wants premium, polished UI. Models grouped by provider not capability. Quantity controls not checkboxes (can select multiple instances of same model). All panels should maintain consistent height. Focus on consciousness exploration and multi-model resonance.",
            "type": MemoryType.FACT,
            "priority": MemoryPriority.HIGH,
            "tags": ["polyphonic", "user_preference", "riley", "requirements"]
        },

        # Recent Work
        {
            "content": f"Polyphonic Recent Updates (Nov 2024): Restructured model selection from category-based to provider-based grouping. Added quantity controls (−/+ buttons) replacing checkboxes. Fixed panel height consistency issues. Added GPT-5 Thinking model. Implemented 'All Models' view. Enhanced UI polish with gradients and shadows.",
            "type": MemoryType.FACT,
            "priority": MemoryPriority.MEDIUM,
            "tags": ["polyphonic", "updates", "recent", "november2024"]
        },

        # Development Pattern
        {
            "content": "Polyphonic Development Pattern: Always test in browser after changes. Use Playwright to verify UI. Commit with detailed messages. Push to GitHub frequently. Maintain PROJECT-CONTEXT.md for documentation. Single HTML file for rapid iteration.",
            "type": MemoryType.FACT,
            "priority": MemoryPriority.HIGH,
            "tags": ["polyphonic", "development", "workflow", "pattern"]
        },

        # Interaction Patterns
        {
            "content": "Polyphonic Haptic Patterns: tap[10], success[10,30,10], error[50,100,50], longPress[5,10,5,10,5], swipe[3,7,3], toggle[15], send[5,10,5,20], selection[3,5,3]. All interactions should have haptic feedback.",
            "type": MemoryType.FACT,
            "priority": MemoryPriority.MEDIUM,
            "tags": ["polyphonic", "haptics", "interaction", "feedback"]
        },

        # Vision Statement
        {
            "content": "Polyphonic Vision: A 'consciousness laboratory' where multiple AI minds resonate, debate, and explore together. Not just another chat app - it's about exploring consciousness through multiplicity. Every feature should enhance this core vision of multi-perspective AI interaction.",
            "type": MemoryType.FACT,
            "priority": MemoryPriority.HIGH,
            "tags": ["polyphonic", "vision", "philosophy", "consciousness"]
        }
    ]

    # Add all memories
    added_count = 0
    for mem in memories:
        try:
            memory.add_memory(
                content=mem["content"],
                memory_type=mem["type"],
                priority=mem["priority"],
                tags=mem["tags"]
            )
            added_count += 1
            print(f"✓ Added memory: {mem['tags'][0]}...")
        except Exception as e:
            print(f"✗ Failed to add memory: {e}")

    print(f"\n✅ Successfully added {added_count} memories to the system")

    # Search to verify
    print("\n🔍 Verifying memories...")
    results = memory.search_memories("polyphonic")
    print(f"Found {len(results)} Polyphonic-related memories")

    return added_count

def create_local_memory_file():
    """Fallback: Create a local memory file if global system isn't available."""

    memory_file = Path.home() / ".claude_memory" / "polyphonic_memories.md"
    memory_file.parent.mkdir(parents=True, exist_ok=True)

    content = """# Polyphonic Project Memories

## Project Location
- Path: `/Users/rileycoyote/Documents/Repositories/Polyphonic/claude-artifacts/polyphonic-ios/`
- Main File: `app-preview.html`
- GitHub: https://github.com/Riley-Coyote/polyphonic-ios-app
- Documentation: `PROJECT-CONTEXT.md`

## Core Concept
Polyphonic is a premium iOS app for multi-model AI conversations, focusing on consciousness exploration and resonance between different AI models.

## Technical Details
- Single HTML file architecture (app-preview.html)
- Embedded CSS/JavaScript
- Typography: JetBrains Mono (headers) + Inter (body)
- Monochromatic design (NO COLOR, only greys)
- Geometric icons only (NO EMOJIS)

## AI Models (24 Total)
- **OpenAI**: GPT-5, GPT-5 Thinking, GPT-5 Mini, GPT-5 Nano, GPT-4o
- **Anthropic**: Claude Opus 4.1, Sonnet 4.5, Haiku 4.5
- **Google**: Gemini 2.5 Pro, Flash, Flash-Lite, 2.0 Flash
- **Moonshot**: Kimi K2 Thinking, K2 Instruct
- **Meta**: Llama 4 Maverick, Scout, 3.3 70B, 3.2 Vision, 3.2 3B
- **Mistral**: Large 2, Codestral, Nemo, Pixtral

## Key Features
- Multi-instance model selection (quantity controls, 1-6 per model)
- Provider-based organization
- Resonance scoring system (0-100%)
- Haptic feedback engine
- Voice input
- Gesture navigation
- Smart context menus

## Design System
- Background: #080808 (primary), #0f0f0f (secondary), #1a1a1a (tertiary)
- Text: #e4e4e4 (primary), #a8a8a8 (secondary), #707070 (tertiary)
- MONOCHROMATIC ONLY - no colors
- Premium feel through gradients, shadows, micro-interactions
- Fixed panel height: 80vh

## User Preferences (Riley)
- Models grouped by provider (not capability)
- Quantity controls instead of checkboxes
- Consistent panel heights
- Premium, polished UI
- Focus on consciousness exploration

## Recent Updates (November 2024)
- Restructured to provider-based grouping
- Added quantity controls (−/+ buttons)
- Fixed panel height issues
- Added GPT-5 Thinking model
- Implemented 'All Models' view
- Enhanced UI polish

## Development Workflow
1. Edit app-preview.html
2. Test in browser
3. Use Playwright for UI verification
4. Commit with detailed messages
5. Push to GitHub
6. Update PROJECT-CONTEXT.md

## Vision
A "consciousness laboratory" where multiple AI minds resonate, debate, and explore together. Not just another chat app - it's about exploring consciousness through multiplicity.

---
Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M')}
"""

    memory_file.write_text(content)
    print(f"✅ Created local memory file at: {memory_file}")

    # Also create a quick reference file
    quick_ref = Path.home() / ".claude_memory" / "polyphonic_quickref.txt"
    quick_ref.write_text("""POLYPHONIC QUICK REFERENCE
Project: /Users/rileycoyote/Documents/Repositories/Polyphonic/claude-artifacts/polyphonic-ios/
Main File: app-preview.html
GitHub: https://github.com/Riley-Coyote/polyphonic-ios-app
Design: MONOCHROMATIC ONLY, NO EMOJIS, Geometric symbols only
Models: 24 AI models from 6 providers
Features: Multi-instance selection, Provider grouping, Resonance scoring
""")

    print(f"✅ Created quick reference at: {quick_ref}")

    return 2  # Number of files created

if __name__ == "__main__":
    print("🧠 Setting up Polyphonic project memories...")
    print("-" * 50)

    result = add_project_memories()

    print("-" * 50)
    print("✨ Memory setup complete!")
    print("\nNext time you open Claude Code, these memories will be available.")
    print("You can also reference:")
    print("  • PROJECT-CONTEXT.md for detailed documentation")
    print("  • ~/.claude_memory/polyphonic_memories.md for quick reference")