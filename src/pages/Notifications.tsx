import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNotesForSavedJobs, getSavedJobIds, getJobs } from '@/lib/storage';
import { formatDistanceToNow } from 'date-fns';
import { JobNote } from '@/types/job';

interface NotificationsProps {
  onJobDetailsClick: (jobId: string) => void;
}

const Notifications = ({ onJobDetailsClick }: NotificationsProps) => {
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<JobNote[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [savedIds, fetchedNotes, fetchedJobs] = await Promise.all([
        getSavedJobIds(),
        getNotesForSavedJobs(),
        getJobs()
      ]);
      
      setSavedJobIds(savedIds);
      setNotes(fetchedNotes);
      setJobs(fetchedJobs);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
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
  
  return (
    <div className="pb-20 p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      
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
            return (
              <div
                key={note.id}
                className="bg-card border border-border rounded-xl p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onJobDetailsClick(note.jobId)}
                      className="text-xs h-7"
                    >
                      View
                    </Button>
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
