# Development Path 2: Frontend & User Experience

**Assigned to:** Claude Code Instance #2
**Focus:** UI/UX, Components, Student & Instructor Interfaces, PWA, Marketing Pages
**Timeline:** Weeks 1-32 (Parallel with Path 1)

---

## Overview

This path focuses on building the visually impressive, user-friendly interfaces that solve critical UX pain points:
- **80-90% mobile abandonment** → Build PWA with offline support
- **10% completion rate** → Create engaging, gamified learning experience
- **"Where's my professor?"** complaint → Build interactive, connected interfaces
- **Poor customization** → Fully customizable, beautiful design system

You will be responsible for all user-facing components, student and instructor dashboards, course creation interfaces, and the Progressive Web App implementation.

---

## Phase 1: Design System & Core UI (Weeks 1-6)

### Week 1-2: Setup & Design System Foundation

**Priority: CRITICAL - Foundation for all UI work**

#### Tasks:
- [ ] Wait for Path 1 to create Next.js project (Day 1)
  - Once created, pull the repository

- [ ] Install frontend dependencies
  ```bash
  # UI Components
  npx shadcn-ui@latest init

  # Select options:
  # - TypeScript: Yes
  # - Style: Default
  # - Base color: Slate
  # - CSS variables: Yes

  # Install core shadcn components
  npx shadcn-ui@latest add button
  npx shadcn-ui@latest add card
  npx shadcn-ui@latest add input
  npx shadcn-ui@latest add form
  npx shadcn-ui@latest add dialog
  npx shadcn-ui@latest add dropdown-menu
  npx shadcn-ui@latest add avatar
  npx shadcn-ui@latest add badge
  npx shadcn-ui@latest add progress
  npx shadcn-ui@latest add tabs
  npx shadcn-ui@latest add toast
  npx shadcn-ui@latest add skeleton
  npx shadcn-ui@latest add alert
  npx shadcn-ui@latest add select
  npx shadcn-ui@latest add textarea
  npx shadcn-ui@latest add checkbox
  npx shadcn-ui@latest add radio-group
  npx shadcn-ui@latest add separator
  npx shadcn-ui@latest add sheet
  npx shadcn-ui@latest add popover
  npx shadcn-ui@latest add command
  npx shadcn-ui@latest add calendar
  npx shadcn-ui@latest add slider

  # Animation library
  npm install motion

  # Video player
  npm install video.js @types/video.js
  npm install videojs-contrib-quality-levels
  npm install videojs-http-source-selector

  # Rich text editor
  npm install @tiptap/react @tiptap/starter-kit
  npm install @tiptap/extension-placeholder
  npm install @tiptap/extension-link
  npm install @tiptap/extension-image
  npm install @tiptap/extension-youtube

  # Form handling
  npm install react-hook-form @hookform/resolvers zod

  # State management
  npm install zustand

  # API client
  npm install @tanstack/react-query axios

  # Icons
  npm install lucide-react

  # Utilities
  npm install clsx tailwind-merge
  npm install date-fns
  ```

