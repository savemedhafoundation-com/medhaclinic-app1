import { PrismaClient, AdminRole } from '@prisma/client';

const prisma = new PrismaClient();

const uid = process.env.ADMIN_FIREBASE_UID;
const email = process.env.ADMIN_EMAIL;
const role = process.env.ADMIN_ROLE ?? AdminRole.super_admin;

if (!uid || !email) {
  console.error('Set ADMIN_FIREBASE_UID and ADMIN_EMAIL before running this script.');
  process.exit(1);
}

if (!Object.values(AdminRole).includes(role)) {
  console.error(`ADMIN_ROLE must be one of: ${Object.values(AdminRole).join(', ')}`);
  process.exit(1);
}

await prisma.adminUser.upsert({
  where: { uid },
  update: { email, role, active: true },
  create: { uid, email, role, active: true },
});

console.log(`Seeded admin ${email} (${uid}) with role ${role}.`);
await prisma.$disconnect();
