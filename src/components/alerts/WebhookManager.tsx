import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useStore } from '@/hooks/useStore'
import { testDiscordWebhook, testTelegramWebhook, isValidDiscordWebhookUrl } from '@/services/webhookService'
import type { WebhookConfig } from '@/types/alert'

export function WebhookManager() {
  const alertSettings = useStore((state) => state.alertSettings)
  const updateAlertSettings = useStore((state) => state.updateAlertSettings)
  
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'discord' as 'discord' | 'telegram',
    url: '',
    botToken: '',
    chatId: '',
  })
  const [isTesting, setIsTesting] = useState<string | null>(null)
  const [error, setError] = useState<string>('')

  const handleAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setFormData({ name: '', type: 'discord', url: '', botToken: '', chatId: '' })
    setError('')
  }

  const handleEdit = (webhook: WebhookConfig) => {
    setIsAdding(true)
    setEditingId(webhook.id)
    
    if (webhook.type === 'telegram') {
      const match = webhook.url.match(/^telegram:\/\/([^:]+):(.+)$/)
      if (match) {
        const [, botToken, chatId] = match
        setFormData({ name: webhook.name, type: 'telegram', url: '', botToken, chatId })
      }
    } else {
      setFormData({ name: webhook.name, type: webhook.type, url: webhook.url, botToken: '', chatId: '' })
    }
    setError('')
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      setError('Please enter a name')
      return
    }

    if (formData.type === 'discord') {
      if (!formData.url || !isValidDiscordWebhookUrl(formData.url)) {
        setError('Please enter a valid Discord webhook URL')
        return
      }
    } else if (formData.type === 'telegram') {
      if (!formData.botToken || !formData.chatId) {
        setError('Please enter both bot token and chat ID')
        return
      }
    }

    const webhooks = [...(alertSettings.webhooks || [])]
    
    if (editingId) {
      const index = webhooks.findIndex(w => w.id === editingId)
      if (index >= 0) {
        webhooks[index] = {
          ...webhooks[index],
          name: formData.name,
          type: formData.type,
          url: formData.type === 'telegram' 
            ? `telegram://${formData.botToken}:${formData.chatId}`
            : formData.url,
        }
      }
    } else {
      const newWebhook: WebhookConfig = {
        id: `webhook_${Date.now()}`,
        name: formData.name,
        type: formData.type,
        url: formData.type === 'telegram' 
          ? `telegram://${formData.botToken}:${formData.chatId}`
          : formData.url,
        enabled: true,
        createdAt: Date.now(),
      }
      webhooks.push(newWebhook)
    }

    updateAlertSettings({ webhooks })
    setIsAdding(false)
    setEditingId(null)
    setError('')
  }

  const handleDelete = (id: string) => {
    const webhooks = (alertSettings.webhooks || []).filter(w => w.id !== id)
    updateAlertSettings({ webhooks })
  }

  const handleToggle = (id: string) => {
    const webhooks = (alertSettings.webhooks || []).map(w =>
      w.id === id ? { ...w, enabled: !w.enabled } : w
    )
    updateAlertSettings({ webhooks })
  }

  const handleTest = async (webhook: WebhookConfig) => {
    setIsTesting(webhook.id)
    setError('')

    let success = false
    
    if (webhook.type === 'discord') {
      success = await testDiscordWebhook(webhook.url)
    } else if (webhook.type === 'telegram') {
      const match = webhook.url.match(/^telegram:\/\/([^:]+):(.+)$/)
      if (match) {
        const [, botToken, chatId] = match
        success = await testTelegramWebhook(botToken, chatId)
      }
    }

    setIsTesting(null)
    
    if (!success) {
      setError(`Test failed for ${webhook.name}`)
    }
  }

  const webhooks = alertSettings.webhooks || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-white">Webhook Configurations</h4>
          <p className="text-xs text-gray-400">
            {webhooks.filter(w => w.enabled).length} of {webhooks.length} webhooks active
          </p>
        </div>
        <Button onClick={handleAdd} variant="secondary" size="sm">
          + Add Webhook
        </Button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 space-y-3">
          <h5 className="text-sm font-medium text-white">
            {editingId ? 'Edit Webhook' : 'New Webhook'}
          </h5>

          <div>
            <label className="text-xs text-gray-400">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Discord Channel"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="discord">Discord</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>

          {formData.type === 'discord' ? (
            <div>
              <label className="text-xs text-gray-400">Webhook URL</label>
              <Input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://discord.com/api/webhooks/..."
              />
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs text-gray-400">Bot Token</label>
                <Input
                  type="password"
                  value={formData.botToken}
                  onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                  placeholder="123456:ABC-DEF..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Chat ID</label>
                <Input
                  value={formData.chatId}
                  onChange={(e) => setFormData({ ...formData, chatId: e.target.value })}
                  placeholder="-1001234567890"
                />
              </div>
            </>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={handleSave} variant="primary" size="sm">
              Save
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false)
                setEditingId(null)
                setError('')
              }}
              variant="secondary"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Webhook List */}
      {webhooks.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No webhooks configured. Add one to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="rounded-lg border border-gray-700 bg-gray-800/50 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={webhook.enabled}
                      onChange={() => handleToggle(webhook.id)}
                      className="peer sr-only"
                    />
                    <div className="peer h-5 w-9 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-600 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                  
                  <div>
                    <div className="text-sm font-medium text-white">{webhook.name}</div>
                    <div className="text-xs text-gray-400">
                      {webhook.type === 'discord' ? '🔵 Discord' : '✈️ Telegram'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleTest(webhook)}
                    variant="secondary"
                    size="sm"
                    disabled={isTesting === webhook.id}
                  >
                    {isTesting === webhook.id ? 'Testing...' : 'Test'}
                  </Button>
                  <Button
                    onClick={() => handleEdit(webhook)}
                    variant="secondary"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(webhook.id)}
                    variant="secondary"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
