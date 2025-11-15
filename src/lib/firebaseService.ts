import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, ADMIN_EMAILS } from './firebase';
import { Job, User, JobNote } from '@/types/job';
import { validateJobData, validateProfileData, sanitizeHTML } from './sanitize';

// ==================== USER MANAGEMENT ====================

export const saveUserToFirestore = async (user: User) => {
  try {
    // Validate profile data
    const validation = validateProfileData({
      name: user.name,
      phone: user.phone,
      district: user.district,
      state: user.state,
      email: user.email,
    });
    
    if (!validation.valid) {
      const errorMessages = Object.values(validation.errors).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    
    // Use sanitized data
    const sanitizedUser = {
      uid: user.uid,
      ...validation.sanitizedData,
      // Role is intentionally NOT included here for new users
      // It will be set by Firestore rules to 'user' by default
      // Only admins can set roles for other users
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'users', user.uid), sanitizedUser);
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const getUserFromFirestore = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<User>) => {
  try {
    // Validate only the fields being updated
    const fieldsToValidate: any = {};
    if (data.name) fieldsToValidate.name = data.name;
    if (data.phone) fieldsToValidate.phone = data.phone;
    if (data.district) fieldsToValidate.district = data.district;
    if (data.state) fieldsToValidate.state = data.state;
    if (data.email) fieldsToValidate.email = data.email;
    
    if (Object.keys(fieldsToValidate).length > 0) {
      const validation = validateProfileData({
        name: fieldsToValidate.name || 'DefaultName',
        phone: fieldsToValidate.phone || '9999999999',
        district: fieldsToValidate.district || 'DefaultDistrict',
        state: fieldsToValidate.state || 'DefaultState',
        email: fieldsToValidate.email || 'default@email.com',
      });
      
      if (!validation.valid) {
        const errorMessages = Object.values(validation.errors).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
    }
    
    // Remove role from update data - users cannot update their own role
    const { role, ...updateData } = data;
    
    await updateDoc(doc(db, 'users', uid), {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const isUserAdmin = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(normalizedEmail);
};

export const promoteUserToAdmin = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    // Only allow role updates through this specific function
    // This should be called only by authenticated admins
    await setDoc(userRef, { role: 'admin', updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('Error promoting user:', error);
    throw error;
  }
};

// ==================== JOBS MANAGEMENT ====================

export const getAllJobs = async (): Promise<Job[]> => {
  try {
    const jobsSnapshot = await getDocs(collection(db, 'jobs'));
    return jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
    })) as Job[];
  } catch (error) {
    console.error('Error getting jobs:', error);
    return [];
  }
};

export const getPublishedJobs = async (): Promise<Job[]> => {
  try {
    const q = query(
      collection(db, 'jobs'),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    const jobsSnapshot = await getDocs(q);
    return jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
    })) as Job[];
  } catch (error) {
    console.error('Error getting published jobs:', error);
    return [];
  }
};

export const getJobById = async (jobId: string): Promise<Job | null> => {
  try {
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    if (jobDoc.exists()) {
      return {
        id: jobDoc.id,
        ...jobDoc.data(),
        createdAt: jobDoc.data().createdAt?.toDate() || new Date(),
        lastUpdated: jobDoc.data().lastUpdated?.toDate() || new Date(),
      } as Job;
    }
    return null;
  } catch (error) {
    console.error('Error getting job:', error);
    return null;
  }
};

export const saveJobToFirestore = async (job: Job) => {
  try {
    // Validate and sanitize job data - NOW INCLUDING ALL NEW FIELDS
    const validation = validateJobData({
      title: job.title,
      short: job.short,
      location: job.location,
      locationType: job.locationType,  // ✅ ADDED
      district: job.district,           // ✅ ADDED
      state: job.state,                 // ✅ ADDED
      sector: job.sector,               // ✅ ADDED
      contractType: job.contractType,   // ✅ ADDED
      fee: job.fee,
      applyBy: job.applyBy,
      examDate: job.examDate,
      description: job.description,
      registrationLink: job.registrationLink,
    });
    
    if (!validation.valid) {
      const errorMessages = Object.values(validation.errors).join('\n');
      throw new Error(`Validation failed:\n${errorMessages}`);
    }
    
    // Use sanitized data
    const jobData = {
      ...job,
      ...validation.sanitizedData,
      createdAt: job.createdAt ? Timestamp.fromDate(job.createdAt) : serverTimestamp(),
      lastUpdated: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'jobs', job.id), jobData);
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
};

