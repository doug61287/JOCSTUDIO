import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jocstudio.dev' },
    update: {},
    create: {
      email: 'admin@jocstudio.dev',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create demo user
  const demoPassword = await bcrypt.hash('Demo1234!', 12);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@jocstudio.dev' },
    update: {},
    create: {
      email: 'demo@jocstudio.dev',
      passwordHash: demoPassword,
      name: 'Demo User',
      role: 'USER',
      emailVerified: true,
    },
  });
  console.log('✅ Created demo user:', demo.email);

  // Create sample organization
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-construction' },
    update: {},
    create: {
      name: 'ACME Construction',
      slug: 'acme-construction',
      plan: 'TEAM',
      seats: 10,
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'OWNER' },
          { userId: demo.id, role: 'MEMBER' },
        ],
      },
    },
  });
  console.log('✅ Created organization:', org.name);

  // Create sample project
  const project = await prisma.project.upsert({
    where: { id: 'sample-project-001' },
    update: {},
    create: {
      id: 'sample-project-001',
      name: 'Sample Hospital Renovation',
      description: 'NYC HHC facility renovation project for demo purposes',
      status: 'IN_PROGRESS',
      ownerId: demo.id,
      organizationId: org.id,
      settings: {
        units: 'imperial',
        scale: { value: 96, unit: 'inch' },
      },
      layers: {
        create: [
          { name: 'Flooring', color: '#3B82F6', order: 0 },
          { name: 'Walls', color: '#10B981', order: 1 },
          { name: 'Ceiling', color: '#F59E0B', order: 2 },
          { name: 'MEP', color: '#EF4444', order: 3 },
        ],
      },
    },
  });
  console.log('✅ Created sample project:', project.name);

  // Seed UPB Catalog with sample items
  const upbItems = [
    {
      contractType: 'NYC_HHC',
      division: '09',
      category: 'Finishes',
      lineNumber: '09 21 16.23 0500',
      description: 'Gypsum board, 5/8" thick, on metal studs, taped and finished',
      unit: 'SF',
      basePrice: 3.45,
      version: '2024',
      effectiveDate: new Date('2024-01-01'),
    },
    {
      contractType: 'NYC_HHC',
      division: '09',
      category: 'Finishes',
      lineNumber: '09 30 13.20 0100',
      description: 'Ceramic tile, floor, 12" x 12", thin-set mortar',
      unit: 'SF',
      basePrice: 12.85,
      version: '2024',
      effectiveDate: new Date('2024-01-01'),
    },
    {
      contractType: 'NYC_HHC',
      division: '09',
      category: 'Finishes',
      lineNumber: '09 51 00.10 0200',
      description: 'Acoustical ceiling, 2\' x 4\' lay-in panels, complete',
      unit: 'SF',
      basePrice: 8.25,
      version: '2024',
      effectiveDate: new Date('2024-01-01'),
    },
    {
      contractType: 'NYC_HHC',
      division: '09',
      category: 'Finishes',
      lineNumber: '09 91 23.10 0500',
      description: 'Paint, interior, latex, 2 coats on drywall',
      unit: 'SF',
      basePrice: 1.15,
      version: '2024',
      effectiveDate: new Date('2024-01-01'),
    },
    {
      contractType: 'NYC_HHC',
      division: '08',
      category: 'Openings',
      lineNumber: '08 11 13.10 0100',
      description: 'Steel door frame, 3\' x 7\', 16 ga, single',
      unit: 'EA',
      basePrice: 285.00,
      version: '2024',
      effectiveDate: new Date('2024-01-01'),
    },
    {
      contractType: 'NYC_HHC',
      division: '08',
      category: 'Openings',
      lineNumber: '08 14 16.10 0200',
      description: 'Wood door, flush, solid core, 3\'-0" x 7\'-0"',
      unit: 'EA',
      basePrice: 425.00,
      version: '2024',
      effectiveDate: new Date('2024-01-01'),
    },
    {
      contractType: 'NYC_HHC',
      division: '22',
      category: 'Plumbing',
      lineNumber: '22 41 13.10 0100',
      description: 'Lavatory, vitreous china, wall-hung, complete',
      unit: 'EA',
      basePrice: 1250.00,
      version: '2024',
      effectiveDate: new Date('2024-01-01'),
    },
    {
      contractType: 'NYC_HHC',
      division: '26',
      category: 'Electrical',
      lineNumber: '26 27 26.10 0100',
      description: 'Receptacle, duplex, 20A, 125V, with plate',
      unit: 'EA',
      basePrice: 85.00,
      version: '2024',
      effectiveDate: new Date('2024-01-01'),
    },
  ];

  for (const item of upbItems) {
    await prisma.uPBCatalog.upsert({
      where: {
        contractType_lineNumber_version: {
          contractType: item.contractType,
          lineNumber: item.lineNumber,
          version: item.version,
        },
      },
      update: {},
      create: item,
    });
  }
  console.log('✅ Seeded UPB catalog with', upbItems.length, 'items');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Test credentials:');
  console.log('   Admin: admin@jocstudio.dev / Admin123!');
  console.log('   Demo:  demo@jocstudio.dev / Demo1234!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
