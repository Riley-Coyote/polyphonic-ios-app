#!/bin/bash

echo "🚀 Starting Polyphonic iOS App Setup..."
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✓ Node.js and npm detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if React Native CLI is installed
if ! command -v npx &> /dev/null; then
    npm install -g npx
fi

echo ""
echo "🎯 Choose how to run the app:"
echo ""
echo "1) iOS Simulator (requires Xcode)"
echo "2) Web Preview (opens in browser)"
echo "3) Install dependencies only"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📱 Starting iOS Simulator..."
        echo "Note: This requires Xcode and iOS Simulator installed"

        # Install iOS dependencies
        if [ -d "ios" ]; then
            echo "Installing CocoaPods dependencies..."
            cd ios
            pod install 2>/dev/null || echo "Note: CocoaPods not installed. Run: sudo gem install cocoapods"
            cd ..
        fi

        # Start Metro bundler in background
        npx react-native start --reset-cache &
        METRO_PID=$!

        # Wait for Metro to start
        sleep 5

        # Run on iOS
        npx react-native run-ios

        # Keep Metro running
        wait $METRO_PID
        ;;

    2)
        echo ""
        echo "🌐 Opening HTML Preview..."
        open app-preview.html
        echo ""
        echo "✓ App preview opened in your browser!"
        ;;

    3)
        echo ""
        echo "✓ Dependencies installed successfully!"
        echo ""
        echo "To run later:"
        echo "  - For iOS: npm run ios"
        echo "  - For HTML preview: open app-preview.html"
        ;;

    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✨ Done!"