- [ ] Configure Tailwind with custom theme
  ```typescript
  // tailwind.config.ts
  import type { Config } from 'tailwindcss';

  const config: Config = {
    darkMode: ['class'],
    content: [
      './pages/**/*.{ts,tsx}',
      './components/**/*.{ts,tsx}',
      './app/**/*.{ts,tsx}',
      './src/**/*.{ts,tsx}',
    ],
    theme: {
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px',
        },
      },
      extend: {
        colors: {
          border: 'hsl(var(--border))',
          input: 'hsl(var(--input))',
          ring: 'hsl(var(--ring))',
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          primary: {
            DEFAULT: 'hsl(var(--primary))',
            foreground: 'hsl(var(--primary-foreground))',
          },
          secondary: {
            DEFAULT: 'hsl(var(--secondary))',
            foreground: 'hsl(var(--secondary-foreground))',
          },
          success: {
            DEFAULT: 'hsl(142, 76%, 36%)',
            foreground: 'hsl(142, 76%, 96%)',
          },
          warning: {
            DEFAULT: 'hsl(48, 96%, 53%)',
            foreground: 'hsl(48, 96%, 13%)',
          },
          destructive: {
            DEFAULT: 'hsl(var(--destructive))',
            foreground: 'hsl(var(--destructive-foreground))',
          },
          muted: {
            DEFAULT: 'hsl(var(--muted))',
            foreground: 'hsl(var(--muted-foreground))',
          },
          accent: {
            DEFAULT: 'hsl(var(--accent))',
            foreground: 'hsl(var(--accent-foreground))',
          },
          popover: {
            DEFAULT: 'hsl(var(--popover))',
            foreground: 'hsl(var(--popover-foreground))',
          },
          card: {
            DEFAULT: 'hsl(var(--card))',
            foreground: 'hsl(var(--card-foreground))',
          },
        },
        borderRadius: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)',
        },
        keyframes: {
          'accordion-down': {
            from: { height: '0' },
            to: { height: 'var(--radix-accordion-content-height)' },
          },
          'accordion-up': {
            from: { height: 'var(--radix-accordion-content-height)' },
            to: { height: '0' },
          },
          'fade-in': {
            from: { opacity: '0' },
            to: { opacity: '1' },
          },
          'slide-in-from-top': {
            from: { transform: 'translateY(-10px)', opacity: '0' },
            to: { transform: 'translateY(0)', opacity: '1' },
          },
        },
        animation: {
          'accordion-down': 'accordion-down 0.2s ease-out',
          'accordion-up': 'accordion-up 0.2s ease-out',
          'fade-in': 'fade-in 0.3s ease-out',
          'slide-in': 'slide-in-from-top 0.3s ease-out',
        },
      },
    },
    plugins: [require('tailwindcss-animate')],
  };

  export default config;
  ```

- [ ] Create global styles with animations
  ```css
  /* app/globals.css */
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer base {
    :root {
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;
      --card: 0 0% 100%;
      --card-foreground: 222.2 84% 4.9%;
      --popover: 0 0% 100%;
      --popover-foreground: 222.2 84% 4.9%;
      --primary: 221.2 83.2% 53.3%;
      --primary-foreground: 210 40% 98%;
      --secondary: 210 40% 96.1%;
      --secondary-foreground: 222.2 47.4% 11.2%;
      --muted: 210 40% 96.1%;
      --muted-foreground: 215.4 16.3% 46.9%;
      --accent: 210 40% 96.1%;
      --accent-foreground: 222.2 47.4% 11.2%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 210 40% 98%;
      --border: 214.3 31.8% 91.4%;
      --input: 214.3 31.8% 91.4%;
      --ring: 221.2 83.2% 53.3%;
      --radius: 0.5rem;
    }

    .dark {
      --background: 222.2 84% 4.9%;
      --foreground: 210 40% 98%;
      --card: 222.2 84% 4.9%;
      --card-foreground: 210 40% 98%;
      --popover: 222.2 84% 4.9%;
      --popover-foreground: 210 40% 98%;
      --primary: 217.2 91.2% 59.8%;
      --primary-foreground: 222.2 47.4% 11.2%;
      --secondary: 217.2 32.6% 17.5%;
      --secondary-foreground: 210 40% 98%;
      --muted: 217.2 32.6% 17.5%;
      --muted-foreground: 215 20.2% 65.1%;
      --accent: 217.2 32.6% 17.5%;
      --accent-foreground: 210 40% 98%;
      --destructive: 0 62.8% 30.6%;
      --destructive-foreground: 210 40% 98%;
      --border: 217.2 32.6% 17.5%;
      --input: 217.2 32.6% 17.5%;
      --ring: 224.3 76.3% 48%;
    }
  }

  @layer base {
    * {
      @apply border-border;
    }
    body {
      @apply bg-background text-foreground;
    }
  }

  /* Custom animations */
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  .skeleton {
    animation: shimmer 2s infinite linear;
    background: linear-gradient(
      to right,
      #f6f7f8 0%,
      #edeef1 20%,
      #f6f7f8 40%,
      #f6f7f8 100%
    );
    background-size: 1000px 100%;
  }
  ```

