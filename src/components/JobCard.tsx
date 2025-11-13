import { useState, useEffect } from 'react';
import { Star, MapPin, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Job } from '@/types/job';
import { isJobSaved, toggleSavedJob } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';

interface JobCardProps {
  job: Job;
  onDetailsClick: () => void;
  onRegisterClick: () => void;
}

const JobCard = ({ job, onDetailsClick, onRegisterClick }: JobCardProps) => {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    checkIfSaved();
  }, [job.id]);
  
  const checkIfSaved = async () => {
    try {
      const isSaved = await isJobSaved(job.id);
      setSaved(isSaved);
    } catch (error) {
      console.error('Error checking if job is saved:', error);
    }
  };
  
  const handleSaveToggle = async () => {
    if (!auth.currentUser) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save jobs',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      const isSaved = await toggleSavedJob(job.id);
      setSaved(isSaved);
      
      toast({
        title: isSaved ? 'Job saved' : 'Job removed',
        description: isSaved ? 'You will receive updates for this job' : 'Job removed from saved list',
      });
    } catch (error) {
      console.error('Error toggling saved job:', error);
      toast({
        title: 'Error',
        description: 'Failed to update saved status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-base text-foreground leading-tight mb-1">
            {job.title}
          </h3>
          <p className="text-xs text-muted-foreground">{job.short}</p>
        </div>
        <button
          onClick={handleSaveToggle}
          disabled={loading}
          className="p-1.5 hover:bg-surface rounded-lg transition-colors disabled:opacity-50"
        >
          <Star
            className={cn(
              "w-5 h-5 transition-colors",
              saved ? "fill-primary text-primary" : "text-muted-foreground"
            )}
          />
        </button>
      </div>
      
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{job.location}</span>
        </div>
        {job.examDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(job.examDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDetailsClick}
          className="flex-1 text-xs h-8"
        >
          Details
        </Button>
        <Button
          size="sm"
          onClick={onRegisterClick}
          className="flex-1 text-xs h-8 bg-accent hover:bg-accent/90"
        >
          Register
        </Button>
      </div>
      
      {job.applyBy && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Apply by: {new Date(job.applyBy).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default JobCard;