export const deleteJobFromFirestore = async (jobId: string) => {
  try {
    await deleteDoc(doc(db, 'jobs', jobId));
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

// ==================== SAVED JOBS MANAGEMENT ====================

export const getSavedJobs = async (uid: string): Promise<string[]> => {
  try {
    const savedJobsSnapshot = await getDocs(collection(db, 'users', uid, 'savedJobs'));
    return savedJobsSnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error getting saved jobs:', error);
    return [];
  }
};

export const toggleSavedJobInFirestore = async (uid: string, jobId: string): Promise<boolean> => {
  try {
    const savedJobRef = doc(db, 'users', uid, 'savedJobs', jobId);
    const savedJobDoc = await getDoc(savedJobRef);
    
    if (savedJobDoc.exists()) {
      await deleteDoc(savedJobRef);
      return false;
    } else {
      await setDoc(savedJobRef, {
        savedAt: serverTimestamp(),
      });
      return true;
    }
  } catch (error) {
    console.error('Error toggling saved job:', error);
    throw error;
  }
};

export const isJobSavedByUser = async (uid: string, jobId: string): Promise<boolean> => {
  try {
    const savedJobDoc = await getDoc(doc(db, 'users', uid, 'savedJobs', jobId));
    return savedJobDoc.exists();
  } catch (error) {
    console.error('Error checking if job is saved:', error);
    return false;
  }
};

// ==================== JOB NOTES MANAGEMENT ====================

export const addJobNote = async (jobId: string, message: string) => {
  try {
    // Validate message length
    if (!message || message.trim().length === 0) {
      throw new Error('Note message cannot be empty');
    }
    
    if (message.length > 500) {
      throw new Error('Note message is too long (max 500 characters)');
    }
    
    const noteRef = doc(collection(db, 'jobs', jobId, 'notes'));
    await setDoc(noteRef, {
      message: message.trim(),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};

export const getJobNotes = async (jobId: string): Promise<JobNote[]> => {
  try {
    const q = query(
      collection(db, 'jobs', jobId, 'notes'),
      orderBy('createdAt', 'desc')
    );
    const notesSnapshot = await getDocs(q);
    return notesSnapshot.docs.map(doc => ({
      id: doc.id,
      jobId,
      message: doc.data().message,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as JobNote[];
  } catch (error) {
    console.error('Error getting notes:', error);
    return [];
  }
};

export const getNotesForSavedJobs = async (uid: string): Promise<JobNote[]> => {
  try {
    const savedJobIds = await getSavedJobs(uid);
    const allNotes: JobNote[] = [];
    
    for (const jobId of savedJobIds) {
      const notes = await getJobNotes(jobId);
      allNotes.push(...notes);
    }
    
    allNotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return allNotes;
  } catch (error) {
    console.error('Error getting notes for saved jobs:', error);
    return [];
  }
};

// ==================== BOOKING/REGISTRATION MANAGEMENT ====================

export interface Booking {
  id: string;
  jobId: string;
  jobTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  fee: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
}

export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>) => {
  try {
    // Validate booking data
    if (!booking.jobId || booking.jobId.trim().length === 0) {
      throw new Error('Job ID is required');
    }
    
    if (!booking.jobTitle || booking.jobTitle.trim().length < 5) {
      throw new Error('Job title must be at least 5 characters');
    }
    
    if (!booking.userName || booking.userName.trim().length < 2) {
      throw new Error('User name must be at least 2 characters');
    }
    
    if (!booking.userEmail || !booking.userEmail.includes('@')) {
      throw new Error('Valid email is required');
    }
    
    if (typeof booking.fee !== 'number' || booking.fee < 0) {
      throw new Error('Fee must be a positive number');
    }
    
    const bookingRef = doc(collection(db, 'bookings'));
    const bookingData = {
      ...booking,
      id: bookingRef.id,
      status: 'pending', // Always set to pending for new bookings
      createdAt: serverTimestamp(),
    };
    
    await setDoc(bookingRef, bookingData);
    return bookingRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Booking[];
  } catch (error) {
    console.error('Error getting bookings:', error);
    return [];
  }
};

export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Booking[];
  } catch (error) {
    console.error('Error getting all bookings:', error);
    return [];
  }
};

export const updateBookingStatus = async (
  bookingId: string, 
  status: Booking['status']
) => {
  try {
    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid booking status');
    }
    
    await updateDoc(doc(db, 'bookings', bookingId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

export const deleteBooking = async (bookingId: string) => {
  try {
    await deleteDoc(doc(db, 'bookings', bookingId));
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};

// ==================== NOTIFICATION READ STATUS ====================

export const markNotificationAsRead = async (userId: string, noteId: string) => {
  try {
    const readRef = doc(db, 'users', userId, 'readNotifications', noteId);
    await setDoc(readRef, {
      readAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const getReadNotifications = async (userId: string): Promise<string[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'readNotifications'));
    return snapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error getting read notifications:', error);
    return [];
  }
};

export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const savedJobs = await getSavedJobs(userId);
    const allNotes: string[] = [];
    
    for (const jobId of savedJobs) {
      const notes = await getJobNotes(jobId);
      allNotes.push(...notes.map(n => n.id));
    }
    
    const readNotes = await getReadNotifications(userId);
    return allNotes.filter(id => !readNotes.includes(id)).length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// ==================== REAL-TIME LISTENERS ====================

export const subscribeToJobs = (callback: (jobs: Job[]) => void) => {
  const q = query(
    collection(db, 'jobs'),
    where('published', '==', true),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const jobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
    })) as Job[];
    callback(jobs);
  });
};

export const subscribeToSavedJobs = (uid: string, callback: (jobIds: string[]) => void) => {
  return onSnapshot(collection(db, 'users', uid, 'savedJobs'), (snapshot) => {
    const jobIds = snapshot.docs.map(doc => doc.id);
    callback(jobIds);
  });
};

export const subscribeToJobNotes = (jobId: string, callback: (notes: JobNote[]) => void) => {
  const q = query(
    collection(db, 'jobs', jobId, 'notes'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      jobId,
      message: doc.data().message,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as JobNote[];
    callback(notes);
  });
};
