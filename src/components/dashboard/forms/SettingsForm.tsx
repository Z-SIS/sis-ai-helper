'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Shield } from 'lucide-react';
import ApiConnectionStatus from '@/components/dashboard/api-connection-status';

interface UserProfile {
  name: string;
  email: string;
  department: string;
}

export function SettingsForm() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    department: ''
  });
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    setIsSavingProfile(false);
  };

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </CardTitle>
          <CardDescription>
            Manage your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={profile.department}
              onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
              placeholder="Enter your department"
            />
          </div>
          <Button 
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="bg-red-700 hover:bg-red-800"
          >
            {isSavingProfile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Comprehensive API Connection Status */}
      <ApiConnectionStatus />

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Application:</span>
              <p className="text-muted-foreground">SIS AI Helper v2.0</p>
            </div>
            <div>
              <span className="font-medium">Environment:</span>
              <p className="text-muted-foreground">Production</p>
            </div>
            <div>
              <span className="font-medium">Last Deployment:</span>
              <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <p className="text-muted-foreground">Operational</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}