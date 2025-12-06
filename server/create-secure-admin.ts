import { connectToMongoDB, getDatabase } from './mongodb';
import { createUser } from './auth';

async function createSecureAdmin() {
  try {
    await connectToMongoDB();
    
    // Get admin credentials from environment variables or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@polylearnhub.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdminPass123!';
    const adminFirstName = process.env.ADMIN_FIRSTNAME || 'Super';
    const adminLastName = process.env.ADMIN_LASTNAME || 'Admin';

    const adminData = {
      email: adminEmail,
      password: adminPassword,
      firstName: adminFirstName,
      lastName: adminLastName,
      isAdmin: true,
    };

    console.log('Creating secure admin account...');
    
    const admin = await createUser(adminData);
    console.log('✅ Secure admin account created successfully!');
    console.log('Admin Details:', {
      id: admin.id,
      email: admin.email,
      name: `${admin.firstName} ${admin.lastName}`,
      isAdmin: admin.isAdmin,
    });
    
    console.log('\n🔐 Admin Login Credentials:');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log('\n🌐 Access Admin Dashboard at: /admin');
    console.log('\n💡 Tip: Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables for custom credentials');

    process.exit(0);
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Admin account already exists with this email.');
      console.log('You can login with your existing credentials.');
    } else {
      console.error('❌ Error creating admin account:', error.message);
    }
    process.exit(1);
  }
}

createSecureAdmin();
