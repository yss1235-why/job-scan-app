import { Star, MapPin, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Job } from '@/types/job';
import { isJobSaved, toggleSavedJob } from '@/lib/storage';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  onDetailsClick: () => void;
  onRegisterClick: () => void;
}

const JobCard = ({ job, onDetailsClick, onRegisterClick }: JobCardProps) => {
  const [saved, setSaved] = useState(isJobSaved(job.id));
  
  const handleSaveToggle = () => {
    toggleSavedJob(job.id);
    setSaved(!saved);
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
          className="p-1.5 hover:bg-surface rounded-lg transition-colors"
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
