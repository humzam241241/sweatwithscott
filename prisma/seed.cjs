const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

(async () => {
  const email = "admin@cave.boxing";
  const password = "SweatAdmin123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Admin", passwordHash },
  });

  console.log(`Seeded admin ? ${email} / ${password}`);
  await prisma.$disconnect();
})();
