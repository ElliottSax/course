'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface LessonFormProps {
  courseId: string
  lesson?: {
    id: string
    title: string
    content: string | null
    videoUrl: string | null
    duration: number | null
    order: number
  }
  defaultOrder?: number
}

export function LessonForm({ courseId, lesson, defaultOrder = 0 }: LessonFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: lesson?.title || '',
    content: lesson?.content || '',
    videoUrl: lesson?.videoUrl || '',
    duration: lesson?.duration ? lesson.duration.toString() : '',
    order: lesson?.order.toString() || defaultOrder.toString(),
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const url = lesson
        ? `/api/courses/${courseId}/lessons/${lesson.id}`
        : `/api/courses/${courseId}/lessons`
      const method = lesson ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content || null,
          videoUrl: formData.videoUrl || null,
          duration: formData.duration ? parseInt(formData.duration) : null,
          order: parseInt(formData.order),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save lesson')
      }

      router.push(`/instructor/courses/${courseId}/lessons`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Lesson Title *</Label>
        <Input
          id="title"
          type="text"
          placeholder="e.g., Introduction to JavaScript Variables"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          minLength={3}
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Lesson Content</Label>
        <Textarea
          id="content"
          placeholder="Describe what students will learn in this lesson..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          This will be displayed to students along with the video
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoUrl">Video URL</Label>
        <Input
          id="videoUrl"
          type="url"
          placeholder="https://example.com/video.mp4"
          value={formData.videoUrl}
          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          For now, provide a direct URL to your video. Video upload functionality coming
          soon!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            placeholder="e.g., 600 for 10 minutes"
            min="0"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Video duration in seconds (e.g., 600 = 10 minutes)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            min="0"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">
            Position in the course (0 = first lesson)
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            <>{lesson ? 'Update Lesson' : 'Create Lesson'}</>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
