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
  eventType: {
    title: string
  }
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )

  if (!booking) return <div className="p-8 text-center text-gray-500 font-medium">Booking not found</div>

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-none shadow-2xl overflow-hidden">
        <div className="h-2 bg-green-500 w-full" />
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">This meeting is scheduled</CardTitle>
          <CardDescription>
            A confirmation email has been sent to {booking.bookerEmail}.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6 px-8">
          <div className="space-y-4 border rounded-xl p-6 bg-gray-50/50">
             <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy')}</p>
                </div>
             </div>
             
             <div className="flex items-start gap-3">
                <Clock size={18} className="text-gray-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{format(new Date(booking.startTime), 'h:mm a')}</p>
                  <p className="text-gray-500">Duration: 30 min</p> 
                </div>
             </div>

             <div className="flex items-start gap-3 pt-2 border-t">
                <div className="text-sm">
                  <p className="text-gray-500 mb-1 font-medium">Meeting Name</p>
                  <p className="font-bold text-lg text-gray-900">{booking.eventType.title}</p>
                </div>
             </div>
          </div>

          <div className="space-y-3 px-2">
             <div className="flex items-center gap-3 text-sm text-gray-600">
                <User size={16} className="text-gray-400" />
                <span>{booking.bookerName}</span>
             </div>
             <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={16} className="text-gray-400" />
                <span>{booking.bookerEmail}</span>
             </div>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50 border-t flex flex-col gap-3 p-6 mt-4">
           <Button className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-6">
              Add to Calendar
           </Button>
           <Button variant="ghost" className="w-full text-gray-500 font-medium" asChild>
             <Link href="/event-types">
               <Home size={16} className="mr-2" />
               Return Home
             </Link>
           </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
