import { prisma } from '../../config/database.js';
import { logger } from '../../lib/logger.js';
import { NotFoundError } from '../../lib/errors.js';
import type { CreateFeedbackInput, UpdateFeedbackInput, FeedbackQueryInput } from './feedback.schema.js';

// Upload screenshot and get URL (simplified - in production use S3/Supabase)
async function uploadScreenshot(base64Data: string): Promise<string | null> {
  if (!base64Data) return null;
  
  try {
    // Extract mime type and data
    const matches = base64Data.match(/^data:image\/(png|jpeg|jpg|gif);base64,(.+)$/);
    if (!matches) return null;
    
    const ext = matches[1];
    const data = matches[2];
    const filename = `feedback-${Date.now()}.${ext}`;
    
    // In production, upload to S3/Supabase Storage
    // For now, save locally
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const uploadsDir = path.join(process.cwd(), 'uploads', 'feedback');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, Buffer.from(data, 'base64'));
    
    return `/uploads/feedback/${filename}`;
  } catch (error) {
    logger.error({ error }, 'Failed to upload screenshot');
    return null;
  }
}

export async function createFeedback(
  input: CreateFeedbackInput,
  userId?: string,
  userAgent?: string
) {
  // Upload screenshot if provided
  const screenshotUrl = input.screenshot 
    ? await uploadScreenshot(input.screenshot) 
    : null;

  const feedback = await prisma.feedback.create({
    data: {
      type: input.type,
      description: input.description,
      pageUrl: input.pageUrl || null,
      email: input.email || null,
      screenshotUrl,
      userAgent: userAgent || null,
      userId: userId || null,
      status: 'NEW',
    },
  });

  logger.info({ feedbackId: feedback.id, type: feedback.type }, 'New feedback submitted');

  // Optionally send email notification to admin
  // await sendFeedbackNotification(feedback);

  return feedback;
}

export async function getFeedback(id: string) {
  const feedback = await prisma.feedback.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!feedback) {
    throw new NotFoundError('Feedback not found');
  }

  return feedback;
}

export async function listFeedback(query: FeedbackQueryInput) {
  const { page, limit, type, status, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (type) where.type = type;
  if (status) where.status = status;

  const [feedback, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.feedback.count({ where }),
  ]);

  return {
    feedback,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateFeedback(id: string, input: UpdateFeedbackInput) {
  const existing = await prisma.feedback.findUnique({ where: { id } });
  
  if (!existing) {
    throw new NotFoundError('Feedback not found');
  }

  const data: any = { ...input };
  
  // Set resolvedAt if status changed to RESOLVED
  if (input.status === 'RESOLVED' && existing.status !== 'RESOLVED') {
    data.resolvedAt = new Date();
  }

  const feedback = await prisma.feedback.update({
    where: { id },
    data,
  });

  logger.info({ feedbackId: id, status: input.status }, 'Feedback updated');

  return feedback;
}

export async function deleteFeedback(id: string) {
  const existing = await prisma.feedback.findUnique({ where: { id } });
  
  if (!existing) {
    throw new NotFoundError('Feedback not found');
  }

  await prisma.feedback.delete({ where: { id } });

  logger.info({ feedbackId: id }, 'Feedback deleted');

  return { success: true };
}

export async function getFeedbackStats() {
  const [byType, byStatus, total, recent] = await Promise.all([
    prisma.feedback.groupBy({
      by: ['type'],
      _count: { type: true },
    }),
    prisma.feedback.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.feedback.count(),
    prisma.feedback.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    }),
  ]);

  return {
    total,
    recentWeek: recent,
    byType: Object.fromEntries(byType.map((t) => [t.type, t._count.type])),
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count.status])),
  };
}
