import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Edit, Trash2, Eye, EyeOff, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUser } from '@/lib/storage';
import { getAllJobs, deleteJobFromFirestore } from '@/lib/firebaseService';
import { Job } from '@/types/job';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Admin = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getUser();
    
    console.log('Admin component mounted');
    console.log('Current user:', user);
    console.log('User role:', user?.role);

    if (!user) {
      console.log('No user found, redirecting to home');
      toast({
        title: 'Please sign in',
        description: 'You need to sign in to access admin panel',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    if (user.role !== 'admin') {
      console.log('User is not admin, redirecting');
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    console.log('User is admin, loading jobs...');
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      console.log('Starting to load jobs...');
      setLoading(true);
      
      const allJobs = await getAllJobs();
      console.log('Jobs loaded:', allJobs.length);
      console.log('Jobs data:', allJobs);
      
      setJobs(allJobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      
      toast({
        title: 'Success',
        description: `Loaded ${allJobs.length} jobs`,
      });
    } catch (error: any) {
      console.error('Error loading jobs:', error);
      console.error('Error details:', error.message, error.code);
      
      toast({
        title: 'Error Loading Jobs',
        description: error.message || 'Failed to load jobs. Check console for details.',
        variant: 'destructive',
      });
      
      setJobs([]);
    } finally {
      setLoading(false);
      console.log('Loading complete');
    }
  };

  const handleDelete = async () => {
    if (!deleteJobId) return;

    try {
      await deleteJobFromFirestore(deleteJobId);
      toast({
        title: 'Success',
        description: 'Job deleted successfully',
      });
      loadJobs();
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete job',
        variant: 'destructive',
      });
    } finally {
      setDeleteJobId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/more')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">Admin Panel</h1>
          </div>
          <Button onClick={() => navigate('/admin/job/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Job
          </Button>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto pb-20">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{jobs.length}</p>
                <p className="text-xs text-muted-foreground">Total Jobs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">
                  {jobs.filter(j => j.published).length}
                </p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">
                  {jobs.filter(j => !j.published).length}
                </p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NEW REGISTRATION REQUESTS BUTTON */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <Button 
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/admin/bookings')}
            >
              <ClipboardList className="w-5 h-5 mr-3" />
              <div className="flex-1 text-left">
                <p className="font-semibold">Registration Requests</p>
                <p className="text-xs text-muted-foreground">Manage user registration requests</p>
              </div>
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground">All Jobs</h2>
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-2">No jobs yet</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Create your first job to get started
                </p>
                <Button onClick={() => navigate('/admin/job/new')}>
                  Create First Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            jobs.map(job => (
              <Card key={job.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{job.title}</h3>
                        {job.published ? (
                          <Badge variant="default" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {job.location} • Apply by: {new Date(job.applyBy).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {job.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/admin/job/${job.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteJobId(job.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
