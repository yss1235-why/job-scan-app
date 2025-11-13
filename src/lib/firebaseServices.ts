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

// User Management
export const saveUserToFirestore = async (user: User) => {
  try {
    await setDoc(doc(db, 'users', user.uid), {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
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
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Check if user is admin
export const isUserAdmin = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Jobs Management
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
    const jobData = {
      ...job,
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

// Saved Jobs Management
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
      return false; // Job was removed
    } else {
      await setDoc(savedJobRef, {
        savedAt: serverTimestamp(),
      });
      return true; // Job was added
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

// Job Notes Management
export const addJobNote = async (jobId: string, message: string) => {
  try {
    const noteRef = doc(collection(db, 'jobs', jobId, 'notes'));
    await setDoc(noteRef, {
      message,
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
    
    // Sort by date, most recent first
    allNotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return allNotes;
  } catch (error) {
    console.error('Error getting notes for saved jobs:', error);
    return [];
  }
};

// Real-time listeners
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