- [ ] Create reusable layout components
  ```typescript
  // components/layouts/PageLayout.tsx
  import { ReactNode } from 'react';
  import { Header } from '@/components/Header';
  import { Footer } from '@/components/Footer';

  interface PageLayoutProps {
    children: ReactNode;
    showHeader?: boolean;
    showFooter?: boolean;
  }

  export function PageLayout({
    children,
    showHeader = true,
    showFooter = true
  }: PageLayoutProps) {
    return (
      <div className="min-h-screen flex flex-col">
        {showHeader && <Header />}
        <main className="flex-1">
          {children}
        </main>
        {showFooter && <Footer />}
      </div>
    );
  }

  // components/layouts/DashboardLayout.tsx
  import { Sidebar } from '@/components/Sidebar';

  export function DashboardLayout({ children }: { children: ReactNode }) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    );
  }
  ```

- [ ] Set up API client with React Query
  ```typescript
  // lib/api-client.ts
  import axios from 'axios';

  export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token to requests
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // app/providers.tsx
  'use client';

  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import { ReactNode, useState } from 'react';

  export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          refetchOnWindowFocus: false,
        },
      },
    }));

    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }
  ```

#### Deliverables for Path 1:
- [ ] **Component library documentation** (Storybook optional)
- [ ] **Design tokens and theme** variables
- [ ] **Layout templates** screenshots

**Success Metrics:**
- [ ] All shadcn components render correctly
- [ ] Theme switcher (light/dark) works
- [ ] Responsive layouts on all screen sizes
- [ ] Animations smooth (60fps)

---

### Week 3-4: Authentication UI & Onboarding

**Priority: HIGH - Required for all protected pages**

#### Tasks (wait for Path 1 auth API completion):
- [ ] Create authentication store with Zustand
  ```typescript
  // lib/stores/auth-store.ts
  import { create } from 'zustand';
  import { persist } from 'zustand/middleware';

  interface User {
    id: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
  }

  interface AuthStore {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, role: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
  }

  export const useAuthStore = create<AuthStore>()(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        login: async (email, password) => {
          const response = await apiClient.post('/auth/login', {
            email,
            password,
          });

          const { session, user } = response.data;

          localStorage.setItem('auth_token', session.access_token);

          set({
            user,
            token: session.access_token,
            isAuthenticated: true,
          });
        },

        signup: async (email, password, role) => {
          const response = await apiClient.post('/auth/signup', {
            email,
            password,
            role,
          });

          const { user } = response.data;

          set({ user });
        },

        logout: () => {
          localStorage.removeItem('auth_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        },

        setUser: (user) => set({ user, isAuthenticated: true }),
      }),
      {
        name: 'auth-storage',
      }
    )
  );
  ```

- [ ] Create login page
  ```typescript
  // app/(auth)/login/page.tsx
  'use client';

  import { useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { useAuthStore } from '@/lib/stores/auth-store';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
  import { useToast } from '@/components/ui/use-toast';
  import Link from 'next/link';

  export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const login = useAuthStore((state) => state.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        await login(email, password);
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
        router.push('/dashboard');
      } catch (error) {
        toast({
          title: 'Login failed',
          description: 'Invalid email or password.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log in'}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }
  ```

