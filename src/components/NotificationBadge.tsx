import { useState, useEffect } from 'react';
import { getUnreadCount } from '@/lib/storage';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const NotificationBadge = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        loadCount();
        // Refresh count every 30 seconds
        const interval = setInterval(loadCount, 30000);
        return () => clearInterval(interval);
      } else {
        setCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadCount = async () => {
    try {
      const unreadCount = await getUnreadCount();
      setCount(unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs font-bold rounded-full flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  );
};

export default NotificationBadge;
