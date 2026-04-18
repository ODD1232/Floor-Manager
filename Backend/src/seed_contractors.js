// Backend/src/seed_contractors.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CONTRACTORS = [
  { name: 'KIRAN SERVICES Pvt Ltd' },
  { name: 'SRIVARI ENTERPRICES Services' },
  { name: 'SREE VEERANJANEVA MANPOWER SERVICES' },
  { name: 'SAPTAGIRI ENTERPRICES ' },
  { name: 'HSN TECH SOLUITONS' },
  { name: 'QUESS CORP LTD' }
];

async function main() {
  console.log('🌱 Seeding contractors...');

  for (const contractor of CONTRACTORS) {
    await prisma.contractor.upsert({
      where: { name: contractor.name },
      update: {},
      create: contractor,
    });

    console.log(`✅ Added/exists: ${contractor.name}`);
  }

  const total = await prisma.contractor.count();
  console.log(`🎉 Contractors seeding completed. Total contractors: ${total}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed contractors error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });