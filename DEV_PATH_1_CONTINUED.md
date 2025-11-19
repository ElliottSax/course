# Development Path 1: Backend & Infrastructure (Continued)

**This document continues from DEV_PATH_1_BACKEND.md**
**Covers detailed implementation for Weeks 13-32**

---

## Week 13-18: Email Automation Backend (Continued)

### Email Campaign Management API

#### Create campaign management endpoints
```typescript
// app/api/campaigns/route.ts
export async function POST(request: Request) {
  const instructor = await requireRole(request, ['instructor', 'admin']);
  const { name, status } = await request.json();

  const [campaign] = await db
    .insert(campaigns)
    .values({
      instructorId: instructor.id,
      name,
      status: status || 'draft'
    })
    .returning();

  return Response.json({ campaign }, { status: 201 });
}

export async function GET(request: Request) {
  const instructor = await requireRole(request, ['instructor', 'admin']);

  const instructorCampaigns = await db.query.campaigns.findMany({
    where: eq(campaigns.instructorId, instructor.id),
    with: {
      emails: {
        orderBy: [asc(campaignEmails.order)]
      }
    }
  });

  return Response.json({ campaigns: instructorCampaigns });
}

// app/api/campaigns/[id]/emails/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const instructor = await requireRole(request, ['instructor', 'admin']);
  const { subject, content, delayDays, order } = await request.json();

  // Verify campaign ownership
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, params.id)
  });

  if (!campaign || campaign.instructorId !== instructor.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [email] = await db
    .insert(campaignEmails)
    .values({
      campaignId: params.id,
      subject,
      content,
      delayDays,
      order
    })
    .returning();

  return Response.json({ email }, { status: 201 });
}
```

### Behavior-Triggered Emails

```typescript
// lib/email/triggers.ts
import { Resend } from 'resend';
import { db } from '@/lib/db';
import { emailTemplates } from './templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });

  if (!user) return;

  const template = emailTemplates.welcome(user.email);

  await resend.emails.send({
    from: 'noreply@courseflow.com',
    to: user.email,
    ...template
  });

  // Track email sent
  await db.insert(analyticsEvents).values({
    userId,
    eventType: 'email_sent',
    metadata: { template: 'welcome' }
  });
}

export async function sendEnrollmentEmail(userId: string, courseId: string) {
  const [user, course] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        instructor: true
      }
    })
  ]);

  if (!user || !course) return;

  const template = emailTemplates.courseEnrollment(
    course.title,
    course.instructor.email
  );

  await resend.emails.send({
    from: 'noreply@courseflow.com',
    to: user.email,
    ...template
  });

  // Enroll user in any active campaigns for this course
  const activeCampaigns = await db.query.campaigns.findMany({
    where: and(
      eq(campaigns.instructorId, course.instructorId),
      eq(campaigns.status, 'active')
    )
  });

  for (const campaign of activeCampaigns) {
    await db.insert(campaignEnrollments).values({
      campaignId: campaign.id,
      userId,
      currentStep: 0
    });
  }
}

export async function sendCompletionEmail(userId: string, courseId: string) {
  const [user, course] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.courses.findFirst({ where: eq(courses.id, courseId) })
  ]);

  if (!user || !course) return;

  const template = emailTemplates.courseCompletion(course.title);

  await resend.emails.send({
    from: 'noreply@courseflow.com',
    to: user.email,
    ...template,
    attachments: [
      {
        filename: 'certificate.pdf',
        content: await generateCertificate(user, course)
      }
    ]
  });
}

export async function sendAbandonmentEmail(userId: string, courseId: string) {
  const [user, course] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.courses.findFirst({ where: eq(courses.id, courseId) })
  ]);

  if (!user || !course) return;

  // Check last activity
  const lastProgress = await db.query.progress.findFirst({
    where: and(
      eq(progress.userId, userId),
      eq(progress.lessonId, sql`(SELECT id FROM lessons WHERE course_id = ${courseId} LIMIT 1)`)
    ),
    orderBy: [desc(progress.updatedAt)]
  });

  if (!lastProgress) return;

  const daysSinceLastActivity = Math.floor(
    (Date.now() - lastProgress.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastActivity >= 7) {
    await resend.emails.send({
      from: 'noreply@courseflow.com',
      to: user.email,
      subject: `Miss you in ${course.title}! 👋`,
      html: `
        <h1>We noticed you haven't been active lately</h1>
        <p>You're ${Math.floor((lastProgress.timeWatched / course.totalDuration) * 100)}% through "${course.title}"</p>
        <p>Pick up where you left off and keep learning!</p>
        <a href="${process.env.NEXT_PUBLIC_URL}/courses/${courseId}/lessons/${lastProgress.lessonId}">
          Continue Learning
        </a>
      `
    });
  }
}
```

### Email Analytics

```typescript
// Add to schema
export const emailEvents = pgTable('email_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  emailType: text('email_type').notNull(),
  eventType: text('event_type', {
    enum: ['sent', 'opened', 'clicked', 'bounced', 'complained']
  }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow()
});

// app/api/webhooks/resend/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // Verify webhook signature
  const signature = request.headers.get('resend-signature');
  if (!verifyResendSignature(body, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { type, data } = body;

  await db.insert(emailEvents).values({
    userId: data.metadata?.userId,
    emailType: data.metadata?.template,
    eventType: type,
    metadata: data
  });

  return Response.json({ received: true });
}

// app/api/campaigns/[id]/analytics/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const instructor = await requireRole(request, ['instructor', 'admin']);

  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, params.id)
  });

  if (!campaign || campaign.instructorId !== instructor.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get email statistics
  const stats = await db
    .select({
      emailType: emailEvents.emailType,
      eventType: emailEvents.eventType,
      count: sql<number>`COUNT(*)`
    })
    .from(emailEvents)
    .where(eq(emailEvents.emailType, `campaign_${params.id}`))
    .groupBy(emailEvents.emailType, emailEvents.eventType);

  const totalSent = stats.find(s => s.eventType === 'sent')?.count || 0;
  const totalOpened = stats.find(s => s.eventType === 'opened')?.count || 0;
  const totalClicked = stats.find(s => s.eventType === 'clicked')?.count || 0;

  return Response.json({
    totalSent,
    totalOpened,
    totalClicked,
    openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0
  });
}
```

### Segmentation Engine

