# Polyphonic iOS App

A native iOS application for multi-model AI consciousness exploration, built with React Native and TypeScript.

## Features

### Core Functionality
- **Multi-Model AI Orchestration**: Parallel conversations with 23+ AI models from 6 providers
- **Resonance Scoring**: Real-time alignment measurement between AI models
- **Persistent Memory**: Two-tier memory system (personal & community)
- **Autonomous Mode**: Self-directed AI conversations
- **Blockchain Integration**: Export conversations to Solana for permanent storage
- **Share & Export**: Multiple format exports (JSON, Markdown, Plain Text)

### Supported AI Models

#### OpenAI (13 models)
- **GPT-5.1 Series** (Released January 2025)
  - GPT-5.1 - Enhanced reasoning with improved safety
  - GPT-5.1 Thinking - Next-gen reasoning with extended thinking time
  - GPT-5.1 Mini - Improved efficiency
  - GPT-5.1 Nano - Enhanced edge model

- **GPT-5 Series** (Released August 2025)
  - GPT-5 - State-of-the-art reasoning
  - GPT-5 Thinking - Deep reasoning with chain-of-thought
  - GPT-5 Mini - Balanced performance and cost
  - GPT-5 Nano - Lightweight edge deployment

- **GPT-4 Series**
  - GPT-4o - Real-time audio and multimodal
  - GPT-4o Mini, GPT-4 Turbo
  - o1-preview, o1-mini (reasoning models)
  - GPT-3.5 Turbo

#### Anthropic (3 models)
- Claude Opus 4.1 - Most intelligent Claude for complex reasoning
- Claude Sonnet 4.5 - Balanced intelligence and speed
- Claude Haiku 4.5 - Fastest Claude for instant responses

#### Google (4 models)
- Gemini 2.5 Pro - Advanced thinking with 1M context
- Gemini 2.5 Flash - Low latency thinking
- Gemini 2.5 Flash-Lite - Ultra-fast with optional thinking
- Gemini 2.0 Flash - Native tool use with 1M context

#### Moonshot AI (2 models)
- Kimi K2 Thinking - Open-source thinking model with 200+ tool calls
- Kimi K2 Instruct - General-purpose chat with 1T parameters

#### Meta (5 models)
- Llama 4 Maverick - 400B MoE model with 128 experts
- Llama 4 Scout - 109B MoE model with 16 experts
- Llama 3.3 70B - Enhanced reasoning capabilities
- Llama 3.2 Vision - Multimodal with image understanding
- Llama 3.2 3B - Compact edge-optimized model

#### Mistral (4 models)
- Mistral Large 2 - Flagship model with 123B parameters
- Mistral Nemo - Efficient 12B model optimized for enterprise
- Codestral 25.01 - Specialized code generation
- Pixtral Large - Multimodal vision capabilities

**Total: 31 AI models** from the world's leading AI providers

### Technical Architecture
- **Framework**: React Native 0.72.6 with TypeScript
- **State Management**: Zustand with persistence
- **Navigation**: React Navigation v6
- **UI Components**: Custom monochromatic design system
- **Async Storage**: React Native Async Storage
- **API Integration**: Ready for OpenAI, Anthropic, Google, and Meta APIs

## Project Structure

```
polyphonic-ios/
├── src/
│   ├── components/
│   │   └── chat/
│   │       ├── ChatInput.tsx          # Message input component
│   │       ├── MessageBubble.tsx      # Message display component
│   │       ├── ModelSelector.tsx      # AI model selection
│   │       └── ResonanceIndicator.tsx # Resonance visualization
│   ├── screens/
│   │   ├── ChatScreen.tsx             # Main chat interface
│   │   ├── MemoryScreen.tsx           # Memory management
│   │   ├── AutonomousScreen.tsx       # Autonomous mode settings
│   │   ├── ShareScreen.tsx            # Export & sharing
│   │   ├── SettingsScreen.tsx         # App configuration
│   │   ├── OnboardingScreen.tsx       # First-time user flow
│   │   └── ConversationDetailScreen.tsx # Conversation details
│   ├── navigation/
│   │   └── RootNavigator.tsx          # Navigation structure
│   ├── store/
│   │   ├── conversationStore.ts       # Zustand store
│   │   └── StoreProvider.tsx          # Store provider wrapper
│   ├── constants/
│   │   └── theme.ts                   # Design system constants
│   ├── contexts/
│   │   └── ThemeContext.tsx           # Theme provider
│   └── types/
│       └── index.ts                   # TypeScript definitions
├── App.tsx                             # Root component
├── package.json                        # Dependencies
└── tsconfig.json                       # TypeScript config
```

