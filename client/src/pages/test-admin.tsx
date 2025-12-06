import { useAuth } from "@/hooks/useAuthContext";

export default function TestAdminPage() {
  const { user, token } = useAuth();
  
  return (
    <div className="container mx-auto py-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold mb-4">🎉 Test Admin Page</h1>
        <p className="text-lg">This is a simple test page to verify routing works.</p>
        <p className="text-sm text-gray-500">URL: /test-admin</p>
        
        <div className="bg-gray-100 p-4 rounded-lg text-left max-w-md mx-auto">
          <h3 className="font-bold mb-2">🔍 Debug Info:</h3>
          <p><strong>User:</strong> {user ? `${user.firstName} ${user.lastName}` : 'Not loaded'}</p>
          <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
          <p><strong>Is Admin:</strong> {user?.isAdmin ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Token:</strong> {token ? '✅ Present' : '❌ Missing'}</p>
        </div>
        
        <div className="space-x-4"> 
          <a href="/admin" className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Go to Admin Dashboard
          </a>
          <a href="/admin/uploads" className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Go to Admin Uploads
          </a>
        </div>
      </div>
    </div>
  );
}