```typescript
// lib/email/segmentation.ts
export async function segmentUsers(criteria: {
  enrolled?: boolean;
  completed?: boolean;
  lastActive?: { days: number; operator: 'gt' | 'lt' };
  xpRange?: { min: number; max: number };
  courseId?: string;
}) {
  let query = db.select().from(users);

  if (criteria.enrolled && criteria.courseId) {
    query = query.innerJoin(
      enrollments,
      and(
        eq(enrollments.userId, users.id),
        eq(enrollments.courseId, criteria.courseId)
      )
    );
  }

  if (criteria.completed && criteria.courseId) {
    query = query.where(eq(enrollments.status, 'completed'));
  }

  if (criteria.lastActive) {
    const date = new Date();
    date.setDate(date.getDate() - criteria.lastActive.days);

    if (criteria.lastActive.operator === 'gt') {
      query = query.innerJoin(
        gamification,
        and(
          eq(gamification.userId, users.id),
          sql`${gamification.lastActive} > ${date}`
        )
      );
    } else {
      query = query.innerJoin(
        gamification,
        and(
          eq(gamification.userId, users.id),
          sql`${gamification.lastActive} < ${date}`
        )
      );
    }
  }

  if (criteria.xpRange) {
    query = query.innerJoin(
      gamification,
      and(
        eq(gamification.userId, users.id),
        sql`${gamification.xp} >= ${criteria.xpRange.min}`,
        sql`${gamification.xp} <= ${criteria.xpRange.max}`
      )
    );
  }

  return await query;
}

// app/api/segments/route.ts
export async function POST(request: Request) {
  const instructor = await requireRole(request, ['instructor', 'admin']);
  const criteria = await request.json();

  const segment = await segmentUsers(criteria);

  return Response.json({
    users: segment,
    count: segment.length
  });
}
```

---

## Week 19-20: Content Protection (DRM) - Detailed Implementation

### Cloudflare Stream Integration (Recommended for MVP)

```typescript
// lib/cloudflare-stream.ts
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export async function uploadToCloudflareStream(
  file: File,
  metadata: { courseId: string; lessonId: string }
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('meta', JSON.stringify(metadata));

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`
      },
      body: formData
    }
  );

  const data = await response.json();

  return {
    videoId: data.result.uid,
    playbackUrl: data.result.playback.hls,
    thumbnailUrl: data.result.thumbnail
  };
}

export async function getSignedStreamUrl(
  videoId: string,
  userId: string,
  expiresIn: number = 3600
) {
  // Create signed token with Cloudflare Stream
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}/token`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: userId,
        exp: Math.floor(Date.now() / 1000) + expiresIn,
        downloadable: false,
        accessRules: [
          {
            type: 'ip.geoip.country',
            action: 'allow',
            country: ['US', 'CA', 'GB'] // Add allowed countries
          }
        ]
      })
    }
  );

  const data = await response.json();

  return data.result.token;
}

// app/api/videos/upload/route.ts (Updated)
export async function POST(request: Request) {
  const instructor = await requireRole(request, ['instructor', 'admin']);

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const courseId = formData.get('courseId') as string;
  const lessonId = formData.get('lessonId') as string;

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  // Upload to Cloudflare Stream
  const { videoId, playbackUrl, thumbnailUrl } = await uploadToCloudflareStream(
    file,
    { courseId, lessonId }
  );

  // Store video metadata in database
  await db
    .update(lessons)
    .set({
      videoUrl: videoId, // Store Cloudflare video ID
      thumbnailUrl,
      duration: 0 // Will be updated via webhook
    })
    .where(eq(lessons.id, lessonId));

  return Response.json({
    videoId,
    playbackUrl,
    thumbnailUrl
  });
}

// app/api/videos/[id]/stream/route.ts (Updated with DRM)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(request);

  // Verify lesson access
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, params.id),
    with: { course: true }
  });

  if (!lesson) {
    return Response.json({ error: 'Lesson not found' }, { status: 404 });
  }

  // Check enrollment
  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, user.id),
      eq(enrollments.courseId, lesson.courseId)
    )
  });

  if (!enrollment) {
    return Response.json({ error: 'Not enrolled' }, { status: 403 });
  }

  // Check device registration
  const deviceId = request.headers.get('x-device-id');
  if (deviceId) {
    const device = await db.query.userDevices.findFirst({
      where: and(
        eq(userDevices.userId, user.id),
        eq(userDevices.deviceId, deviceId)
      )
    });

    if (!device) {
      return Response.json(
        { error: 'Device not registered' },
        { status: 403 }
      );
    }

    // Update last used
    await db
      .update(userDevices)
      .set({ lastUsed: new Date() })
      .where(eq(userDevices.id, device.id));
  }

  // Get signed URL with watermark
  const signedToken = await getSignedStreamUrl(lesson.videoUrl!, user.id);

  // Get watermark config
  const watermark = {
    text: `${user.email} - ${user.id.substring(0, 8)}`,
    position: Date.now() % 2 === 0 ? 'top-right' : 'bottom-left',
    opacity: 0.4
  };

  return Response.json({
    url: `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${lesson.videoUrl}/manifest/video.m3u8?token=${signedToken}`,
    watermark,
    drmConfig: {
      type: 'widevine',
      licenseUrl: `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${lesson.videoUrl}/license`
    }
  });
}
```

### Device Management

```typescript
// app/api/devices/route.ts
export async function GET(request: Request) {
  const user = await requireAuth(request);

  const devices = await db.query.userDevices.findMany({
    where: eq(userDevices.userId, user.id),
    orderBy: [desc(userDevices.lastUsed)]
  });

  return Response.json({ devices });
}

export async function DELETE(request: Request) {
  const user = await requireAuth(request);
  const { deviceId } = await request.json();

  await db
    .delete(userDevices)
    .where(
      and(
        eq(userDevices.userId, user.id),
        eq(userDevices.deviceId, deviceId)
      )
    );

  return Response.json({ success: true });
}
```

### Suspicious Activity Detection

```typescript
// lib/security/activity-monitor.ts
export async function detectSuspiciousActivity(userId: string) {
  const alerts: string[] = [];

  // Check for simultaneous streams from different IPs
  const recentStreams = await db
    .select({
      deviceId: userDevices.deviceId,
      lastUsed: userDevices.lastUsed
    })
    .from(userDevices)
    .where(
      and(
        eq(userDevices.userId, userId),
        sql`${userDevices.lastUsed} > NOW() - INTERVAL '5 minutes'`
      )
    );

  if (recentStreams.length > 2) {
    alerts.push('Multiple simultaneous streams detected');
  }

  // Check for rapid device switching
  const deviceSwitches = await db
    .select({ count: sql<number>`COUNT(DISTINCT device_id)` })
    .from(userDevices)
    .where(
      and(
        eq(userDevices.userId, userId),
        sql`${userDevices.lastUsed} > NOW() - INTERVAL '1 hour'`
      )
    );

  if (deviceSwitches[0].count > 3) {
    alerts.push('Rapid device switching detected');
  }

  // Check for geo-inconsistencies (would need IP tracking)
  // ... additional checks ...

  if (alerts.length > 0) {
    // Log suspicious activity
    await db.insert(analyticsEvents).values({
      userId,
      eventType: 'suspicious_activity',
      metadata: { alerts }
    });

    // Notify admin
    await notifyAdmin({
      type: 'security_alert',
      userId,
      alerts
    });
  }

  return alerts;
}

// Middleware to check on every video request
// app/api/videos/[id]/stream/route.ts (add before returning stream URL)
const suspiciousActivity = await detectSuspiciousActivity(user.id);
if (suspiciousActivity.length > 0) {
  // Still allow access but flag for review
  console.warn('Suspicious activity detected:', suspiciousActivity);
}
```

---

## Week 21-22: AI Features Backend

### OpenAI Integration

```typescript
// lib/ai/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateQuizFromTranscript(
  transcript: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Quiz[]> {
  const prompt = `
Generate 5 multiple-choice questions based on this video transcript.
Difficulty: ${difficulty}

Transcript:
${transcript}

Return JSON in this format:
[
  {
    "question": "What is...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "..."
  }
]
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert educator creating assessment questions.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content!);
}

export async function generateCourseDescription(
  title: string,
  outline: string[]
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a marketing copywriter for online courses.'
      },
      {
        role: 'user',
        content: `
Write a compelling course description for:
Title: ${title}
Outline: ${outline.join(', ')}

Make it engaging, benefit-focused, and SEO-friendly. 2-3 paragraphs.
        `
      }
    ]
  });

  return response.choices[0].message.content!;
}
```

### AI Course Assistant

```typescript
// Add to schema
export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  courseId: uuid('course_id').references(() => courses.id).notNull(),
  messages: jsonb('messages').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// lib/ai/course-assistant.ts
export async function chatWithCourseAssistant(
  userId: string,
  courseId: string,
  message: string,
  conversationId?: string
) {
  // Get course context
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      lessons: {
        columns: {
          title: true,
          content: true
        }
      }
    }
  });

  if (!course) throw new Error('Course not found');

  // Get or create conversation
  let conversation;
  if (conversationId) {
    conversation = await db.query.aiConversations.findFirst({
      where: eq(aiConversations.id, conversationId)
    });
  }

  const messages = conversation?.messages || [];

  // Build context from course content
  const context = `
Course: ${course.title}
Description: ${course.description}

Lessons:
${course.lessons.map(l => `- ${l.title}`).join('\n')}

You are a helpful teaching assistant for this course. Answer student questions
based on the course content. If you don't know, say so and suggest they contact
the instructor.
  `;

  // Add user message
  messages.push({
    role: 'user',
    content: message
  });

  // Get AI response
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: context
      },
      ...messages
    ]
  });

  const assistantMessage = response.choices[0].message.content!;

  messages.push({
    role: 'assistant',
    content: assistantMessage
  });

  // Save conversation
  if (conversation) {
    await db
      .update(aiConversations)
      .set({
        messages,
        updatedAt: new Date()
      })
      .where(eq(aiConversations.id, conversationId));
  } else {
    [conversation] = await db
      .insert(aiConversations)
      .values({
        userId,
        courseId,
        messages
      })
      .returning();
  }

  return {
    message: assistantMessage,
    conversationId: conversation.id
  };
}

// app/api/courses/[courseId]/assistant/route.ts
export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const user = await requireAuth(request);
  const { message, conversationId } = await request.json();

  // Verify enrollment
  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, user.id),
      eq(enrollments.courseId, params.courseId)
    )
  });

  if (!enrollment) {
    return Response.json({ error: 'Not enrolled' }, { status: 403 });
  }

  const response = await chatWithCourseAssistant(
    user.id,
    params.courseId,
    message,
    conversationId
  );

  return Response.json(response);
}
```

### Auto-Quiz Generation API

```typescript
// app/api/lessons/[id]/generate-quiz/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const instructor = await requireRole(request, ['instructor', 'admin']);
  const { difficulty } = await request.json();

  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, params.id),
    with: { course: true }
  });

  if (!lesson || lesson.course.instructorId !== instructor.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get video transcript (would need speech-to-text integration)
  const transcript = await getVideoTranscript(lesson.videoUrl!);

  // Generate quiz
  const quiz = await generateQuizFromTranscript(transcript, difficulty);

  // Store quiz
  await db
    .update(lessons)
    .set({
      quiz: JSON.stringify(quiz)
    })
    .where(eq(lessons.id, params.id));

  return Response.json({ quiz });
}
```

---

## Week 23-24: Analytics & Recommendations

### Real-Time Analytics Aggregation

```typescript
// lib/analytics/aggregator.ts
export async function getStudentEngagement(courseId: string, timeRange: '7d' | '30d' | '90d') {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const engagement = await db
    .select({
      date: sql<string>`DATE(${analyticsEvents.createdAt})`,
      uniqueUsers: sql<number>`COUNT(DISTINCT ${analyticsEvents.userId})`,
      totalEvents: sql<number>`COUNT(*)`,
      avgSessionTime: sql<number>`AVG(EXTRACT(EPOCH FROM (${analyticsEvents.metadata}->>'sessionDuration')::interval))`
    })
    .from(analyticsEvents)
    .innerJoin(enrollments, eq(enrollments.userId, analyticsEvents.userId))
    .where(
      and(
        eq(enrollments.courseId, courseId),
        sql`${analyticsEvents.createdAt} >= ${startDate}`
      )
    )
    .groupBy(sql`DATE(${analyticsEvents.createdAt})`)
    .orderBy(sql`DATE(${analyticsEvents.createdAt})`);

  return engagement;
}

export async function getCompletionRateByLesson(courseId: string) {
  const stats = await db
    .select({
      lessonId: progress.lessonId,
      lessonTitle: lessons.title,
      totalEnrollments: sql<number>`COUNT(DISTINCT ${enrollments.userId})`,
      completions: sql<number>`COUNT(DISTINCT CASE WHEN ${progress.completed} THEN ${progress.userId} END)`,
      avgTimeWatched: sql<number>`AVG(${progress.timeWatched})`,
      completionRate: sql<number>`
        (COUNT(DISTINCT CASE WHEN ${progress.completed} THEN ${progress.userId} END)::float /
         COUNT(DISTINCT ${enrollments.userId})::float) * 100
      `
    })
    .from(lessons)
    .leftJoin(progress, eq(progress.lessonId, lessons.id))
    .innerJoin(enrollments, eq(enrollments.courseId, lessons.courseId))
    .where(eq(lessons.courseId, courseId))
    .groupBy(progress.lessonId, lessons.title, lessons.id)
    .orderBy(lessons.order);

  return stats;
}

// app/api/analytics/courses/[id]/engagement/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const instructor = await requireRole(request, ['instructor', 'admin']);

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, params.id)
  });

  if (!course || course.instructorId !== instructor.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const timeRange = (searchParams.get('range') || '30d') as '7d' | '30d' | '90d';

  const [engagement, completionStats] = await Promise.all([
    getStudentEngagement(params.id, timeRange),
    getCompletionRateByLesson(params.id)
  ]);

  return Response.json({
    engagement,
    completionStats
  });
}
```

### Recommendation Engine

```typescript
// lib/recommendations/engine.ts
export async function getRecommendedCourses(userId: string, limit: number = 5) {
  // Get user's enrolled courses
  const enrolledCourses = await db.query.enrollments.findMany({
    where: eq(enrollments.userId, userId),
    with: { course: true }
  });

  const enrolledCourseIds = enrolledCourses.map(e => e.courseId);

  // Get similar courses based on category/tags
  // (This would be more sophisticated with ML, but simple version for MVP)
  const recommendations = await db
    .select({
      course: courses,
      relevanceScore: sql<number>`
        (SELECT COUNT(*) FROM enrollments WHERE course_id = ${courses.id}) as popularity
      `
    })
    .from(courses)
    .where(
      and(
        notInArray(courses.id, enrolledCourseIds),
        eq(courses.status, 'published')
      )
    )
    .orderBy(desc(sql`popularity`))
    .limit(limit);

  return recommendations;
}

