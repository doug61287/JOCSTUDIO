-- Migration: 004_feedback
-- Description: Add Feedback table for beta tester feedback collection
-- Created: 2026-02-10

-- Create feedback status enum
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'REVIEWED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED');

-- Create feedback type enum
CREATE TYPE "FeedbackType" AS ENUM ('BUG', 'FEATURE_REQUEST', 'GENERAL');

-- Create Feedback table
CREATE TABLE "Feedback" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "type" "FeedbackType" NOT NULL,
  "description" TEXT NOT NULL,
  "screenshotUrl" TEXT,
  "pageUrl" TEXT,
  "userAgent" TEXT,
  "email" TEXT,
  "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
  "adminNotes" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");
CREATE INDEX "Feedback_type_idx" ON "Feedback"("type");
CREATE INDEX "Feedback_status_idx" ON "Feedback"("status");
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt" DESC);

-- Add trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_feedback_updated_at
  BEFORE UPDATE ON "Feedback"
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();
