import { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
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
import { saveUser, getJobs } from '@/lib/storage';
import { X } from 'lucide-react';

const Index = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    district: '',
    state: '',
    email: '',
  });
  const navigate = useNavigate();

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

  const handleGoogleLogin = () => {
    // Simulate Google login
    setShowLoginModal(false);
    setProfileData({ ...profileData, email: 'user@gmail.com' });
    setShowProfileModal(true);
  };

  const handleProfileComplete = () => {
    if (!profileData.name || !profileData.phone || !profileData.district || !profileData.state) {
      return;
    }
    
    saveUser({
      uid: Date.now().toString(),
      ...profileData,
      role: 'user',
    });
    
    setShowProfileModal(false);
    window.location.reload();
  };

  const handleNotificationJobClick = (jobId: string) => {
    const jobs = getJobs();
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      handleJobDetails(job);
    }
  };

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
            <div className="bg-surface rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Application Fee</p>
              <p className="text-lg font-bold">₹{selectedJob?.fee || 0}</p>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Your Name</Label>
                <Input placeholder="Enter your name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="Enter your email" />
              </div>
            </div>
            <Button className="w-full">Submit Request</Button>
            <p className="text-xs text-center text-muted-foreground">
              We will contact you soon with registration details
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
            <Button onClick={handleGoogleLogin} className="w-full" size="lg">
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
            <Button onClick={handleProfileComplete} className="w-full">
              Complete Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
