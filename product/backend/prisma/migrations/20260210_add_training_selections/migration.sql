-- Add TrainingSelection table for ML learning
CREATE TABLE "TrainingSelection" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "measurementId" TEXT NOT NULL,
    "measurementType" TEXT NOT NULL,
    "measurementValue" DOUBLE PRECISION NOT NULL,
    "measurementLabel" TEXT,
    "path" JSONB NOT NULL,
    "keywords" JSONB NOT NULL DEFAULT '[]',
    "selectedTaskCode" TEXT NOT NULL,
    "selectedDescription" TEXT NOT NULL,
    "selectedUnit" TEXT NOT NULL,
    "selectedUnitCost" DOUBLE PRECISION NOT NULL,
    "alternativesShown" JSONB NOT NULL DEFAULT '[]',
    "timeToSelect" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingSelection_pkey" PRIMARY KEY ("id")
);

-- Indexes for efficient querying
CREATE INDEX "TrainingSelection_sessionId_idx" ON "TrainingSelection"("sessionId");
CREATE INDEX "TrainingSelection_userId_idx" ON "TrainingSelection"("userId");
CREATE INDEX "TrainingSelection_selectedTaskCode_idx" ON "TrainingSelection"("selectedTaskCode");
CREATE INDEX "TrainingSelection_measurementType_idx" ON "TrainingSelection"("measurementType");
CREATE INDEX "TrainingSelection_createdAt_idx" ON "TrainingSelection"("createdAt" DESC);
