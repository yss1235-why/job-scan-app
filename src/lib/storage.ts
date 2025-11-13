import { Job, User, JobNote } from '@/types/job';

// Simulated backend using localStorage
const STORAGE_KEYS = {
  USER: 'jobnotify_user',
  SAVED_JOBS: 'jobnotify_saved_jobs',
  JOBS: 'jobnotify_jobs',
  NOTES: 'jobnotify_notes',
};

// User management
export const saveUser = (user: User) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const clearUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Saved jobs management
export const getSavedJobIds = (): string[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SAVED_JOBS);
  return data ? JSON.parse(data) : [];
};

export const toggleSavedJob = (jobId: string): boolean => {
  const saved = getSavedJobIds();
  const index = saved.indexOf(jobId);
  
  if (index > -1) {
    saved.splice(index, 1);
  } else {
    saved.push(jobId);
  }
  
  localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(saved));
  return index === -1; // returns true if job was added
};

export const isJobSaved = (jobId: string): boolean => {
  return getSavedJobIds().includes(jobId);
};

// Jobs management
export const getJobs = (): Job[] => {
  const data = localStorage.getItem(STORAGE_KEYS.JOBS);
  if (!data) {
    // Initialize with sample data
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
        description: `<h3>How to Register:</h3>
<ol>
  <li>Visit the official MPSC website</li>
  <li>Click on "Apply Online"</li>
  <li>Fill in your personal details</li>
  <li>Upload required documents</li>
  <li>Pay the application fee</li>
  <li>Submit and download receipt</li>
</ol>

<h3>Documents Required:</h3>
<ul>
  <li>Aadhaar Card</li>
  <li>Class 10 Marksheet</li>
  <li>Class 12 Marksheet</li>
  <li>Recent passport photo</li>
  <li>Signature scan</li>
</ul>`,
        createdAt: new Date(),
        lastUpdated: new Date(),
      },
      {
        id: '2',
        title: 'SSC MTS 2025',
        short: 'Multi-Tasking Staff recruitment',
        location: 'All India',
        fee: 100,
        published: true,
        applyBy: '2025-11-30',
        examDate: '2026-02-10',
        description: `<h3>Exam Pattern:</h3>
<ul>
  <li>Paper I: Computer Based Test</li>
  <li>Paper II: Descriptive Paper</li>
  <li>Duration: 90 minutes each</li>
</ul>

<h3>Eligibility:</h3>
<ul>
  <li>Age: 18-25 years</li>
  <li>Qualification: 10th pass</li>
</ul>`,
        createdAt: new Date(),
        lastUpdated: new Date(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(sampleJobs));
    return sampleJobs;
  }
  return JSON.parse(data);
};

export const saveJob = (job: Job) => {
  const jobs = getJobs();
  const index = jobs.findIndex(j => j.id === job.id);
  
  if (index > -1) {
    jobs[index] = job;
  } else {
    jobs.push(job);
  }
  
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
};

// Notes management
export const getNotes = (): JobNote[] => {
  const data = localStorage.getItem(STORAGE_KEYS.NOTES);
  return data ? JSON.parse(data) : [];
};

export const addNote = (jobId: string, message: string) => {
  const notes = getNotes();
  const newNote: JobNote = {
    id: Date.now().toString(),
    jobId,
    message,
    createdAt: new Date(),
  };
  notes.unshift(newNote);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
};

export const getNotesForSavedJobs = (): JobNote[] => {
  const savedJobIds = getSavedJobIds();
  const allNotes = getNotes();
  return allNotes.filter(note => savedJobIds.includes(note.jobId));
};
