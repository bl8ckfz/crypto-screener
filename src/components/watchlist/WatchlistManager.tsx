import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Watchlist } from '@/types'

const PRESET_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
]

const PRESET_ICONS = [
  '⭐', '🎯', '🔥', '💎', '📈', '📊', '🚀', '💰',
  '👀', '⚡', '🎲', '🎪', '🎨', '🏆', '💡', '🔔',
]

interface WatchlistManagerProps {
  onClose?: () => void
}

export function WatchlistManager({ onClose }: WatchlistManagerProps) {
  const { watchlists, addWatchlist, updateWatchlist, deleteWatchlist } = useStore()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    color: PRESET_COLORS[0].value,
    icon: PRESET_ICONS[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) return

    if (editingId) {
      // Update existing watchlist
      updateWatchlist(editingId, {
        name: formData.name.trim(),
        color: formData.color,
        icon: formData.icon,
      })
      setEditingId(null)
    } else {
      // Create new watchlist
      addWatchlist({
        name: formData.name.trim(),
        symbols: [],
        color: formData.color,
        icon: formData.icon,
      })
      setIsCreating(false)
    }

    // Reset form
    setFormData({
      name: '',
      color: PRESET_COLORS[0].value,
      icon: PRESET_ICONS[0],
    })
  }

  const handleEdit = (watchlist: Watchlist) => {
    setEditingId(watchlist.id)
    setFormData({
      name: watchlist.name,
      color: watchlist.color || PRESET_COLORS[0].value,
      icon: watchlist.icon || PRESET_ICONS[0],
    })
    setIsCreating(true)
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingId(null)
    setFormData({
      name: '',
      color: PRESET_COLORS[0].value,
      icon: PRESET_ICONS[0],
    })
  }

  const handleDelete = (watchlistId: string) => {
    if (confirm('Are you sure you want to delete this watchlist?')) {
      deleteWatchlist(watchlistId)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary-foreground">
          Manage Watchlists
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-primary-foreground transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Watchlist Form */}
      {isCreating && (
        <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-card-bg rounded-lg border border-border">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Watchlist"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`h-10 rounded-lg border-2 transition-all ${
                    formData.color === color.value
                      ? 'border-primary-foreground scale-105'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`h-10 rounded-lg border-2 transition-all text-xl ${
                    formData.icon === icon
                      ? 'border-primary-foreground scale-105 bg-card-bg'
                      : 'border-border hover:border-muted-foreground bg-primary-bg'
                  }`}
                  title={icon}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" variant="primary" className="flex-1">
              {editingId ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Create Button */}
      {!isCreating && (
        <Button
          variant="primary"
          onClick={() => setIsCreating(true)}
          className="w-full"
        >
          + New Watchlist
        </Button>
      )}

      {/* Watchlist List */}
      <div className="space-y-2">
        {watchlists.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No watchlists yet</p>
            <p className="text-xs mt-1">Create one to organize your favorite coins</p>
          </div>
        ) : (
          watchlists.map((watchlist) => (
            <div
              key={watchlist.id}
              className="flex items-center gap-3 p-3 bg-card-bg rounded-lg border border-border hover:border-muted-foreground transition-colors"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: watchlist.color }}
              >
                {watchlist.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-primary-foreground truncate">
                  {watchlist.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {watchlist.symbols.length} {watchlist.symbols.length === 1 ? 'coin' : 'coins'}
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(watchlist)}
                  className="px-2 py-1 text-xs rounded bg-primary-bg hover:bg-card-bg text-muted-foreground hover:text-primary-foreground transition-colors"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(watchlist.id)}
                  className="px-2 py-1 text-xs rounded bg-primary-bg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
