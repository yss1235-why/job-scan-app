import { Settings, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUser, clearUser } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

interface MoreProps {
  onLoginClick: () => void;
}

const More = ({ onLoginClick }: MoreProps) => {
  const user = getUser();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    clearUser();
    window.location.reload();
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
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
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
          Made with ❤️ for job seekers
        </p>
      </div>
    </div>
  );
};

export default More;
