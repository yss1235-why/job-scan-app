import { Home, Bookmark, Bell, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import NotificationBadge from './NotificationBadge';

const BottomNav = () => {
  const location = useLocation();
  
  const tabs = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Bookmark, label: 'Saved', path: '/saved' },
    { icon: Bell, label: 'Notifications', path: '/notifications', showBadge: true },
    { icon: Menu, label: 'More', path: '/more' },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around max-w-2xl mx-auto">
        {tabs.map(({ icon: Icon, label, path, showBadge }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-1" />
                {showBadge && <NotificationBadge />}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
