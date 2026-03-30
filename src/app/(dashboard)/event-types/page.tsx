'use client'

import { useEffect, useState } from 'react'
import { Plus, ExternalLink, Copy, Edit, Trash, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface EventType {
  id: string
  title: string
  description: string | null
  duration: number
  bufferAfterMinutes: number
  slug: string
  user: {
    username: string
  }
}

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingEventTypeId, setDeletingEventTypeId] = useState<string | null>(null)
  const [editingEventTypeId, setEditingEventTypeId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '30',
    bufferAfterMinutes: '0',
    slug: ''
  })
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    duration: '30',
    bufferAfterMinutes: '0',
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
        setFormData({ title: '', description: '', duration: '30', bufferAfterMinutes: '0', slug: '' })
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to create event type')
      }
    } catch (err) {
      toast.error('Something went wrong')
    }
  }

  const getPublicUrl = (username: string, slug: string) => {
    return `${window.location.origin}/${username}/${slug}`
  }

  const copyLink = (username: string, slug: string) => {
    const url = getPublicUrl(username, slug)
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  const openEditDialog = (eventType: EventType) => {
    setEditingEventTypeId(eventType.id)
    setEditFormData({
      title: eventType.title,
      description: eventType.description || '',
      duration: String(eventType.duration),
      bufferAfterMinutes: String(eventType.bufferAfterMinutes),
      slug: eventType.slug,
    })
    setIsEditDialogOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEventTypeId) return

    try {
      const res = await fetch(`/api/event-types/${editingEventTypeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })

      if (res.ok) {
        toast.success('Event type updated')
        setIsEditDialogOpen(false)
        setEditingEventTypeId(null)
        fetchEventTypes()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to update event type')
      }
    } catch (err) {
      toast.error('Something went wrong')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/event-types/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Event type deleted')
        setIsDeleteDialogOpen(false)
        setDeletingEventTypeId(null)
        fetchEventTypes()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to delete event type')
      }
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const openDeleteDialog = (id: string) => {
    setDeletingEventTypeId(id)
    setIsDeleteDialogOpen(true)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 sm:space-y-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Event Types</h1>
          <p className="text-slate-500 mt-2 font-medium text-base sm:text-lg italic">Create and manage your scheduling links.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="h-11 sm:h-14 px-5 sm:px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20 transition-all active:scale-95 gap-2.5 sm:gap-3 text-base sm:text-lg">
              <Plus size={20} />
              New Event Type
            </Button>
          } />
          <DialogContent className="rounded-[32px] sm:max-w-md">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Add a new event type</DialogTitle>
                <DialogDescription>Create a new event type to start scheduling meetings.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-bold text-slate-700">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. 15 Minute Meeting" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="font-bold text-slate-700">URL Slug</Label>
                  <div className="outline-box p-3 bg-slate-50/50 flex items-center gap-2 text-sm text-slate-400 border-none shadow-none">
                    <span className="font-bold">kalclone.com/</span>
                    <input 
                      id="slug"
                      className="flex-1 bg-transparent py-1 focus:outline-none text-slate-900 font-extrabold placeholder:text-slate-300"
                      placeholder="quick-chat"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="outline-box p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/30">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="font-bold text-slate-700">Duration (min)</Label>
                    <Input 
                      id="duration" 
                      type="number" 
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="h-12 rounded-xl bg-white border-slate-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buffer" className="font-bold text-slate-700">Buffer (min)</Label>
                    <Input
                      id="buffer"
                      type="number"
                      min="0"
                      value={formData.bufferAfterMinutes}
                      onChange={(e) => setFormData({ ...formData, bufferAfterMinutes: e.target.value })}
                      className="h-12 rounded-xl bg-white border-slate-200"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="font-bold text-slate-700">Description (optional)</Label>
                  <Input 
                    id="description" 
                    placeholder="Briefly describe the event purpose" 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="ghost" className="rounded-xl font-bold" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="rounded-xl font-bold px-6 bg-slate-900 text-white">Create Event Type</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="rounded-[32px] sm:max-w-md">
            <form onSubmit={handleEdit}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Edit event type</DialogTitle>
                <DialogDescription>Update your event type details.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="font-bold text-slate-700">Title</Label>
                  <Input
                    id="edit-title"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-slug" className="font-bold text-slate-700">URL Slug</Label>
                  <div className="outline-box p-3 bg-slate-50/50 flex items-center gap-2 text-sm text-slate-400 border-none shadow-none">
                    <span className="font-bold">kalclone.com/</span>
                    <input
                      id="edit-slug"
                      className="flex-1 bg-transparent py-1 focus:outline-none text-slate-900 font-extrabold"
                      value={editFormData.slug}
                      onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="outline-box p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/30">
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration" className="font-bold text-slate-700">Duration (min)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      value={editFormData.duration}
                      onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                      className="h-12 rounded-xl bg-white border-slate-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-buffer" className="font-bold text-slate-700">Buffer (min)</Label>
                    <Input
                      id="edit-buffer"
                      type="number"
                      min="0"
                      value={editFormData.bufferAfterMinutes}
                      onChange={(e) => setEditFormData({ ...editFormData, bufferAfterMinutes: e.target.value })}
                      className="h-12 rounded-xl bg-white border-slate-200"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="font-bold text-slate-700">Description (optional)</Label>
                  <Input
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="ghost" className="rounded-xl font-bold" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="rounded-xl font-bold px-6 bg-slate-900 text-white">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-[32px] bg-slate-200/50 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {eventTypes.map((et, index) => (
              <motion.div
                key={et.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="premium-card group relative p-5 sm:p-8 flex flex-col h-full bg-white shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="h-4 w-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200/50" />
                  <div className="flex gap-1 transform translate-x-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors" onClick={() => copyLink(et.user.username, et.slug)}>
                      <Copy size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors" onClick={() => openEditDialog(et)}>
                      <Edit size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors" onClick={() => window.open(getPublicUrl(et.user.username, et.slug), '_blank')}>
                      <ExternalLink size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" onClick={() => openDeleteDialog(et.id)}>
                      <Trash size={18} />
                    </Button>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors duration-300">{et.title}</h3>
                  <p className="text-sm font-semibold text-slate-400 mt-1 flex items-center gap-1.5 opacity-80 decoration-slate-300">
                    <span className="text-slate-300">/</span>{et.user.username}<span className="text-slate-300">/</span>{et.slug}
                  </p>
                  
                  {et.description && (
                    <p className="mt-4 text-sm text-slate-500 line-clamp-2 font-medium leading-relaxed italic">
                      &quot;{et.description}&quot;
                    </p>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                    <Clock size={16} className="text-primary/60" />
                    <span>{et.duration}m</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300 mx-1" />
                    <span className="text-slate-400 font-medium">{et.bufferAfterMinutes}m buffer</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Delete Event Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event type? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl font-bold"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeletingEventTypeId(null)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl font-bold bg-red-600 px-6"
              onClick={() => deletingEventTypeId && handleDelete(deletingEventTypeId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
