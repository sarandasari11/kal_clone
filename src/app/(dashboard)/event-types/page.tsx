'use client'

import { useEffect, useState } from 'react'
import { Plus, ExternalLink, MoreVertical, Copy, Edit, Trash, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface EventType {
  id: string
  title: string
  description: string | null
  duration: number
  slug: string
}

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '30',
    slug: ''
  })

  useEffect(() => {
    fetchEventTypes()
  }, [])

  const fetchEventTypes = async () => {
    try {
      const res = await fetch('/api/event-types')
      const data = await res.json()
      if (res.ok) setEventTypes(data)
    } catch (err) {
      toast.error('Failed to load event types')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/event-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success('Event type created')
        setIsDialogOpen(false)
        fetchEventTypes()
        setFormData({ title: '', description: '', duration: '30', slug: '' })
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to create event type')
      }
    } catch (err) {
      toast.error('Something went wrong')
    }
  }

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/admin/${slug}` // Mock username as 'admin'
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event type?')) return
    try {
      const res = await fetch(`/api/event-types/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Event type deleted')
        fetchEventTypes()
      }
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Event Types</h1>
          <p className="text-sm text-gray-500">Manage your event types and availability.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="gap-2">
              <Plus size={18} />
              New Event Type
            </Button>
          } />
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add a new event type</DialogTitle>
                <DialogDescription>Create a new event type to start scheduling meetings.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. 15 Minute Meeting" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <div className="flex items-center gap-2 text-sm text-gray-500 border rounded-md px-3 bg-gray-50">
                    <span>calclone.com/admin/</span>
                    <input 
                      id="slug"
                      className="flex-1 bg-transparent py-2 focus:outline-none text-black"
                      placeholder="quick-chat"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input 
                    id="duration" 
                    type="number" 
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input 
                    id="description" 
                    placeholder="Briefly describe the event purpose" 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Create Event Type</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse border-2 border-dashed" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventTypes.map((et) => (
            <Card key={et.id} className="group relative overflow-hidden transition-all hover:shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-4 rounded-full bg-green-500" />
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900" onClick={() => copyLink(et.slug)} title="Copy booking link">
                      <Copy size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-700" onClick={() => window.open(`/admin/${et.slug}`, '_blank')} title="View live page">
                      <ExternalLink size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(et.id)}>
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg font-bold">{et.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  /admin/{et.slug}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={14} />
                  <span>{et.duration}m</span>
                </div>
              </CardContent>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-black opacity-0 transition-opacity group-hover:opacity-100" />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