- [ ] Create signup page with role selection
  ```typescript
  // app/(auth)/signup/page.tsx
  'use client';

  import { useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { useAuthStore } from '@/lib/stores/auth-store';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
  import { useToast } from '@/components/ui/use-toast';
  import { GraduationCap, User } from 'lucide-react';

  export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const signup = useAuthStore((state) => state.signup);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'student' | 'instructor'>('student');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        await signup(email, password, role);
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });
        router.push('/login');
      } catch (error) {
        toast({
          title: 'Signup failed',
          description: 'Unable to create account. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Join thousands of learners and educators
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-3">
                <Label>I want to...</Label>
                <RadioGroup value={role} onValueChange={(v) => setRole(v as any)}>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="flex items-center cursor-pointer flex-1">
                      <User className="mr-2 h-5 w-5" />
                      <div>
                        <div className="font-medium">Learn</div>
                        <div className="text-sm text-muted-foreground">
                          Take courses and earn certificates
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="instructor" id="instructor" />
                    <Label htmlFor="instructor" className="flex items-center cursor-pointer flex-1">
                      <GraduationCap className="mr-2 h-5 w-5" />
                      <div>
                        <div className="font-medium">Teach</div>
                        <div className="text-sm text-muted-foreground">
                          Create and sell courses
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }
  ```

- [ ] Create protected route wrapper
  ```typescript
  // components/ProtectedRoute.tsx
  'use client';

  import { useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { useAuthStore } from '@/lib/stores/auth-store';

  export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    return <>{children}</>;
  }
  ```

#### Deliverables for Path 1:
- [ ] **Auth flow documentation** with screenshots
- [ ] **Error handling examples**
- [ ] **OAuth button implementation** (Google, GitHub)

---

### Week 5-6: Video Player & Progress Tracking UI

**Priority: CRITICAL - Core learning experience**

#### Tasks:
- [ ] Create advanced video player component
  ```typescript
  // components/VideoPlayer.tsx
  'use client';

  import { useEffect, useRef, useState } from 'react';
  import videojs from 'video.js';
  import 'video.js/dist/video-js.css';
  import { useAuthStore } from '@/lib/stores/auth-store';
  import { apiClient } from '@/lib/api-client';

  interface VideoPlayerProps {
    lessonId: string;
    onProgressUpdate?: (progress: number) => void;
    onComplete?: () => void;
  }

  export function VideoPlayer({ lessonId, onProgressUpdate, onComplete }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<any>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [lastPosition, setLastPosition] = useState(0);

    // Fetch video URL from API
    useEffect(() => {
      const fetchVideo = async () => {
        try {
          const response = await apiClient.get(`/videos/${lessonId}/stream`);
          setVideoUrl(response.data.url);

          // Fetch last watched position
          const progressResponse = await apiClient.get(`/progress/${lessonId}`);
          if (progressResponse.data.progress) {
            setLastPosition(progressResponse.data.progress.lastPosition);
          }
        } catch (error) {
          console.error('Failed to fetch video:', error);
        }
      };

      fetchVideo();
    }, [lessonId]);

    // Initialize Video.js player
    useEffect(() => {
      if (!videoRef.current || !videoUrl) return;

      const player = videojs(videoRef.current, {
        controls: true,
        responsive: true,
        fluid: true,
        playbackRates: [0.5, 1, 1.5, 2],
        preload: 'auto',
        html5: {
          vhs: {
            overrideNative: true,
          },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false,
        },
      });

      player.src({
        src: videoUrl,
        type: 'application/x-mpegURL', // HLS
      });

      // Resume from last position
      if (lastPosition > 0) {
        player.currentTime(lastPosition);
      }

      playerRef.current = player;

      // Auto-save progress every 30 seconds
      const saveInterval = setInterval(() => {
        const currentTime = player.currentTime();
        const duration = player.duration();
        const completed = (currentTime / duration) >= 0.9;

        apiClient.post('/progress/save', {
          lessonId,
          timeWatched: Math.floor(currentTime),
          lastPosition: Math.floor(currentTime),
          completed,
        });

        onProgressUpdate?.(currentTime / duration);

        if (completed) {
          onComplete?.();
        }
      }, 30000);

      // Save on video end
      player.on('ended', () => {
        apiClient.post('/progress/save', {
          lessonId,
          timeWatched: Math.floor(player.duration()),
          lastPosition: Math.floor(player.duration()),
          completed: true,
        });

        onComplete?.();
      });

      return () => {
        clearInterval(saveInterval);
        if (playerRef.current) {
          playerRef.current.dispose();
        }
      };
    }, [videoUrl, lastPosition]);

    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
        />
      </div>
    );
  }
  ```

