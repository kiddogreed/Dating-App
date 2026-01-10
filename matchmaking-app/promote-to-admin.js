// Quick script to promote a user to admin
// Usage: node promote-to-admin.js your-email@example.com

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteToAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node promote-to-admin.js your-email@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`✅ User ${email} is already an ADMIN`);
      process.exit(0);
    }

    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log(`✅ Successfully promoted ${email} to ADMIN`);
    console.log('🔄 Please logout and login again for changes to take effect');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();
