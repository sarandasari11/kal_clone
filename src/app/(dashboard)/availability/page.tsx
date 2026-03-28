'use client'

import { useEffect, useState } from 'react'
import { Clock, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Availability {
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface DateOverride {
  id: string
  date: string
  startTime: string | null
  endTime: string | null
  isBlocked: boolean
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<Availability[]>([])
  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingOverride, setSavingOverride] = useState(false)
  const [timeZone, setTimeZone] = useState('UTC')
  const [overrideForm, setOverrideForm] = useState({
    date: '',
    isBlocked: true,
    startTime: '09:00',
    endTime: '17:00',
  })

  useEffect(() => {
    fetchAvailability()
    fetchDateOverrides()
    fetchTimeZone()
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

  const fetchDateOverrides = async () => {
    try {
      const res = await fetch('/api/date-overrides')
      const data = await res.json()
      if (res.ok) {
        const formatted = data.map((d: any) => ({
          ...d,
          startTime: d.startTime ? new Date(d.startTime).toISOString().slice(11, 16) : null,
          endTime: d.endTime ? new Date(d.endTime).toISOString().slice(11, 16) : null,
        }))
        setDateOverrides(formatted)
      }
    } catch (err) {
      toast.error('Failed to load date overrides')
    }
  }

  const handleUpdate = (dayIndex: number, fields: Partial<Availability>) => {
    setAvailability(prev => prev.map(d => d.dayOfWeek === dayIndex ? { ...d, ...fields } : d))
  }

  const fetchTimeZone = async () => {
    try {
      const res = await fetch('/api/user')
      if (res.ok) {
        const data = await res.json()
        setTimeZone(data.timeZone || 'UTC')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const updateTimeZone = async (newTz: string) => {
    setTimeZone(newTz)
    try {
      await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeZone: newTz })
      })
      toast.success('Timezone updated')
    } catch {
      toast.error('Failed to change timezone')
    }
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

  const handleCreateOverride = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!overrideForm.date) {
      toast.error('Please select a date')
      return
    }

    setSavingOverride(true)
    try {
      const payload = {
        date: overrideForm.date,
        isBlocked: overrideForm.isBlocked,
        startTime: overrideForm.isBlocked ? null : overrideForm.startTime,
        endTime: overrideForm.isBlocked ? null : overrideForm.endTime,
      }

      const res = await fetch('/api/date-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success('Date override saved')
        setOverrideForm({
          date: '',
          isBlocked: true,
          startTime: '09:00',
          endTime: '17:00',
        })
        fetchDateOverrides()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to save override')
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setSavingOverride(false)
    }
  }

  const handleDeleteOverride = async (id: string) => {
    try {
      const res = await fetch(`/api/date-overrides/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Date override removed')
        fetchDateOverrides()
      } else {
        toast.error('Failed to delete override')
      }
    } catch (err) {
      toast.error('Something went wrong')
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Availability</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg italic">Configure your default working hours and schedule.</p>
        </div>
        <Button 
          onClick={saveAvailability} 
          disabled={saving} 
          className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 gap-2"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-8">
          <div className="premium-card p-8">
            <div className="mb-8">
               <h2 className="text-2xl font-bold text-slate-900">Weekly Hours</h2>
               <p className="text-slate-500 font-medium mt-1">Select the days and times you are available for bookings.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {availability.map((day, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={day.dayOfWeek} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-6 first:pt-0 last:pb-0 gap-6"
                >
                  <div className="flex items-center gap-6 min-w-max">
                    <Switch 
                      checked={day.isAvailable}
                      onCheckedChange={(val) => handleUpdate(day.dayOfWeek, { isAvailable: val })}
                      className="data-[state=checked]:bg-primary"
                    />
                    <span className="font-bold text-slate-900 w-24 text-lg">{dayNames[day.dayOfWeek]}</span>
                  </div>

                  {day.isAvailable ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 w-full sm:w-auto p-1 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner"
                    >
                      <Input 
                        type="time" 
                        className="w-full sm:w-32 bg-transparent border-none font-bold text-slate-700 shadow-none focus-visible:ring-0" 
                        value={day.startTime}
                        onChange={(e) => handleUpdate(day.dayOfWeek, { startTime: e.target.value })}
                      />
                      <span className="text-slate-400 font-bold px-1">–</span>
                      <Input 
                        type="time" 
                        className="w-full sm:w-32 bg-transparent border-none font-bold text-slate-700 shadow-none focus-visible:ring-0" 
                        value={day.endTime}
                        onChange={(e) => handleUpdate(day.dayOfWeek, { endTime: e.target.value })}
                      />
                    </motion.div>
                  ) : (
                    <div className="text-sm font-bold text-slate-400 px-6 py-3 bg-slate-50 rounded-2xl italic">Unavailable</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="premium-card p-8 group">
             <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Timezone</h2>
                <p className="text-slate-500 font-medium mt-1">Ensure your availability matches your local time.</p>
             </div>
             <div className="outline-box p-4 bg-slate-50/50">
               <select
                  className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-700 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                  value={timeZone}
                  onChange={(e) => updateTimeZone(e.target.value)}
                >
                  <option value="UTC">UTC (Global)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Central Europe (CET)</option>
                  <option value="Asia/Tokyo">Japan (JST)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="Australia/Sydney">Sydney (AEST)</option>
               </select>
             </div>
          </div>

          <div className="premium-card p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Overrides</h2>
              <p className="text-slate-500 font-medium mt-1">Block specific dates or custom hours.</p>
            </div>
            
            <div className="outline-box p-6 mb-8">
              <form onSubmit={handleCreateOverride} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Date</Label>
                  <Input
                    type="date"
                    className="h-12 rounded-xl"
                    value={overrideForm.date}
                    onChange={(e) => setOverrideForm((prev) => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                   <span className="text-sm font-bold text-slate-700">Block full day</span>
                   <Switch
                      checked={overrideForm.isBlocked}
                      onCheckedChange={(val) => setOverrideForm((prev) => ({ ...prev, isBlocked: val }))}
                      className="data-[state=checked]:bg-red-500"
                    />
                </div>
                
                {!overrideForm.isBlocked && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <Input
                      type="time"
                      className="h-12 rounded-xl"
                      value={overrideForm.startTime}
                      onChange={(e) => setOverrideForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    />
                    <Input
                      type="time"
                      className="h-12 rounded-xl"
                      value={overrideForm.endTime}
                      onChange={(e) => setOverrideForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    />
                  </motion.div>
                )}
                
                <Button type="submit" disabled={savingOverride} className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all">
                  {savingOverride ? <Loader2 className="animate-spin" size={18} /> : 'Add Override'}
                </Button>
              </form>
            </div>

            <AnimatePresence>
              <div className="space-y-3">
                {dateOverrides.map((override) => (
                  <motion.div
                    key={override.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="outline-box p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        {new Date(override.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 h-8 rounded-lg font-bold text-xs"
                        onClick={() => handleDeleteOverride(override.id)}
                      >
                        Remove
                      </Button>
                    </div>
                    {override.isBlocked ? (
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded-full">Blocked</span>
                    ) : (
                      <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/5 rounded-full w-fit">
                        {override.startTime} - {override.endTime}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