- [ ] Create lesson player page with sidebar
  ```typescript
  // app/courses/[courseId]/lessons/[lessonId]/page.tsx
  'use client';

  import { useQuery } from '@tanstack/react-query';
  import { VideoPlayer } from '@/components/VideoPlayer';
  import { Button } from '@/components/ui/button';
  import { Card } from '@/components/ui/card';
  import { Progress } from '@/components/ui/progress';
  import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
  import Link from 'next/link';

  export default function LessonPage({
    params
  }: {
    params: { courseId: string; lessonId: string }
  }) {
    const { data: course } = useQuery({
      queryKey: ['course', params.courseId],
      queryFn: async () => {
        const response = await apiClient.get(`/courses/${params.courseId}`);
        return response.data.course;
      },
    });

    const { data: progress } = useQuery({
      queryKey: ['progress', params.courseId],
      queryFn: async () => {
        // Fetch all progress for course
        const response = await apiClient.get(`/progress/course/${params.courseId}`);
        return response.data.progress;
      },
    });

    const currentLessonIndex = course?.lessons.findIndex(
      (l: any) => l.id === params.lessonId
    );

    const currentLesson = course?.lessons[currentLessonIndex];
    const nextLesson = course?.lessons[currentLessonIndex + 1];
    const prevLesson = course?.lessons[currentLessonIndex - 1];

    const completedLessons = progress?.filter((p: any) => p.completed).length || 0;
    const totalLessons = course?.lessons.length || 0;
    const progressPercentage = (completedLessons / totalLessons) * 100;

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <Link
                href={`/courses/${params.courseId}`}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to course
              </Link>

              <div>
                <h1 className="text-3xl font-bold mb-2">{currentLesson?.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Lesson {currentLessonIndex + 1} of {totalLessons}</span>
                  <span>•</span>
                  <span>{Math.floor(currentLesson?.duration / 60)} min</span>
                </div>
              </div>

              <VideoPlayer
                lessonId={params.lessonId}
                onComplete={() => {
                  // Show completion animation
                  toast({
                    title: 'Lesson completed! 🎉',
                    description: 'You earned 100 XP!',
                  });
                }}
              />

              {/* Lesson content */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">About this lesson</h2>
                <div
                  className="prose prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentLesson?.content }}
                />
              </Card>

              {/* Navigation */}
              <div className="flex justify-between">
                {prevLesson ? (
                  <Button asChild variant="outline">
                    <Link href={`/courses/${params.courseId}/lessons/${prevLesson.id}`}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous lesson
                    </Link>
                  </Button>
                ) : (
                  <div />
                )}

                {nextLesson ? (
                  <Button asChild>
                    <Link href={`/courses/${params.courseId}/lessons/${nextLesson.id}`}>
                      Next lesson
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button>
                    Complete course
                  </Button>
                )}
              </div>
            </div>

            {/* Sidebar - Course outline */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Course Progress</span>
                      <span className="text-muted-foreground">
                        {completedLessons}/{totalLessons}
                      </span>
                    </div>
                    <Progress value={progressPercentage} />
                  </div>

                  <h3 className="font-semibold">Course Content</h3>
                  <div className="space-y-2">
                    {course?.lessons.map((lesson: any, index: number) => {
                      const isCompleted = progress?.find(
                        (p: any) => p.lessonId === lesson.id && p.completed
                      );
                      const isCurrent = lesson.id === params.lessonId;

                      return (
                        <Link
                          key={lesson.id}
                          href={`/courses/${params.courseId}/lessons/${lesson.id}`}
                          className={`
                            block p-3 rounded-lg transition-colors
                            ${isCurrent ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                          `}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {index + 1}. {lesson.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {Math.floor(lesson.duration / 60)} min
                              </div>
                            </div>
                            {isCompleted && (
                              <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }
  ```

**(Continue with more frontend components...)**

---

## Phase 2: Student & Instructor Dashboards (Weeks 7-12)

### Week 7-8: Student Dashboard with Gamification

**Priority: HIGH - Solves 10% completion rate**

#### Tasks:
- [ ] Create gamification display components
  - [ ] XP progress bar with level display
  - [ ] Achievement badges grid
  - [ ] Streak calendar
  - [ ] Leaderboard widget

- [ ] Build student dashboard homepage
  - [ ] Continue learning section
  - [ ] Recommended courses
  - [ ] Recent achievements
  - [ ] Learning streak

**(Detailed component code provided when building...)**

---

### Week 9-10: Instructor Dashboard & Course Creator

**Priority: HIGH - Critical for platform success**

#### Tasks:
- [ ] Create course creation wizard
  - [ ] Step 1: Basic info (title, description, price)
  - [ ] Step 2: Curriculum builder (lessons)
  - [ ] Step 3: Content upload (videos, text)
  - [ ] Step 4: Publish settings

- [ ] Build Tiptap rich text editor integration
  - [ ] Toolbar with formatting options
  - [ ] Image upload
  - [ ] YouTube embed
  - [ ] Code blocks

**(Detailed implementation...)**

---

### Week 11-12: Checkout & Enrollment Flow

**Priority: HIGH - Revenue generation**

#### Tasks:
- [ ] Create course landing pages
  - [ ] Hero section with preview video
  - [ ] Curriculum display
  - [ ] Instructor bio
  - [ ] Student reviews
  - [ ] Enroll button with price

- [ ] Build Stripe checkout integration
  - [ ] Payment form with Stripe Elements
  - [ ] Loading states
  - [ ] Success/failure handling
  - [ ] Email confirmation

**(Detailed implementation...)**

---

## Phase 3: PWA & Mobile Optimization (Weeks 13-18)

### Week 13-14: Progressive Web App

**Priority: CRITICAL - Solves 80-90% mobile abandonment**

#### Tasks:
- [ ] Configure PWA manifest
  ```json
  // public/manifest.json
  {
    "name": "CourseFlow - Learn Anything",
    "short_name": "CourseFlow",
    "description": "The best way to learn online",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#3b82f6",
    "icons": [
      {
        "src": "/icons/icon-192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }
  ```

- [ ] Implement service worker for offline support
  ```typescript
  // service-worker.js
  const CACHE_NAME = 'courseflow-v1';
  const urlsToCache = [
    '/',
    '/offline',
    '/static/css/main.css',
    '/static/js/main.js',
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
  });

  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  ```

- [ ] Add offline video download feature
- [ ] Implement push notifications
- [ ] Create install prompt

**(More PWA features...)**

---

## Success Metrics

### Performance Targets
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3.5s
- [ ] Largest Contentful Paint <2.5s
- [ ] Cumulative Layout Shift <0.1
- [ ] 90+ Lighthouse score (all categories)

### Mobile Metrics
- [ ] <10% abandonment rate (vs 80-90% industry)
- [ ] >60% PWA install rate
- [ ] >70% push notification opt-in
- [ ] 4.5+ star app satisfaction

### UX Metrics
- [ ] >30% course completion (vs 10% industry)
- [ ] >50% engagement with gamification
- [ ] <2 clicks to start learning
- [ ] >80% task completion rate

---

## Integration Checkpoints with Path 1

### Daily Sync Points:
- Share component requirements for API endpoints
- Coordinate on data structures and types
- Test API integrations together
- Review UI mockups for data availability

### Weekly Review:
- Demo completed features
- Identify blocking issues
- Plan next week's integration points

---

**Last Updated:** November 19, 2025
