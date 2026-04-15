const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [
      { name: 'super_admin' },
      { name: 'operator' },
      { name: 'viewer' }
    ],
    skipDuplicates: true
  });

  console.log('✅ Roles seeded: super_admin, operator, viewer');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });