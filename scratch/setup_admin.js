const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('@Kayavan1011', 10);
  const admin = await prisma.admin.create({
    data: {
      name: 'Super Admin',
      email: 'kayavanshah7@gmail.com',
      password_hash: hashedPassword,
      role: 'SUPER_ADMIN'
    }
  });
  console.log('Admin successfully created:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
