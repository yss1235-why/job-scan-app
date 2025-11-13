import { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { isUserAdmin } from '@/lib/firebaseService';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import Home from './Home';
import Saved from './Saved';
import Notifications from './Notifications';
import More from './More';
import { Job } from '@/types/job';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveUser, getUser, refreshUserFromFirestore, createBooking } from '@/lib/storage';
import { getJobs } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    district: '',
    state: '',
    email: '',
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setAuthUser(user);
        // Check if user profile is complete
        const userProfile = await refreshUserFromFirestore();
        if (!userProfile) {
          // New user, show profile completion modal
          setProfileData({
            name: user.displayName || '',
            phone: '',
            district: '',
            state: '',
            email: user.email || '',
          });
          setShowProfileModal(true);
        }
      } else {
        setAuthUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleJobDetails = (job: Job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  const handleRegister = (job: Job) => {
    setSelectedJob(job);
    setShowRegisterModal(true);
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      setShowLoginModal(false);
      
      // Check if user exists in Firestore
      const existingUser = await refreshUserFromFirestore();
      
      if (!existingUser) {
        // New user, show profile completion
        setProfileData({
          name: user.displayName || '',
          phone: '',
          district: '',
          state: '',
          email: user.email || '',
        });
        setShowProfileModal(true);
      } else {
        toast({
          title: 'Welcome back!',
          description: `Signed in as ${existingUser.name}`,
        });
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: 'Sign in failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = async () => {
    if (!profileData.name || !profileData.phone || !profileData.district || !profileData.state) {
      toast({
        title: 'Incomplete profile',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (!authUser) return;

    try {
      setLoading(true);
      
      // Check if user email is in admin list
      const role = isUserAdmin(authUser.email) ? 'admin' : 'user';
      
      await saveUser({
        uid: authUser.uid,
        ...profileData,
        role,
      });
      
      setShowProfileModal(false);
      
      toast({
        title: 'Profile completed!',
        description: role === 'admin' ? 'Welcome, Admin!' : 'Welcome to JobNotify!',
      });
    } catch (error: any) {
      console.error('Error completing profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationJobClick = async (jobId: string) => {
    const jobs = await getJobs();
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      handleJobDetails(job);
    }
  };

  const handleRegisterForYou = async () => {
    if (!authUser) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to register',
        variant: 'destructive',
      });
      setShowRegisterModal(false);
      setShowLoginModal(true);
      return;
    }

    if (!selectedJob) return;

    try {
      setBookingLoading(true);
      
      const bookingId = await createBooking(
        selectedJob.id,
        selectedJob.title,
        selectedJob.fee || 0
      );
      
      toast({
        title: 'Request Submitted',
        description: 'We will contact you soon with registration details',
      });
      
      setShowRegisterModal(false);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit request',
        variant: 'destructive',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopBar />
      
      <Routes>
        <Route
          path="/"
          element={
            <Home
              onJobDetailsClick={handleJobDetails}
              onRegisterClick={handleRegister}
            />
          }
        />
        <Route
          path="/saved"
          element={
            <Saved
              onJobDetailsClick={handleJobDetails}
              onRegisterClick={handleRegister}
              onLoginClick={handleLogin}
            />
          }
        />
        <Route
          path="/notifications"
          element={<Notifications onJobDetailsClick={handleNotificationJobClick} />}
        />
        <Route path="/more" element={<More onLoginClick={handleLogin} />} />
      </Routes>
      
      <BottomNav />

      {/* Job Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold pr-8">
              {selectedJob?.title}
            </DialogTitle>
          </DialogHeader>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: selectedJob?.description || '' }}
          />
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register for {selectedJob?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-surface rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Application Fee</span>
                <span className="text-2xl font-bold text-primary">
                  ₹{selectedJob?.fee || 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                This is an assisted registration service. We will help you with the registration process.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  window.open('#', '_blank'); // Replace with actual registration URL
                  setShowRegisterModal(false);
                }}
              >
                Register Yourself
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button 
                className="w-full bg-accent hover:bg-accent/90"
                onClick={handleRegisterForYou}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Register For You'
                )}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              We will contact you via email/phone within 24 hours with registration details and payment instructions.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign in to JobNotify</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <Button 
              onClick={handleGoogleLogin} 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name *</Label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="Enter your phone"
              />
            </div>
            <div>
              <Label>District *</Label>
              <Input
                value={profileData.district}
                onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                placeholder="Enter your district"
              />
            </div>
            <div>
              <Label>State *</Label>
              <Input
                value={profileData.state}
                onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                placeholder="Enter your state"
              />
            </div>
            <Button 
              onClick={handleProfileComplete} 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
