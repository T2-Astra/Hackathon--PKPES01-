import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Shield,
  Download,
  Search,
  Filter,
  User,
  Calendar,
  FileCheck,
  AlertTriangle,
  UserPlus,
  Crown
} from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface Upload {
  _id: string;
  userId: string;
  resourceId: string;
  resourceType: string;
  title: string;
  subject?: string;
  department?: string;
  semester?: string;
  year?: string;
  session?: string;
  marks?: string;
  chapter?: string;
  description?: string;
  filePath: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  approvedBy?: string;
  rejectedBy?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdminUploadsPage() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Debug logging
  console.log('🚀 AdminUploadsPage rendered');
  console.log('👤 User:', user);
  console.log('🔒 User.isAdmin:', user?.isAdmin);
  console.log('🔑 Token:', token ? 'Present' : 'Missing');
  console.log('📍 Current URL:', window.location.href);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // User management state
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [promotionMessage, setPromotionMessage] = useState("");
  const [promotionError, setPromotionError] = useState("");

  useEffect(() => {
    // Don't redirect if user data is still loading
    if (!user) {
      console.log('🔄 User data still loading...');
      return;
    }
    
    if (!user.isAdmin) {
      console.log('❌ User is not admin, redirecting...');
      setLocation('/');
      return;
    }
    
    console.log('✅ User is admin, fetching uploads...');
    fetchUploads();
  }, [user, setLocation, statusFilter, searchTerm]);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/uploads?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUploads(data);
        
        // Calculate stats
        const stats = {
          total: data.length,
          pending: data.filter((u: Upload) => u.status === 'pending').length,
          approved: data.filter((u: Upload) => u.status === 'approved').length,
          rejected: data.filter((u: Upload) => u.status === 'rejected').length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (uploadId: string) => {
    try {
      console.log(`🟢 Approving upload: ${uploadId}`);
      const response = await fetch(`/api/admin/uploads/${uploadId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Upload approved successfully:', responseData);
        
        // Refresh the uploads list from the server to get the real data
        await fetchUploads();
        
        // Show success message
        alert('✅ Upload approved successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to approve upload:', errorData);
        alert('❌ Failed to approve upload: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error approving upload:', error);
      alert('❌ Error approving upload. Please try again.');
    }
  };

  const handleReject = async (uploadId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || reason.trim() === '') {
      alert('❌ Rejection reason is required');
      return;
    }

    try {
      console.log(`🔴 Rejecting upload: ${uploadId} with reason: ${reason}`);
      const response = await fetch(`/api/admin/uploads/${uploadId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Upload rejected successfully:', responseData);
        
        // Refresh the uploads list from the server to get the real data
        await fetchUploads();
        
        // Show success message
        alert('✅ Upload rejected successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to reject upload:', errorData);
        alert('❌ Failed to reject upload: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error rejecting upload:', error);
      alert('❌ Error rejecting upload. Please try again.');
    }
  };

  const getStatusBadge = (status: string, upload?: any) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />✅ Approved</Badge>;
      case 'rejected':
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-300">
              <XCircle className="w-3 h-3 mr-1" />❌ Rejected
            </Badge>
            {upload?.rejectionReason && (
              <p className="text-xs text-red-600 italic">Reason: {upload.rejectionReason}</p>
            )}
          </div>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'question-paper':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'study-note':
        return <FileCheck className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoteEmail.trim()) {
      setPromotionError("Please enter an email address");
      return;
    }
    
    setPromoting(true);
    setPromotionMessage("");
    setPromotionError("");
    
    try {
      console.log(`👑 Promoting user: ${promoteEmail}`);
      const response = await fetch('/api/admin/promote-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: promoteEmail.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ User promoted successfully:', data);
        setPromotionMessage(`✅ Successfully promoted ${data.user.firstName} ${data.user.lastName} (${data.user.email}) to administrator!`);
        setPromoteEmail("");
      } else {
        console.error('Failed to promote user:', data);
        setPromotionError(data.message || 'Failed to promote user');
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      setPromotionError('An error occurred while promoting the user. Please try again.');
    } finally {
      setPromoting(false);  
    }
  };

  // Show loading if user data is not loaded yet OR if uploads are loading
  if (!user || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {!user ? 'Loading user data...' : 'Loading uploads...'}
            </p>
            <p className="text-xs text-gray-500 mt-2">Debug: Admin Uploads Page Loading</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Admin access required. Please login with an administrator account.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 pt-16 md:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📚 Admin Panel</h1>
          <p className="text-muted-foreground">Manage uploads and user permissions</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Shield className="w-4 h-4 mr-1" />
          Administrator
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="uploads" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="uploads" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Review Uploads
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            User Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="uploads" className="space-y-6">


      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status ({stats.total})</SelectItem>
                  <SelectItem value="pending">⏳ Pending ({stats.pending})</SelectItem>
                  <SelectItem value="approved">✅ Approved ({stats.approved})</SelectItem>
                  <SelectItem value="rejected">❌ Rejected ({stats.rejected})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={fetchUploads} 
                className="w-full"
                variant="outline"
              >
                <Search className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploads List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Files ({uploads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {uploads.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Uploads Found</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter === 'all' ? 
                  "No files have been uploaded yet." : 
                  `No ${statusFilter} uploads found.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {uploads.map((upload) => (
                <Card key={upload._id} className={cn(
                  "group hover:shadow-lg transition-all duration-200 border-0 shadow-md aspect-square flex flex-col",
                  upload.status === 'approved' && "bg-gradient-to-br from-green-50/50 to-emerald-50/30 border-t-4 border-t-green-500",
                  upload.status === 'rejected' && "bg-gradient-to-br from-red-50/50 to-rose-50/30 border-t-4 border-t-red-500",
                  upload.status === 'pending' && "bg-gradient-to-br from-yellow-50/50 to-amber-50/30 border-t-4 border-t-yellow-500"
                )}>
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Header Section */}
                    <div className="p-4 flex-1 flex flex-col min-h-0">
                      {/* Status Badge */}
                      <div className="flex justify-end mb-2 flex-shrink-0">
                        {getStatusBadge(upload.status, upload)}
                      </div>
                      
                      {/* File Icon */}
                      <div className="flex justify-center mb-3 flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          {getResourceTypeIcon(upload.resourceType)}
                        </div>
                      </div>
                      
                      {/* Title and Type */}
                      <div className="text-center mb-3 flex-shrink-0">
                        <h3 className="font-semibold text-base text-foreground mb-1 line-clamp-2">
                          {upload.title}
                        </h3>
                        <p className="text-xs text-muted-foreground capitalize font-medium">
                          {upload.resourceType.replace('-', ' ')}
                        </p>
                      </div>

                      {/* Metadata Section */}
                      <div className="space-y-2 text-xs text-muted-foreground flex-shrink-0">
                        <div className="flex items-center justify-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="truncate">
                            {upload.user ? 
                              `${upload.user.firstName} ${upload.user.lastName}` : 
                              'Unknown User'
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(upload.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Spacer for non-rejected cards */}
                      {upload.status !== 'rejected' && <div className="flex-1 min-h-0"></div>}

                      {/* Rejection Reason */}
                      {upload.status === 'rejected' && upload.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-100/50 border border-red-200 rounded text-xs text-red-700 flex-shrink-0 overflow-hidden">
                          <div className="break-words line-clamp-2">
                            <strong>Rejected:</strong> {upload.rejectionReason}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Footer */}
                    <div className="p-3 bg-muted/20 border-t border-border/50 mt-auto flex-shrink-0">
                      {upload.status === 'pending' ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-7 flex-1"
                            onClick={() => handleApprove(upload._id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2 py-1 h-7 flex-1"
                            onClick={() => handleReject(upload._id)}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-background hover:bg-muted border-border/60 text-xs px-2 py-1 h-7"
                          onClick={() => {
                            // Open the file in a new tab for preview
                            if (upload.filePath) {
                              window.open(upload.filePath, '_blank');
                            } else {
                              alert('❌ File path not available');
                            }
                          }}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Message */}
      {uploads.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              📋 Showing {uploads.length} upload(s) • 
              ⏳ {stats.pending} pending review • 
              ✅ {stats.approved} approved • 
              ❌ {stats.rejected} rejected
            </p>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Management Section - Restricted Access */}
          {user?.email === 'krishmhatre1805@gmail.com' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Promote User to Administrator
                </CardTitle>
                <CardDescription>
                  Enter a user's email address to promote them to administrator status. 
                  They will gain access to the admin panel and all administrative features.
                </CardDescription>
              </CardHeader>
              <CardContent>
              <form onSubmit={handlePromoteUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="md:col-span-2">
                    <Label htmlFor="promote-email">User Email Address</Label>
                    <Input
                      id="promote-email"
                      type="email"
                      placeholder="Enter user's email address..."
                      value={promoteEmail}
                      onChange={(e) => setPromoteEmail(e.target.value)}
                      disabled={promoting}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Button 
                      type="submit" 
                      disabled={promoting || !promoteEmail.trim()}
                      className="w-full"
                    >
                      {promoting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Promoting...
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Promote to Admin
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Success Message */}
                {promotionMessage && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {promotionMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Message */}
                {promotionError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {promotionError}
                    </AlertDescription>
                  </Alert>
                )}
              </form>

              {/* Information Card */}
              <div className="mt-6 p-4 bg-accent/50 border border-border rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Administrator Privileges</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Review and approve/reject uploaded study materials</li>
                      <li>• Delete approved resources from the system</li>
                      <li>• Access admin dashboard and analytics</li>
                      <li>• Promote other users to administrator status</li>
                      <li>• Manage system settings and configurations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  User Management - Access Restricted
                </CardTitle>
                <CardDescription>
                  User management features are restricted to the super administrator only.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-2">Access Denied</h4>
                      <p className="text-sm text-yellow-800">
                        Only the super administrator (krishmhatre1805@gmail.com) can access user management features.
                        If you need to promote users to administrator status, please contact the super administrator.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}