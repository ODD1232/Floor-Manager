// backend/src/seed_permissions.js
// Run: node src/seed_permissions.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── All permissions in the system ─────────────────────────────────────────────
// Add new ones here as you add features
const PERMISSIONS = [
  // Recruitment
  { key: 'recruitment.view',               label: 'View Recruitment Module',       group: 'Recruitment' },
  { key: 'recruitment.round1.create',      label: 'Create New Candidate (Round 1)', group: 'Recruitment' },
  { key: 'recruitment.round2_test.view', label: 'View Round 2.1 — Test Queue', group: 'Recruitment' },
  { key: 'recruitment.round2_test.update', label: 'Update Round 2.1 Test Results', group: 'Recruitment' },
  { key: 'recruitment.round2_int.view',    label: 'View Round 2.2 — Interview Panel', group: 'Recruitment' },
  { key: 'recruitment.round2_int.update',  label: 'Update Round 2.2 Interview Results', group: 'Recruitment' },
  { key: 'recruitment.round3.view',        label: 'View Round 3 — Dept Approval',  group: 'Recruitment' },
  { key: 'recruitment.round3.approve',     label: 'Approve Candidates (Round 3)',  group: 'Recruitment' },

  // User Management
  { key: 'users.view',   label: 'View Users',   group: 'User Management' },
  { key: 'users.create', label: 'Create Users', group: 'User Management' },
  { key: 'users.edit',   label: 'Edit Users',   group: 'User Management' },
  { key: 'users.delete', label: 'Delete Users', group: 'User Management' },

  // Roles & Permissions
  { key: 'roles.view',   label: 'View Roles & Permissions', group: 'Roles & Permissions' },
  { key: 'roles.manage', label: 'Manage Role Permissions',  group: 'Roles & Permissions' },

  // Settings
  { key: 'settings.view',   label: 'View Settings',   group: 'Settings' },
  { key: 'settings.manage', label: 'Manage Settings', group: 'Settings' },
];

// ── Roles that get ALL permissions by default ──────────────────────────────────
const SUPER_ADMIN_ROLES = ['super_admin'];

// ── Roles that get Round 3 view + approve ─────────────────────────────────────
const MANAGER_PERMS = [
  'recruitment.view',
  'recruitment.round3.view',
  'recruitment.round3.approve',
  'recruitment.round2_int.view',
  'recruitment.round2_int.update',
];

async function main() {
  console.log('Seeding permissions...');

  // Upsert all permissions
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where:  { key: p.key },
      update: { label: p.label, group: p.group },
      create: p,
    });
  }
  console.log(`✅ ${PERMISSIONS.length} permissions upserted`);

  // Give super_admin ALL permissions
  const allPerms = await prisma.permission.findMany();
  for (const roleName of SUPER_ADMIN_ROLES) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) { console.warn(`Role ${roleName} not found, skipping`); continue; }

    for (const perm of allPerms) {
      await prisma.rolePermission.upsert({
        where:  { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
    console.log(`✅ ${roleName} granted all ${allPerms.length} permissions`);
  }

  // Give 'operator' role the manager-level recruitment perms as example
  const operatorRole = await prisma.role.findUnique({ where: { name: 'operator' } });
  if (operatorRole) {
    for (const key of MANAGER_PERMS) {
      const perm = await prisma.permission.findUnique({ where: { key } });
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where:  { roleId_permissionId: { roleId: operatorRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: operatorRole.id, permissionId: perm.id },
      });
    }
    console.log(`✅ operator granted manager-level recruitment permissions`);
  }

  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());