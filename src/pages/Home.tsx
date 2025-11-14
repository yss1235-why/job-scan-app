// src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import JobCard from '@/components/JobCard';
import { getJobs, getUser } from '@/lib/storage';
import { Job } from '@/types/job';
import { subscribeToJobs } from '@/lib/firebaseService';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HomeProps {
  onJobDetailsClick: (job: Job) => void;
  onRegisterClick: (job: Job) => void;
}

const Home = ({ onJobDetailsClick, onRegisterClick }: HomeProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Location tab filter
  const [locationTab, setLocationTab] = useState<'local' | 'state' | 'national'>('state');
  
  // Additional filters
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [contractFilter, setContractFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get user to determine their district for local filter
  const user = getUser();
  const userDistrict = user?.district || '';
  const userState = user?.state || '';
  
  useEffect(() => {
    loadJobs();
    
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
  
  // Apply all filters
  const filteredJobs = jobs.filter(job => {
    // Search filter
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Location type filter
    if (job.locationType !== locationTab) return false;
    
    // For local jobs, check if it matches user's district
    if (locationTab === 'local' && userDistrict) {
      if (job.district?.toLowerCase() !== userDistrict.toLowerCase()) {
        return false;
      }
    }
    
    // For state jobs, check if it matches user's state
    if (locationTab === 'state' && userState) {
      if (job.state?.toLowerCase() !== userState.toLowerCase()) {
        return false;
      }
    }
    
    // Sector filter
    if (sectorFilter !== 'all' && job.sector !== sectorFilter) return false;
    
    // Contract type filter
    if (contractFilter !== 'all' && job.contractType !== contractFilter) return false;
    
    return true;
  });
  
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
      {/* Search Bar */}
      <div className="p-4 bg-surface border-b border-border">
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
      
      {/* Location Tabs */}
      <div className="sticky top-[57px] z-30 bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex gap-1 bg-surface rounded-lg p-1">
              <button
                onClick={() => setLocationTab('local')}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  locationTab === 'local'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Local
                {userDistrict && <span className="block text-xs opacity-70">{userDistrict}</span>}
              </button>
              <button
                onClick={() => setLocationTab('state')}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  locationTab === 'state'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                State
                {userState && <span className="block text-xs opacity-70">{userState}</span>}
              </button>
              <button
                onClick={() => setLocationTab('national')}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  locationTab === 'national'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                National
                <span className="block text-xs opacity-70">India</span>
              </button>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-primary text-primary-foreground")}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Additional Filters */}
          {showFilters && (
            <div className="mt-3 flex gap-2 animate-in slide-in-from-top-2">
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={contractFilter} onValueChange={setContractFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Contract Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      
      {/* Jobs List */}
      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {/* Active Filters Info */}
        {(sectorFilter !== 'all' || contractFilter !== 'all') && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Filters:</span>
            {sectorFilter !== 'all' && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                {sectorFilter}
              </span>
            )}
            {contractFilter !== 'all' && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                {contractFilter}
              </span>
            )}
            <button
              onClick={() => {
                setSectorFilter('all');
                setContractFilter('all');
              }}
              className="text-primary hover:underline ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
        
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
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
