# ExitPal

ExitPal is a web application that helps users exit awkward social situations by scheduling text or voice messages to their phone. This app was built for a hackathon demo.

## Features

- User authentication (email/password and Google OAuth)
- Dashboard for scheduling SMS and voice messages
- Message management (view and cancel pending messages)
- Mock Twilio integration for sending SMS and making voice calls
- Premium account mock-up with Twilio number selection

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, shadcn/ui
- Backend: Next.js API Routes
- Authentication: Custom auth provider (local storage based for demo)
- SMS & Voice: Twilio (mocked for demo)
- Subscription: RevenueCat (mocked for demo)
- Database: Local storage (for demo purposes)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your Twilio credentials:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_DEFAULT_NUMBER=your_twilio_number
   ```

### Development

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### Build

```
npm run build
```

### Deployment

This project is configured for deployment on Netlify. Connect your GitHub repository to Netlify for automatic deployments.

## Project Structure

- `app/` - Next.js app directory with pages and API routes
- `components/` - React components
- `lib/` - Utility functions and services
- `hooks/` - Custom React hooks

## Notes

- This is a demo application for a hackathon. In a production environment, you would want to:
  - Use a proper database instead of localStorage
  - Implement real authentication with JWT or OAuth
  - Use a server for scheduling messages (instead of browser setTimeout)
  - Add proper error handling and validation
  - Implement real payment processing

## License

Apache License 2.0 

## Acknowledgements

- Built with [Bolt.new](https://bolt.new)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
