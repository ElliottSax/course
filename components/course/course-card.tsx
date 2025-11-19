'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Clock, Users, Star } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    thumbnail_url: string
    price: number
    category: string
    instructor: {
      name: string
      avatar_url?: string
    }
    _count?: {
      enrollments: number
      lessons: number
    }
    duration?: number
    rating?: number
  }
  showEnrollButton?: boolean
}

export function CourseCard({ course, showEnrollButton = true }: CourseCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link href={`/courses/${course.id}`}>
        <Card className="group relative h-full overflow-hidden border-none bg-white dark:bg-gray-800 transition-all">
          {/* Thumbnail */}
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Category Badge */}
            <div className="absolute left-4 top-4">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                {course.category}
              </Badge>
            </div>

            {/* Price Badge */}
            <div className="absolute right-4 top-4">
              <Badge
                variant={course.price === 0 ? 'default' : 'secondary'}
                className={
                  course.price === 0
                    ? 'bg-green-500 text-white'
                    : 'bg-white/90 backdrop-blur-sm'
                }
              >
                {formatPrice(course.price)}
              </Badge>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Title */}
            <h3 className="mb-2 line-clamp-2 text-xl font-bold group-hover:text-primary transition-colors">
              {course.title}
            </h3>

            {/* Description */}
            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
              {course.description}
            </p>

            {/* Instructor */}
            <div className="mb-4 flex items-center gap-2">
              {course.instructor.avatar_url && (
                <Image
                  src={course.instructor.avatar_url}
                  alt={course.instructor.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className="text-sm text-muted-foreground">
                {course.instructor.name}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {course._count?.lessons && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course._count.lessons} lessons</span>
                </div>
              )}
              {course._count?.enrollments !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course._count.enrollments} students</span>
                </div>
              )}
              {course.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </CardContent>

          {showEnrollButton && (
            <CardFooter className="p-6 pt-0">
              <Button className="w-full" onClick={(e) => e.preventDefault()}>
                {course.price === 0 ? 'Enroll for Free' : 'Enroll Now'}
              </Button>
            </CardFooter>
          )}
        </Card>
      </Link>
    </motion.div>
  )
}
