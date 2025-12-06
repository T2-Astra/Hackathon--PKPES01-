import { useState } from "react";
import { useAuth } from "@/hooks/useAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Calendar, Shield, Edit3, Save, X } from "lucide-react";
import { useLocation } from "wouter";

export default function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  console.log('UserProfile component rendered, user:', user);

  // This component is only rendered for authenticated users
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16 md:pt-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading user data...</h1>
          <p className="text-muted-foreground">Please wait while we load your profile...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    // TODO: Implement profile update API call
    console.log('Profile update:', editData);
    setIsEditing(false);
    // For now, just close editing mode
  };

  const handleCancel = () => {
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
    setIsEditing(false);
  };

  const getInitials = () => {
    if (!user) return "G";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-16 md:pt-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {user.isAdmin && (
              <Badge variant="secondary" className="px-3 py-1">
                <Shield className="w-3 h-3 mr-1" />
                Administrator
              </Badge>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Your personal information and account details
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF (max. 1MB)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  />
                ) : (
                  <p className="text-lg font-medium">{user.firstName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  />
                ) : (
                  <p className="text-lg font-medium">{user.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="flex-1"
                  />
                ) : (
                  <p className="text-lg">{user.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <Badge variant={user.isAdmin ? "default" : "secondary"}>
                  {user.isAdmin ? "Administrator" : "User"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>User ID</Label>
              <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Account created: Member since joining PolyLearnHub
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <h4 className="font-medium">Account Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Download My Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
