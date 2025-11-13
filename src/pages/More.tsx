import { useState, useEffect } from 'react';
import { Settings, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUser, clearUser } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface MoreProps {
  onLoginClick: () => void;
}

const More = ({ onLoginClick }: MoreProps) => {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    setUser(getUser());
  }, []);
  
  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      clearUser();
      
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      });
      
      // Reload to clear state
      window.location.reload();
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="pb-20 p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">More</h2>
      
      {user ? (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.role === 'admin' && (
                  <span className="inline-block mt-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">District</p>
                <p className="font-medium">{user.district}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">State</p>
                <p className="font-medium">{user.state}</p>
              </div>
            </div>
          </div>
          
          {user.role === 'admin' && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/admin')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          )}
          
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
            disabled={loading}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {loading ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">Sign in to continue</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Access saved jobs, notifications, and more
          </p>
          <Button onClick={onLoginClick}>
            Sign in with Google
          </Button>
        </div>
      )}
      
      <div className="mt-12 text-center">
        <p className="text-xs text-muted-foreground">
          JobNotify v1.0.0
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Made with ❤️ for job seekers by Innovative Archive x Dynamic_Edu
        </p>
      </div>
    </div>
  );
};

export default More;
