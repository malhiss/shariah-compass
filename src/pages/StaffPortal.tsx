import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';
import { motion } from 'framer-motion';
import { UserPlus, Users, Trash2, Key, Shield, RefreshCw, Search, User, Mail, Calendar, Clock, Copy, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: 'client' | 'staff' | null;
  createdAt: string;
  lastSignIn: string | null;
}

const createUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['client', 'staff']),
});

export default function StaffPortal() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'staff' | 'none'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'client' as 'client' | 'staff',
  });
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('manage-users', {
        body: { action: 'list_users' },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setUsers(response.data.users || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching users',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    setErrors({});
    
    try {
      createUserSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create_user',
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role,
        },
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }

      // Show credentials to copy
      setGeneratedCredentials({ email: formData.email, password: formData.password });

      toast({
        title: 'User created successfully',
        description: 'Copy the credentials below to share with the user.',
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error creating user',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCredentials = () => {
    if (generatedCredentials) {
      const text = `Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`;
      navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description: 'Credentials have been copied.',
      });
    }
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setFormData({ email: '', password: '', fullName: '', role: 'client' });
    setGeneratedCredentials(null);
    setShowPassword(false);
    setErrors({});
  };

  const handleUpdateRole = async (userId: string, newRole: 'client' | 'staff') => {
    try {
      const response = await supabase.functions.invoke('manage-users', {
        body: { action: 'update_user_role', userId, role: newRole },
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }

      toast({
        title: 'Role updated',
        description: 'User role has been updated successfully.',
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error updating role',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await supabase.functions.invoke('manage-users', {
        body: { action: 'delete_user', userId },
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }

      toast({
        title: 'User deleted',
        description: `${userEmail} has been deleted successfully.`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error deleting user',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    if (newPassword.length < 8) {
      toast({
        title: 'Invalid password',
        description: 'Password must be at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await supabase.functions.invoke('manage-users', {
        body: { action: 'reset_password', userId: selectedUser.id, newPassword },
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }

      toast({
        title: 'Password reset',
        description: `Password for ${selectedUser.email} has been reset. New password: ${newPassword}`,
      });

      setIsResetPasswordDialogOpen(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: 'Error resetting password',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (roleFilter === 'all') return matchesSearch;
    if (roleFilter === 'none') return matchesSearch && !user.role;
    return matchesSearch && user.role === roleFilter;
  });

  const clientCount = users.filter(u => u.role === 'client').length;
  const staffCount = users.filter(u => u.role === 'staff').length;
  const pendingCount = users.filter(u => !u.role).length;

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container max-w-7xl">
        {/* Header */}
        <AnimatedSection className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-4">
                <Shield className="w-4 h-4" />
                <span>Staff Portal</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">User Management</h1>
              <p className="text-muted-foreground mt-2">Create and manage client and staff accounts</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => !open && closeCreateDialog()}>
              <DialogTrigger asChild>
                <Button className="btn-invesense" size="lg" onClick={() => setIsCreateDialogOpen(true)}>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create New User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">
                    {generatedCredentials ? 'User Created Successfully' : 'Create New User'}
                  </DialogTitle>
                  <DialogDescription>
                    {generatedCredentials 
                      ? 'Copy these credentials to share with the user.' 
                      : 'Create a new client or staff account.'}
                  </DialogDescription>
                </DialogHeader>

                {generatedCredentials ? (
                  <div className="space-y-4 py-4">
                    <div className="p-4 rounded-lg bg-compliant/10 border border-compliant/30">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Email:</span>
                          <span className="font-mono text-sm">{generatedCredentials.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Password:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">
                              {showPassword ? generatedCredentials.password : '••••••••••••'}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button onClick={copyCredentials} className="w-full" variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Credentials
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="John Doe"
                          className="pl-10"
                        />
                      </div>
                      {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="user@example.com"
                          className="pl-10"
                        />
                      </div>
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setFormData({ ...formData, password: generatePassword() })}
                        >
                          Generate
                        </Button>
                      </div>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Minimum 8 characters"
                          className="pl-10 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: 'client' | 'staff') => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Client
                            </div>
                          </SelectItem>
                          <SelectItem value="staff">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Staff
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {generatedCredentials ? (
                    <Button onClick={closeCreateDialog} className="btn-invesense">
                      Done
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={closeCreateDialog}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateUser} disabled={isSubmitting} className="btn-invesense">
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                        ) : (
                          'Create User'
                        )}
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </AnimatedSection>

        {/* Stats */}
        <AnimatedSection delay={0.1} className="mb-8">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StaggerItem>
              <Card className="border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="border-border hover:border-compliant/30 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-compliant/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-compliant" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{clientCount}</p>
                    <p className="text-sm text-muted-foreground">Clients</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="border-border hover:border-warning/30 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{staffCount}</p>
                    <p className="text-sm text-muted-foreground">Staff</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="border-border hover:border-muted-foreground/30 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Clock className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingCount}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </AnimatedSection>

        {/* Users Table */}
        <AnimatedSection delay={0.2}>
          <Card className="border-border">
            <CardHeader className="border-b border-border">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="font-serif">All Users</CardTitle>
                  <CardDescription>Manage user accounts, roles, and credentials</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="client">Clients</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="none">No Role</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={fetchUsers} title="Refresh">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{searchQuery || roleFilter !== 'all' ? 'No users found matching your filters.' : 'No users yet. Create your first user above.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[250px]">User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead className="hidden lg:table-cell">Last Sign In</TableHead>
                        <TableHead className="text-right w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="group">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{user.fullName || 'No name'}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={user.role || 'none'}
                              onValueChange={(value) => {
                                if (value !== 'none') {
                                  handleUpdateRole(user.id, value as 'client' | 'staff');
                                }
                              }}
                            >
                              <SelectTrigger className="w-28 h-8">
                                <SelectValue>
                                  {user.role ? (
                                    <Badge 
                                      variant={user.role === 'staff' ? 'default' : 'secondary'}
                                      className={user.role === 'staff' ? 'bg-warning/20 text-warning hover:bg-warning/30' : 'bg-compliant/20 text-compliant hover:bg-compliant/30'}
                                    >
                                      {user.role}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">No role</span>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="client">Client</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                            {user.lastSignIn ? (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(user.lastSignIn).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50">Never</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewPassword(generatePassword());
                                  setIsResetPasswordDialogOpen(true);
                                }}
                                title="Reset Password"
                              >
                                <Key className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteUser(user.id, user.email)}
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Reset Password Dialog */}
        <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Reset Password</DialogTitle>
              <DialogDescription>
                Set a new password for {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setNewPassword(generatePassword())}
                  >
                    Generate
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleResetPassword} disabled={isSubmitting} className="btn-invesense">
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                ) : (
                  'Reset Password'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
