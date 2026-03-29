'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, Loader2, XCircle, CheckCircle2, ArrowUpDown, Timer, Trash2 } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { format, isAfter } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

interface Booking {
  id: string
  bookerName: string
  bookerEmail: string
  startTime: string
  endTime: string
  status: 'active' | 'cancelled'
  eventType: {
    title: string
    duration?: number
  }
}

type UpcomingSortOption = 'next-first' | 'short-first' | 'long-first'
type PastSortOption = 'recent-first' | 'oldest-first' | 'cancelled-first'

export default function BookingsPage() {
  const [upcoming, setUpcoming] = useState<Booking[]>([])
  const [past, setPast] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null)
  const [removeBookingId, setRemoveBookingId] = useState<string | null>(null)
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null)
  const [rescheduleDateTime, setRescheduleDateTime] = useState('')
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [upcomingSort, setUpcomingSort] = useState<UpcomingSortOption>('next-first')
  const [pastSort, setPastSort] = useState<PastSortOption>('recent-first')

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
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { 
        method: 'PATCH' 
      })
      if (res.ok) {
        toast.success('Booking cancelled')
        setCancelBookingId(null)
        fetchBookings()
      } else {
        toast.error('Failed to cancel')
      }
    } catch (err) {
      toast.error('Something went wrong')
    }
  }

  const handleReschedule = async (booking: Booking) => {
    const parsed = new Date(rescheduleDateTime)
    if (Number.isNaN(parsed.getTime())) {
      toast.error('Invalid date/time format')
      return
    }

    try {
      const res = await fetch(`/api/bookings/${booking.id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: parsed.toISOString() }),
      })

      if (res.ok) {
        toast.success('Booking rescheduled')
        setRescheduleBooking(null)
        setRescheduleDateTime('')
        fetchBookings()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to reschedule booking')
      }
    } catch (err) {
      toast.error('Something went wrong')
    }
  }

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Booking removed')
        setRemoveBookingId(null)
        fetchBookings()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to remove booking')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  const openCancelDialog = (id: string) => {
    setCancelBookingId(id)
  }

  const openRescheduleDialog = (booking: Booking) => {
    setRescheduleBooking(booking)
    setRescheduleDateTime(format(new Date(booking.startTime), "yyyy-MM-dd'T'HH:mm"))
  }

  const getDurationMinutes = (booking: Booking) => {
    if (typeof booking.eventType.duration === 'number') {
      return booking.eventType.duration
    }

    const start = new Date(booking.startTime).getTime()
    const end = new Date(booking.endTime).getTime()
    const diff = Math.round((end - start) / 60000)
    return Number.isFinite(diff) && diff > 0 ? diff : 0
  }

  const sortedUpcoming = [...upcoming].sort((a, b) => {
    const aStart = new Date(a.startTime).getTime()
    const bStart = new Date(b.startTime).getTime()

    if (upcomingSort === 'next-first') {
      return aStart - bStart
    }

    const aDuration = getDurationMinutes(a)
    const bDuration = getDurationMinutes(b)

    if (upcomingSort === 'short-first') {
      if (aDuration !== bDuration) return aDuration - bDuration
      return aStart - bStart
    }

    if (aDuration !== bDuration) return bDuration - aDuration
    return aStart - bStart
  })

  const sortedPast = [...past].sort((a, b) => {
    const aStart = new Date(a.startTime).getTime()
    const bStart = new Date(b.startTime).getTime()

    if (pastSort === 'oldest-first') {
      return aStart - bStart
    }

    if (pastSort === 'cancelled-first') {
      if (a.status !== b.status) {
        return a.status === 'cancelled' ? -1 : 1
      }
    }

    return bStart - aStart
  })

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
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => openRescheduleDialog(booking)}
                      >
                        Reschedule
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openCancelDialog(booking.id)}
                      >
                        Cancel
                      </Button>
                    </div>
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
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => openRescheduleDialog(booking)}
            >
              Reschedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={() => openCancelDialog(booking.id)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Bookings</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg italic">Track and manage your scheduled appointments.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <ArrowUpDown size={16} className="text-slate-500" />
          <label htmlFor="booking-sort" className="text-sm font-semibold text-slate-700">Sort by</label>
          <select
            id="booking-sort"
            value={activeTab === 'upcoming' ? upcomingSort : pastSort}
            onChange={(e) => {
              if (activeTab === 'upcoming') {
                setUpcomingSort(e.target.value as UpcomingSortOption)
              } else {
                setPastSort(e.target.value as PastSortOption)
              }
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {activeTab === 'upcoming' ? (
              <>
                <option value="next-first">Next meetings first</option>
                <option value="short-first">Short meetings first</option>
                <option value="long-first">Long meetings first</option>
              </>
            ) : (
              <>
                <option value="recent-first">Recent meetings first</option>
                <option value="oldest-first">Oldest meetings first</option>
                <option value="cancelled-first">Cancelled first</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="w-full">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upcoming' | 'past')} className="w-full">
          <TabsList className="bg-slate-100/80 p-1.5 mb-10 w-fit rounded-2xl border border-slate-200/50">
            <TabsTrigger value="upcoming" className="rounded-xl px-8 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">Upcoming</TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl px-8 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">Past / Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="m-0 space-y-6">
             {sortedUpcoming.length === 0 ? (
               <div className="premium-card p-20 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-500 font-bold text-lg">No upcoming bookings found.</p>
               </div>
             ) : (
               <motion.div layout className="grid gap-6">
                 <AnimatePresence mode="popLayout">
                   {sortedUpcoming.map((booking, index) => (
                     <motion.div
                       key={booking.id}
                       layout
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: index * 0.05 }}
                       className="premium-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-6 group"
                     >
                       <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                               <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-lg mb-2 inline-block">
                                 {booking.eventType.title}
                               </span>
                               <h3 className="text-2xl font-bold text-slate-900">{booking.bookerName}</h3>
                               <p className="text-sm font-semibold text-slate-400 mt-0.5">{booking.bookerEmail}</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full shadow-sm shadow-emerald-100">
                               <CheckCircle2 size={12} />
                               Active
                            </div>
                          </div>
                          
                          <div className="outline-box p-4 bg-slate-50/50 flex flex-wrap gap-6 mt-4 border-none shadow-none">
                             <div className="flex items-center gap-2.5 text-slate-600">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                  <Calendar size={18} className="text-secondary-foreground/60" />
                                </div>
                                <span className="font-bold text-sm tracking-tight">{format(new Date(booking.startTime), 'EEEE, MMM d, yyyy')}</span>
                             </div>
                             <div className="flex items-center gap-2.5 text-slate-600">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                  <Clock size={18} className="text-secondary-foreground/60" />
                                </div>
                                <span className="font-bold text-sm tracking-tight">{format(new Date(booking.startTime), 'h:mm a')}</span>
                             </div>
                              <div className="flex items-center gap-2.5 text-slate-600">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                    <Timer size={18} className="text-secondary-foreground/60" />
                                </div>
                                <span className="font-bold text-sm tracking-tight">{getDurationMinutes(booking)} min</span>
                              </div>
                          </div>
                       </div>

                       <div className="flex md:flex-col gap-2 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
                         <Button
                           variant="ghost"
                           className="flex-1 md:w-32 rounded-xl font-bold text-primary hover:bg-primary/5 h-11"
                           onClick={() => openRescheduleDialog(booking)}
                         >
                           Reschedule
                         </Button>
                         <Button 
                           variant="ghost" 
                           className="flex-1 md:w-32 rounded-xl font-bold text-red-500 hover:bg-red-50 h-11"
                           onClick={() => openCancelDialog(booking.id)}
                         >
                           Cancel
                         </Button>
                       </div>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </motion.div>
             )}
          </TabsContent>

          <TabsContent value="past" className="m-0 space-y-6">
             {sortedPast.length === 0 ? (
               <div className="premium-card p-20 text-center">
                  <XCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-500 font-bold text-lg">No past bookings found.</p>
               </div>
             ) : (
               <div className="grid gap-6">
                 {sortedPast.map((booking, index) => (
                   <motion.div
                     key={booking.id}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: index * 0.05 }}
                     className="premium-card p-6 sm:p-8 opacity-70 grayscale-[0.5] hover:grayscale-0 transition-all flex flex-col md:flex-row md:items-center gap-6"
                   >
                     <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                             <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded-lg mb-2 inline-block">
                               {booking.eventType.title}
                             </span>
                             <h3 className="text-xl font-bold text-slate-900">{booking.bookerName}</h3>
                             <p className="text-xs font-semibold text-slate-400">{booking.bookerEmail}</p>
                          </div>
                          <div className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full ${
                             booking.status === 'active' ? 'text-slate-600 bg-slate-100' : 'text-red-500 bg-red-50'
                          }`}>
                             {booking.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                             {booking.status === 'active' ? 'Past' : 'Cancelled'}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-6 pt-1">
                           <div className="flex items-center gap-2.5 text-slate-500">
                             <Calendar size={16} />
                             <span className="font-bold text-xs">{format(new Date(booking.startTime), 'MMM d, yyyy')}</span>
                           </div>
                           <div className="flex items-center gap-2.5 text-slate-500">
                             <Clock size={16} />
                             <span className="font-bold text-xs">{format(new Date(booking.startTime), 'h:mm a')}</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex md:flex-col gap-2 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
                       <Button
                         variant="ghost"
                         className="flex-1 md:w-32 rounded-xl font-bold text-red-500 hover:bg-red-50 h-11"
                         onClick={() => setRemoveBookingId(booking.id)}
                       >
                         <Trash2 size={16} className="mr-1" />
                         Remove
                       </Button>
                     </div>
                   </motion.div>
                 ))}
               </div>
             )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!cancelBookingId} onOpenChange={(open) => !open && setCancelBookingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelBookingId(null)}>Keep booking</Button>
            <Button
              variant="destructive"
              onClick={() => cancelBookingId && handleCancel(cancelBookingId)}
            >
              Yes, cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!removeBookingId} onOpenChange={(open) => !open && setRemoveBookingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Booking</DialogTitle>
            <DialogDescription>
              This will permanently remove this booking from your records. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveBookingId(null)}>Keep booking</Button>
            <Button
              variant="destructive"
              onClick={() => removeBookingId && handleRemove(removeBookingId)}
            >
              Yes, remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rescheduleBooking} onOpenChange={(open) => {
        if (!open) {
          setRescheduleBooking(null)
          setRescheduleDateTime('')
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Booking</DialogTitle>
            <DialogDescription>
              Choose a new date and time for this booking.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="datetime-local"
            value={rescheduleDateTime}
            onChange={(e) => setRescheduleDateTime(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRescheduleBooking(null)
                setRescheduleDateTime('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => rescheduleBooking && handleReschedule(rescheduleBooking)}
              disabled={!rescheduleDateTime}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
