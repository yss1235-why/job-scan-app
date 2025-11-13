import { Job, User, JobNote } from '@/types/job';
import {
  saveUserToFirestore,
  getUserFromFirestore,
  getAllJobs,
  getPublishedJobs,
  saveJobToFirestore,
  getSavedJobs,
  toggleSavedJobInFirestore,
  isJobSavedByUser,
  addJobNote,
  getJobNotes,
  getNotesForSavedJobs as getNotesForSavedJobsFromFirestore,
  createBooking as createBookingFirestore,
  getUserBookings as getUserBookingsFirestore,
  getAllBookings as getAllBookingsFirestore,
  markNotificationAsRead as markNotificationAsReadFirestore,
  getUnreadNotificationCount as getUnreadNotificationCountFirestore,
  type Booking,
} from './firebaseService';
import { auth } from './firebase';

// ==================== USER MANAGEMENT ====================

export const saveUser = async (user: User) => {
  try {
    await saveUserToFirestore(user);
    // Also store in localStorage for quick access
    localStorage.setItem('jobnotify_user_cache', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const getUser = (): User | null => {
  // First check if user is authenticated with Firebase
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return null;
  }

  // Try to get from cache first
  const cached = localStorage.getItem('jobnotify_user_cache');
  if (cached) {
    return JSON.parse(cached);
  }

  return null;
};

export const clearUser = () => {
  localStorage.removeItem('jobnotify_user_cache');
};

export const refreshUserFromFirestore = async (): Promise<User | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return null;
  }

  const user = await getUserFromFirestore(currentUser.uid);
  if (user) {
    localStorage.setItem('jobnotify_user_cache', JSON.stringify(user));
  }
  return user;
};

// ==================== SAVED JOBS MANAGEMENT ====================

export const getSavedJobIds = async (): Promise<string[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    // Fallback to localStorage for non-authenticated users
    const data = localStorage.getItem('jobnotify_saved_jobs');
    return data ? JSON.parse(data) : [];
  }

  try {
    return await getSavedJobs(currentUser.uid);
  } catch (error) {
    console.error('Error getting saved jobs:', error);
    return [];
  }
};

export const toggleSavedJob = async (jobId: string): Promise<boolean> => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    // Fallback to localStorage for non-authenticated users
    const saved = JSON.parse(localStorage.getItem('jobnotify_saved_jobs') || '[]');
    const index = saved.indexOf(jobId);
    
    if (index > -1) {
      saved.splice(index, 1);
      localStorage.setItem('jobnotify_saved_jobs', JSON.stringify(saved));
      return false;
    } else {
      saved.push(jobId);
      localStorage.setItem('jobnotify_saved_jobs', JSON.stringify(saved));
      return true;
    }
  }

  try {
    return await toggleSavedJobInFirestore(currentUser.uid, jobId);
  } catch (error) {
    console.error('Error toggling saved job:', error);
    throw error;
  }
};

export const isJobSaved = async (jobId: string): Promise<boolean> => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    const saved = JSON.parse(localStorage.getItem('jobnotify_saved_jobs') || '[]');
    return saved.includes(jobId);
  }

  try {
    return await isJobSavedByUser(currentUser.uid, jobId);
  } catch (error) {
    console.error('Error checking if job is saved:', error);
    return false;
  }
};

// ==================== JOBS MANAGEMENT ====================

export const getJobs = async (): Promise<Job[]> => {
  try {
    const currentUser = auth.currentUser;
    
    // Admin users get all jobs, regular users get only published jobs
    if (currentUser) {
      const user = getUser();
      if (user?.role === 'admin') {
        return await getAllJobs();
      }
    }
    
    return await getPublishedJobs();
  } catch (error) {
    console.error('Error getting jobs:', error);
    // Fallback to localStorage sample data
    const data = localStorage.getItem('jobnotify_jobs');
    if (!data) {
      const sampleJobs: Job[] = [
        {
          id: '1',
          title: 'Junior Clerk - Manipur PSC',
          short: 'Government clerical position',
          location: 'Imphal',
          fee: 150,
          published: true,
          applyBy: '2025-12-15',
          examDate: '2026-01-20',
          description: `<h3>How to Register:</h3><ol><li>Visit the official MPSC website</li></ol>`,
          createdAt: new Date(),
          lastUpdated: new Date(),
        },
      ];
      return sampleJobs;
    }
    return JSON.parse(data);
  }
};

export const saveJob = async (job: Job) => {
  try {
    await saveJobToFirestore(job);
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
};

// ==================== NOTES MANAGEMENT ====================

export const getNotes = async (): Promise<JobNote[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return [];
  }

  try {
    return await getNotesForSavedJobsFromFirestore(currentUser.uid);
  } catch (error) {
    console.error('Error getting notes:', error);
    return [];
  }
};

export const addNote = async (jobId: string, message: string) => {
  try {
    await addJobNote(jobId, message);
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};

export const getNotesForSavedJobs = async (): Promise<JobNote[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return [];
  }

  try {
    return await getNotesForSavedJobsFromFirestore(currentUser.uid);
  } catch (error) {
    console.error('Error getting notes for saved jobs:', error);
    return [];
  }
};

// ==================== BOOKING MANAGEMENT ====================

export const createBooking = async (
  jobId: string,
  jobTitle: string,
  fee: number
): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in to create booking');
  }

  const user = getUser();
  if (!user) {
    throw new Error('User profile not found');
  }

  try {
    const bookingId = await createBookingFirestore({
      jobId,
      jobTitle,
      userId: currentUser.uid,
      userName: user.name,
      userEmail: user.email,
      fee,
      status: 'pending',
    });
    return bookingId;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getUserBookings = async (): Promise<Booking[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return [];
  }

  try {
    return await getUserBookingsFirestore(currentUser.uid);
  } catch (error) {
    console.error('Error getting user bookings:', error);
    return [];
  }
};

export const getAllBookings = async (): Promise<Booking[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return [];
  }

  const user = getUser();
  if (user?.role !== 'admin') {
    throw new Error('Admin access required');
  }

  try {
    return await getAllBookingsFirestore();
  } catch (error) {
    console.error('Error getting all bookings:', error);
    return [];
  }
};

// ==================== NOTIFICATION MANAGEMENT ====================

export const markNotificationRead = async (noteId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return;
  }

  try {
    await markNotificationAsReadFirestore(currentUser.uid, noteId);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const getUnreadCount = async (): Promise<number> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return 0;
  }

  try {
    return await getUnreadNotificationCountFirestore(currentUser.uid);
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Export Booking type for use in other files
export type { Booking };
