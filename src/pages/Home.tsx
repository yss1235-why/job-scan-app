import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import JobCard from '@/components/JobCard';
import { getJobs } from '@/lib/storage';
import { Job } from '@/types/job';
import { subscribeToJobs } from '@/lib/firebaseService';
import { auth } from '@/lib/firebase';

interface HomeProps {
  onJobDetailsClick: (job: Job) => void;
  onRegisterClick: (job: Job) => void;
}

const Home = ({ onJobDetailsClick, onRegisterClick }: HomeProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Initial load
    loadJobs();
    
    // Subscribe to real-time updates if user is authenticated
    let unsubscribe: (() => void) | undefined;
    
    if (auth.currentUser) {
      unsubscribe = subscribeToJobs((updatedJobs) => {
        setJobs(updatedJobs);
        setLoading(false);
      });
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
  
  const loadJobs = async () => {
    try {
      setLoading(true);
      const fetchedJobs = await getJobs();
      const publishedJobs = fetchedJobs.filter(job => job.published);
      setJobs(publishedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      <div className="p-4 bg-surface">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-border rounded-xl"
          />
        </div>
      </div>
      
      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {filteredJobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            onDetailsClick={() => onJobDetailsClick(job)}
            onRegisterClick={() => onRegisterClick(job)}
          />
        ))}
        
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
