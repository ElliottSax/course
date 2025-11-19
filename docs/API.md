# API Documentation

Complete REST API reference for the Course Platform.

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.courseplatform.com
```

## Authentication

All authenticated endpoints require a valid session token obtained through NextAuth.js.

### Headers

```http
Content-Type: application/json
Cookie: next-auth.session-token=<token>
```

---

## Table of Contents

- [Authentication](#authentication-endpoints)
- [Courses](#courses)
- [Lessons](#lessons)
- [Enrollments](#enrollments)
- [Quizzes](#quizzes)
- [Progress](#progress)
- [Gamification](#gamification)
- [AI](#ai-endpoints)
- [Payments](#payments)
- [Users](#users)

---

## Authentication Endpoints

### Sign In

NextAuth.js handles authentication. See [NextAuth.js documentation](https://next-auth.js.org/).

```http
POST /api/auth/signin
```

### Sign Out

```http
POST /api/auth/signout
```

### Get Session

```http
GET /api/auth/session
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student",
    "avatar_url": "https://..."
  },
  "expires": "2025-12-31T23:59:59.999Z"
}
```

---

## Courses

### List Courses

Get all published courses.

```http
GET /api/courses
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |
| `search` | string | Search query |
| `category` | string | Filter by category |
| `instructor_id` | string | Filter by instructor |
| `sort` | string | Sort by: `popular`, `newest`, `price_asc`, `price_desc` |

**Response:**
```json
{
  "courses": [
    {
      "id": "course_123",
      "title": "Introduction to Web Development",
      "description": "Learn the fundamentals of web development",
      "thumbnail_url": "https://...",
      "price": 9900,
      "instructor": {
        "id": "user_456",
        "name": "Jane Smith",
        "avatar_url": "https://..."
      },
      "stats": {
        "student_count": 1250,
        "rating": 4.8,
        "review_count": 320,
        "lesson_count": 42,
        "duration": 28800
      },
      "created_at": "2025-01-15T10:00:00.000Z",
      "updated_at": "2025-11-15T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "total_pages": 15
  }
}
```

### Get Course

Get a specific course by ID.

```http
GET /api/courses/:id
```

**Response:**
```json
{
  "id": "course_123",
  "title": "Introduction to Web Development",
  "description": "Learn the fundamentals of web development",
  "thumbnail_url": "https://...",
  "price": 9900,
  "instructor": {
    "id": "user_456",
    "name": "Jane Smith",
    "avatar_url": "https://...",
    "bio": "Professional developer with 10+ years experience"
  },
  "curriculum": [
    {
      "id": "module_1",
      "title": "Getting Started",
      "order": 1,
      "lessons": [
        {
          "id": "lesson_1",
          "title": "Introduction",
          "duration": 600,
          "is_free_preview": true,
          "order": 1
        }
      ]
    }
  ],
  "stats": {
    "student_count": 1250,
    "rating": 4.8,
    "review_count": 320,
    "lesson_count": 42,
    "duration": 28800,
    "completion_rate": 68
  },
  "created_at": "2025-01-15T10:00:00.000Z",
  "updated_at": "2025-11-15T14:30:00.000Z"
}
```

### Create Course

Create a new course (instructor only).

```http
POST /api/courses
```

**Request Body:**
```json
{
  "title": "Advanced React Patterns",
  "description": "Master advanced React patterns and techniques",
  "price": 14900,
  "category": "web-development",
  "thumbnail_url": "https://..."
}
```

**Response:**
```json
{
  "id": "course_789",
  "title": "Advanced React Patterns",
  "description": "Master advanced React patterns and techniques",
  "price": 14900,
  "category": "web-development",
  "thumbnail_url": "https://...",
  "instructor_id": "user_456",
  "is_published": false,
  "created_at": "2025-11-19T10:00:00.000Z",
  "updated_at": "2025-11-19T10:00:00.000Z"
}
```

### Update Course

Update course details (instructor only).

```http
PATCH /api/courses/:id
```

**Request Body:**
```json
{
  "title": "Advanced React Patterns (Updated)",
  "price": 12900,
  "is_published": true
}
```

**Response:**
```json
{
  "id": "course_789",
  "title": "Advanced React Patterns (Updated)",
  "price": 12900,
  "is_published": true,
  "updated_at": "2025-11-19T11:00:00.000Z"
}
```