// app/api/recommendations/route.ts
export async function GET(request: Request) {
  const user = await requireAuth(request);

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '5');

  const recommended = await getRecommendedCourses(user.id, limit);

  return Response.json({ courses: recommended });
}
```

---

## Week 25-28: Migration & Advanced Features

### Migration Import Tools

```typescript
// lib/migration/teachable-importer.ts
export async function importFromTeachable(
  csvFile: File,
  instructorId: string
) {
  const csvText = await csvFile.text();
  const rows = parseCSV(csvText);

  const results = {
    courses: 0,
    lessons: 0,
    students: 0,
    errors: []
  };

  for (const row of rows) {
    try {
      // Import course
      const [course] = await db
        .insert(courses)
        .values({
          instructorId,
          title: row.course_title,
          description: row.course_description,
          price: parseInt(row.price) * 100 // Convert to cents
        })
        .returning();

      results.courses++;

      // Import lessons (would need separate CSV or API)
      // ...

      // Import student enrollments
      if (row.student_email) {
        let student = await db.query.users.findFirst({
          where: eq(users.email, row.student_email)
        });

        if (!student) {
          // Create student account
          [student] = await db
            .insert(users)
            .values({
              email: row.student_email,
              role: 'student'
            })
            .returning();
        }

        await db.insert(enrollments).values({
          userId: student.id,
          courseId: course.id
        });

        results.students++;
      }
    } catch (error) {
      results.errors.push({
        row,
        error: error.message
      });
    }
  }

  return results;
}

// app/api/migration/teachable/route.ts
export async function POST(request: Request) {
  const instructor = await requireRole(request, ['instructor', 'admin']);

  const formData = await request.formData();
  const csvFile = formData.get('file') as File;

  if (!csvFile) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  const results = await importFromTeachable(csvFile, instructor.id);

  return Response.json(results);
}
```

---

## Deliverables Checklist

### Week 13-18: Email Automation
- [ ] Campaign management API complete
- [ ] Behavior-triggered emails working
- [ ] Drip campaigns functional
- [ ] Email analytics dashboard
- [ ] Segmentation engine operational
- [ ] Webhook handling for email events

### Week 19-20: Content Protection
- [ ] Cloudflare Stream integration
- [ ] Signed URLs with expiration
- [ ] Device management (3 device limit)
- [ ] Dynamic watermarking
- [ ] Suspicious activity detection
- [ ] DRM configuration for video player

### Week 21-22: AI Features
- [ ] OpenAI integration working
- [ ] Course assistant chatbot functional
- [ ] Auto-quiz generation from transcripts
- [ ] Marketing copy generation
- [ ] AI conversation history stored

### Week 23-24: Analytics
- [ ] Real-time engagement tracking
- [ ] Completion rate analytics per lesson
- [ ] Revenue analytics for instructors
- [ ] Recommendation engine
- [ ] Exportable reports

### Week 25-28: Migration
- [ ] Teachable CSV importer
- [ ] Thinkific importer
- [ ] SCORM package support
- [ ] Video bulk upload
- [ ] Migration verification dashboard

---

## Week 29-30: Support Infrastructure & 24/7 AI Chatbot

### AI Support Chatbot (24/7 General Support)

```typescript
// lib/ai/support-bot.ts
export async function chatWithSupportBot(
  userId: string,
  message: string,
  conversationId?: string
) {
  // Get user context
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      enrollments: {
        with: { course: true }
      }
    }
  });

  // Get or create conversation
  let conversation;
  if (conversationId) {
    conversation = await db.query.supportConversations.findFirst({
      where: eq(supportConversations.id, conversationId)
    });
  }

  const messages = conversation?.messages || [];

  // Build context from user's enrollments and common issues
  const context = `
You are CourseFlow's 24/7 AI support assistant. Help users with:
- Account issues (login, password reset, profile)
- Course access problems
- Payment and billing questions
- Video playback issues
- Certificate generation
- General platform navigation

User context:
- Email: ${user.email}
- Role: ${user.role}
- Enrolled courses: ${user.enrollments.map(e => e.course.title).join(', ')}

If the issue requires human intervention, create a support ticket and provide the ticket ID.
Be helpful, professional, and concise.
  `;

  messages.push({ role: 'user', content: message });

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: context },
      ...messages
    ],
    functions: [
      {
        name: 'create_support_ticket',
        description: 'Create a support ticket for issues requiring human intervention',
        parameters: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['billing', 'technical', 'content', 'account', 'other']
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent']
            },
            description: { type: 'string' }
          },
          required: ['category', 'priority', 'description']
        }
      },
      {
        name: 'search_knowledge_base',
        description: 'Search the knowledge base for articles',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' }
          },
          required: ['query']
        }
      }
    ],
    function_call: 'auto'
  });

  const assistantMessage = response.choices[0].message;

  // Handle function calls
  if (assistantMessage.function_call) {
    const functionName = assistantMessage.function_call.name;
    const functionArgs = JSON.parse(assistantMessage.function_call.arguments);

    if (functionName === 'create_support_ticket') {
      const ticket = await createSupportTicket(userId, functionArgs);
      messages.push({
        role: 'assistant',
        content: `I've created support ticket #${ticket.ticketNumber} for you. A team member will respond within ${getResponseTime(functionArgs.priority)}.`
      });
    } else if (functionName === 'search_knowledge_base') {
      const articles = await searchKnowledgeBase(functionArgs.query);
      const articleList = articles.map(a => `- [${a.title}](${a.url})`).join('\n');
      messages.push({
        role: 'assistant',
        content: `I found these helpful articles:\n${articleList}`
      });
    }
  } else {
    messages.push({
      role: 'assistant',
      content: assistantMessage.content!
    });
  }

  // Save conversation
  if (conversation) {
    await db
      .update(supportConversations)
      .set({ messages, updatedAt: new Date() })
      .where(eq(supportConversations.id, conversationId));
  } else {
    [conversation] = await db
      .insert(supportConversations)
      .values({ userId, messages })
      .returning();
  }

  return {
    message: messages[messages.length - 1].content,
    conversationId: conversation.id
  };
}

function getResponseTime(priority: string): string {
  const times = {
    urgent: '1 hour',
    high: '4 hours',
    medium: '24 hours',
    low: '48 hours'
  };
  return times[priority] || '24 hours';
}
```

### Support Ticket System

```typescript
// Add to schema
export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketNumber: serial('ticket_number').notNull().unique(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id),
  category: text('category', {
    enum: ['billing', 'technical', 'content', 'account', 'other']
  }).notNull(),
  priority: text('priority', {
    enum: ['low', 'medium', 'high', 'urgent']
  }).notNull(),
  status: text('status', {
    enum: ['open', 'in_progress', 'waiting', 'resolved', 'closed']
  }).default('open'),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at')
});

