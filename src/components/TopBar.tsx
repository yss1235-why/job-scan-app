import { useState, useEffect } from 'react';
import { Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUser } from '@/lib/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const TopBar = () => {
  const [user, setUser] = useState(getUser());
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setUser(getUser());
    });
    
    return () => unsubscribe();
  }, []);
  
  return (
    <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">JN</span>
          </div>
          <h1 className="text-lg font-bold text-foreground">JobNotify</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {user && (
            <Link to="/more" className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              {user.name ? (
                <span className="text-xs font-semibold text-secondary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-4 h-4 text-secondary-foreground" />
              )}
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="w-8 h-8 bg-surface rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