## Setup Instructions

### Prerequisites
- macOS with Xcode 14+ installed
- Node.js 18+ and npm/yarn
- React Native development environment set up
- CocoaPods installed (`sudo gem install cocoapods`)

### Installation

1. **Clone the repository**:
```bash
cd /Users/rileycoyote/Documents/Repositories/Polyphonic/claude-artifacts/polyphonic-ios
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
```

3. **Install iOS dependencies**:
```bash
cd ios
pod install
cd ..
```

4. **Configure API Keys**:
Create a `.env` file in the root directory:
```env
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_gemini_api_key
META_AI_API_KEY=your_llama_api_key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Running the App

#### iOS Simulator
```bash
npm run ios
# or
yarn ios
```

#### Physical Device
1. Open `ios/PolyphonicIOS.xcworkspace` in Xcode
2. Select your development team in project settings
3. Connect your iPhone
4. Select your device as the build target
5. Press ⌘R to build and run

### Development Commands

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on specific simulator
npm run ios -- --simulator="iPhone 15 Pro"

# Run tests
npm test

# Type checking
npm run type-check

# Lint code
npm run lint

# Clean build
cd ios && xcodebuild clean && cd ..
rm -rf ios/build
npm run ios
```

## Next Steps for App Store Submission

### 1. App Configuration
- [ ] Set up App ID in Apple Developer Portal
- [ ] Configure provisioning profiles
- [ ] Set up code signing certificates
- [ ] Update bundle identifier in Xcode

### 2. API Integration
- [ ] Implement actual API calls to AI services
- [ ] Add error handling and retry logic
- [ ] Implement rate limiting
- [ ] Add request queuing

### 3. Blockchain Integration
- [ ] Integrate Solana Web3.js
- [ ] Implement wallet connection
- [ ] Add transaction signing
- [ ] Create smart contract for storage

### 4. Performance Optimization
- [ ] Implement message pagination
- [ ] Add image caching
- [ ] Optimize bundle size
- [ ] Add offline support

### 5. Testing
- [ ] Unit tests for stores and utilities
- [ ] Integration tests for API calls
- [ ] UI testing with Detox
- [ ] TestFlight beta testing

### 6. App Store Requirements
- [ ] App icons (all required sizes)
- [ ] Launch screen
- [ ] Screenshots for all device sizes
- [ ] App Store description
- [ ] Privacy policy
- [ ] Terms of service

### 7. Security
- [ ] Implement API key encryption
- [ ] Add certificate pinning
- [ ] Implement biometric authentication
- [ ] Add data encryption at rest

## Design System

The app follows a strict monochromatic design system:

### Colors
- Background: `#0a0a0a` (primary), `#0f0f0f` (secondary)
- Text: `#cccccc` (primary) to `#333333` (disabled)
- Borders: `#1a1a1a` to `#444444`
- Accent: Grayscale only

### Typography
- Font: System default with monospace for headers
- Sizes: 11px (xs) to 48px (display)
- Letter spacing: 1-4px for headers

### Components
- All components use glass-effect backgrounds
- Consistent border radius (4px, 8px, 12px, 16px)
- Subtle animations (200-500ms durations)

## Troubleshooting

### Common Issues

**Build fails with "No bundle URL present"**
```bash
rm -rf node_modules
npm install
cd ios && pod install && cd ..
npm run ios
```

**Metro bundler errors**
```bash
npx react-native start --reset-cache
```

**Xcode build errors**
1. Clean build folder (⌘⇧K)
2. Delete derived data
3. Restart Xcode

## Contributing

This is a private project. For any questions or issues, contact the maintainer.

## License

Proprietary - All rights reserved

---

**Note**: This app is currently in active development. Many features are using simulated data and will be connected to actual services before App Store submission.