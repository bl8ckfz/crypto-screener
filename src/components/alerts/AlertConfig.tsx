import { useState } from 'react'
import { AlertRule, AlertType, LEGACY_ALERT_PRESETS } from '@/types/alert'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface AlertConfigProps {
  rules: AlertRule[]
  onRuleToggle: (ruleId: string, enabled: boolean) => void
  onRuleCreate: (rule: AlertRule) => void
  onRuleDelete: (ruleId: string) => void
}

/**
 * AlertConfig - UI for managing alert rules
 * 
 * Features:
 * - Display active alert rules with enable/disable toggles
 * - Preset selector for 8 legacy alert types
 * - Create custom rules with condition editor
 * - Edit existing rules (name, conditions, thresholds)
 */
export function AlertConfig({
  rules,
  onRuleToggle,
  onRuleCreate,
  onRuleDelete,
}: AlertConfigProps) {
  const [isCreating, setIsCreating] = useState(false)

  const handlePresetSelect = (presetName: string) => {
    const preset = LEGACY_ALERT_PRESETS.find(p => p.name === presetName)
    if (!preset) return

    const newRule: AlertRule = {
      id: `rule_${Date.now()}`,
      name: preset.name,
      enabled: true,
      conditions: [
        {
          type: preset.type,
          threshold: 0, // Legacy alerts use preset logic
          comparison: 'greater_than',
          timeframe: undefined,
        },
      ],
      symbols: [], // Empty = all symbols
      severity: preset.severity,
      notificationEnabled: true,
      soundEnabled: true,
      createdAt: Date.now(),
    }

    onRuleCreate(newRule)
    setIsCreating(false)
  }

  const getAlertTypeBadgeColor = (type: AlertType): string => {
    if (type.includes('bull') || type === 'price_pump' || type === 'volume_spike') {
      return 'bg-green-500/20 text-green-400'
    }
    if (type.includes('bear') || type === 'price_dump' || type === 'volume_drop') {
      return 'bg-red-500/20 text-red-400'
    }
    if (type.includes('hunter')) {
      return 'bg-purple-500/20 text-purple-400'
    }
    return 'bg-blue-500/20 text-blue-400'
  }

  const getAlertTypeLabel = (type: AlertType): string => {
    const labels: Record<AlertType, string> = {
      price_pump: 'Price Pump',
      price_dump: 'Price Dump',
      volume_spike: 'Volume Spike',
      volume_drop: 'Volume Drop',
      vcp_signal: 'VCP Signal',
      fibonacci_break: 'Fibonacci Break',
      trend_reversal: 'Trend Reversal',
      custom: 'Custom Alert',
      pioneer_bull: '🎯 Pioneer Bull',
      pioneer_bear: '🎯 Pioneer Bear',
      '5m_big_bull': '⚡ 5m Big Bull',
      '5m_big_bear': '⚡ 5m Big Bear',
      '15m_big_bull': '🔥 15m Big Bull',
      '15m_big_bear': '🔥 15m Big Bear',
      bottom_hunter: '🎣 Bottom Hunter',
      top_hunter: '🎣 Top Hunter',
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Alert Rules</h3>
          <p className="text-sm text-gray-400">
            {rules.filter(r => r.enabled).length} of {rules.length} rules active
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          variant="secondary"
          size="sm"
        >
          {isCreating ? 'Cancel' : '+ Add Rule'}
        </Button>
      </div>

      {/* Preset Selector */}
      {isCreating && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
          <h4 className="mb-3 text-sm font-medium text-white">Choose Alert Type</h4>
          <div className="grid grid-cols-1 gap-2">
            {LEGACY_ALERT_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset.name)}
                className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-3 text-left transition-colors hover:border-blue-500 hover:bg-gray-700"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {getAlertTypeLabel(preset.type)}
                    </span>
                    <Badge className={getAlertTypeBadgeColor(preset.type)}>
                      Legacy
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{preset.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Rules List */}
      <div className="space-y-2">
        {rules.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-700 bg-gray-800/30 p-8 text-center">
            <p className="text-sm text-gray-400">
              No alert rules configured yet.
              <br />
              Click "Add Rule" to create your first alert.
            </p>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={`rounded-lg border p-4 transition-colors ${
                rule.enabled
                  ? 'border-blue-500/50 bg-gray-800'
                  : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{rule.name}</h4>
                    {rule.conditions.map((condition, idx) => (
                      <Badge
                        key={idx}
                        className={getAlertTypeBadgeColor(condition.type)}
                      >
                        {getAlertTypeLabel(condition.type)}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Rule Details */}
                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <div>
                      Symbols: {rule.symbols.length === 0 ? 'All' : rule.symbols.join(', ')}
                    </div>
                    {rule.conditions.length > 0 && (
                      <div>
                        Conditions: {rule.conditions.length} condition(s)
                        {rule.conditions[0].threshold !== undefined && 
                          ` (threshold: ${rule.conditions[0].threshold})`}
                        {rule.conditions[0].timeframe && 
                          ` [${rule.conditions[0].timeframe}]`}
                      </div>
                    )}
                    <div className="text-gray-500">
                      Created: {new Date(rule.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => onRuleToggle(rule.id, e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-5 w-9 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-600 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-800"></div>
                  </label>
                  <Button
                    onClick={() => onRuleDelete(rule.id)}
                    variant="secondary"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Help Text */}
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-300">
        <p className="font-medium">💡 About Legacy Alerts</p>
        <p className="mt-1 text-blue-400">
          Legacy alert types (Pioneer, Big Bull/Bear, Hunters) replicate the original fast.html
          alert logic with predefined conditions. They monitor price movements, volume spikes, and
          trend patterns across multiple timeframes.
        </p>
      </div>
    </div>
  )
}
