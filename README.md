# ExitPal

ExitPal is a web application that helps users exit awkward social situations by scheduling text or voice messages to their phone. This app was built for the **Bolt.new Hackathon 2025**.

## 🚀 Live Demo

**[Visit ExitPal →](https://exitpal.app)**

[![Netlify Status](https://api.netlify.com/api/v1/badges/ced34ba0-22aa-4585-99cc-0622e4026b27/deploy-status)](https://app.netlify.com/projects/exitpal/deploys)

## 🏆 Hackathon Submission

This project was built in **48 hours** for the **Bolt.new Hackathon 2025**, showcasing the power of AI-assisted development with modern web technologies.

### **Problem Solved**
Everyone has been stuck in uncomfortable social situations - bad dates, boring meetings, awkward family gatherings. ExitPal provides a discreet, automated way to create believable exit opportunities.

### **Innovation**
- **Smart scheduling** with precise timing control
- **Vonage integration** for reliable SMS/voice delivery
- **Real-time dashboard** with live status updates
- **Premium features** with custom phone number selection
- **Production-ready** security and scalability

## ✨ Features

- **Dual Message Types**: Schedule SMS texts or voice calls
- **Precise Timing**: Set exact date and time for delivery
- **Custom Contacts**: Messages appear from "Mom", "Boss", "Doctor", etc.
- **Real-time Updates**: Live status tracking and management
- **Premium Numbers**: Choose from different area codes for authenticity
- **Responsive Design**: Works perfectly on mobile and desktop
- **Dark/Light Theme**: Automatic theme switching
- **Secure Authentication**: Email/password and Google OAuth

## 🛠 Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Supabase Auth
- **SMS & Voice**: Vonage API
- **Deployment**: Netlify
- **Icons**: Lucide React
- **Built with**: Bolt.new AI-powered development platform

## 🎯 Architecture Highlights

- **Modular Design**: Clean separation of concerns with 200-line file limits
- **Type Safety**: Full TypeScript implementation
- **Real-time**: Live updates via Supabase subscriptions
- **Security**: Row Level Security (RLS) for data isolation
- **Scalability**: Serverless edge functions for API integration
- **Responsive**: Mobile-first design with proper breakpoints

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (optional - app works with demo mode)
- Vonage account for SMS/Voice functionality

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### Environment Variables

```bash
# Required for Supabase integration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional - Vonage (for production SMS/Voice)
VITE_VONAGE_API_KEY=your_api_key
VITE_VONAGE_API_SECRET=your_api_secret
VITE_VONAGE_APPLICATION_ID=your_application_id
VITE_VONAGE_DEFAULT_NUMBER=your_vonage_number
```

## 📱 How It Works

1. **Sign Up**: Create account with email or Google
2. **Schedule Message**: Choose SMS or voice, set timing
3. **Add Contact**: Save ExitPal number as trusted contact
4. **Receive & Exit**: Use the message as your excuse to leave

## 🎨 Design Philosophy

- **Apple-level aesthetics** with meticulous attention to detail
- **Intuitive UX** with progressive disclosure
- **Micro-interactions** for enhanced engagement
- **Consistent spacing** using 8px grid system
- **Accessible colors** with proper contrast ratios
- **Responsive breakpoints** for all device sizes

## 🔒 Security & Privacy

- **Row Level Security** ensures users only see their data
- **Secure authentication** with Supabase Auth
- **API key protection** via serverless edge functions
- **No data sharing** with third parties
- **GDPR compliant** data handling

## 🌟 Hackathon Achievements

- ✅ **Full-stack application** built in 48 hours
- ✅ **Production-ready** with proper security
- ✅ **Real SMS/Voice integration** via Vonage
- ✅ **Professional UI/UX** with modern design
- ✅ **Scalable architecture** ready for growth
- ✅ **Live deployment** on custom domain

## 🔮 Future Roadmap

- **AI-generated messages** for different scenarios
- **Group coordination** for team exits
- **Location-based triggers** for automatic activation
- **Calendar integration** for meeting escapes
- **Analytics dashboard** for usage insights

## 🏆 Why ExitPal?

1. **Universal Problem**: Everyone can relate to awkward situations
2. **Elegant Solution**: Simple, effective, and discreet
3. **Technical Excellence**: Modern stack with best practices
4. **User Experience**: Intuitive design with attention to detail
5. **Market Ready**: Production-quality with real integrations

## 📊 Project Stats

- **Development Time**: 48 hours
- **Lines of Code**: ~3,000 (TypeScript/React)
- **Components**: 25+ reusable UI components
- **Database Tables**: 2 with proper relationships
- **API Endpoints**: 2 serverless edge functions
- **Test Coverage**: Manual testing across devices

## 🤝 Contributing

This is a hackathon project, but contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

Apache License 2.0

## 🙏 Acknowledgements

- **Bolt.new** - AI-powered development platform that made this possible
- **Supabase** - Backend-as-a-Service for database and auth
- **Vonage** - SMS and voice API integration
- **shadcn/ui** - Beautiful, accessible UI components
- **Netlify** - Seamless deployment and hosting

---

**🚀 Built for the Bolt.new Hackathon 2025**

*Showcasing the future of AI-assisted development*

&copy; 2025 ExitPal. All rights reserved.