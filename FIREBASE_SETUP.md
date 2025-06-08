# Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `exitpal-hackathon` (or your preferred name)
4. Disable Google Analytics (not needed for hackathon)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location (choose closest to your users)
5. Click "Done"

## Step 3: Get Firebase Configuration

1. Click the gear icon (Project Settings)
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Enter app nickname: `exitpal-web`
5. Don't check "Firebase Hosting" (we're using Netlify)
6. Click "Register app"
7. Copy the config object

## Step 4: Add Configuration to Your App

1. Create a `.env.local` file in your project root
2. Add your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Step 5: Set Up Security Rules

1. In Firebase Console, go to "Firestore Database"
2. Click "Rules" tab
3. Replace the default rules with the content from `firestore.rules`
4. Click "Publish"

## Step 6: Enable Authentication (Optional)

If you want to use Firebase Auth instead of your custom auth:

1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Enable "Google" (optional)

## Step 7: Test Your Setup

1. Run `npm run dev`
2. Try creating a message in your app
3. Check Firebase Console > Firestore Database to see the data

## Security Features Implemented

✅ **User Isolation**: Users can only access their own messages
✅ **Data Validation**: All message fields are validated
✅ **Authentication Required**: All operations require valid auth
✅ **Type Safety**: Message types and statuses are validated
✅ **No Admin Backdoors**: Even project owners must follow rules

## Production Checklist

- [ ] Update security rules for production
- [ ] Set up proper authentication
- [ ] Configure Firebase project for production domain
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy