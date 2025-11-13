import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUser } from '@/lib/storage';
import { getAllBookings, updateBookingStatus, type Booking } from '@/lib/firebaseService';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getUser();
    
    if (!user || user.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const allBookings = await getAllBookings();
      setBookings(allBookings);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load registration requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (statusFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === statusFilter));
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      
      // Update local state
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));
      
      toast({
        title: 'Status Updated',
        description: `Registration request marked as ${newStatus}`,
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(b => b.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading requests...</p>
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
            <h1 className="text-lg font-bold">Registration Requests</h1>
          </div>
          <Badge variant="secondary">{filteredBookings.length} requests</Badge>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto pb-20">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <Card className="cursor-pointer hover:bg-surface" onClick={() => setStatusFilter('all')}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-primary">{getStatusCount('all')}</p>
              <p className="text-xs text-muted-foreground">All</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-surface" onClick={() => setStatusFilter('pending')}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">{getStatusCount('pending')}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-surface" onClick={() => setStatusFilter('processing')}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{getStatusCount('processing')}</p>
              <p className="text-xs text-muted-foreground">Processing</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-surface" onClick={() => setStatusFilter('completed')}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{getStatusCount('completed')}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-surface" onClick={() => setStatusFilter('cancelled')}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{getStatusCount('cancelled')}</p>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Dropdown */}
        <div className="mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings List */}
        <div className="space-y-3">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No registration requests found</p>
                {statusFilter !== 'all' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Try changing the filter to see more requests
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map(booking => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{booking.jobTitle}</h3>
                        <p className="text-xs text-muted-foreground">
                          Fee: ₹{booking.fee}
                        </p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>

                    {/* User Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-surface rounded-lg p-3">
                      <div>
                        <p className="text-muted-foreground">Name</p>
                        <p className="font-medium">{booking.userName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium truncate">{booking.userEmail}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Requested On</p>
                        <p className="font-medium">
                          {booking.createdAt.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Status Update Buttons */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Update Status:</p>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant={booking.status === 'pending' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(booking.id, 'pending')}
                          disabled={booking.status === 'pending'}
                        >
                          Pending
                        </Button>
                        <Button
                          size="sm"
                          variant={booking.status === 'processing' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(booking.id, 'processing')}
                          disabled={booking.status === 'processing'}
                        >
                          In Progress
                        </Button>
                        <Button
                          size="sm"
                          variant={booking.status === 'completed' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(booking.id, 'completed')}
                          disabled={booking.status === 'completed'}
                        >
                          Completed
                        </Button>
                        <Button
                          size="sm"
                          variant={booking.status === 'cancelled' ? 'destructive' : 'outline'}
                          onClick={() => handleStatusChange(booking.id, 'cancelled')}
                          disabled={booking.status === 'cancelled'}
                        >
                          Cancelled
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
