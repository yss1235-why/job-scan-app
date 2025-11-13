import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, List, ListOrdered, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUser } from '@/lib/storage';
import { getJobById, saveJobToFirestore, addJobNote } from '@/lib/firebaseService';
import { Job } from '@/types/job';
import { useToast } from '@/hooks/use-toast';

const AdminJobEdit = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getUser();
  const isNew = jobId === 'new';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    short: '',
    location: '',
    fee: 0,
    published: false,
    applyBy: '',
    examDate: '',
    description: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    if (!isNew && jobId) {
      loadJob(jobId);
    }
  }, [user, jobId, isNew, navigate]);

  const loadJob = async (id: string) => {
    try {
      setLoading(true);
      const job = await getJobById(id);
      if (job) {
        setFormData({
          ...job,
          applyBy: job.applyBy?.split('T')[0] || '',
          examDate: job.examDate?.split('T')[0] || '',
        });
      }
    } catch (error) {
      console.error('Error loading job:', error);
      toast({
        title: 'Error',
        description: 'Failed to load job',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const insertTemplate = (template: string) => {
    const templates = {
      bullets: '\n<ul>\n  <li>Point 1</li>\n  <li>Point 2</li>\n  <li>Point 3</li>\n</ul>\n',
      numbered: '\n<ol>\n  <li>Step 1</li>\n  <li>Step 2</li>\n  <li>Step 3</li>\n</ol>\n',
      documents: '\n<h3>Documents Required:</h3>\n<ul>\n  <li>Aadhaar Card</li>\n  <li>Educational Certificates</li>\n  <li>Passport Size Photo</li>\n</ul>\n',
    };

    setFormData({
      ...formData,
      description: (formData.description || '') + templates[template as keyof typeof templates],
    });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.location || !formData.applyBy) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const jobData: Job = {
        id: isNew ? `job_${Date.now()}` : jobId!,
        title: formData.title!,
        short: formData.short || '',
        location: formData.location!,
        fee: formData.fee || 0,
        published: formData.published || false,
        applyBy: formData.applyBy!,
        examDate: formData.examDate || '',
        description: formData.description || '',
        createdAt: isNew ? new Date() : (formData.createdAt || new Date()),
        lastUpdated: new Date(),
      };

      await saveJobToFirestore(jobData);

      // Add note for existing jobs
      if (!isNew) {
        await addJobNote(jobData.id, `Job details updated: ${jobData.title}`);
      }

      toast({
        title: 'Success',
        description: isNew ? 'Job created successfully' : 'Job updated successfully',
      });

      navigate('/admin');
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: 'Error',
        description: 'Failed to save job',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isNew) {
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
      <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">{isNew ? 'New Job' : 'Edit Job'}</h1>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto pb-20">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Junior Clerk - MPSC"
              />
            </div>

            <div>
              <Label htmlFor="short">Short Description</Label>
              <Input
                id="short"
                value={formData.short}
                onChange={(e) => setFormData({ ...formData, short: e.target.value })}
                placeholder="e.g., Government clerical position"
              />
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Imphal"
              />
            </div>

            <div>
              <Label htmlFor="fee">Application Fee (₹)</Label>
              <Input
                id="fee"
                type="number"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="applyBy">Apply By Date *</Label>
                <Input
                  id="applyBy"
                  type="date"
                  value={formData.applyBy}
                  onChange={(e) => setFormData({ ...formData, applyBy: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="examDate">Exam Date</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="published">Published</Label>
                <p className="text-xs text-muted-foreground">
                  Make this job visible to users
                </p>
              </div>
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertTemplate('bullets')}
              >
                <List className="w-4 h-4 mr-2" />
                Bullets
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertTemplate('numbered')}
              >
                <ListOrdered className="w-4 h-4 mr-2" />
                Steps
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertTemplate('documents')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </Button>
            </div>

            <div>
              <Label htmlFor="description">Description (HTML supported)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter job description with HTML formatting..."
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            {formData.description && (
              <div>
                <Label>Preview</Label>
                <div
                  className="border rounded-lg p-4 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.description }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminJobEdit;
