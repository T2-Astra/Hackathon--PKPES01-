import { connectToMongoDB, getDatabase } from './mongodb';
import { createUser } from './auth';

async function createMyAdminAccount() {
  try {
    await connectToMongoDB();
    
    const adminData = {
      email: 'krishmhatre1805@gmail.com',
      password: 'krishmhatre1805@gmail.com',
      firstName: 'Krish',
      lastName: 'Mhatre',
      isAdmin: true,
    };

    console.log('Creating admin account for:', adminData.email);
    
    const admin = await createUser(adminData);
    console.log('✅ Admin account created successfully!');
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

createMyAdminAccount();
