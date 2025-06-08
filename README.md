# ExitPal

ExitPal is a web application that helps users exit awkward social situations by scheduling text or voice messages to their phone. This app was built for the Bolt.new hackathon demo.

## Features

- User authentication (email/password and Google OAuth via Supabase)
- Dashboard for scheduling SMS and voice messages
- Real-time message management with Supabase
- Message status tracking (view and cancel pending messages)
- Mock Twilio integration for sending SMS and making voice calls
- Premium account features with Twilio number selection
- Dark/light theme support
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Supabase Auth
- **SMS & Voice**: Twilio (mocked for demo)
- **Deployment**: Netlify (static site)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (optional - app works with mock data)

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
   
   For Twilio (optional - currently mocked):
   ```
   VITE_TWILIO_ACCOUNT_SID=your_account_sid
   VITE_TWILIO_AUTH_TOKEN=your_auth_token
   VITE_TWILIO_DEFAULT_NUMBER=your_twilio_number
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

### Deployment

This project is configured for deployment on Netlify as a static site:

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

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
- Custom phone number selection
- Priority message delivery (planned)
- Advanced scheduling options (planned)

## Development Notes

### Hackathon Context
This app was built in 48 hours for the Bolt.new hackathon. Some features are mocked or simplified:

- **Twilio Integration**: Currently mocked - messages are simulated
- **Payment Processing**: Mock payment flow for premium features
- **Message Delivery**: Simulated with setTimeout (would use server-side jobs in production)

### Production Considerations
For a production deployment, you would want to:

- Implement real Twilio integration with server-side API
- Add proper payment processing (Stripe, etc.)
- Use server-side job scheduling for message delivery
- Add comprehensive error handling and validation
- Implement rate limiting and abuse prevention
- Add analytics and monitoring
- Enhance security with proper API key management

## Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Twilio Configuration (for future use)
VITE_TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
VITE_TWILIO_AUTH_TOKEN=1234567890abcdef1234567890abcdef
VITE_TWILIO_DEFAULT_NUMBER=+12312345678
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
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Deployed on [Netlify](https://netlify.com)

---

**🚀 Built for the Bolt.new Hackathon 2025**

&copy; 2025 ExitPal. All rights reserved.