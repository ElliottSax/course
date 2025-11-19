'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    thumbnail_url: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      })

      if (!response.ok) {
        throw new Error('Failed to create course')
      }

      const course = await response.json()
      toast.success('Course created successfully!')
      router.push(`/instructor/courses/${course.id}/edit`)
    } catch (error) {
      toast.error('Failed to create course')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground">
          Fill in the basic information for your course
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basics">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basics">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={courseData.title}
                    onChange={(e) =>
                      setCourseData({ ...courseData, title: e.target.value })
                    }
                    placeholder="e.g., Introduction to React"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    value={courseData.description}
                    onChange={(e) =>
                      setCourseData({ ...courseData, description: e.target.value })
                    }
                    placeholder="Describe what students will learn..."
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={courseData.category}
                    onChange={(e) =>
                      setCourseData({ ...courseData, category: e.target.value })
                    }
                    placeholder="e.g., Web Development"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    type="url"
                    value={courseData.thumbnail_url}
                    onChange={(e) =>
                      setCourseData({ ...courseData, thumbnail_url: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (in cents) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={courseData.price}
                    onChange={(e) =>
                      setCourseData({
                        ...courseData,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="9900 = $99.00, 0 = Free"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter 0 for a free course, or price in cents (e.g., 9900 for $99.00)
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h4 className="mb-2 font-semibold">Pricing Preview</h4>
                  <p className="text-2xl font-bold">
                    {courseData.price === 0
                      ? 'Free'
                      : `$${(courseData.price / 100).toFixed(2)}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  )
}
