import { connectToMongoDB, getDatabase } from './mongodb';
import { createUser } from './auth';

async function createAdminUser() {
  try {
    await connectToMongoDB();
    
    const adminData = {
      email: 'admin@polylearnhub.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
    };

    const admin = await createUser(adminData);
    console.log('Admin user created successfully:', {
      id: admin.id,
      email: admin.email,
      name: `${admin.firstName} ${admin.lastName}`,
      isAdmin: admin.isAdmin,
    });

    process.exit(0);
  } catch (error: any) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
