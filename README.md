# ExitPal

ExitPal is a web application that helps users exit awkward social situations by scheduling text or voice messages to their phone. This app was built for the Bolt.new hackathon demo.

## 🚀 Live Demo

**[Visit ExitPal →](https://www.exitpal.app)**

[![Netlify Status](https://api.netlify.com/api/v1/badges/ced34ba0-22aa-4585-99cc-0622e4026b27/deploy-status)](https://app.netlify.com/projects/exitpal/deploys)

## Features

- User authentication (email/password and Google OAuth via Supabase)
- Dashboard for scheduling SMS and voice messages
- Real-time message management with Supabase
- Message status tracking (view and cancel pending messages)
- Vonage integration for sending SMS and making voice calls
- Premium account features with Vonage number selection
- Dark/light theme support
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Supabase Auth
- **SMS & Voice**: Vonage (formerly Nexmo)
- **Deployment**: Netlify (static site)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (optional - app works with mock data)
- Vonage account for SMS/Voice functionality

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   
   For Supabase integration, add:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   For Vonage (optional - currently mocked):
   ```
   VITE_VONAGE_API_KEY=your_api_key
   VITE_VONAGE_API_SECRET=your_api_secret
   VITE_VONAGE_APPLICATION_ID=your_application_id
   VITE_VONAGE_DEFAULT_NUMBER=your_vonage_number
   ```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment on Netlify

### Step 1: Connect Repository
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository

### Step 2: Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

### Step 3: Environment Variables
In your Netlify site dashboard, go to **Site settings → Environment variables** and add:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**: Replace these with your actual Supabase credentials from your [Supabase Dashboard](https://supabase.com/dashboard).

### Step 4: Deploy
Click "Deploy site" and your app will be live!

## Vonage Integration

### Setting Up Vonage

1. **Create a Vonage Account**: Sign up at [dashboard.nexmo.com](https://dashboard.nexmo.com)

2. **Get API Credentials**: 
   - API Key and API Secret from your dashboard
   - For voice calls, create a Vonage Application and get the Application ID

3. **Configure Environment Variables** in Supabase Edge Functions:
   ```
   VONAGE_API_KEY=your_api_key
   VONAGE_API_SECRET=your_api_secret
   VONAGE_APPLICATION_ID=your_application_id (for voice)
   VONAGE_PRIVATE_KEY=your_private_key (for voice)
   VONAGE_DEFAULT_NUMBER=your_vonage_number
   ```

### Vonage vs Twilio

This app was migrated from Twilio to Vonage. Key differences:

- **SMS API**: Vonage uses `https://rest.nexmo.com/sms/json` vs Twilio's REST API
- **Voice Calls**: Vonage uses NCCO (JSON) vs Twilio's TwiML (XML)
- **Authentication**: Vonage uses API Key/Secret vs Twilio's Account SID/Auth Token
- **Webhooks**: Different webhook formats and structures

## Environment Variables Security

**Q: Are environment variables secure when deployed?**

For Supabase, **yes, this is the intended design**:

- `VITE_SUPABASE_ANON_KEY` is **meant to be public** (it's called "anonymous" for a reason)
- Security comes from **Row Level Security (RLS)** policies in your database
- You can restrict which domains can access your Supabase project
- Supabase has built-in rate limiting and abuse protection

**Never put sensitive keys** (like `SUPABASE_SERVICE_ROLE_KEY` or `VONAGE_PRIVATE_KEY`) in client-side environment variables.

## Project Structure

```
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/              # Page components
│   ├── lib/                # Utility functions and services
│   └── main.tsx            # App entry point
├── components/             # Shared UI components
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
├── lib/                    # Shared utilities
├── public/                 # Static assets
├── supabase/              # Database migrations and functions
└── dist/                   # Build output (generated)
```

## Database Schema

The app uses Supabase with the following tables:

### `profiles`
- `id` (uuid, primary key) - User ID from Supabase Auth
- `email` (text) - User email
- `phone` (text, nullable) - User phone number
- `is_premium` (boolean) - Premium subscription status
- `created_at` (timestamp)

### `messages`
- `id` (uuid, primary key) - Message ID
- `user_id` (uuid, foreign key) - References profiles.id
- `contact_name` (text) - Display name for the contact
- `message_content` (text) - Message body
- `phone_number` (text) - Recipient phone number
- `scheduled_time` (timestamp) - When to send the message
- `message_type` (enum: 'sms' | 'voice') - Type of message
- `status` (enum: 'pending' | 'sent' | 'failed') - Message status
- `created_at` (timestamp)
- `vonage_id` (text, nullable) - Vonage message/call ID for tracking

## Features in Detail

### Authentication
- Email/password signup and login via Supabase Auth
- Google OAuth integration
- Automatic profile creation
- Session persistence

### Message Scheduling
- Schedule SMS or voice messages
- Real-time updates via Supabase subscriptions
- Message status tracking
- Cancel pending messages

### Premium Features
- Custom Vonage phone number selection
- Priority message delivery (planned)
- Advanced scheduling options (planned)

## Development Notes

### Hackathon Context
This app was built in 48 hours for the Bolt.new hackathon. Some features are mocked or simplified:

- **Vonage Integration**: Currently mocked - messages are simulated
- **Payment Processing**: Mock payment flow for premium features
- **Message Delivery**: Simulated with setTimeout (would use server-side jobs in production)

### Production Considerations
For a production deployment, you would want to:

- Implement real Vonage integration with server-side API
- Add proper payment processing (Stripe, etc.)
- Use server-side job scheduling for message delivery
- Add comprehensive error handling and validation
- Implement rate limiting and abuse prevention
- Add analytics and monitoring
- Enhance security with proper API key management

## Troubleshooting

### "Supabase not configured" Error
If you see this error on your deployed site:

1. **Check Netlify Environment Variables**: Go to your Netlify site dashboard → Site settings → Environment variables
2. **Verify Supabase Credentials**: Make sure your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
3. **Redeploy**: After adding environment variables, trigger a new deployment

### Local Development Issues
- Make sure your `.env` file is in the project root
- Restart your dev server after changing environment variables
- Check that your Supabase project is active and accessible

## Environment Variables Reference

```bash
# Required for Supabase integration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional - Vonage (currently mocked)
VITE_VONAGE_API_KEY=your_api_key
VITE_VONAGE_API_SECRET=your_api_secret
VITE_VONAGE_APPLICATION_ID=your_application_id
VITE_VONAGE_DEFAULT_NUMBER=your_vonage_number
```

## Contributing

This is a hackathon project, but contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Apache License 2.0

## Acknowledgements

- Built with ❤️ using [Bolt.new](https://bolt.new) - AI-powered development platform
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
- Database and auth by [Supabase](https://supabase.com)
- SMS and Voice by [Vonage](https://vonage.com)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Deployed on [Netlify](https://netlify.com)

---

**🚀 Built for the Bolt.new Hackathon 2025**

&copy; 2025 ExitPal. All rights reserved.