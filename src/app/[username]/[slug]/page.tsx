'use client'

import { useEffect, useState, use } from 'react'
import { Calendar as CalendarIcon, Clock, Globe, ChevronLeft, CalendarX } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar as UICalendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
    timeZone: string
  }
}

interface SlotsInfoResponse {
  slots: string[]
  availabilityDays: number[]
  isDateBlocked: boolean
  eventType: EventType
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
  const [isDateBlocked, setIsDateBlocked] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [skipInitialSlotsFetch, setSkipInitialSlotsFetch] = useState(false)
  
  // Booking form state
  const [step, setStep] = useState<'datetime' | 'details'>('datetime')
  const [bookerName, setBookerName] = useState('')
  const [bookerEmail, setBookerEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchEventType()
  }, [params.slug, params.username])

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (selectedDate && eventType) {
      if (skipInitialSlotsFetch) {
        setSkipInitialSlotsFetch(false)
        return
      }
      fetchSlots(selectedDate)
    }
  }, [selectedDate, eventType, skipInitialSlotsFetch])

  const fetchEventType = async () => {
    try {
      const res = await fetch(
        `/api/slots/${params.slug}?username=${params.username}&info=true&date=${format(new Date(), 'yyyy-MM-dd')}`
      )
      const data = await res.json() as SlotsInfoResponse
      
      if (res.ok) {
        setEventType(data.eventType)
        setSlots(data.slots)
        setAvailability(data.availabilityDays ?? [])
        setIsDateBlocked(Boolean(data.isDateBlocked))
        setSkipInitialSlotsFetch(true)
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
      const res = await fetch(`/api/slots/${params.slug}?username=${params.username}&date=${dateStr}&info=true`)
      const data = await res.json() as SlotsInfoResponse
      if (res.ok) {
        setSlots(data.slots)
        setIsDateBlocked(Boolean(data.isDateBlocked))
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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_90%_90%,rgba(16,185,129,0.08),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] py-8 px-4 sm:py-12 sm:px-6">
      <div className="absolute -left-12 top-16 h-44 w-44 rounded-full bg-blue-300/20 blur-3xl" aria-hidden />
      <div className="absolute -right-16 bottom-20 h-52 w-52 rounded-full bg-emerald-300/20 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-6xl">
        <Card className="overflow-hidden border border-slate-200/70 bg-white/90 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur rounded-3xl">
          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
            {/* Column 1: Info - Hidden on mobile in details step */}
            {(step === 'datetime' || isDesktop) && (
            <div className="lg:w-1/3 p-6 sm:p-8 space-y-7 bg-[linear-gradient(180deg,#eef4ff_0%,#f8fbff_45%,#ffffff_100%)]">
              <button 
                onClick={() => step === 'details' ? setStep('datetime') : router.push('/')}
                className="p-2 -m-2 hover:bg-blue-100 rounded-xl transition-colors duration-200"
                aria-label="Go back"
              >
                <ChevronLeft size={24} className="text-gray-600" />
              </button>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-[0.14em] mb-2">
                  {eventType.user.name || eventType.user.username}
                </p>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{eventType.title}</h1>
              </div>

              <div className="space-y-4 text-gray-700">
                <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <Clock size={20} className="text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base text-slate-800">{eventType.duration} minutes</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <Globe size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-slate-800">{eventType.user.timeZone || 'UTC'}</span>
                </div>
                {selectedSlot && step === 'details' && (
                  <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-200 text-blue-700 font-semibold animate-in fade-in slide-in-from-bottom-2">
                    <CalendarIcon size={20} className="flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{format(new Date(selectedSlot), 'h:mm a, EEEE, MMM d')}</span>
                  </div>
                )}
              </div>

              {eventType.description && (
                <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-xl text-sm text-slate-700 italic leading-relaxed">
                  &quot;{eventType.description}&quot;
                </div>
              )}
            </div>
            )}

            {/* Column 2 & 3: Calendar and Slots */}
            <div className="flex-1">
              {step === 'datetime' ? (
                <div className="flex flex-col lg:flex-row h-full divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                  <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-white">
                    <h2 className="text-xl sm:text-3xl font-black mb-6 text-slate-900 tracking-tight">Select a Date & Time</h2>
                    <div className="flex justify-center lg:justify-start">
                      <UICalendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-2xl border border-slate-200 shadow-sm bg-white"
                        disabled={(date) => {
                           const day = date.getDay()
                           return !availability.includes(day) || date < new Date(new Date().setHours(0,0,0,0))
                        }}
                      />
                    </div>
                  </div>

                  <div className="lg:w-1/3 p-6 sm:p-8 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] overflow-y-auto max-h-96 lg:max-h-none">
                    {selectedDate && (
                      <>
                        <div className="mb-5 rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
                          <p className="text-sm font-bold text-slate-900">{format(selectedDate, 'EEEE, MMM d, yyyy')}</p>
                          <p className="text-xs text-slate-500 mt-0.5">All times shown in {eventType.user.timeZone || 'UTC'}</p>
                        </div>
                        {loadingSlots ? (
                          <div className="flex justify-center py-12">
                             <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          </div>
                        ) : slots.length > 0 ? (
                          <div className="space-y-3">
                            {slots.map((slot) => (
                              <div key={slot} className="flex gap-2 flex-col sm:flex-row">
                                <Button
                                  variant={selectedSlot === slot ? 'default' : 'outline'}
                                  className={`flex-1 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-all duration-200 ${
                                    selectedSlot === slot 
                                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md' 
                                      : 'border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-50 text-slate-700'
                                  }`}
                                  onClick={() => setSelectedSlot(slot)}
                                >
                                  {format(new Date(slot), 'h:mm a')}
                                </Button>
                                {selectedSlot === slot && (
                                  <Button 
                                    className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold animate-in slide-in-from-left-2 duration-300 w-full sm:w-auto"
                                    onClick={() => setStep('details')}
                                  >
                                    Continue
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center">
                            <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full ${isDateBlocked ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                              <CalendarX size={18} />
                            </div>
                            <p className="text-sm font-semibold text-slate-800">
                              {isDateBlocked
                                ? 'This date is blocked by the host.'
                                : 'No available slots for this date.'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {isDateBlocked
                                ? 'Please pick another day from the calendar.'
                                : 'Try selecting another date to see open times.'}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8 flex flex-col justify-center bg-white">
                  <h2 className="text-2xl sm:text-3xl font-black mb-8 text-slate-900 tracking-tight">Your Details</h2>
                  <form onSubmit={handleBooking} className="max-w-sm space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base font-semibold text-slate-900">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Enter your name" 
                        value={bookerName}
                        onChange={(e) => setBookerName(e.target.value)}
                        className="py-3 text-base rounded-xl border border-slate-300 bg-slate-50/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base font-semibold text-slate-900">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={bookerEmail}
                        onChange={(e) => setBookerEmail(e.target.value)}
                        className="py-3 text-base rounded-xl border border-slate-300 bg-slate-50/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full py-3 sm:py-4 mt-8 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={submitting}
                    >
                      {submitting && <Loader2 className="animate-spin mr-2 inline-block" />}
                      {submitting ? 'Confirming...' : 'Confirm Booking'}
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
