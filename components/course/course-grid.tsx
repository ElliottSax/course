'use client'

import { CourseCard } from './course-card'

interface CourseGridProps {
  courses: any[]
  showEnrollButton?: boolean
}

export function CourseGrid({ courses, showEnrollButton = true }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <h3 className="mb-2 text-2xl font-semibold">No courses found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or check back later for new courses.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          showEnrollButton={showEnrollButton}
        />
      ))}
    </div>
  )
}
