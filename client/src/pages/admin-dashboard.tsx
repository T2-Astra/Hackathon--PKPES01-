import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  Settings
} from "lucide-react";
import { useLocation } from "wouter";

interface AdminStats {
  users: number;
  uploads: number;
  searchHistory: number;
  uploadStats: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

interface PendingUpload {
  _id: string;
  userId: string;
  resourceId: string;
  resourceType: string;
  title: string;
  status: string;
  uploadedAt: string;
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      setLocation('/');
      return;
    }
    
    fetchAdminData();
  }, [user, setLocation]);

  const fetchAdminData = async () => {
    if (!token) return;

    try {
      const [statsResponse, uploadsResponse] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/uploads', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (uploadsResponse.ok) {
        const uploadsData = await uploadsResponse.json();
        setPendingUploads(uploadsData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (uploadId: string) => {
    if (!token) return;
    
    setActionLoading(uploadId);
    try {
      const response = await fetch(`/api/admin/uploads/${uploadId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setPendingUploads(prev => prev.filter(upload => upload._id !== uploadId));
        fetchAdminData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error approving upload:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (uploadId: string, reason: string = '') => {
    if (!token) return;
    
    setActionLoading(uploadId);
    try {
      const response = await fetch(`/api/admin/uploads/${uploadId}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        setPendingUploads(prev => prev.filter(upload => upload._id !== uploadId));
        fetchAdminData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error rejecting upload:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16 md:pt-8">
        <Alert>
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16 md:pt-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 pt-16 md:pt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary" className="px-3 py-1">
          Administrator
        </Badge>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Uploads</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uploadStats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Uploads</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uploadStats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Search History</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.searchHistory}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for different admin functions */}
      <Tabs defaultValue="uploads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="uploads">Pending Uploads</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="uploads" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Uploads</CardTitle>
                <CardDescription>
                  Review and approve/reject uploaded content
                </CardDescription>
              </div>
              <Button 
                onClick={() => setLocation('/admin/uploads')}
                className="bg-primary hover:bg-primary/90"
              >
                <FileText className="w-4 h-4 mr-2" />
                View All Uploads
              </Button>
            </CardHeader>
            <CardContent>
              {pendingUploads.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No pending uploads to review
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingUploads.map((upload) => (
                    <div
                      key={upload._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <h3 className="font-medium">{upload.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Type: {upload.resourceType}</span>
                          <span>
                            Uploaded: {new Date(upload.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(upload._id)}
                          disabled={actionLoading === upload._id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(upload._id)}
                          disabled={actionLoading === upload._id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                User management features coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View platform usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
