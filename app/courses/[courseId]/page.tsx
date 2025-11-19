import Image from 'next/image'
import { Clock, Users, Star, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LessonList } from '@/components/course/lesson-list'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatPrice, getInitials } from '@/lib/utils'

async function getCourse(courseId: string) {
  // This will fetch from API in production
  return null
}

export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string }
}) {
  const course = await getCourse(params.courseId)

  if (!course) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold">Course Not Found</h1>
          <p className="text-muted-foreground">
            The course you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <Badge className="mb-4 bg-white/20 hover:bg-white/30">
                Web Development
              </Badge>
              <h1 className="mb-4 text-4xl font-bold lg:text-5xl">
                Introduction to React
              </h1>
              <p className="mb-6 text-lg text-white/90">
                Learn React from scratch with hands-on projects and real-world examples
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span>4.8 (1,234 ratings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>5,678 students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>12 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>24 lessons</span>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800"
                    alt="Course preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-4 text-3xl font-bold">
                    {formatPrice(9900)}
                  </div>
                  <Button className="mb-3 w-full" size="lg">
                    Enroll Now
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    30-day money-back guarantee
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="p-6">
                  <h2 className="mb-4 text-2xl font-bold">What you'll learn</h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {[
                      'Build modern React applications',
                      'Understand React hooks and state management',
                      'Create reusable components',
                      'Work with APIs and async data',
                      'Deploy React apps to production',
                      'Best practices and patterns',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="mt-6 p-6">
                  <h2 className="mb-4 text-2xl font-bold">Description</h2>
                  <div className="prose dark:prose-invert">
                    <p>
                      This comprehensive React course will take you from beginner to advanced.
                      You'll learn by building real projects and understanding core concepts.
                    </p>
                    <p>
                      Perfect for developers who want to learn modern React development with
                      hooks, context, and best practices.
                    </p>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="mt-6">
                <LessonList
                  lessons={[]}
                  courseId={params.courseId}
                  isEnrolled={false}
                />
              </TabsContent>

              <TabsContent value="instructor" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Instructor" />
                      <AvatarFallback>{getInitials('Jane Smith')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="mb-1 text-2xl font-bold">Jane Smith</h3>
                      <p className="mb-4 text-muted-foreground">
                        Full-stack Developer & Educator
                      </p>
                      <p className="text-sm">
                        Jane has over 10 years of experience in web development and has taught
                        thousands of students around the world.
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">This course includes:</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    24 lessons
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    12 hours of video
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    5 coding exercises
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
