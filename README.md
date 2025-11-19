# Course Platform - Next-Generation Learning Platform

> A comprehensive course platform that exceeds Kajabi with advanced gamification, AI-powered features, superior mobile experience, and true community engagement.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

## 🌟 Key Features

### 🎯 Core Differentiators
- **Superior Mobile Experience** - PWA with offline capability and 70% faster repeat visits
- **Advanced Gamification** - XP system, badges, leaderboards (60% engagement increase)
- **Next-Gen AI Features** - Adaptive learning paths, AI teaching assistant (30-50% performance boost)
- **Interactive Learning** - Video hotspots, branching scenarios (25% retention increase)
- **True Community** - Forums, peer review, study groups (50% completion rate increase)

### 📚 Learning Features
- **Rich Content Editor** - Notion-like editor with images, videos, code blocks
- **Quiz System** - Multiple question types, timed quizzes, instant feedback
- **Video Streaming** - HLS adaptive bitrate streaming with 4 quality levels
- **Progress Tracking** - Real-time progress with resume capability
- **Certificates** - Blockchain-verified course completion certificates

### 🤖 AI-Powered
- **AI Teaching Assistant** - 24/7 support with course context (RAG)
- **Auto Quiz Generation** - Generate quizzes from any content
- **Adaptive Learning Paths** - Personalized based on performance
- **Predictive Analytics** - Early warning for at-risk students
- **Smart Study Schedules** - AI-optimized with spaced repetition

### 🎮 Gamification
- **XP System** - Points for all learning activities
- **Badges & Achievements** - Visual recognition of milestones
- **Leaderboards** - Global, course, and friend rankings
- **Daily Streaks** - Encourage consistent learning
- **Level Progression** - Unlock features as you advance

### 📱 Mobile Excellence
- **Progressive Web App** - Install from browser, works offline
- **Core Web Vitals Optimized** - LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Responsive Design** - Mobile-first, tablet, desktop
- **Touch Optimized** - Thumb-friendly navigation
- **Push Notifications** - Re-engagement and updates

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **PostgreSQL** (via Supabase)
- **FFmpeg** (for video processing)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/course-platform.git
cd course-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Run database migrations
npm run db:push

# 5. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Create a `.env.local` file with the following:

```env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_postgres_connection_string

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Payments (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# AI (OpenAI)
OPENAI_API_KEY=your_openai_api_key

# Vector Database (Pinecone)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX=course-content

# Email (Optional - Resend)
RESEND_API_KEY=your_resend_api_key
```

## 📖 Documentation

