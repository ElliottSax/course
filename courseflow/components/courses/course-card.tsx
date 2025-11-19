import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    price: number
    thumbnailUrl?: string | null
    category?: string | null
    instructor: {
      email: string
    } | null
  }
}

export function CourseCard({ course }: CourseCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(course.price / 100)

  return (
    <Card className="flex flex-col" data-testid="course-card">
      {course.thumbnailUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-xl">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-2">
            <Link
              href={`/courses/${course.id}`}
              className="hover:underline"
            >
              {course.title}
            </Link>
          </CardTitle>
        </div>
        {course.category && (
          <span className="text-xs text-muted-foreground capitalize">
            {course.category}
          </span>
        )}
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          By {course.instructor?.email || 'Unknown'}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-2xl font-bold">{formattedPrice}</span>
        <Button asChild>
          <Link href={`/courses/${course.id}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
