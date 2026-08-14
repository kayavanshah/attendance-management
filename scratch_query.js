const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.admin.findMany().then(admins => {
  console.log(JSON.stringify(admins, null, 2));
}).finally(() => {
  prisma.$disconnect();
});