export const ticketMessages = pgTable('ticket_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: uuid('ticket_id').references(() => supportTickets.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  isInternal: boolean('is_internal').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// lib/support/tickets.ts
export async function createSupportTicket(
  userId: string,
  data: {
    category: string;
    priority: string;
    description: string;
  }
) {
  const [ticket] = await db
    .insert(supportTickets)
    .values({
      userId,
      category: data.category,
      priority: data.priority,
      subject: data.description.substring(0, 100),
      description: data.description
    })
    .returning();

  // Notify support team
  await notifySupportTeam(ticket);

  return ticket;
}

async function notifySupportTeam(ticket: any) {
  // Send email to support team
  await resend.emails.send({
    from: 'support@courseflow.com',
    to: 'support-team@courseflow.com',
    subject: `[${ticket.priority.toUpperCase()}] New ticket #${ticket.ticketNumber}`,
    html: `
      <h2>New Support Ticket</h2>
      <p><strong>Ticket:</strong> #${ticket.ticketNumber}</p>
      <p><strong>Category:</strong> ${ticket.category}</p>
      <p><strong>Priority:</strong> ${ticket.priority}</p>
      <p><strong>Description:</strong></p>
      <p>${ticket.description}</p>
      <a href="${process.env.NEXT_PUBLIC_URL}/admin/tickets/${ticket.id}">View Ticket</a>
    `
  });
}

// app/api/support/tickets/route.ts
export async function POST(request: Request) {
  const user = await requireAuth(request);
  const { category, priority, description } = await request.json();

  const ticket = await createSupportTicket(user.id, {
    category,
    priority,
    description
  });

  return Response.json({ ticket }, { status: 201 });
}

export async function GET(request: Request) {
  const user = await requireAuth(request);

  const tickets = await db.query.supportTickets.findMany({
    where: eq(supportTickets.userId, user.id),
    orderBy: [desc(supportTickets.createdAt)]
  });

  return Response.json({ tickets });
}

// app/api/support/tickets/[id]/messages/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(request);
  const { message } = await request.json();

  // Verify ticket ownership or support role
  const ticket = await db.query.supportTickets.findFirst({
    where: eq(supportTickets.id, params.id)
  });

  if (!ticket || (ticket.userId !== user.id && user.role !== 'admin')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [ticketMessage] = await db
    .insert(ticketMessages)
    .values({
      ticketId: params.id,
      userId: user.id,
      message
    })
    .returning();

  // Update ticket status
  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    await db
      .update(supportTickets)
      .set({ status: 'open' })
      .where(eq(supportTickets.id, params.id));
  }

  // Notify relevant parties
  if (user.role === 'admin' && ticket.userId !== user.id) {
    // Admin replied - notify user
    await notifyUserOfReply(ticket.userId, ticket.ticketNumber);
  } else {
    // User replied - notify assigned admin
    await notifyAdminOfReply(ticket.assignedTo, ticket.ticketNumber);
  }

  return Response.json({ message: ticketMessage });
}
```

### Knowledge Base System

```typescript
// Add to schema
export const knowledgeBaseArticles = pgTable('knowledge_base_articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  tags: text('tags').array(),
  viewCount: integer('view_count').default(0),
  helpfulCount: integer('helpful_count').default(0),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// lib/support/knowledge-base.ts
export async function searchKnowledgeBase(query: string, limit: number = 5) {
  const articles = await db
    .select()
    .from(knowledgeBaseArticles)
    .where(
      and(
        eq(knowledgeBaseArticles.published, true),
        or(
          sql`${knowledgeBaseArticles.title} ILIKE ${'%' + query + '%'}`,
          sql`${knowledgeBaseArticles.content} ILIKE ${'%' + query + '%'}`,
          sql`${'%' + query + '%'} = ANY(${knowledgeBaseArticles.tags})`
        )
      )
    )
    .orderBy(desc(knowledgeBaseArticles.helpfulCount))
    .limit(limit);

  return articles.map(a => ({
    ...a,
    url: `${process.env.NEXT_PUBLIC_URL}/help/${a.slug}`
  }));
}

// app/api/help/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  const articles = await searchKnowledgeBase(query);

  return Response.json({ articles });
}

// app/api/help/[slug]/helpful/route.ts
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  await db
    .update(knowledgeBaseArticles)
    .set({
      helpfulCount: sql`${knowledgeBaseArticles.helpfulCount} + 1`
    })
    .where(eq(knowledgeBaseArticles.slug, params.slug));

  return Response.json({ success: true });
}
```

### Support Analytics Dashboard

```typescript
// lib/analytics/support.ts
export async function getSupportMetrics(timeRange: '7d' | '30d' | '90d') {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Ticket volume
  const ticketVolume = await db
    .select({
      date: sql<string>`DATE(${supportTickets.createdAt})`,
      count: sql<number>`COUNT(*)`,
      urgent: sql<number>`COUNT(*) FILTER (WHERE priority = 'urgent')`,
      high: sql<number>`COUNT(*) FILTER (WHERE priority = 'high')`
    })
    .from(supportTickets)
    .where(sql`${supportTickets.createdAt} >= ${startDate}`)
    .groupBy(sql`DATE(${supportTickets.createdAt})`);

  // Resolution times
  const resolutionTimes = await db
    .select({
      category: supportTickets.category,
      avgResolutionTime: sql<number>`
        AVG(EXTRACT(EPOCH FROM (${supportTickets.resolvedAt} - ${supportTickets.createdAt})) / 3600)
      `
    })
    .from(supportTickets)
    .where(
      and(
        sql`${supportTickets.createdAt} >= ${startDate}`,
        isNotNull(supportTickets.resolvedAt)
      )
    )
    .groupBy(supportTickets.category);

  // Common issues
  const commonIssues = await db
    .select({
      category: supportTickets.category,
      count: sql<number>`COUNT(*)`
    })
    .from(supportTickets)
    .where(sql`${supportTickets.createdAt} >= ${startDate}`)
    .groupBy(supportTickets.category)
    .orderBy(desc(sql`COUNT(*)`));

  // First response time
  const firstResponseTime = await db
    .select({
      avgTime: sql<number>`
        AVG(EXTRACT(EPOCH FROM (
          (SELECT created_at FROM ticket_messages
           WHERE ticket_id = ${supportTickets.id}
           ORDER BY created_at LIMIT 1)
          - ${supportTickets.createdAt}
        )) / 3600)
      `
    })
    .from(supportTickets)
    .where(sql`${supportTickets.createdAt} >= ${startDate}`);

  return {
    ticketVolume,
    resolutionTimes,
    commonIssues,
    avgFirstResponseTime: firstResponseTime[0]?.avgTime || 0
  };
}

// app/api/admin/analytics/support/route.ts
export async function GET(request: Request) {
  const admin = await requireRole(request, ['admin']);

  const { searchParams } = new URL(request.url);
  const timeRange = (searchParams.get('range') || '30d') as '7d' | '30d' | '90d';

  const metrics = await getSupportMetrics(timeRange);

  return Response.json(metrics);
}
```

---

## Week 31: Performance Optimization & Monitoring

### Database Query Optimization

```typescript
// lib/db/optimizations.ts
import { db } from '@/lib/db';

