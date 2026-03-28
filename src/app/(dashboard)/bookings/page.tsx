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

  const BookingTable = ({ bookings, isUpcoming }: { bookings: Booking[], isUpcoming: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event Type</TableHead>
          <TableHead>Booker</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-gray-400">
              No bookings found.
            </TableCell>
          </TableRow>
        ) : (
          bookings.map((booking) => (
            <TableRow key={booking.id} className="group">
              <TableCell className="font-medium">
                {booking.eventType.title}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{booking.bookerName}</span>
                  <span className="text-xs text-gray-400">{booking.bookerEmail}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                   <Calendar size={14} className="text-gray-400" />
                   {format(new Date(booking.startTime), 'MMM d, yyyy')}
                   <Clock size={14} className="text-gray-400 ml-2" />
                   {format(new Date(booking.startTime), 'h:mm a')}
                </div>
              </TableCell>
              <TableCell>
                 {booking.status === 'active' ? (
                   <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full w-fit">
                      <CheckCircle2 size={12} />
                      Active
                   </div>
                 ) : (
                   <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium bg-gray-100 px-2 py-1 rounded-full w-fit">
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
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleCancel(booking.id)}
                  >
                    Cancel
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-sm text-gray-500">Track all your scheduled appointments.</p>
        </div>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="bg-gray-100/80 p-1 mb-6">
            <TabsTrigger value="upcoming" className="px-6 rounded-md">Upcoming</TabsTrigger>
            <TabsTrigger value="past" className="px-6 rounded-md">Past / Cancelled</TabsTrigger>
          </TabsList>
          
          <Card className="overflow-hidden border shadow-sm">
            <TabsContent value="upcoming" className="m-0">
               <BookingTable bookings={upcoming} isUpcoming={true} />
            </TabsContent>
            <TabsContent value="past" className="m-0">
               <BookingTable bookings={past} isUpcoming={false} />
            </TabsContent>
          </Card>
        </Tabs>
      </Card>
    </div>
  )
}
