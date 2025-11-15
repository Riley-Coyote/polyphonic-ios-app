#!/bin/bash

# Polyphonic iOS - Xcode Project Setup Script
# This script initializes the iOS project for Xcode and App Store deployment

echo "🚀 Setting up Polyphonic for iOS/Xcode..."

# Check for required tools
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npx >/dev/null 2>&1 || { echo "❌ npx is required but not installed. Aborting." >&2; exit 1; }

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Initialize React Native iOS project
echo "📱 Initializing iOS project..."
npx react-native init PolyphonicIOS --skip-install --directory temp_ios

# Copy iOS folder
if [ -d "temp_ios/ios" ]; then
    echo "📂 Setting up iOS folder..."
    cp -r temp_ios/ios ./
    rm -rf temp_ios
else
    echo "⚠️  Could not create iOS folder automatically."
    echo "Creating iOS folder manually..."
    mkdir -p ios
fi

# Create Podfile if it doesn't exist
if [ ! -f "ios/Podfile" ]; then
    echo "📝 Creating Podfile..."
    cat > ios/Podfile << 'EOF'
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '13.0'
prepare_react_native_project!

flipper_config = ENV['NO_FLIPPER'] == "1" ? FlipperConfiguration.disabled : FlipperConfiguration.enabled

target 'PolyphonicIOS' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :fabric_enabled => false,
    :flipper_configuration => flipper_config,
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  # Required pods for our features
  pod 'RNKeychain', :path => '../node_modules/react-native-keychain'
  pod 'RNVectorIcons', :path => '../node_modules/react-native-vector-icons'
  pod 'BVLinearGradient', :path => '../node_modules/react-native-linear-gradient'
  pod 'RNHapticFeedback', :path => '../node_modules/react-native-haptic-feedback'

  target 'PolyphonicIOSTests' do
    inherit! :complete
  end

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
  end
end
EOF
fi

# Create Info.plist with required permissions
echo "📋 Creating Info.plist..."
cat > ios/PolyphonicIOS/Info.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>Polyphonic</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <false/>
        <key>NSExceptionDomains</key>
        <dict>
            <key>localhost</key>
            <dict>
                <key>NSExceptionAllowsInsecureHTTPLoads</key>
                <true/>
            </dict>
        </dict>
    </dict>
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>This app does not require location services.</string>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
    </array>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
    <key>UIStatusBarStyle</key>
    <string>UIStatusBarStyleLightContent</string>
    <key>ITSAppUsesNonExemptEncryption</key>
    <false/>
    <key>UIBackgroundModes</key>
    <array>
        <string>fetch</string>
        <string>remote-notification</string>
    </array>
</dict>
</plist>
EOF

# Install CocoaPods if not installed
if ! command -v pod &> /dev/null; then
    echo "📦 Installing CocoaPods..."
    sudo gem install cocoapods
fi

# Install pods
echo "🔗 Installing CocoaPods dependencies..."
cd ios && pod install && cd ..

echo "✅ iOS setup complete!"
echo ""
echo "📱 Next steps:"
echo "1. Open ios/PolyphonicIOS.xcworkspace in Xcode"
echo "2. Select your development team in Signing & Capabilities"
echo "3. Choose a device or simulator"
echo "4. Press Run (⌘R) to build and run"
echo ""
echo "🚀 To run from command line:"
echo "   npm run ios"
echo ""
echo "📦 For App Store submission:"
echo "1. Set version and build numbers in Xcode"
echo "2. Archive the app (Product > Archive)"
echo "3. Upload to App Store Connect"