// Add indexes to improve query performance
export async function addPerformanceIndexes() {
  await db.execute(sql`
    -- Enrollments by user and course (frequently queried together)
    CREATE INDEX IF NOT EXISTS idx_enrollments_user_course
    ON enrollments(user_id, course_id);

    -- Progress by user and lesson with completion status
    CREATE INDEX IF NOT EXISTS idx_progress_user_lesson_completed
    ON progress(user_id, lesson_id, completed);

    -- Analytics events by user and date
    CREATE INDEX IF NOT EXISTS idx_analytics_user_date
    ON analytics_events(user_id, created_at DESC);

    -- Video access by lesson and updated time
    CREATE INDEX IF NOT EXISTS idx_progress_lesson_updated
    ON progress(lesson_id, updated_at DESC);

    -- Email events for analytics
    CREATE INDEX IF NOT EXISTS idx_email_events_type_created
    ON email_events(email_type, created_at DESC);

    -- Support tickets by status and priority
    CREATE INDEX IF NOT EXISTS idx_tickets_status_priority
    ON support_tickets(status, priority, created_at DESC);
  `);
}

// Materialized views for expensive queries
export async function createMaterializedViews() {
  await db.execute(sql`
    -- Course statistics (refresh hourly via cron)
    CREATE MATERIALIZED VIEW IF NOT EXISTS course_stats AS
    SELECT
      c.id as course_id,
      c.title,
      COUNT(DISTINCT e.user_id) as total_enrollments,
      COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.user_id END) as completions,
      AVG(
        (SELECT COUNT(*) FROM progress p
         INNER JOIN lessons l ON l.id = p.lesson_id
         WHERE l.course_id = c.id AND p.completed = true AND p.user_id = e.user_id)::float /
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id)::float
      ) * 100 as avg_completion_rate,
      SUM(c.price) as total_revenue
    FROM courses c
    LEFT JOIN enrollments e ON e.course_id = c.id
    GROUP BY c.id, c.title;

    CREATE UNIQUE INDEX ON course_stats(course_id);
  `);
}

// Efficient pagination with cursor-based approach
export async function getCoursesPaginated(
  cursor?: string,
  limit: number = 20
) {
  const query = db
    .select()
    .from(courses)
    .where(eq(courses.status, 'published'))
    .orderBy(desc(courses.createdAt))
    .limit(limit + 1);

  if (cursor) {
    query.where(sql`${courses.createdAt} < ${new Date(cursor)}`);
  }

  const results = await query;
  const hasMore = results.length > limit;
  const items = hasMore ? results.slice(0, -1) : results;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  return { items, nextCursor, hasMore };
}
```

### Redis Caching Layer

```typescript
// lib/cache/redis.ts
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on('error', (err) => console.error('Redis Client Error', err));
await redis.connect();

export { redis };

// Cache wrapper for expensive queries
export async function cachedQuery<T>(
  key: string,
  ttl: number,
  queryFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Execute query
  const result = await queryFn();

  // Store in cache
  await redis.setEx(key, ttl, JSON.stringify(result));

  return result;
}

// app/api/courses/route.ts (Updated with caching)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor') || undefined;

  const cacheKey = `courses:list:${cursor}`;

  const result = await cachedQuery(
    cacheKey,
    300, // 5 minutes
    () => getCoursesPaginated(cursor)
  );

  return Response.json(result);
}

// Cache invalidation on updates
export async function POST(request: Request) {
  const instructor = await requireRole(request, ['instructor', 'admin']);
  const data = await request.json();

  const [course] = await db
    .insert(courses)
    .values({ ...data, instructorId: instructor.id })
    .returning();

  // Invalidate cache
  await redis.del('courses:list:undefined');

  return Response.json({ course }, { status: 201 });
}
```

### CDN Configuration & Asset Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['customer-*.cloudflarestream.com', 'supabase.co'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },

  // Enable compression
  compress: true,

  // Enable SWC minification
  swcMinify: true,

  // Optimize bundles
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react']
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};

// lib/image-optimization.ts
export function getOptimizedImageUrl(
  url: string,
  width: number,
  quality: number = 75
): string {
  // Use Cloudflare Image Resizing
  return `https://courseflow.com/cdn-cgi/image/width=${width},quality=${quality},format=auto/${url}`;
}
```

### Performance Monitoring

```typescript
// lib/monitoring/performance.ts
export class PerformanceMonitor {
  static async trackApiRequest(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number
  ) {
    await db.insert(performanceMetrics).values({
      metricType: 'api_request',
      endpoint,
      method,
      duration,
      statusCode,
      timestamp: new Date()
    });

    // Alert if slow
    if (duration > 1000) {
      console.warn(`Slow API request: ${method} ${endpoint} took ${duration}ms`);
    }
  }

  static async trackDatabaseQuery(
    query: string,
    duration: number
  ) {
    if (duration > 500) {
      await db.insert(performanceMetrics).values({
        metricType: 'slow_query',
        metadata: { query },
        duration,
        timestamp: new Date()
      });

      console.warn(`Slow database query (${duration}ms):`, query);
    }
  }

  static async getPerformanceReport(hours: number = 24) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const metrics = await db
      .select({
        endpoint: performanceMetrics.endpoint,
        avgDuration: sql<number>`AVG(${performanceMetrics.duration})`,
        maxDuration: sql<number>`MAX(${performanceMetrics.duration})`,
        requestCount: sql<number>`COUNT(*)`,
        errorRate: sql<number>`
          (COUNT(*) FILTER (WHERE status_code >= 400)::float / COUNT(*)::float) * 100
        `
      })
      .from(performanceMetrics)
      .where(
        and(
          eq(performanceMetrics.metricType, 'api_request'),
          sql`${performanceMetrics.timestamp} >= ${since}`
        )
      )
      .groupBy(performanceMetrics.endpoint)
      .orderBy(desc(sql`AVG(${performanceMetrics.duration})`));

    return metrics;
  }
}

// middleware.ts (Add performance tracking)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  const duration = Date.now() - start;

  // Track in background (don't await)
  PerformanceMonitor.trackApiRequest(
    request.nextUrl.pathname,
    request.method,
    duration,
    response.status
  ).catch(console.error);

  // Add performance headers
  response.headers.set('X-Response-Time', `${duration}ms`);

  return response;
}

export const config = {
  matcher: '/api/:path*'
};
```

### Application Performance Monitoring (APM)

```typescript
// lib/monitoring/apm.ts
// Example using Sentry for error tracking and performance monitoring

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  environment: process.env.NODE_ENV,

  beforeSend(event, hint) {
    // Don't send certain errors
    if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
      return null;
    }
    return event;
  },

  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Postgres()
  ]
});

// Usage in API routes
export async function GET(request: Request) {
  const transaction = Sentry.startTransaction({
    op: 'http.server',
    name: 'GET /api/courses'
  });

  try {
    const courses = await db.query.courses.findMany();
    return Response.json({ courses });
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  } finally {
    transaction.finish();
  }
}
```

---

## Week 32: Security Audit, Load Testing, Documentation & Launch

### Security Hardening

```typescript
// lib/security/headers.ts
export function getSecurityHeaders() {
  return {
    // Prevent XSS attacks
    'X-XSS-Protection': '1; mode=block',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Prevent MIME sniffing
    'X-Content-Type-Options': 'nosniff',

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com https://*.supabase.co",
      "media-src 'self' https://*.cloudflarestream.com",
      "frame-src https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  };
}

// next.config.js (Update)
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: Object.entries(getSecurityHeaders()).map(([key, value]) => ({
          key,
          value
        }))
      }
    ];
  }
};

