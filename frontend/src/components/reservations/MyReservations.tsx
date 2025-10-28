import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { reservationsAPI, timeSlotsAPI } from '../../services/api';
import type { Reservation, TimeSlot } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

export const MyReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [timeSlots, setTimeSlots] = useState<Map<number, TimeSlot>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const myReservations = await reservationsAPI.getMyReservations();
      setReservations(myReservations);

      const slotIds = [...new Set(myReservations.map(r => r.time_slot_id))];
      const slots = await Promise.all(slotIds.map(id => timeSlotsAPI.getById(id)));
      const slotMap = new Map(slots.map(slot => [slot.id, slot]));
      setTimeSlots(slotMap);
    } catch (err: any) {
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (reservationId: number) => {
    setCancellingId(reservationId);
    try {
      await reservationsAPI.cancel(reservationId);
      fetchReservations();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
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
    return <div className="text-center py-8">Loading your reservations...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            My Reservations
          </CardTitle>
          <CardDescription>View and manage your reservations</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {reservations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">You have no reservations yet</p>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => {
                const slot = timeSlots.get(reservation.time_slot_id);
                return (
                  <Card key={reservation.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-semibold">
                              {slot && format(new Date(slot.start_time), 'PPP')}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {slot && `${format(new Date(slot.start_time), 'p')} - ${format(new Date(slot.end_time), 'p')}`}
                          </div>
                          {reservation.notes && (
                            <div className="text-sm text-gray-500">
                              Notes: {reservation.notes}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(reservation.status)}>
                              {reservation.status}
                            </Badge>
                          </div>
                        </div>
                        {reservation.status !== 'cancelled' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(reservation.id)}
                            disabled={cancellingId === reservation.id}
                          >
                            {cancellingId === reservation.id ? 'Cancelling...' : 'Cancel'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
