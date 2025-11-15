# iOS Deployment Guide for Polyphonic

This guide covers everything needed to deploy Polyphonic to the App Store via Xcode.

## Prerequisites

- **macOS** (required for iOS development)
- **Xcode 14+** (download from App Store)
- **Apple Developer Account** ($99/year for App Store)
- **CocoaPods** (will be installed by setup script)
- **Node.js 16+** and npm

## Initial Setup

### 1. Run the iOS Setup Script

```bash
chmod +x setup-ios.sh
./setup-ios.sh
```

This script will:
- Initialize the iOS project structure
- Create necessary configuration files
- Install CocoaPods dependencies
- Set up Info.plist with proper permissions

### 2. Open in Xcode

```bash
open ios/PolyphonicIOS.xcworkspace
```

**Important:** Always open `.xcworkspace`, not `.xcodeproj`!

### 3. Configure Signing

1. Select the project in navigator
2. Go to "Signing & Capabilities" tab
3. Select your team
4. Set bundle identifier (e.g., `com.yourcompany.polyphonic`)

## React Native ↔ Xcode Bridge

### How Our Code Works with Xcode

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────┐
│  JavaScript/TS  │  →   │ React Native │  →   │   Native    │
│   (Our Code)    │      │    Bridge    │      │  iOS (Swift)│
└─────────────────┘      └──────────────┘      └─────────────┘

- src/*.tsx → Bundled by Metro → Runs in JSC/Hermes → Renders Native Views
```

### Key Files for Xcode

1. **AppDelegate.m/.swift** - iOS app entry point
2. **Info.plist** - App permissions and configuration
3. **Podfile** - Native dependencies
4. **LaunchScreen.storyboard** - Splash screen

## Accessibility in iOS

Since we're implementing Phase 2 (Accessibility), here's how it maps to iOS:

### React Native → iOS Accessibility

```typescript
// React Native (what we write)
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Send message"
  accessibilityRole="button"
  accessibilityHint="Double tap to send your message"
>

// Becomes in iOS (automatically)
UIButton with:
- isAccessibilityElement = true
- accessibilityLabel = "Send message"
- accessibilityTraits = .button
- accessibilityHint = "Double tap to send your message"
```

### VoiceOver Testing

1. **On Simulator:**
   - Xcode → Open Developer Tool → Accessibility Inspector
   - Turn on VoiceOver: Settings → Accessibility → VoiceOver

2. **On Device:**
   - Triple-click side button to toggle VoiceOver
   - Or Settings → Accessibility → VoiceOver

## App Store Requirements

### App Icons

Create these sizes in `ios/PolyphonicIOS/Images.xcassets/AppIcon.appiconset/`:

- 1024×1024 (App Store)
- 180×180 (iPhone @3x)
- 120×120 (iPhone @2x)
- 152×152 (iPad @2x)
- 76×76 (iPad @1x)

### Screenshots

Required sizes for App Store Connect:

- **iPhone 6.7"**: 1290×2796 (iPhone 14 Pro Max)
- **iPhone 6.5"**: 1242×2688 or 1284×2778
- **iPhone 5.5"**: 1242×2208
- **iPad 12.9"**: 2048×2732

### Privacy Policy

Required for apps that:
- Store user data (✓ we do via AsyncStorage)
- Use third-party APIs (✓ OpenAI, Anthropic)
- Process personal information (✓ conversations)

## Build Configuration

### Development vs Production

```javascript
// In your code, use:
if (__DEV__) {
  // Development-only code
  console.log('Debug info');
} else {
  // Production-only code
}
```

### API Endpoints

```typescript
// src/config/environment.ts
const API_CONFIG = {
  openai: __DEV__
    ? 'https://api.openai.com/v1'     // Dev
    : 'https://api.openai.com/v1',     // Prod (same for this app)
};
```

## Building for App Store

### 1. Update Version

In Xcode:
- Select project → General tab
- Update Version (e.g., 1.0.0)
- Update Build (increment for each upload)

### 2. Set Release Scheme

1. Click scheme selector (next to device selector)
2. Edit Scheme...
3. Run → Build Configuration → Release

### 3. Archive

1. Select "Any iOS Device" as target
2. Product → Archive
3. Wait for build to complete

### 4. Upload to App Store Connect

1. Window → Organizer
2. Select your archive
3. Click "Distribute App"
4. Choose "App Store Connect"
5. Follow upload wizard

## Common Issues & Solutions

### "No bundle URL present"

```bash
# Fix: Reset Metro bundler
npx react-native start --reset-cache
```

### "Unable to resolve module"

```bash
# Fix: Clear everything and reinstall
cd ios && rm -rf Pods Podfile.lock && cd ..
npm install
cd ios && pod install && cd ..
```

### "Signing requires a development team"

Fix: Select your Apple Developer team in Xcode's Signing & Capabilities

### Build fails with "PhaseScriptExecution"

```bash
# Fix: Clean build
cd ios
xcodebuild clean
cd ..
npm run ios
```

## Performance Optimization

### For App Store builds:

1. **Enable Hermes** (already configured in Podfile)
2. **Strip debug symbols** (automatic in Release)
3. **Enable ProGuard** (Android only, ignore)
4. **Optimize images** (use .webp format when possible)

## Testing Checklist

Before submitting to App Store:

- [ ] Test on real device (not just simulator)
- [ ] Test all API integrations
- [ ] Test with VoiceOver enabled
- [ ] Test on different iOS versions (13+)
- [ ] Test offline behavior
- [ ] Test memory management (no leaks)
- [ ] Test with slow network (Network Link Conditioner)
- [ ] Review crash logs in Xcode

## App Store Submission Checklist

- [ ] App icons (all sizes)
- [ ] Screenshots (all required sizes)
- [ ] App Store description
- [ ] Keywords for search
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Age rating questionnaire
- [ ] Export compliance (we use encryption)
- [ ] TestFlight beta testing (recommended)

## Maintenance

### Updating React Native

```bash
npx react-native upgrade
cd ios && pod install
```

### Updating Native Dependencies

```bash
npm update
cd ios && pod update
```

## Next Steps

Now that iOS is configured, we'll implement:

1. **Accessibility improvements** (Phase 2)
   - Will work seamlessly in iOS with VoiceOver
   - Proper keyboard navigation
   - WCAG compliance

2. **Memory system** (Phase 3)
   - AsyncStorage → iOS Keychain
   - Secure data persistence

The app is now ready for Xcode development and App Store deployment!