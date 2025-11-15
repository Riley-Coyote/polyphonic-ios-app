# Polyphonic iOS - Implementation Plan

## 🎯 Core Functionality Sprint

This plan focuses on bringing the Polyphonic iOS app to production quality by addressing three critical areas:
1. API Integration (making AI responses real)
2. Accessibility Fixes (WCAG compliance)
3. Memory System Activation (connecting UI to storage)

## Phase 1: API Integration (Priority #1)

### Week 1 Focus: Get Real AI Responses Working

#### Day 1-2: API Service Architecture

```typescript
// Step 1: Create src/services/api/base.ts
interface APIProvider {
  name: string;
  baseURL: string;
  headers: Record<string, string>;
  formatRequest: (messages: Message[]) => any;
  parseResponse: (data: any) => string;
  handleStream?: (stream: ReadableStream) => AsyncGenerator<string>;
}

// Step 2: Create provider-specific implementations
// src/services/api/providers/openai.ts
// src/services/api/providers/anthropic.ts
// src/services/api/providers/google.ts
```

#### Day 3-4: Core Integration

1. **Start with OpenAI** (most standard API)
   - Implement non-streaming first (simpler)
   - Add proper error handling
   - Test with real API keys

2. **Then Anthropic** (similar but different format)
   - Handle their message format
   - Implement their streaming protocol

3. **API Key Management**
   - Secure storage using React Native Keychain
   - Settings screen integration
   - Validation and test endpoints

#### Day 5: Streaming & Polish
- Implement SSE (Server-Sent Events) for streaming
- Add timeout handling
- Implement retry logic with exponential backoff
- Create fallback for failed providers

### Implementation Checklist:
- [ ] Create services/api folder structure
- [ ] Implement base API client class
- [ ] Add OpenAI provider integration
- [ ] Add Anthropic provider integration
- [ ] Implement streaming response handler
- [ ] Create API key secure storage
- [ ] Add loading/error states in UI
- [ ] Test with real API calls
- [ ] Add rate limiting protection
- [ ] Implement request queuing

---

## Phase 2: Accessibility Fixes

### Week 1-2: WCAG Compliance

#### Semantic HTML Structure
```html
<!-- Current (BAD) -->
<div onclick="sendMessage()">Send</div>

<!-- Fixed (GOOD) -->
<button
  type="button"
  aria-label="Send message"
  onClick={sendMessage}
  disabled={isLoading}
>
  Send
</button>
```

#### Keyboard Navigation Fix
```javascript
// Add to app-preview.html
document.addEventListener('DOMContentLoaded', () => {
  // Enable tab navigation
  const interactiveElements = document.querySelectorAll(
    'button, input, select, textarea, a, [tabindex]'
  );

  interactiveElements.forEach((el, index) => {
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', index);
    }
  });

  // Add keyboard event handlers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
    if (e.key === 'Enter' && e.target.matches('[role="button"]')) {
      e.target.click();
    }
  });
});
```

#### Color Contrast Fixes
```css
/* Update CSS variables for WCAG AA compliance */
:root {
  /* OLD: #444444 (3.1:1 ratio - FAIL) */
  --text-quaternary: #767676; /* NEW: 4.5:1 ratio - PASS */

  /* OLD: #303030 (1.9:1 ratio - FAIL) */
  --text-disabled: #5a5a5a; /* NEW: 4.5:1 ratio - PASS */
}
```

#### Focus Indicators
```css
/* Add clear focus states */
button:focus-visible,
input:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Skip link for keyboard users */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--bg-elevated);
  padding: 8px;
  z-index: 100;
}

.skip-to-content:focus {
  top: 0;
}
```

### Accessibility Checklist:
- [ ] Replace all clickable divs with semantic buttons
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement proper heading hierarchy (h1, h2, h3)
- [ ] Add role attributes where needed
- [ ] Fix tab order (logical flow)
- [ ] Add keyboard event handlers
- [ ] Implement escape key to close modals
- [ ] Fix color contrast ratios (4.5:1 minimum)
- [ ] Add focus indicators to all interactive elements
- [ ] Add skip navigation link
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Add alt text for icons/images
- [ ] Implement live regions for dynamic content

---

## Phase 3: Memory System Activation

### Week 2: Connect Frontend to Storage

