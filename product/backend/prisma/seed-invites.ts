/**
 * Seed script for initial beta invite codes
 * Run: npx ts-node prisma/seed-invites.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_CODES = [
  'JOCHERO-A7B3C9D2',
  'JOCHERO-K8M4N6P1',
  'JOCHERO-Q2W5E8R3',
  'JOCHERO-T9Y7U4I6',
  'JOCHERO-H3J5L7Z2',
  'JOCHERO-X1C4V6B9',
  'JOCHERO-F8G2D5S4',
  'JOCHERO-M6N1P3Q7',
  'JOCHERO-W4E9R2T8',
  'JOCHERO-Y5U7I1O3',
];

async function seedInviteCodes() {
  console.log('🌱 Seeding initial invite codes...\n');

  for (const code of INITIAL_CODES) {
    try {
      const existing = await prisma.inviteCode.findUnique({
        where: { code },
      });

      if (existing) {
        console.log(`⏭️  ${code} - Already exists`);
        continue;
      }

      await prisma.inviteCode.create({
        data: {
          code,
          maxUses: 1,
          currentUses: 0,
          metadata: { batch: 'initial', createdAt: new Date().toISOString() },
        },
      });

      console.log(`✅ ${code} - Created`);
    } catch (error) {
      console.error(`❌ ${code} - Error:`, error);
    }
  }

  console.log('\n✨ Done seeding invite codes!');
}

seedInviteCodes()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
