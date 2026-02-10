"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Create admin user
    const adminPassword = await bcrypt_1.default.hash('Admin123!', 12);
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
    const demoPassword = await bcrypt_1.default.hash('Demo1234!', 12);
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
    // ============================================
    // Jacobi Medical Center - Fire Protection (Sample)
    // ============================================
    // Create NYC HHC organization
    const nycHhc = await prisma.organization.upsert({
        where: { slug: 'nyc-hhc' },
        update: {},
        create: {
            name: 'NYC Health + Hospitals',
            slug: 'nyc-hhc',
            plan: 'ENTERPRISE',
            seats: 100,
            ownerId: admin.id,
        },
    });
    console.log('✅ Created NYC HHC organization:', nycHhc.name);
    // Create Jacobi FP project
    const jacobiFp = await prisma.project.upsert({
        where: { id: 'jacobi-fp-sample-001' },
        update: {},
        create: {
            id: 'jacobi-fp-sample-001',
            name: 'Jacobi Medical Center - Fire Protection',
            description: 'NYC HHC Fire Protection takeoff - 15th Floor renovation (SAMPLE DATA)',
            status: 'IN_PROGRESS',
            ownerId: demo.id,
            organizationId: nycHhc.id,
            settings: {
                units: 'imperial',
                scale: { value: 96, unit: 'inch' },
                agency: 'NYC HHC',
                division: '21 - Fire Protection',
                location: 'Bronx, NY',
                floor: '15th Floor',
                is_demo: true,
                coefficient: { location: 'Bronx (NYC HHC)', value: 1.20 },
            },
            layers: {
                create: [
                    { id: 'jacobi-layer-sprinkler', name: 'Sprinkler Systems', color: '#DC2626', order: 0 },
                    { id: 'jacobi-layer-piping', name: 'Piping', color: '#2563EB', order: 1 },
                    { id: 'jacobi-layer-valves', name: 'Valves & Connections', color: '#7C3AED', order: 2 },
                    { id: 'jacobi-layer-alarm', name: 'Fire Alarm', color: '#F97316', order: 3 },
                ],
            },
        },
    });
    console.log('✅ Created Jacobi FP project:', jacobiFp.name);
    // Create Jacobi measurements
    const jacobiMeasurements = [
        { id: 'jacobi-meas-001', type: 'COUNT', label: 'Sprinkler Heads (Pendant)', quantity: 47, unit: 'EA', color: '#DC2626', layerId: 'jacobi-layer-sprinkler' },
        { id: 'jacobi-meas-002', type: 'COUNT', label: 'Sprinkler Heads (Upright)', quantity: 12, unit: 'EA', color: '#DC2626', layerId: 'jacobi-layer-sprinkler' },
        { id: 'jacobi-meas-003', type: 'LENGTH', label: 'Main Run Pipe 3/4" BI', quantity: 234, unit: 'LF', color: '#2563EB', layerId: 'jacobi-layer-piping' },
        { id: 'jacobi-meas-004', type: 'LENGTH', label: 'Branch Line 1/2" BI', quantity: 456, unit: 'LF', color: '#3B82F6', layerId: 'jacobi-layer-piping' },
        { id: 'jacobi-meas-005', type: 'COUNT', label: 'OS&Y Valve 6"', quantity: 2, unit: 'EA', color: '#7C3AED', layerId: 'jacobi-layer-valves' },
        { id: 'jacobi-meas-006', type: 'COUNT', label: 'Butterfly Valve 4"', quantity: 4, unit: 'EA', color: '#7C3AED', layerId: 'jacobi-layer-valves' },
        { id: 'jacobi-meas-007', type: 'COUNT', label: "Inspector's Test Connection", quantity: 4, unit: 'EA', color: '#7C3AED', layerId: 'jacobi-layer-valves' },
        { id: 'jacobi-meas-008', type: 'COUNT', label: 'Fire Alarm Pull Station', quantity: 8, unit: 'EA', color: '#EF4444', layerId: 'jacobi-layer-alarm' },
        { id: 'jacobi-meas-009', type: 'COUNT', label: 'Smoke Detector', quantity: 24, unit: 'EA', color: '#F97316', layerId: 'jacobi-layer-alarm' },
        { id: 'jacobi-meas-010', type: 'COUNT', label: 'Horn/Strobe Combo', quantity: 16, unit: 'EA', color: '#F59E0B', layerId: 'jacobi-layer-alarm' },
    ];
    for (const m of jacobiMeasurements) {
        await prisma.measurement.upsert({
            where: { id: m.id },
            update: {},
            create: {
                id: m.id,
                type: m.type,
                label: m.label,
                color: m.color,
                geometry: { points: [], pageIndex: 0 },
                quantity: m.quantity,
                unit: m.unit,
                projectId: jacobiFp.id,
                layerId: m.layerId,
                createdById: demo.id,
            },
        });
    }
    console.log('✅ Created', jacobiMeasurements.length, 'Jacobi measurements');
    // Create JOC Line Items with pricing (coefficient: 1.20)
    const jacobiLineItems = [
        { measurementId: 'jacobi-meas-001', upbCode: '21 10 00.10 0100', description: 'Sprinkler Head, Pendant, 1/2" NPT, Quick Response', quantity: 47, unit: 'EA', unitPrice: 45.00, totalPrice: 2538.00 },
        { measurementId: 'jacobi-meas-002', upbCode: '21 10 00.10 0200', description: 'Sprinkler Head, Upright, 1/2" NPT, Standard Response', quantity: 12, unit: 'EA', unitPrice: 48.00, totalPrice: 691.20 },
        { measurementId: 'jacobi-meas-003', upbCode: '21 10 00.20 0300', description: 'Pipe, Black Iron, 3/4", Schedule 40, Threaded', quantity: 234, unit: 'LF', unitPrice: 8.50, totalPrice: 2386.80 },
        { measurementId: 'jacobi-meas-004', upbCode: '21 10 00.20 0200', description: 'Pipe, Black Iron, 1/2", Schedule 40, Threaded', quantity: 456, unit: 'LF', unitPrice: 6.25, totalPrice: 3420.00 },
        { measurementId: 'jacobi-meas-005', upbCode: '21 20 00.10 0600', description: 'Valve, OS&Y, 6", Flanged, 175 PSI', quantity: 2, unit: 'EA', unitPrice: 750.00, totalPrice: 1800.00 },
        { measurementId: 'jacobi-meas-006', upbCode: '21 20 00.10 0400', description: 'Valve, Butterfly, 4", Grooved, Supervised', quantity: 4, unit: 'EA', unitPrice: 425.00, totalPrice: 2040.00 },
        { measurementId: 'jacobi-meas-007', upbCode: '21 20 00.20 0100', description: "Inspector Test Connection, 1\", w/Sight Glass", quantity: 4, unit: 'EA', unitPrice: 120.00, totalPrice: 576.00 },
        { measurementId: 'jacobi-meas-008', upbCode: '21 30 00.10 0100', description: 'Pull Station, Manual, Single Action, Red', quantity: 8, unit: 'EA', unitPrice: 85.00, totalPrice: 816.00 },
        { measurementId: 'jacobi-meas-009', upbCode: '21 30 00.20 0100', description: 'Smoke Detector, Photoelectric, Ceiling Mount', quantity: 24, unit: 'EA', unitPrice: 65.00, totalPrice: 1872.00 },
        { measurementId: 'jacobi-meas-010', upbCode: '21 30 00.30 0100', description: 'Horn/Strobe, Wall Mount, 24VDC, Red', quantity: 16, unit: 'EA', unitPrice: 95.00, totalPrice: 1824.00 },
    ];
    for (const item of jacobiLineItems) {
        await prisma.jOCLineItem.create({
            data: {
                ...item,
                coefficients: { location: 1.20 },
                createdById: demo.id,
            },
        });
    }
    console.log('✅ Created', jacobiLineItems.length, 'Jacobi JOC line items');
    console.log('   📊 Total (with 1.20 coefficient): $17,964.00');
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
        // Division 21 - Fire Protection
        {
            contractType: 'NYC_HHC',
            division: '21',
            category: 'Fire Suppression',
            lineNumber: '21 10 00.10 0100',
            description: 'Sprinkler Head, Pendant, 1/2" NPT, Quick Response',
            unit: 'EA',
            basePrice: 45.00,
            version: '2024',
            effectiveDate: new Date('2024-01-01'),
        },
        {
            contractType: 'NYC_HHC',
            division: '21',
            category: 'Fire Suppression',
            lineNumber: '21 10 00.10 0200',
            description: 'Sprinkler Head, Upright, 1/2" NPT, Standard Response',
            unit: 'EA',
            basePrice: 48.00,
            version: '2024',
            effectiveDate: new Date('2024-01-01'),
        },
        {
            contractType: 'NYC_HHC',
            division: '21',
            category: 'Fire Suppression',
            lineNumber: '21 10 00.20 0200',
            description: 'Pipe, Black Iron, 1/2", Schedule 40, Threaded',
            unit: 'LF',
            basePrice: 6.25,
            version: '2024',
            effectiveDate: new Date('2024-01-01'),
        },
        {
            contractType: 'NYC_HHC',
            division: '21',
            category: 'Fire Suppression',
            lineNumber: '21 10 00.20 0300',
            description: 'Pipe, Black Iron, 3/4", Schedule 40, Threaded',
            unit: 'LF',
            basePrice: 8.50,
            version: '2024',
            effectiveDate: new Date('2024-01-01'),
        },
        {
            contractType: 'NYC_HHC',
            division: '21',
            category: 'Fire Suppression',
            lineNumber: '21 20 00.10 0400',
            description: 'Valve, Butterfly, 4", Grooved, Supervised',
            unit: 'EA',
            basePrice: 425.00,
            version: '2024',
            effectiveDate: new Date('2024-01-01'),
        },
        {
            contractType: 'NYC_HHC',
            division: '21',
            category: 'Fire Suppression',
            lineNumber: '21 20 00.10 0600',
            description: 'Valve, OS&Y, 6", Flanged, 175 PSI',
            unit: 'EA',
            basePrice: 750.00,
            version: '2024',
            effectiveDate: new Date('2024-01-01'),
        },
        {
            contractType: 'NYC_HHC',
            division: '21',
            category: 'Fire Suppression',
            lineNumber: '21 20 00.20 0100',
            description: 'Inspector Test Connection, 1", w/Sight Glass',
            unit: 'EA',
            basePrice: 120.00,
            version: '2024',
            effectiveDate: new Date('2024-01-01'),
        },
        {
            contractType: 'NYC_HHC',
            division: '21',
            category: 'Fire Alarm',
            lineNumber: '21 30 00.10 0100',
            description: 'Pull Station, Manual, Single Action, Red',
            unit: 'EA',
            basePrice: 85.00,
            version: '2024',
            effectiveDate: new Date('2024-01-01'),
        },
        {
            contractType: 'NYC_HHC',
            division: '21',
            category: 'Fire Alarm',
            lineNumber: '21 30 00.20 0100',
            description: 'Smoke Detector, Photoelectric, Ceiling Mount',
            unit: 'EA',
            basePrice: 65.00,
            version: '2024',
            effectiveDate: new Date('2024-01-01'),
        },
        {
            contractType: 'NYC_HHC',
            division: '21',
            category: 'Fire Alarm',
            lineNumber: '21 30 00.30 0100',
            description: 'Horn/Strobe, Wall Mount, 24VDC, Red',
            unit: 'EA',
            basePrice: 95.00,
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
//# sourceMappingURL=seed.js.map