import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JobCard from '@/components/JobCard';
import { getJobs, getSavedJobIds, getUser } from '@/lib/storage';
import { Job } from '@/types/job';

interface SavedProps {
  onJobDetailsClick: (job: Job) => void;
  onRegisterClick: (job: Job) => void;
  onLoginClick: () => void;
}

const Saved = ({ onJobDetailsClick, onRegisterClick, onLoginClick }: SavedProps) => {
  const user = getUser();
  const savedJobIds = getSavedJobIds();
  const allJobs = getJobs();
  const savedJobs = allJobs.filter(job => savedJobIds.includes(job.id));
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Sign in to save jobs</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in with Google to sync your saved jobs across devices
          </p>
          <Button onClick={onLoginClick} className="w-full">
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-20 p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Saved Jobs</h2>
      
      {savedJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No saved jobs yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tap the star icon on any job to save it
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onDetailsClick={() => onJobDetailsClick(job)}
              onRegisterClick={() => onRegisterClick(job)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;
