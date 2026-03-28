'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, Loader2, XCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { format, isAfter } from 'date-fns'

interface Booking {
  id: string
  bookerName: string
  bookerEmail: string
  startTime: string
  endTime: string
  status: 'active' | 'cancelled'
  eventType: {
    title: string
  }
}

export default function BookingsPage() {
  const [upcoming, setUpcoming] = useState<Booking[]>([])
  const [past, setPast] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      if (res.ok) {
        setUpcoming(data.upcoming)
        setPast(data.past)
      }
    } catch (err) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { 
        method: 'PATCH' 
      })
      if (res.ok) {
        toast.success('Booking cancelled')
        fetchBookings()
      } else {
        toast.error('Failed to cancel')
      }
    } catch (err) {
      toast.error('Something went wrong')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
    </div>
  )

  const BookingTable = ({ bookings, isUpcoming }: { bookings: Booking[], isUpcoming: boolean }) => {
    // Mobile card view
    if (bookings.length === 0) {
      return (
        <div className="h-24 flex items-center justify-center text-center text-gray-500 py-8">
          <p className="text-sm">No bookings found.</p>
        </div>
      )
    }

    return (
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-200">
              <TableHead className="text-gray-700 font-semibold">Event Type</TableHead>
              <TableHead className="text-gray-700 font-semibold">Booker</TableHead>
              <TableHead className="text-gray-700 font-semibold">Date & Time</TableHead>
              <TableHead className="text-gray-700 font-semibold">Status</TableHead>
              <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id} className="group border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <TableCell className="font-semibold text-gray-900">
                  {booking.eventType.title}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{booking.bookerName}</span>
                    <span className="text-xs text-gray-500">{booking.bookerEmail}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                     <Calendar size={14} className="text-gray-400" />
                     {format(new Date(booking.startTime), 'MMM d, yyyy')}
                     <Clock size={14} className="text-gray-400 ml-2" />
                     {format(new Date(booking.startTime), 'h:mm a')}
                  </div>
                </TableCell>
                <TableCell>
                   {booking.status === 'active' ? (
                     <div className="flex items-center gap-1.5 text-green-700 text-xs font-semibold bg-green-100 px-3 py-1 rounded-full w-fit">
                        <CheckCircle2 size={12} />
                        Active
                     </div>
                   ) : (
                     <div className="flex items-center gap-1.5 text-gray-600 text-xs font-semibold bg-gray-200 px-3 py-1 rounded-full w-fit">
                        <XCircle size={12} />
                        Cancelled
                     </div>
                   )}
                </TableCell>
                <TableCell className="text-right">
                  {isUpcoming && booking.status === 'active' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Mobile card view
  const BookingCard = ({ booking, isUpcoming }: { booking: Booking, isUpcoming: boolean }) => (
    <div className="sm:hidden border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900">{booking.eventType.title}</h3>
            <p className="text-xs text-gray-600 mt-1">{booking.bookerName}</p>
            <p className="text-xs text-gray-500">{booking.bookerEmail}</p>
          </div>
          {booking.status === 'active' ? (
            <div className="flex items-center gap-1 text-green-700 text-xs font-semibold bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">
              <CheckCircle2 size={12} />
              Active
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-600 text-xs font-semibold bg-gray-200 px-2 py-1 rounded-full whitespace-nowrap">
              <XCircle size={12} />
              Cancelled
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar size={14} className="text-gray-400" />
            {format(new Date(booking.startTime), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock size={14} className="text-gray-400" />
            {format(new Date(booking.startTime), 'h:mm a')}
          </div>
        </div>
        {isUpcoming && booking.status === 'active' && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={() => handleCancel(booking.id)}
          >
            Cancel Booking
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-600 mt-2">Track all your scheduled appointments.</p>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="bg-gray-200/70 p-1 mb-6 w-full">
            <TabsTrigger value="upcoming" className="flex-1 rounded-md text-sm sm:text-base">Upcoming</TabsTrigger>
            <TabsTrigger value="past" className="flex-1 rounded-md text-sm sm:text-base">Past / Cancelled</TabsTrigger>
          </TabsList>
          
          <Card className="overflow-hidden border border-gray-200 shadow-sm">
            <TabsContent value="upcoming" className="m-0">
              <BookingTable bookings={upcoming} isUpcoming={true} />
              <div className="sm:hidden space-y-3 p-4">
                {upcoming.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isUpcoming={true} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="past" className="m-0">
              <BookingTable bookings={past} isUpcoming={false} />
              <div className="sm:hidden space-y-3 p-4">
                {past.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isUpcoming={false} />
                ))}
              </div>
            </TabsContent>
          </Card>
        </Tabs>
      </Card>
    </div>
  )
}
