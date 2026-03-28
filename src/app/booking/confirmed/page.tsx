'use client'

import { useEffect, useState, use } from 'react'
import { CheckCircle2, Calendar, Clock, User, Mail, Home } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface BookingData {
  id: string
  bookerName: string
  bookerEmail: string
  startTime: string
  endTime: string
  eventType: {
    title: string
    duration: number
  }
}

function toIcsDateTime(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export default function ConfirmationPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ id: string }>
}) {
  const searchParams = use(searchParamsPromise)
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (searchParams.id) {
      fetchBookingDetails(searchParams.id)
    }
  }, [searchParams.id])

  const fetchBookingDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/booking/${id}/confirm`)
      const data = await res.json()
      if (res.ok) {
        setBooking(data)
      }
    } catch (err) {
      console.error('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToGoogleCalendar = () => {
    if (!booking) return

    const start = new Date(booking.startTime)
    const end = new Date(booking.endTime)
    const eventTitle = booking.eventType.title
    const details = `Booking with ${booking.bookerName} (${booking.bookerEmail})`

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventTitle,
      dates: `${toIcsDateTime(start)}/${toIcsDateTime(end)}`,
      details,
    })

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank', 'noopener,noreferrer')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )

  if (!booking) return <div className="p-8 text-center text-gray-500 font-medium">Booking not found</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4 py-12">
      <Card className="max-w-xl w-full border border-green-200 shadow-2xl overflow-hidden rounded-2xl">
        <div className="h-1 bg-gradient-to-r from-green-500 to-green-600 w-full" />
        <CardHeader className="text-center pb-4 bg-gradient-to-b from-green-50 to-white">
          <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">Booking Confirmed!</CardTitle>
          <CardDescription className="text-base text-gray-600 mt-3">
            A confirmation has been sent to <span className="font-semibold text-gray-900">{booking.bookerEmail}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-8 px-6 sm:px-8">
          <div className="space-y-4 border-2 border-green-200 rounded-xl p-6 bg-gradient-to-br from-green-50 to-blue-50">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</p>
                  <p className="font-bold text-lg sm:text-xl text-gray-900">{format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy')}</p>
                </div>
             </div>
             
             <div className="border-t border-green-200 pt-4 flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock size={24} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Time</p>
                  <p className="font-bold text-lg sm:text-xl text-gray-900">{format(new Date(booking.startTime), 'h:mm a')}</p>
                  <p className="text-sm text-gray-600 mt-1">Duration: {booking.eventType.duration} minutes</p>
                </div>
             </div>

             <div className="border-t border-green-200 pt-4 flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <p className="text-sm font-bold text-orange-600">📅</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Event</p>
                  <p className="font-bold text-lg sm:text-xl text-gray-900">{booking.eventType.title}</p>
                </div>
             </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 space-y-3 border border-indigo-200">
             <div className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Attendee</p>
                  <p className="font-semibold text-gray-900">{booking.bookerName}</p>
                </div>
             </div>
             <div className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                  <p className="font-semibold text-gray-900 break-all">{booking.bookerEmail}</p>
                </div>
             </div>
          </div>
        </CardContent>

        <CardFooter className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex flex-col gap-3 p-6 mt-6">
            <Button
              onClick={handleAddToGoogleCalendar}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 sm:py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-base"
            >
              Add to Google Clender
           </Button>
           <Link href="/event-types" className="w-full">
             <Button variant="outline" className="w-full text-gray-700 border-gray-300 hover:bg-gray-100 font-semibold py-3 sm:py-4 rounded-lg text-base transition-all duration-200">
               <Home size={18} className="mr-2" />
               Back to Dashboard
             </Button>
           </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
