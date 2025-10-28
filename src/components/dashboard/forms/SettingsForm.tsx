'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, XCircle, AlertCircle, User, Mail, Building, Key, Database, Bot, Shield } from 'lucide-react';
import ApiConnectionStatus from '@/components/dashboard/api-connection-status';

interface UserProfile {
  name: string;
  email: string;
  department: string;
}

interface ApiStatus {
  name: string;
  displayName: string;
  status: 'loading' | 'success' | 'error' | 'warning';
  message: string;
  lastChecked: string;
  environments: string[];
  maskedValue: string;
  testResult?: {
    success: boolean;
    message: string;
    responseTime?: number;
  };
}

export function SettingsForm() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    department: ''
  });
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([
    {
      name: 'GOOGLE_GENERATIVE_AI_API_KEY',
      displayName: 'Google Generative AI',
      status: 'loading',
      message: 'Checking...',
      lastChecked: '',
      environments: ['All Environments'],
      maskedValue: '•••••••••••••••'
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      displayName: 'Supabase URL',
      status: 'loading',
      message: 'Checking...',
      lastChecked: '',
      environments: ['All Environments'],
      maskedValue: '•••••••••••••••'
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      displayName: 'Supabase Anonymous Key',
      status: 'loading',
      message: 'Checking...',
      lastChecked: '',
      environments: ['All Environments'],
      maskedValue: '•••••••••••••••'
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      displayName: 'Supabase Service Role Key',
      status: 'loading',
      message: 'Checking...',
      lastChecked: '',
      environments: ['All Environments'],
      maskedValue: '•••••••••••••••'
    },
    {
      name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      displayName: 'Clerk Publishable Key',
      status: 'loading',
      message: 'Checking...',
      lastChecked: '',
      environments: ['All Environments'],
      maskedValue: '•••••••••••••••'
    },
    {
      name: 'CLERK_SECRET_KEY',
      displayName: 'Clerk Secret Key',
      status: 'loading',
      message: 'Checking...',
      lastChecked: '',
      environments: ['All Environments'],
      maskedValue: '•••••••••••••••'
    }
  ]);

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Check API statuses on component mount
  useEffect(() => {
    checkAllApiStatuses();
  }, []);

  const checkAllApiStatuses = async () => {
    // Check Supabase
    await checkSupabaseStatus();
    
    // Check Google AI
    await checkGoogleAIStatus();
    
    // Check Clerk (basic validation)
    checkClerkStatus();
    
    // Update last checked time
    const now = new Date().toLocaleString();
    setApiStatuses(prev => prev.map(api => ({
      ...api,
      lastChecked: now
    })));
  };

  const checkSupabaseStatus = async () => {
    try {
      const response = await fetch('/api/supabase/check');
      const data = await response.json();
      
      if (data.status === 'success' && data.connection.status === 'connected') {
        updateApiStatus('NEXT_PUBLIC_SUPABASE_URL', 'success', 'Connected and working');
        updateApiStatus('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'success', 'Valid authentication');
        if (data.config.hasServiceKey) {
          updateApiStatus('SUPABASE_SERVICE_ROLE_KEY', 'success', 'Service role available');
        } else {
          updateApiStatus('SUPABASE_SERVICE_ROLE_KEY', 'warning', 'Service role not configured');
        }
      } else {
        updateApiStatus('NEXT_PUBLIC_SUPABASE_URL', 'error', 'Connection failed');
        updateApiStatus('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'error', 'Invalid or missing key');
        updateApiStatus('SUPABASE_SERVICE_ROLE_KEY', 'error', 'Connection failed');
      }
    } catch (error) {
      updateApiStatus('NEXT_PUBLIC_SUPABASE_URL', 'error', 'Unable to connect');
      updateApiStatus('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'error', 'Connection failed');
      updateApiStatus('SUPABASE_SERVICE_ROLE_KEY', 'error', 'Connection failed');
    }
  };

  const checkGoogleAIStatus = async () => {
    try {
      const response = await fetch('/api/test/google-api');
      const data = await response.json();
      
      if (data.success) {
        updateApiStatus('GOOGLE_GENERATIVE_AI_API_KEY', 'success', 'API key valid and working', {
          success: true,
          message: 'Model initialization successful',
          responseTime: data.responseTime
        });
      } else {
        updateApiStatus('GOOGLE_GENERATIVE_AI_API_KEY', 'error', 'API key invalid or quota exceeded');
      }
    } catch (error) {
      updateApiStatus('GOOGLE_GENERATIVE_AI_API_KEY', 'error', 'Unable to connect to Google AI');
    }
  };

  const checkClerkStatus = () => {
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    
    if (clerkPublishableKey && clerkPublishableKey.startsWith('pk_')) {
      updateApiStatus('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'success', 'Publishable key format valid');
    } else {
      updateApiStatus('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'warning', 'Publishable key not configured');
    }
    
    if (clerkSecretKey && clerkSecretKey.startsWith('sk_')) {
      updateApiStatus('CLERK_SECRET_KEY', 'success', 'Secret key format valid');
    } else {
      updateApiStatus('CLERK_SECRET_KEY', 'warning', 'Secret key not configured');
    }
  };

  const updateApiStatus = (apiName: string, status: 'success' | 'error' | 'warning', message: string, testResult?: any) => {
    setApiStatuses(prev => prev.map(api => 
      api.name === apiName 
        ? { ...api, status, message, testResult }
        : api
    ));
  };

  const testIndividualApi = async (apiName: string) => {
    if (apiName === 'GOOGLE_GENERATIVE_AI_API_KEY') {
      await checkGoogleAIStatus();
    } else if (apiName.includes('SUPABASE')) {
      await checkSupabaseStatus();
    } else if (apiName.includes('CLERK')) {
      checkClerkStatus();
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    setIsSavingProfile(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800 border-green-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      loading: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.loading}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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

      {/* Legacy API Status (Compact View) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Quick API Status
              </CardTitle>
              <CardDescription>
                Quick overview of critical API connections
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={checkAllApiStatuses}
              size="sm"
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apiStatuses.slice(0, 6).map((api) => (
              <div key={api.name} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(api.status)}
                    <div>
                      <h4 className="font-medium text-sm">{api.displayName}</h4>
                      <p className="text-xs text-muted-foreground">{api.message}</p>
                    </div>
                  </div>
                  {getStatusBadge(api.status)}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            For detailed monitoring, see the comprehensive API Connection Status above
          </p>
        </CardContent>
      </Card>

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