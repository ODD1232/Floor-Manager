// backend/src/controllers/rolesController.js
const prisma = require('../config/prisma');

// ── GET /api/roles-mgmt  — all roles with their permissions ──────────────────
const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch roles', error: err.message });
  }
};

// ── GET /api/roles-mgmt/permissions  — all available permissions ─────────────
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({ orderBy: [{ group: 'asc' }, { label: 'asc' }] });
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch permissions', error: err.message });
  }
};

// ── POST /api/roles-mgmt  — create a new role ────────────────────────────────
const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Role name required' });

    const role = await prisma.role.create({ data: { name: name.trim().toUpperCase() } });
    res.status(201).json({ message: 'Role created', role });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ message: 'Role name already exists' });
    res.status(500).json({ message: 'Failed to create role', error: err.message });
  }
};

// ── PUT /api/roles-mgmt/:id/permissions  — set permissions for a role ────────
// body: { permissionKeys: ['recruitment.round3.view', ...] }
const setRolePermissions = async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    const { permissionKeys } = req.body; // array of permission keys

    if (!Array.isArray(permissionKeys)) {
      return res.status(400).json({ message: 'permissionKeys must be an array' });
    }

    // Verify role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) return res.status(404).json({ message: 'Role not found' });

    // Get permission ids for the given keys
    const perms = await prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
    });

    // Delete all existing permissions for this role
    await prisma.rolePermission.deleteMany({ where: { roleId } });

    // Re-create selected ones
    if (perms.length > 0) {
      await prisma.rolePermission.createMany({
        data: perms.map(p => ({ roleId, permissionId: p.id })),
        skipDuplicates: true,
      });
    }

    res.json({ message: `Permissions updated for ${role.name}`, count: perms.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update permissions', error: err.message });
  }
};

// ── DELETE /api/roles-mgmt/:id  — delete a role ──────────────────────────────
const deleteRole = async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) return res.status(404).json({ message: 'Role not found' });

    // Prevent deleting super_admin
    if (role.name === 'super_admin') {
      return res.status(403).json({ message: 'Cannot delete super_admin role' });
    }

    await prisma.role.delete({ where: { id: roleId } });
    res.json({ message: `Role ${role.name} deleted` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete role', error: err.message });
  }
};

module.exports = { getRoles, getAllPermissions, createRole, setRolePermissions, deleteRole };