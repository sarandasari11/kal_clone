'use client'

import { useEffect, useState } from 'react'
import { Clock, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'

interface Availability {
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
    try {
      const res = await fetch('/api/availability')
      const data = await res.json()
      if (res.ok) {
        // Map response to a clean format
        const formatted = data.map((d: any) => ({
          dayOfWeek: d.dayOfWeek,
          startTime: new Date(d.startTime).toISOString().substr(11, 5),
          endTime: new Date(d.endTime).toISOString().substr(11, 5),
          isAvailable: !!d.isAvailable
        }))
        
        // Ensure all days are present
        const fullWeek = Array.from({ length: 7 }, (_, i) => {
          const existing = formatted.find((f: any) => f.dayOfWeek === i)
          return existing || { dayOfWeek: i, startTime: '09:00', endTime: '17:00', isAvailable: false }
        })
        setAvailability(fullWeek)
      }
    } catch (err) {
      toast.error('Failed to load availability')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = (dayIndex: number, fields: Partial<Availability>) => {
    setAvailability(prev => prev.map(d => d.dayOfWeek === dayIndex ? { ...d, ...fields } : d))
  }

  const saveAvailability = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: availability })
      })
      if (res.ok) {
        toast.success('Availability updated')
      } else {
        toast.error('Failed to save')
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
          <p className="text-sm text-gray-500">Configure your default working hours and schedule.</p>
        </div>
        <Button onClick={saveAvailability} disabled={saving} className="gap-2">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Hours</CardTitle>
          <CardDescription>Select the days and times you are available for bookings.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {availability.map((day) => (
            <div key={day.dayOfWeek} className="flex flex-col sm:flex-row sm:items-center justify-between py-6 first:pt-0 last:pb-0 gap-4">
              <div className="flex items-center gap-4 w-32">
                <Switch 
                  checked={day.isAvailable}
                  onCheckedChange={(val) => handleUpdate(day.dayOfWeek, { isAvailable: val })}
                />
                <span className="font-medium text-sm w-20">{dayNames[day.dayOfWeek]}</span>
              </div>

              {day.isAvailable ? (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                  <Input 
                    type="time" 
                    className="w-32" 
                    value={day.startTime}
                    onChange={(e) => handleUpdate(day.dayOfWeek, { startTime: e.target.value })}
                  />
                  <span className="text-gray-400 text-sm">-</span>
                  <Input 
                    type="time" 
                    className="w-32" 
                    value={day.endTime}
                    onChange={(e) => handleUpdate(day.dayOfWeek, { endTime: e.target.value })}
                  />
                </div>
              ) : (
                <div className="flex-1 text-sm text-gray-400">Unavailable</div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div className="flex justify-end pt-4">
         <Button variant="outline" className="gap-2 text-gray-500" disabled>
            <Clock size={16} />
            Timezone: UTC (Global Default)
         </Button>
      </div>
    </div>
  )
}
