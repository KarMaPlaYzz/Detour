# Detour - Setup Guide

This guide will help you set up the Detour prototype on your local machine.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- iOS Simulator (macOS only) or Android Emulator
- Google Cloud Platform account with billing enabled

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
# cd into the project directory
cd Detour

# Install dependencies using Expo's install command
# This ensures all packages get compatible versions
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-maps
npx expo install expo-location
npx expo install expo-constants

# Install remaining dependencies
npm install
```

## Step 2: Google Maps API Setup

### 2.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project

### 2.2 Enable Required APIs

Enable the following APIs in your project:
- **Directions API**
- **Places API** 
- **Maps SDK for Android**
- **Maps SDK for iOS**

To enable:
1. Go to "APIs & Services" > "Library"
2. Search for each API and click "Enable"

### 2.3 Create an API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key

### 2.4 Restrict Your API Key (Important for Security)

1. Click on your API key to edit it
2. Under "Application restrictions":
   - For production: Select "Android apps" and "iOS apps" and add your bundle IDs
   - For development: You can leave unrestricted but monitor usage closely
3. Under "API restrictions":
   - Select "Restrict key"
   - Check: Directions API, Places API, Maps SDK for Android, Maps SDK for iOS
4. Save changes

**Bundle IDs used in this app:**
- iOS: `com.detour.app`
- Android: `com.detour.app`

## Step 3: Configure Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Google Maps API key:
   ```
   GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. **Important**: Never commit the `.env` file to version control!

## Step 4: Run the App

### Start the Expo development server:
```bash
npx expo start
```

### Run on iOS (macOS only):
```bash
npx expo start --ios
```

### Run on Android:
```bash
npx expo start --android
```

### Run in Expo Go (for quick testing):
1. Install Expo Go on your device from App Store / Play Store
2. Scan the QR code from the terminal
3. **Note**: react-native-maps may have limited functionality in Expo Go

## Step 5: Testing the App

### Test Coordinates (Los Angeles)
Use these sample coordinates to test the app:

- **Start**: `34.0522,-118.2437` (Downtown LA)
- **End**: `34.0407,-118.2468` (USC area)
- **Interest**: Cafes

Expected result: A route with a cafe POI somewhere along the path.

## Troubleshooting

### "No map view" or blank map
- Verify your API key is correctly set in `.env`
- Ensure Maps SDK for Android/iOS is enabled in Google Cloud Console
- Check that the API key is not restricted too tightly

### "No POIs found"
- Try a different interest category
- Use coordinates in a more populated area
- Check Places API is enabled and has quota remaining

### Build errors
- Run `npx expo prebuild --clean` to regenerate native folders
- Delete `node_modules` and `package-lock.json`, then `npm install` again
- Ensure all dependencies are installed via `npx expo install`

### API Key not working
- Double-check the key is copied correctly with no extra spaces
- Verify all required APIs are enabled
- Check billing is enabled on your Google Cloud project
- Wait a few minutes after enabling APIs (propagation delay)

## Development Notes

- The app uses Expo's managed workflow, so you don't need to manually configure native code
- API keys are embedded at build time from environment variables
- For production builds, use `eas build` with environment secrets

## Next Steps

After successful setup:
1. Test the core flow: Find Detour → Save → View in My Detours
2. Experiment with different interests and locations
3. Monitor API usage in Google Cloud Console
4. Consider implementing additional features from the roadmap

## Cost Monitoring

Keep an eye on your Google Cloud billing:
- Set up budget alerts in Google Cloud Console
- Each detour request makes ~2-3 API calls
- Directions API: ~$5 per 1,000 requests
- Places API: ~$32 per 1,000 requests

For development, Google provides $200 free credit per month.

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Expo documentation: https://docs.expo.dev
3. Check react-native-maps docs: https://github.com/react-native-maps/react-native-maps
4. Open an issue in the repository
