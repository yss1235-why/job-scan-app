import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getNotesForSavedJobs, getSavedJobIds, getJobs, markNotificationRead } from '@/lib/storage';
import { getReadNotifications } from '@/lib/firebaseService';
import { formatDistanceToNow } from 'date-fns';
import { JobNote } from '@/types/job';
import { auth } from '@/lib/firebase';

interface NotificationsProps {
  onJobDetailsClick: (jobId: string) => void;
}

const Notifications = ({ onJobDetailsClick }: NotificationsProps) => {
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<JobNote[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [readNotes, setReadNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      
      const [savedIds, fetchedNotes, fetchedJobs, readIds] = await Promise.all([
        getSavedJobIds(),
        getNotesForSavedJobs(),
        getJobs(),
        currentUser ? getReadNotifications(currentUser.uid) : Promise.resolve([]),
      ]);
      
      setSavedJobIds(savedIds);
      setNotes(fetchedNotes);
      setJobs(fetchedJobs);
      setReadNotes(readIds);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsRead = async (noteId: string) => {
    try {
      await markNotificationRead(noteId);
      setReadNotes([...readNotes, noteId]);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleViewJob = (jobId: string, noteId: string) => {
    handleMarkAsRead(noteId);
    onJobDetailsClick(jobId);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }
  
  if (savedJobIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No notifications yet</h2>
          <p className="text-sm text-muted-foreground">
            Save a job to receive updates and notifications
          </p>
        </div>
      </div>
    );
  }

  const unreadCount = notes.filter(note => !readNotes.includes(note.id)).length;
  
  return (
    <div className="pb-20 p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Notifications</h2>
        {unreadCount > 0 && (
          <Badge variant="default">{unreadCount} unread</Badge>
        )}
      </div>
      
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No updates yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            You'll receive notifications when saved jobs are updated
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map(note => {
            const job = jobs.find(j => j.id === note.jobId);
            const isRead = readNotes.includes(note.id);
            
            return (
              <div
                key={note.id}
                className={`bg-card border rounded-xl p-3 shadow-sm transition-all ${
                  isRead ? 'border-border' : 'border-primary/50 bg-primary/5'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    {!isRead && (
                      <Badge variant="default" className="mb-2 text-xs">
                        New
                      </Badge>
                    )}
                    <p className="font-medium text-sm text-foreground mb-1">
                      {note.message}
                    </p>
                    {job && (
                      <p className="text-xs text-muted-foreground">{job.title}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                  </span>
                  {job && (
                    <div className="flex gap-2">
                      {!isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(note.id)}
                          className="text-xs h-7"
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewJob(note.jobId, note.id)}
                        className="text-xs h-7"
                      >
                        View
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
