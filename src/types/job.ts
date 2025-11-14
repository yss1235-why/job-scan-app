// src/types/job.ts
export interface Job {
  id: string;
  title: string;
  short: string;
  location: string;
  
  // NEW FIELDS
  locationType: 'local' | 'state' | 'national';
  district?: string; // For local jobs
  state: string; // State name
  sector: 'government' | 'private';
  contractType: 'permanent' | 'contract' | 'temporary' | 'part-time';
  
  fee?: number;
  published: boolean;
  applyBy: string;
  examDate?: string;
  description: string;
  registrationLink?: string;
  createdAt: Date;
  lastUpdated: Date;
}

export interface User {
  uid: string;
  name: string;
  phone: string;
  district: string;
  state: string;
  email: string;
  role: 'user' | 'admin';
}

export interface JobNote {
  id: string;
  jobId: string;
  message: string;
  createdAt: Date;
}