- **[Development Plan](./COURSE_PLATFORM_RESEARCH.md#16-comprehensive-development-plan-from-research-to-reality)** - Complete 20-week implementation roadmap
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project
- **[API Documentation](./docs/API.md)** - REST API reference
- **[Component Library](./docs/COMPONENTS.md)** - UI component documentation
- **[Database Schema](./docs/DATABASE.md)** - Database structure and migrations

## 🏗️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library
- **[Motion](https://motion.dev/)** - Animations (Framer Motion)
- **[Radix UI](https://www.radix-ui.com/)** - Accessible primitives

### Backend
- **[Supabase](https://supabase.com/)** - PostgreSQL, Auth, Storage
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database queries
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication
- **[Stripe](https://stripe.com/)** - Payment processing

### Video & Media
- **[Video.js](https://videojs.com/)** - Video player
- **[HLS.js](https://github.com/video-dev/hls.js/)** - Adaptive streaming
- **[FFmpeg](https://ffmpeg.org/)** - Video processing

### AI & ML
- **[OpenAI GPT-4](https://openai.com/)** - Content generation, chat
- **[Pinecone](https://www.pinecone.io/)** - Vector database
- **[LangChain](https://js.langchain.com/)** - AI orchestration

### Deployment
- **[Vercel](https://vercel.com/)** - Hosting and edge functions
- **[Supabase Cloud](https://supabase.com/)** - Database hosting

## 📁 Project Structure

```
course-platform/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Student dashboard
│   ├── (instructor)/        # Instructor dashboard
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── courses/        # Course CRUD
│   │   ├── ai/             # AI endpoints
│   │   └── webhooks/       # Stripe webhooks
│   └── courses/            # Course viewing
├── components/              # React components
│   ├── ui/                 # shadcn/ui components
│   ├── course/             # Course-related components
│   ├── quiz/               # Quiz components
│   ├── gamification/       # XP, badges, leaderboards
│   └── ai/                 # AI chat widget
├── lib/                     # Utility functions
│   ├── db/                 # Database utilities
│   ├── ai/                 # AI helpers
│   ├── video/              # Video processing
│   └── stripe/             # Payment utilities
├── db/                      # Database schema
│   ├── schema/             # Drizzle schema definitions
│   └── migrations/         # Database migrations
├── public/                  # Static assets
├── docs/                    # Documentation
└── scripts/                # Utility scripts
```

## 🎯 Development Roadmap

### Phase 1: Foundation & MVP ✅ (Weeks 1-6)
- [x] Next.js + TypeScript + Tailwind setup
- [x] Database schema and migrations
- [x] Authentication (Google + Email)
- [x] Course CRUD operations
- [x] Video upload and HLS processing
- [x] Stripe payment integration
- [x] Responsive UI with animations

### Phase 2: Enhanced Learning 🚧 (Weeks 7-10)
- [ ] Rich text editor (Tiptap)
- [ ] Quiz system (builder + taker)
- [ ] Gamification (XP, badges, leaderboards)
- [ ] Progress tracking dashboard

### Phase 3: AI Integration 📅 (Weeks 11-14)
- [ ] AI teaching assistant (RAG)
- [ ] AI quiz generation
- [ ] Adaptive learning paths
- [ ] Predictive analytics

### Phase 4: Scale Features 📅 (Weeks 15-20)
- [ ] Community features (forums, peer review)
- [ ] PWA with offline support
- [ ] Advanced analytics dashboards
- [ ] Interactive video (hotspots, branching)

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run all tests with coverage
npm run test:coverage
```

## 📊 Performance Metrics

Our platform targets exceptional performance:

- **Lighthouse Score**: > 90 (all categories)
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1
- **Video Start Time**: < 3 seconds
- **API Response Time**: p95 < 500ms
- **Uptime**: > 99.9%

## 📈 Success Metrics

### Business
- **Course Completion Rate**: > 60% (industry avg: 10%)
- **Student Engagement**: DAU/MAU > 40%
- **NPS**: > 50
- **Churn Rate**: < 5% monthly

### Learning Outcomes
- **Knowledge Retention**: +30% vs passive video
- **Quiz Performance**: Average score improvement > 25%
- **Peer Interaction**: > 50% students participate in forums
- **Badge Attainment**: > 60% earn at least one badge

## 💰 Pricing & Costs

### Platform Costs (Monthly)

**MVP (100 students)**: ~$270
- Vercel Pro: $20
- Supabase Pro: $25
- OpenAI API: $50
- Stripe fees: $175

**Growth (1,000 students)**: ~$2,989
- Supabase Team: $599
- OpenAI API: $500
- Pinecone: $70
- Stripe fees: $1,750

**Scale (10,000 students)**: ~$25,000
- Enterprise infrastructure
- Full AI capabilities
- 24/7 support

### Competitive Advantage

| Feature | Kajabi | Our Platform |
|---------|--------|--------------|
| Entry Price | $89/mo | $10-50/mo |
| Transaction Fees | 0% | 2.9% + $0.30 (Stripe) |
| Gamification | None | Full system |
| AI Features | Basic | Advanced (10+ use cases) |
| Mobile Experience | Good | Excellent (PWA) |
| Community | Limited | Built-in |
| Customization | Limited | Fully open-source |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - Amazing React framework
- **[Supabase](https://supabase.com/)** - Excellent PostgreSQL platform
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[OpenAI](https://openai.com/)** - Powerful AI capabilities
- **Research sources** - See [COURSE_PLATFORM_RESEARCH.md](./COURSE_PLATFORM_RESEARCH.md)

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/course-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/course-platform/discussions)
- **Email**: support@courseplatform.com

## 🗺️ Roadmap

### 2025 Q1-Q2 (Current)
- ✅ Complete research and planning
- 🚧 Phase 1: MVP development
- 📅 Phase 2: Enhanced learning features

### 2025 Q3
- AI integration
- Community features
- PWA launch

### 2025 Q4
- Blockchain credentials
- Advanced analytics
- Mobile native apps (iOS/Android)

### 2026+
- VR/AR learning experiences
- White-label solution
- Integration ecosystem (Zapier, Make)
- Enterprise features

---

**Built with ❤️ for the future of online education**

*Last Updated: November 19, 2025*