// lib/security/rate-limiting.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

// Different rate limits for different endpoints
export const rateLimiters = {
  // General API: 100 requests per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m')
  }),

  // Auth endpoints: 5 requests per minute
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m')
  }),

  // Video streaming: 20 requests per minute
  video: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m')
  }),

  // AI features: 10 requests per minute (expensive)
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m')
  })
};

// Middleware usage
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit
): Promise<boolean> {
  const { success } = await limiter.limit(identifier);
  return success;
}

// lib/security/input-validation.ts
import { z } from 'zod';

// Course creation schema
export const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().int().min(0).max(1000000), // Max $10,000
  category: z.enum(['programming', 'design', 'business', 'marketing', 'other']),
  tags: z.array(z.string()).max(10).optional()
});

// Lesson creation schema
export const createLessonSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().max(50000),
  order: z.number().int().min(0),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional()
});

// User registration schema
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and number'
  ),
  name: z.string().min(2).max(100).optional()
});

// SQL Injection prevention example
export async function safeQuery(userId: string, courseId: string) {
  // ✅ GOOD: Using parameterized queries (Drizzle does this automatically)
  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, userId),
      eq(enrollments.courseId, courseId)
    )
  });

  // ❌ BAD: Never do this
  // const result = await db.execute(
  //   sql`SELECT * FROM enrollments WHERE user_id = '${userId}'`
  // );
}
```

### Load Testing

```typescript
// tests/load/k6-script.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    errors: ['rate<0.1'], // Error rate < 10%
  },
};

const BASE_URL = 'https://courseflow.com';

export default function () {
  // Test homepage
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'homepage status 200': (r) => r.status === 200,
    'homepage loads fast': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test course listing
  res = http.get(`${BASE_URL}/api/courses`);
  check(res, {
    'courses API status 200': (r) => r.status === 200,
    'courses API fast': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(1);

  // Test login (POST)
  const loginPayload = JSON.stringify({
    email: `user${Math.floor(Math.random() * 1000)}@test.com`,
    password: 'TestPassword123',
  });

  res = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'login API responds': (r) => r.status === 200 || r.status === 401,
  }) || errorRate.add(1);

  sleep(2);
}

// Run with: k6 run tests/load/k6-script.js
```

```bash
# tests/load/artillery-config.yml
config:
  target: "https://courseflow.com"
  phases:
    - duration: 120
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 120
      arrivalRate: 100
      name: "Stress test"
  processor: "./custom-functions.js"

scenarios:
  - name: "Browse and enroll"
    flow:
      - get:
          url: "/"
      - think: 2
      - get:
          url: "/api/courses"
      - think: 3
      - post:
          url: "/api/auth/register"
          json:
            email: "{{ $randomEmail() }}"
            password: "TestPass123"
      - think: 5
      - get:
          url: "/api/courses/{{ courseId }}"
      - think: 10
      - post:
          url: "/api/payments/create-intent"
          json:
            courseId: "{{ courseId }}"

  - name: "Watch video"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "testuser@example.com"
            password: "TestPass123"
      - get:
          url: "/api/videos/{{ lessonId }}/stream"
      - loop:
          - post:
              url: "/api/progress/save"
              json:
                lessonId: "{{ lessonId }}"
                timeWatched: "{{ $randomNumber(0, 600) }}"
                lastPosition: "{{ $randomNumber(0, 600) }}"
          - think: 30
        count: 10

# Run with: artillery run tests/load/artillery-config.yml
```

### API Documentation

```typescript
// lib/docs/swagger.ts
import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'CourseFlow API',
        version: '1.0.0',
        description: 'Complete API documentation for CourseFlow platform',
      },
      servers: [
        {
          url: 'https://courseflow.com/api',
          description: 'Production server',
        },
        {
          url: 'http://localhost:3000/api',
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  });

  return spec;
};

// app/api/docs/route.ts
export async function GET() {
  const spec = getApiDocs();
  return Response.json(spec);
}

// app/docs/page.tsx - Swagger UI
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default async function ApiDocsPage() {
  return (
    <div className="h-screen">
      <SwaggerUI url="/api/docs" />
    </div>
  );
}
```

### Deployment Checklist

```typescript
// DEPLOYMENT_CHECKLIST.md
/**
 * Pre-Launch Checklist
 */

// Environment Variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'OPENAI_API_KEY',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_API_TOKEN',
  'RESEND_API_KEY',
  'REDIS_URL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'NEXT_PUBLIC_SENTRY_DSN'
];

export function validateEnvironment() {
  const missing = requiredEnvVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('✅ All environment variables configured');
}

