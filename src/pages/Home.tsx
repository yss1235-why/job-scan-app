import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import JobCard from '@/components/JobCard';
import { getJobs } from '@/lib/storage';
import { Job } from '@/types/job';

interface HomeProps {
  onJobDetailsClick: (job: Job) => void;
  onRegisterClick: (job: Job) => void;
}

const Home = ({ onJobDetailsClick, onRegisterClick }: HomeProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const jobs = getJobs().filter(job => job.published);
  
  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