### Delete Course

Delete a course (instructor only).

```http
DELETE /api/courses/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

---

## Lessons

### List Lessons

Get all lessons for a course.

```http
GET /api/courses/:courseId/lessons
```

**Response:**
```json
{
  "lessons": [
    {
      "id": "lesson_123",
      "course_id": "course_123",
      "title": "Introduction to HTML",
      "content": "<p>HTML is...</p>",
      "video_url": "https://cdn.example.com/videos/lesson_123/master.m3u8",
      "duration": 1200,
      "order": 1,
      "is_free_preview": true,
      "created_at": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Lesson

Get a specific lesson.

```http
GET /api/courses/:courseId/lessons/:id
```

**Response:**
```json
{
  "id": "lesson_123",
  "course_id": "course_123",
  "title": "Introduction to HTML",
  "content": "<p>HTML is...</p>",
  "video_url": "https://cdn.example.com/videos/lesson_123/master.m3u8",
  "duration": 1200,
  "order": 1,
  "is_free_preview": true,
  "quiz": {
    "id": "quiz_123",
    "title": "HTML Basics Quiz",
    "question_count": 5
  },
  "created_at": "2025-01-15T10:00:00.000Z"
}
```

### Create Lesson

Create a new lesson (instructor only).

```http
POST /api/courses/:courseId/lessons
```

**Request Body:**
```json
{
  "title": "CSS Fundamentals",
  "content": "<p>CSS is used for styling...</p>",
  "order": 2,
  "is_free_preview": false
}
```

**Response:**
```json
{
  "id": "lesson_456",
  "course_id": "course_123",
  "title": "CSS Fundamentals",
  "content": "<p>CSS is used for styling...</p>",
  "order": 2,
  "is_free_preview": false,
  "created_at": "2025-11-19T10:00:00.000Z"
}
```

### Upload Video

Upload video for a lesson (instructor only).

```http
POST /api/lessons/:id/video
```

**Request:**
- Content-Type: `multipart/form-data`
- Body: File upload

**Response:**
```json
{
  "video_url": "https://cdn.example.com/videos/lesson_456/master.m3u8",
  "duration": 1800,
  "processing_status": "queued"
}
```

### Update Lesson

Update lesson details (instructor only).

```http
PATCH /api/courses/:courseId/lessons/:id
```

**Request Body:**
```json
{
  "title": "CSS Fundamentals (Updated)",
  "content": "<p>Updated content...</p>"
}
```

**Response:**
```json
{
  "id": "lesson_456",
  "title": "CSS Fundamentals (Updated)",
  "content": "<p>Updated content...</p>",
  "updated_at": "2025-11-19T11:00:00.000Z"
}
```

### Delete Lesson

Delete a lesson (instructor only).

```http
DELETE /api/courses/:courseId/lessons/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Lesson deleted successfully"
}
```

---

## Enrollments

### Get My Enrollments

Get all courses the authenticated user is enrolled in.

```http
GET /api/enrollments
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by: `active`, `completed` |

**Response:**
```json
{
  "enrollments": [
    {
      "id": "enrollment_123",
      "course": {
        "id": "course_123",
        "title": "Introduction to Web Development",
        "thumbnail_url": "https://..."
      },
      "progress": 45,
      "enrolled_at": "2025-10-01T10:00:00.000Z",
      "last_accessed_at": "2025-11-18T14:30:00.000Z",
      "completed_at": null
    }
  ]
}
```

### Enroll in Course

Enroll in a course (requires payment or free course).

```http
POST /api/courses/:courseId/enroll
```

**Response:**
```json
{
  "enrollment": {
    "id": "enrollment_456",
    "course_id": "course_123",
    "student_id": "user_123",
    "progress": 0,
    "enrolled_at": "2025-11-19T10:00:00.000Z"
  }
}
```

**Note:** For paid courses, use the Stripe checkout endpoint instead.

---

## Quizzes

### Get Quiz

Get quiz for a lesson.

```http
GET /api/lessons/:lessonId/quiz
```

**Response:**
```json
{
  "id": "quiz_123",
  "lesson_id": "lesson_123",
  "title": "HTML Basics Quiz",
  "passing_score": 70,
  "time_limit": 1800,
  "questions": [
    {
      "id": "q_1",
      "type": "multiple_choice",
      "question": "What does HTML stand for?",
      "options": [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Home Tool Markup Language",
        "Hyperlinks and Text Markup Language"
      ],
      "points": 1
    }
  ]
}
```

### Submit Quiz

Submit quiz answers.

```http
POST /api/quizzes/:quizId/submit
```

**Request Body:**
```json
{
  "answers": {
    "q_1": "Hyper Text Markup Language",
    "q_2": "CSS",
    "q_3": "true"
  }
}
```

**Response:**
```json
{
  "attempt": {
    "id": "attempt_123",
    "quiz_id": "quiz_123",
    "student_id": "user_123",
    "score": 85,
    "passed": true,
    "answers": {
      "q_1": {
        "answer": "Hyper Text Markup Language",
        "correct": true,
        "points_earned": 1
      },
      "q_2": {
        "answer": "CSS",
        "correct": true,
        "points_earned": 1,
        "explanation": "CSS stands for Cascading Style Sheets"
      }
    },
    "submitted_at": "2025-11-19T10:00:00.000Z"
  },
  "xp_earned": 100
}
```

### Generate Quiz (AI)

Generate quiz from lesson content (instructor only).

```http
POST /api/lessons/:lessonId/generate-quiz
```

**Request Body:**
```json
{
  "difficulty": "medium",
  "question_count": 5
}
```

**Response:**
```json
{
  "quiz": {
    "id": "quiz_456",
    "lesson_id": "lesson_123",
    "title": "Auto-Generated Quiz",
    "questions": [
      {
        "id": "q_1",
        "type": "multiple_choice",
        "question": "What is the primary purpose of HTML?",
        "options": ["Styling", "Structure", "Scripting", "Database"],
        "correct_answer": "Structure",
        "explanation": "HTML provides the structure of web pages"
      }
    ]
  }
}
```

---

## Progress

### Get Lesson Progress

Get progress for a specific lesson.

```http
GET /api/lessons/:lessonId/progress
```

**Response:**
```json
{
  "lesson_id": "lesson_123",
  "student_id": "user_123",
  "completed": false,
  "watch_time": 720,
  "last_position": 720,
  "completed_at": null,
  "updated_at": "2025-11-19T10:00:00.000Z"
}
```

### Update Lesson Progress

Update progress for a lesson.

```http
POST /api/lessons/:lessonId/progress
```

**Request Body:**
```json
{
  "watch_time": 900,
  "last_position": 900,
  "completed": false
}
```

**Response:**
```json
{
  "lesson_id": "lesson_123",
  "watch_time": 900,
  "last_position": 900,
  "completed": false,
  "xp_earned": 0,
  "updated_at": "2025-11-19T10:05:00.000Z"
}
```

### Complete Lesson

Mark lesson as completed.

```http
POST /api/lessons/:lessonId/complete
```

**Response:**
```json
{
  "lesson_id": "lesson_123",
  "completed": true,
  "completed_at": "2025-11-19T10:30:00.000Z",
  "xp_earned": 50,
  "badges_unlocked": [
    {
      "id": "badge_first_lesson",
      "name": "Getting Started",
      "description": "Complete your first lesson",
      "icon": "🎯"
    }
  ]
}
```

---

## Gamification

### Get User Stats

Get gamification stats for the authenticated user.

```http
GET /api/gamification/stats
```

**Response:**
```json
{
  "user_id": "user_123",
  "total_xp": 2500,
  "level": 12,
  "xp_to_next_level": 300,
  "badges": [
    {
      "id": "badge_first_lesson",
      "name": "Getting Started",
      "description": "Complete your first lesson",
      "icon": "🎯",
      "unlocked_at": "2025-10-15T10:00:00.000Z"
    }
  ],
  "current_streak": 7,
  "longest_streak": 14,
  "stats": {
    "courses_completed": 3,
    "lessons_completed": 45,
    "quizzes_passed": 38,
    "perfect_scores": 12
  }
}
```

### Get Leaderboard

Get leaderboard rankings.

```http
GET /api/gamification/leaderboard
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `scope` | string | `global`, `course`, `friends` |
| `course_id` | string | Course ID (required for course scope) |
| `timeframe` | string | `week`, `month`, `all_time` |

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": "user_456",
        "name": "Alice Johnson",
        "avatar_url": "https://..."
      },
      "total_xp": 15000,
      "level": 35,
      "badges_count": 28
    },
    {
      "rank": 2,
      "user": {
        "id": "user_123",
        "name": "John Doe",
        "avatar_url": "https://..."
      },
      "total_xp": 12500,
      "level": 30,
      "badges_count": 24
    }
  ],
  "current_user_rank": 2,
  "timeframe": "month"
}
```

---

## AI Endpoints

### AI Chat

Chat with AI teaching assistant.

```http
POST /api/ai/chat
```

**Request Body:**
```json
{
  "question": "Can you explain how CSS flexbox works?",
  "course_id": "course_123",
  "history": [
    ["What is CSS?", "CSS stands for Cascading Style Sheets..."]
  ]
}
```

**Response:**
```json
{
  "answer": "Flexbox is a CSS layout model that allows you to...",
  "sources": [
    {
      "lesson_id": "lesson_456",
      "content": "CSS Flexbox is a powerful layout system..."
    }
  ]
}
```

### Generate Learning Path

Generate personalized learning path (AI).

```http
POST /api/ai/learning-path
```

**Request Body:**
```json
{
  "course_id": "course_123"
}
```

**Response:**
```json
{
  "path": {
    "weeks": [
      {
        "week": 1,
        "focus": "HTML Fundamentals",
        "lessons": ["lesson_1", "lesson_2", "lesson_3"],
        "practice_exercises": 5,
        "estimated_hours": 8
      },
      {
        "week": 2,
        "focus": "CSS Basics",
        "lessons": ["lesson_4", "lesson_5"],
        "practice_exercises": 3,
        "estimated_hours": 6
      }
    ],
    "recommendations": [
      "Review HTML basics before starting CSS",
      "Complete practice exercises daily",
      "Join study group discussions"
    ]
  }
}
```

---

## Payments

### Create Checkout Session

Create Stripe checkout session for course enrollment.

```http
POST /api/checkout
```

**Request Body:**
```json
{
  "course_id": "course_123"
}
```

**Response:**
```json
{
  "session_id": "cs_test_123456789",
  "url": "https://checkout.stripe.com/pay/cs_test_123456789"
}
```

### Webhook Handler

Handle Stripe webhooks (internal use).

```http
POST /api/webhooks/stripe
```

**Headers:**
```
Stripe-Signature: signature_string
```

---

## Users

### Get Current User

Get authenticated user profile.

```http
GET /api/users/me
```

**Response:**
```json
{
  "id": "user_123",
  "email": "student@example.com",
  "name": "John Doe",
  "role": "student",
  "avatar_url": "https://...",
  "bio": "Passionate learner",
  "created_at": "2025-08-01T10:00:00.000Z",
  "stats": {
    "courses_enrolled": 5,
    "courses_completed": 2,
    "total_xp": 2500,
    "level": 12
  }
}
```

### Update Profile

Update user profile.

```http
PATCH /api/users/me
```

**Request Body:**
```json
{
  "name": "John Smith",
  "bio": "Full-stack developer and lifelong learner"
}
```

**Response:**
```json
{
  "id": "user_123",
  "name": "John Smith",
  "bio": "Full-stack developer and lifelong learner",
  "updated_at": "2025-11-19T10:00:00.000Z"
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour
- **AI endpoints**: 20 requests per hour

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1637347200
```

---

## Pagination

List endpoints support pagination with the following parameters:

| Parameter | Type | Default | Max |
|-----------|------|---------|-----|
| `page` | number | 1 | - |
| `limit` | number | 10 | 100 |

Pagination metadata is included in responses:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "total_pages": 15
  }
}
```

---

## Webhooks

The platform sends webhooks for important events:

### Events

- `course.published` - Course published
- `enrollment.created` - Student enrolled
- `lesson.completed` - Lesson completed
- `quiz.passed` - Quiz passed
- `certificate.issued` - Certificate issued
- `payment.succeeded` - Payment successful

### Webhook Payload

```json
{
  "event": "lesson.completed",
  "timestamp": "2025-11-19T10:00:00.000Z",
  "data": {
    "lesson_id": "lesson_123",
    "student_id": "user_123",
    "course_id": "course_123"
  }
}
```

---

*Last Updated: November 19, 2025*
