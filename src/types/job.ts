export interface Job {
  id: string;
  title: string;
  short: string;
  location: string;
  fee?: number;
  published: boolean;
  applyBy: string;
  examDate?: string;
  description: string;
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
