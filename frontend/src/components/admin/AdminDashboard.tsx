import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { reservationsAPI, timeSlotsAPI } from '../../services/api';
import type { Reservation, TimeSlot, CreateTimeSlot } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newSlot, setNewSlot] = useState<CreateTimeSlot>({
    start_time: '',
    end_time: '',
    capacity: 1,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allReservations, allSlots] = await Promise.all([
        reservationsAPI.getAllReservations(),
        timeSlotsAPI.getAll(),
      ]);
      setReservations(allReservations);
      setTimeSlots(allSlots);
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await timeSlotsAPI.create(newSlot);
      setSuccess('Time slot created successfully!');
      setNewSlot({ start_time: '', end_time: '', capacity: 1 });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create time slot');
    }
  };

  const handleDeleteTimeSlot = async (id: number) => {
    if (!confirm('Are you sure you want to delete this time slot?')) return;

    try {
      await timeSlotsAPI.delete(id);
      setSuccess('Time slot deleted successfully!');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete time slot');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Manage time slots and view all reservations</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="reservations">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reservations">All Reservations</TabsTrigger>
              <TabsTrigger value="timeslots">Manage Time Slots</TabsTrigger>
            </TabsList>

            <TabsContent value="reservations" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5" />
                <h3 className="text-lg font-semibold">All Reservations ({reservations.length})</h3>
              </div>
              
              {reservations.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No reservations yet</p>
              ) : (
                <div className="space-y-4">
                  {reservations.map((reservation) => {
                    const slot = timeSlots.find(s => s.id === reservation.time_slot_id);
                    return (
                      <Card key={reservation.id} className="border-2">
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold">User ID: {reservation.user_id}</div>
                                <div className="text-sm text-gray-600">
                                  {slot && format(new Date(slot.start_time), 'PPP p')} - {slot && format(new Date(slot.end_time), 'p')}
                                </div>
                                {reservation.notes && (
                                  <div className="text-sm text-gray-500 mt-1">
                                    Notes: {reservation.notes}
                                  </div>
                                )}
                              </div>
                              <Badge className={getStatusColor(reservation.status)}>
                                {reservation.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeslots" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create New Time Slot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTimeSlot} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="start_time" className="text-sm font-medium">Start Time</label>
                        <Input
                          id="start_time"
                          type="datetime-local"
                          value={newSlot.start_time}
                          onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="end_time" className="text-sm font-medium">End Time</label>
                        <Input
                          id="end_time"
                          type="datetime-local"
                          value={newSlot.end_time}
                          onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="capacity" className="text-sm font-medium">Capacity</label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        value={newSlot.capacity}
                        onChange={(e) => setNewSlot({ ...newSlot, capacity: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Create Time Slot</Button>
                  </form>
                </CardContent>
              </Card>

              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Existing Time Slots ({timeSlots.length})</h3>
              </div>

              {timeSlots.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No time slots created yet</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {timeSlots.map((slot) => (
                    <Card key={slot.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="font-semibold">
                              {format(new Date(slot.start_time), 'PPP')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {format(new Date(slot.start_time), 'p')} - {format(new Date(slot.end_time), 'p')}
                            </div>
                            <div className="text-sm text-gray-500">
                              Capacity: {slot.capacity}
                            </div>
                            <Badge className={slot.is_available ? 'bg-green-500' : 'bg-gray-500'}>
                              {slot.is_available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteTimeSlot(slot.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
