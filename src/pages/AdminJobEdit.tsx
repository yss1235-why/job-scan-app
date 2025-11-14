import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, List, ListOrdered, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getUser } from '@/lib/storage';
import { getJobById, saveJobToFirestore, addJobNote } from '@/lib/firebaseService';
import { Job } from '@/types/job';
import { useToast } from '@/hooks/use-toast';
import { validateJobData } from '@/lib/sanitize';

const AdminJobEdit = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = jobId === 'new';

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    short: '',
    location: '',
    locationType: 'state',
    district: '',
    state: '',
    sector: 'government',
    contractType: 'permanent',
    fee: 0,
    published: false,
    applyBy: '',
    examDate: '',
    description: '',
    registrationLink: '',
  });

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (!isNew && jobId) {
      loadJob(jobId);
    }
  }, [jobId, isNew]);

  const loadJob = async (id: string) => {
    try {
      setLoading(true);
      const job = await getJobById(id);
      if (job) {
        setFormData({
          ...job,
          applyBy: job.applyBy?.split('T')[0] || '',
          examDate: job.examDate?.split('T')[0] || '',
          registrationLink: job.registrationLink || '',
          locationType: job.locationType || 'state',
          district: job.district || '',
          state: job.state || '',
          sector: job.sector || 'government',
          contractType: job.contractType || 'permanent',
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

  const handleFieldChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Clear validation error for this field when user types
    if (validationErrors[field]) {
      const { [field]: _, ...rest } = validationErrors;
      setValidationErrors(rest);
    }
  };

  const handleSave = async () => {
    // Validate all job data
    const validation = validateJobData({
      title: formData.title,
      short: formData.short,
      location: formData.location,
      locationType: formData.locationType,
      district: formData.district,
      state: formData.state,
      sector: formData.sector,
      contractType: formData.contractType,
      fee: formData.fee || 0,
      applyBy: formData.applyBy,
      examDate: formData.examDate,
      description: formData.description,
      registrationLink: formData.registrationLink,
    });

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setValidationErrors({});

    try {
      setLoading(true);
      
      const jobData: Job = {
        id: isNew ? `job_${Date.now()}` : jobId!,
        ...validation.sanitizedData!, // Use sanitized data
        published: formData.published || false,
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
    } catch (error: any) {
      console.error('Error saving job:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save job',
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
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g., Junior Clerk - MPSC"
                className={validationErrors.title ? 'border-red-500' : ''}
              />
              {validationErrors.title && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="short">Short Description</Label>
              <Input
                id="short"
                value={formData.short}
                onChange={(e) => handleFieldChange('short', e.target.value)}
                placeholder="e.g., Government clerical position"
                className={validationErrors.short ? 'border-red-500' : ''}
              />
              {validationErrors.short && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.short}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                placeholder="e.g., Imphal"
                className={validationErrors.location ? 'border-red-500' : ''}
              />
              {validationErrors.location && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.location}</p>
              )}
            </div>

            <div>
              <Label htmlFor="locationType">Location Type *</Label>
              <Select
                value={formData.locationType}
                onValueChange={(value) => handleFieldChange('locationType', value)}
              >
                <SelectTrigger className={validationErrors.locationType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local (District Level)</SelectItem>
                  <SelectItem value="state">State Level</SelectItem>
                  <SelectItem value="national">National Level</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.locationType && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.locationType}</p>
              )}
            </div>

            {formData.locationType === 'local' && (
              <div>
                <Label htmlFor="district">District * (Required for Local Jobs)</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleFieldChange('district', e.target.value)}
                  placeholder="e.g., Imphal East"
                  className={validationErrors.district ? 'border-red-500' : ''}
                />
                {validationErrors.district && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.district}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleFieldChange('state', e.target.value)}
                placeholder="e.g., Manipur"
                className={validationErrors.state ? 'border-red-500' : ''}
              />
              {validationErrors.state && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.state}</p>
              )}
            </div>

            <div>
              <Label htmlFor="sector">Sector *</Label>
              <Select
                value={formData.sector}
                onValueChange={(value) => handleFieldChange('sector', value)}
              >
                <SelectTrigger className={validationErrors.sector ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.sector && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.sector}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contractType">Contract Type *</Label>
              <Select
                value={formData.contractType}
                onValueChange={(value) => handleFieldChange('contractType', value)}
              >
                <SelectTrigger className={validationErrors.contractType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="temporary">Temporary/Part-time</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.contractType && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.contractType}</p>
              )}
            </div>

            <div>
              <Label htmlFor="fee">Application Fee (₹)</Label>
              <Input
                id="fee"
                type="number"
                value={formData.fee}
                onChange={(e) => handleFieldChange('fee', Number(e.target.value))}
                placeholder="0"
                min="0"
                max="100000"
                className={validationErrors.fee ? 'border-red-500' : ''}
              />
              {validationErrors.fee && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.fee}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Maximum fee: ₹100,000
              </p>
            </div>

            <div>
              <Label htmlFor="registrationLink">Official Registration Link (HTTPS only)</Label>
              <Input
                id="registrationLink"
                type="url"
                value={formData.registrationLink}
                onChange={(e) => handleFieldChange('registrationLink', e.target.value)}
                placeholder="https://example.com/register"
                className={validationErrors.registrationLink ? 'border-red-500' : ''}
              />
              {validationErrors.registrationLink && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.registrationLink}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Paste the official website link where users can register themselves (must use HTTPS)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="applyBy">Apply By Date *</Label>
                <Input
                  id="applyBy"
                  type="date"
                  value={formData.applyBy}
                  onChange={(e) => handleFieldChange('applyBy', e.target.value)}
                  className={validationErrors.applyBy ? 'border-red-500' : ''}
                />
                {validationErrors.applyBy && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.applyBy}</p>
                )}
              </div>

              <div>
                <Label htmlFor="examDate">Exam Date</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => handleFieldChange('examDate', e.target.value)}
                  className={validationErrors.examDate ? 'border-red-500' : ''}
                />
                {validationErrors.examDate && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.examDate}</p>
                )}
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
                onCheckedChange={(checked) => handleFieldChange('published', checked)}
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
                type="button"
              >
                <List className="w-4 h-4 mr-2" />
                Bullets
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertTemplate('numbered')}
                type="button"
              >
                <ListOrdered className="w-4 h-4 mr-2" />
                Steps
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertTemplate('documents')}
                type="button"
              >
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </Button>
            </div>

            <div>
              <Label htmlFor="description">Description (HTML supported - will be sanitized)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Enter job description with HTML formatting..."
                className={`min-h-[300px] font-mono text-sm ${validationErrors.description ? 'border-red-500' : ''}`}
              />
              {validationErrors.description && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                HTML will be automatically sanitized to remove dangerous scripts. Max 50,000 characters.
              </p>
            </div>

            {formData.description && (
              <div>
                <Label>Preview (After Sanitization)</Label>
                <div
                  className="border rounded-lg p-4 prose prose-sm max-w-none bg-surface"
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
