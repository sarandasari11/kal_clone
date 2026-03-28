'use client'

import { useEffect, useState, use } from 'react'
import { Calendar as CalendarIcon, Clock, Globe, ChevronLeft } from 'lucide-react'
import { format, addMinutes, isSameDay } from 'date-fns'
import { Calendar as UICalendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface EventType {
  id: string
  title: string
  description: string | null
  duration: number
  slug: string
  userId: string
  user: {
    name: string | null
    username: string
  }
}

export default function PublicBookingPage({
  params: paramsPromise,
}: {
  params: Promise<{ username: string; slug: string }>
}) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [eventType, setEventType] = useState<EventType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [slots, setSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loadingEventType, setLoadingEventType] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [availability, setAvailability] = useState<number[]>([]) // Weekdays available
  
  // Booking form state
  const [step, setStep] = useState<'datetime' | 'details'>('datetime')
  const [bookerName, setBookerName] = useState('')
  const [bookerEmail, setBookerEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchEventType()
  }, [params.slug])

  useEffect(() => {
    if (selectedDate && eventType) {
      fetchSlots(selectedDate)
    }
  }, [selectedDate, eventType])

  const fetchEventType = async () => {
    try {
      const res = await fetch(`/api/slots/${params.slug}?info=true&date=${format(new Date(), 'yyyy-MM-dd')}`)
      const data = await res.json()
      
      if (res.ok) {
        setEventType(data.eventType)
        setSlots(data.slots)
        
        // Also fetch user availability to disable calendar days
        const resAvail = await fetch(`/api/availability`)
        const availData = await resAvail.json()
        setAvailability(availData.filter((a: any) => a.isAvailable).map((a: any) => a.dayOfWeek))
      }
    } catch (err) {
      toast.error('Failed to load event details')
    } finally {
      setLoadingEventType(false)
    }
  }

  const fetchSlots = async (date: Date) => {
    setLoadingSlots(true)
    setSelectedSlot(null)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const res = await fetch(`/api/slots/${params.slug}?date=${dateStr}`)
      const data = await res.json()
      if (res.ok) {
        setSlots(data)
      }
    } catch (err) {
      toast.error('Failed to load slots')
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot || !eventType) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTypeId: eventType.id,
          startTime: selectedSlot,
          bookerName,
          bookerEmail
        })
      })

      if (res.ok) {
        const booking = await res.json()
        router.push(`/booking/confirmed?id=${booking.id}`)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to book slot')
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingEventType) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  )

  if (!eventType) return <div className="p-8 text-center text-gray-500 font-medium">Event not found</div>

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Card className="overflow-hidden border shadow-xl bg-white">
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
            {/* Column 1: Info */}
            <div className="md:w-1/3 p-8 space-y-6">
              <button 
                onClick={() => step === 'details' ? setStep('datetime') : router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors mb-4"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Admin User</p>
                <h1 className="text-2xl font-bold text-gray-900">{eventType.title}</h1>
              </div>

              <div className="space-y-4 text-gray-600">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400" />
                  <span className="font-medium">{eventType.duration} min</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-gray-400" />
                  <span className="text-sm">UTC (Global)</span>
                </div>
                {selectedSlot && step === 'details' && (
                  <div className="flex items-center gap-3 text-blue-600 font-medium animate-in fade-in slide-in-from-left-2">
                    <CalendarIcon size={18} />
                    <span>{format(new Date(selectedSlot), 'h:mm a, EEEE, MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              {eventType.description && (
                <p className="text-sm text-gray-500 leading-relaxed italic border-t pt-4">
                  "{eventType.description}"
                </p>
              )}
            </div>

            {/* Column 2 & 3: Calendar and Slots */}
            <div className="flex-1">
              {step === 'datetime' ? (
                <div className="flex flex-col md:flex-row h-full">
                  <div className="p-8 md:w-2/3">
                    <h2 className="text-lg font-semibold mb-6">Select a Date & Time</h2>
                    <UICalendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border-none shadow-none"
                      disabled={(date) => {
                         const day = date.getDay()
                         return !availability.includes(day) || date < new Date(new Date().setHours(0,0,0,0))
                      }}
                    />
                  </div>

                  <div className="md:w-1/3 p-8 bg-gray-50/50 border-t md:border-t-0 md:border-l overflow-y-auto max-h-[500px]">
                    {selectedDate && (
                      <>
                        <p className="text-sm font-medium mb-4">{format(selectedDate, 'EEEE, MMM d')}</p>
                        {loadingSlots ? (
                          <div className="flex justify-center py-12">
                             <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                          </div>
                        ) : slots.length > 0 ? (
                          <div className="space-y-2">
                            {slots.map((slot) => (
                              <div key={slot} className="flex gap-2">
                                <Button
                                  variant={selectedSlot === slot ? 'default' : 'outline'}
                                  className="flex-1 py-6 border-blue-100 hover:border-blue-500 hover:bg-blue-50/50"
                                  onClick={() => setSelectedSlot(slot)}
                                >
                                  {format(new Date(slot), 'h:mm a')}
                                </Button>
                                {selectedSlot === slot && (
                                  <Button 
                                    className="px-6 animate-in slide-in-from-left-2 duration-300 bg-blue-600 hover:bg-blue-700"
                                    onClick={() => setStep('details')}
                                  >
                                    Next
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 text-center py-12">No slots available</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 max-w-md mx-auto h-full flex flex-col justify-center">
                  <h2 className="text-xl font-bold mb-6">Enter Details</h2>
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        placeholder="What's your name?" 
                        value={bookerName}
                        onChange={(e) => setBookerName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="john@example.com" 
                        value={bookerEmail}
                        onChange={(e) => setBookerEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full py-6 mt-6 bg-blue-600 hover:bg-blue-700 text-lg"
                      disabled={submitting}
                    >
                      {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
                      Confirm Booking
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}
