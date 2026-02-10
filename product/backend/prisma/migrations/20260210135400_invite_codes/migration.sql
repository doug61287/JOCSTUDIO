-- CreateTable: invite_codes
CREATE TABLE "InviteCode" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "metadata" JSONB DEFAULT '{}',
    
    CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable: invite_redemptions
CREATE TABLE "InviteRedemption" (
    "id" TEXT NOT NULL,
    "inviteCodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteRedemption_pkey" PRIMARY KEY ("id")
);

-- Add beta user columns to User table
ALTER TABLE "User" ADD COLUMN "isBetaUser" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "inviteCodeUsed" VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "InviteCode_code_key" ON "InviteCode"("code");
CREATE INDEX "InviteCode_code_idx" ON "InviteCode"("code");
CREATE INDEX "InviteCode_createdById_idx" ON "InviteCode"("createdById");

CREATE INDEX "InviteRedemption_inviteCodeId_idx" ON "InviteRedemption"("inviteCodeId");
CREATE INDEX "InviteRedemption_userId_idx" ON "InviteRedemption"("userId");
CREATE UNIQUE INDEX "InviteRedemption_inviteCodeId_userId_key" ON "InviteRedemption"("inviteCodeId", "userId");

-- AddForeignKey
ALTER TABLE "InviteCode" ADD CONSTRAINT "InviteCode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteRedemption" ADD CONSTRAINT "InviteRedemption_inviteCodeId_fkey" FOREIGN KEY ("inviteCodeId") REFERENCES "InviteCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteRedemption" ADD CONSTRAINT "InviteRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