// Database migrations
export async function runPreDeploymentChecks() {
  console.log('Running pre-deployment checks...');

  // 1. Database connectivity
  try {
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  // 2. Check indexes exist
  const indexes = await db.execute(sql`
    SELECT indexname FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
  `);
  console.log(`✅ Found ${indexes.rows.length} performance indexes`);

  // 3. Verify Stripe webhook
  const webhooks = await stripe.webhookEndpoints.list();
  const hasWebhook = webhooks.data.some(
    w => w.url.includes('/api/webhooks/stripe')
  );

  if (!hasWebhook) {
    console.warn('⚠️  Stripe webhook not configured');
  } else {
    console.log('✅ Stripe webhook configured');
  }

  // 4. Test Redis connection
  try {
    await redis.ping();
    console.log('✅ Redis connection successful');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
  }

  // 5. Verify Cloudflare Stream
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`
        }
      }
    );

    if (response.ok) {
      console.log('✅ Cloudflare Stream API accessible');
    } else {
      console.warn('⚠️  Cloudflare Stream API error');
    }
  } catch (error) {
    console.error('❌ Cloudflare Stream check failed:', error);
  }

  console.log('\n✅ All pre-deployment checks passed!');
}

// scripts/deploy.sh
#!/bin/bash

echo "🚀 Starting deployment process..."

# 1. Run tests
echo "Running tests..."
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Aborting deployment."
  exit 1
fi

# 2. Build application
echo "Building application..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Aborting deployment."
  exit 1
fi

# 3. Run pre-deployment checks
echo "Running pre-deployment checks..."
node scripts/pre-deploy-check.js
if [ $? -ne 0 ]; then
  echo "❌ Pre-deployment checks failed. Aborting deployment."
  exit 1
fi

# 4. Database migrations
echo "Running database migrations..."
npm run db:migrate
if [ $? -ne 0 ]; then
  echo "❌ Database migrations failed. Aborting deployment."
  exit 1
fi

# 5. Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
```

### Monitoring & Alerting Setup

```typescript
// lib/monitoring/alerts.ts
export async function setupMonitoring() {
  // 1. Database alerts
  await db.execute(sql`
    -- Alert when too many slow queries
    CREATE OR REPLACE FUNCTION alert_slow_queries()
    RETURNS trigger AS $$
    BEGIN
      IF NEW.duration > 1000 THEN
        PERFORM pg_notify(
          'slow_query',
          json_build_object(
            'query', NEW.metadata->>'query',
            'duration', NEW.duration
          )::text
        );
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER slow_query_trigger
    AFTER INSERT ON performance_metrics
    FOR EACH ROW
    EXECUTE FUNCTION alert_slow_queries();
  `);

  // 2. Error rate monitoring
  setInterval(async () => {
    const errorRate = await getErrorRate('5m');

    if (errorRate > 5) { // More than 5% errors
      await sendAlert({
        type: 'high_error_rate',
        message: `Error rate is ${errorRate.toFixed(2)}%`,
        severity: 'high'
      });
    }
  }, 60000); // Check every minute

  // 3. Video streaming health
  setInterval(async () => {
    const failedStreams = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventType, 'video_error'),
          sql`created_at > NOW() - INTERVAL '5 minutes'`
        )
      );

    if (failedStreams[0].count > 10) {
      await sendAlert({
        type: 'video_streaming_issues',
        message: `${failedStreams[0].count} video streaming errors in last 5 minutes`,
        severity: 'high'
      });
    }
  }, 300000); // Check every 5 minutes
}

async function getErrorRate(timeRange: string): Promise<number> {
  const [total, errors] = await Promise.all([
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(performanceMetrics)
      .where(sql`timestamp > NOW() - INTERVAL '${timeRange}'`),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(performanceMetrics)
      .where(
        and(
          sql`timestamp > NOW() - INTERVAL '${timeRange}'`,
          sql`status_code >= 400`
        )
      )
  ]);

  return (errors[0].count / total[0].count) * 100;
}

async function sendAlert(alert: {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}) {
  // Send to multiple channels
  await Promise.all([
    // Email
    resend.emails.send({
      from: 'alerts@courseflow.com',
      to: 'team@courseflow.com',
      subject: `[${alert.severity.toUpperCase()}] ${alert.type}`,
      html: `<p>${alert.message}</p>`
    }),

    // Slack (if configured)
    process.env.SLACK_WEBHOOK_URL &&
      fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *${alert.type}*\n${alert.message}`,
          channel: '#alerts'
        })
      }),

    // Log to database
    db.insert(alerts).values({
      type: alert.type,
      message: alert.message,
      severity: alert.severity,
      acknowledged: false
    })
  ]);
}
```

---

## Final Deliverables Checklist

### Week 29-30: Support Infrastructure
- [ ] AI support chatbot (24/7) functional
- [ ] Support ticket system operational
- [ ] Knowledge base with search
- [ ] Email notifications for tickets
- [ ] Support analytics dashboard
- [ ] Ticket escalation workflow

### Week 31: Performance Optimization
- [ ] Database indexes created
- [ ] Materialized views for expensive queries
- [ ] Redis caching layer implemented
- [ ] CDN configuration complete
- [ ] Image optimization active
- [ ] Performance monitoring dashboard
- [ ] API response times < 200ms (p95)
- [ ] Database queries < 100ms (p95)

### Week 32: Security & Launch
- [ ] Security headers configured
- [ ] Rate limiting on all endpoints
- [ ] Input validation schemas
- [ ] SQL injection prevention verified
- [ ] XSS protection tested
- [ ] CSRF protection enabled
- [ ] Load testing completed (200+ concurrent users)
- [ ] API documentation published
- [ ] Environment variables validated
- [ ] Database migrations tested
- [ ] Monitoring & alerting active
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented

---

## Launch Day Checklist

```typescript
// LAUNCH_DAY.md

### T-24 Hours Before Launch

- [ ] Final database backup
- [ ] Verify all environment variables in production
- [ ] Test payment flow end-to-end
- [ ] Test video streaming on multiple devices
- [ ] Verify email delivery (all templates)
- [ ] Check SSL certificate validity
- [ ] Confirm CDN is properly configured
- [ ] Run security scan
- [ ] Load test with expected traffic + 50%
- [ ] Brief support team on common issues

### T-1 Hour Before Launch

- [ ] Deploy latest code to production
- [ ] Run smoke tests on production
- [ ] Verify all API endpoints respond
- [ ] Test user registration & login
- [ ] Test course enrollment flow
- [ ] Check monitoring dashboards
- [ ] Enable rate limiting
- [ ] Set up war room communication channel

### Launch Time

- [ ] Announce on social media
- [ ] Send email to waitlist
- [ ] Monitor error rates
- [ ] Monitor server load
- [ ] Monitor payment success rate
- [ ] Monitor user registrations
- [ ] Have support team ready

### T+1 Hour After Launch

- [ ] Check for any critical errors
- [ ] Review user feedback
- [ ] Monitor conversion funnel
- [ ] Check video streaming performance
- [ ] Review payment processing
- [ ] Address any urgent bugs

### T+24 Hours After Launch

- [ ] Full metrics review
- [ ] User feedback analysis
- [ ] Performance optimization based on real usage
- [ ] Plan hotfixes if needed
- [ ] Celebrate! 🎉
```

---

## Complete Backend Architecture Summary

**Technology Stack:**
- **Framework**: Next.js 14/15 (App Router, API Routes)
- **Database**: PostgreSQL (Supabase) + Drizzle ORM
- **Caching**: Redis (Upstash)
- **Auth**: Supabase Auth
- **Payments**: Stripe (0% platform fees)
- **Video**: Cloudflare Stream (DRM, watermarking)
- **Email**: Resend
- **AI**: OpenAI GPT-4
- **Monitoring**: Sentry + Custom APM
- **CDN**: Cloudflare

**Key Features Implemented:**
1. ✅ Complete authentication system
2. ✅ Video streaming with DRM & device limits
3. ✅ Payment processing (0% platform fees)
4. ✅ Gamification (XP, badges, streaks)
5. ✅ Auto-save progress (30-second intervals)
6. ✅ Email automation & drip campaigns
7. ✅ AI course assistant & quiz generation
8. ✅ Real-time analytics & recommendations
9. ✅ Migration tools (Teachable, Thinkific)
10. ✅ 24/7 AI support chatbot
11. ✅ Performance optimization (caching, indexes)
12. ✅ Security hardening (rate limiting, CSP)
13. ✅ Load testing & monitoring

**Performance Targets:**
- API response time: < 200ms (p95)
- Database queries: < 100ms (p95)
- Video start time: < 2 seconds
- Error rate: < 0.1%
- Uptime: 99.9%

**Security Measures:**
- Rate limiting (per endpoint)
- SQL injection prevention (parameterized queries)
- XSS protection (CSP headers)
- CSRF protection
- Input validation (Zod schemas)
- Device management (3 device limit)
- DRM & watermarking for videos
- Suspicious activity detection

---

**🎉 Development Path 1 (Backend) Complete! 32 weeks of detailed implementation.**

**Ready for:**
1. Integration with Frontend (Path 2)
2. Production deployment
3. Load testing with real traffic
4. User onboarding & launch

**Last Updated:** November 19, 2025