#### Step 1: Local Storage Implementation
```typescript
// src/services/storage/memoryService.ts
class MemoryService {
  async saveMemory(conversation: Conversation, type: 'personal' | 'community') {
    const memory: Memory = {
      id: uuidv4(),
      conversationId: conversation.id,
      type,
      content: this.extractContent(conversation),
      metadata: {
        topics: await this.extractTopics(conversation),
        sentiment: this.calculateSentiment(conversation),
        importance: this.calculateImportance(conversation),
        accessCount: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to AsyncStorage
    await this.persistMemory(memory);

    // Update store
    useConversationStore.getState().addMemory(memory);
  }

  async searchMemories(query: string): Promise<Memory[]> {
    // For now, simple text search
    // Later: vector similarity search
    const memories = await this.getAllMemories();
    return memories.filter(m =>
      m.content.toLowerCase().includes(query.toLowerCase()) ||
      m.metadata.topics.some(t => t.includes(query))
    );
  }
}
```

#### Step 2: Connect UI Components
```typescript
// Update MemoryScreen.tsx
const MemoryScreen = () => {
  const memoryService = new MemoryService();
  const [searchQuery, setSearchQuery] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);

  const handleSaveToMemory = async (conversation: Conversation) => {
    await memoryService.saveMemory(conversation, selectedType);
    Toast.show('Saved to memory', {type: 'success'});
    refreshMemories();
  };

  const handleSearch = async () => {
    const results = await memoryService.searchMemories(searchQuery);
    setMemories(results);
  };
};
```

#### Step 3: Sync & Persistence
```typescript
// src/services/sync/cloudSync.ts
class CloudSyncService {
  async syncMemories() {
    const localMemories = await AsyncStorage.getItem('memories');
    const lastSync = await AsyncStorage.getItem('lastSyncTime');

    // For MVP: Simple JSON backup
    // Later: Proper database (Supabase/Firebase)
    await this.uploadToCloud(localMemories);
    await AsyncStorage.setItem('lastSyncTime', Date.now());
  }

  async setupAutoSync() {
    // Sync every 5 minutes when app is active
    setInterval(() => {
      if (AppState.currentState === 'active') {
        this.syncMemories();
      }
    }, 5 * 60 * 1000);
  }
}
```

### Memory System Checklist:
- [ ] Create MemoryService class
- [ ] Implement local storage with AsyncStorage
- [ ] Add save to memory functionality
- [ ] Implement search (text-based first)
- [ ] Connect UI save buttons to service
- [ ] Add search bar functionality
- [ ] Display memory cards with metadata
- [ ] Implement memory deletion
- [ ] Add memory edit capability
- [ ] Create backup/restore functions
- [ ] Add cloud sync (basic JSON backup)
- [ ] Implement auto-sync on app focus
- [ ] Add memory usage statistics
- [ ] Test persistence across app restarts

---

## 🚀 Execution Timeline

### Sprint 1 (Days 1-5): API Integration
- Mon-Tue: Architecture setup
- Wed-Thu: OpenAI & Anthropic implementation
- Fri: Testing & streaming

### Sprint 2 (Days 6-10): Accessibility
- Mon-Tue: Semantic HTML conversion
- Wed: Keyboard navigation
- Thu: Color contrast & focus states
- Fri: Screen reader testing

### Sprint 3 (Days 11-15): Memory System
- Mon-Tue: Storage service implementation
- Wed: UI connections
- Thu: Search functionality
- Fri: Sync & persistence

### Sprint 4 (Days 16-20): Polish & Testing
- Mon-Tue: End-to-end testing
- Wed: Performance optimization
- Thu: Bug fixes
- Fri: Final polish

---

## 🎨 Quality Metrics for "Top-Tier App" Status

### Performance Targets:
- API response time: < 200ms first token
- Message rendering: < 16ms per frame
- Memory search: < 100ms for 1000 items
- App launch: < 2 seconds

### Reliability Standards:
- 99.9% uptime for core features
- Graceful degradation on API failures
- Offline mode with sync
- Zero data loss on crashes

### UX Polish Indicators:
- Smooth 60fps animations
- Instant haptic feedback
- No UI jank or flicker
- Predictive loading states
- Smart error recovery

---

## Current State Assessment

### ✅ What's Working Well:
- Exceptional Visual Design
- Complete UI/UX (all 5 screens functional)
- Premium Polish (micro-interactions, glass effects)
- 24 AI Models Configured
- State Management (Zustand with persistence)
- TypeScript Architecture

### ⚠️ Major Gaps:
1. **API Integration** - Currently simulated with setTimeout
2. **Accessibility** - Zero ARIA attributes, broken keyboard navigation
3. **Responsive Design** - Hardcoded to 390px
4. **Memory System** - UI present but not connected to backend

### 📊 Completion Metrics
**Current State: 65% Complete**
- Design & UI: 90%
- Component Architecture: 85%
- State Management: 75%
- API Integration: 0%
- Accessibility: 10%
- Testing: 0%
- Backend Services: 20%

**Estimated Timeline to Production:**
- MVP (Basic Working App): 2-3 weeks
- Full Feature Set: 4-6 weeks
- App Store Ready: 6-8 weeks