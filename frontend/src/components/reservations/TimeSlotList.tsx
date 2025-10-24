import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { timeSlotsAPI, reservationsAPI } from '../../services/api';
import type { TimeSlot } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from 'lucide-react';

export const TimeSlotList: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookingSlotId, setBookingSlotId] = useState<number | null>(null);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const slots = await timeSlotsAPI.getAll();
      setTimeSlots(slots);
    } catch (err: any) {
      setError('Failed to load time slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const handleBook = async (timeSlotId: number) => {
    setError('');
    setSuccess('');
    setBookingSlotId(timeSlotId);

    try {
      await reservationsAPI.create({ time_slot_id: timeSlotId });
      setSuccess('Reservation created successfully!');
      fetchTimeSlots();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create reservation');
    } finally {
      setBookingSlotId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading available time slots...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Available Time Slots
          </CardTitle>
          <CardDescription>Select a time slot to make a reservation</CardDescription>
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

          {timeSlots.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No available time slots</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {timeSlots.map((slot) => (
                <Card key={slot.id} className="border-2">
                  <CardContent className="pt-6">
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
                      <Button
                        onClick={() => handleBook(slot.id)}
                        disabled={!slot.is_available || bookingSlotId === slot.id}
                        className="w-full mt-2"
                      >
                        {bookingSlotId === slot.id ? 'Booking...' : 'Book Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
