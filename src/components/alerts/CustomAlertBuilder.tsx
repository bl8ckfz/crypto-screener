import { useState } from 'react'
import { AlertRule, AlertCondition, AlertType, AlertSeverity } from '@/types/alert'
import { Timeframe } from '@/types/coin'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface CustomAlertBuilderProps {
  onSave: (rule: AlertRule) => void
  onCancel: () => void
}

const ALERT_TYPES: { value: AlertType; label: string; description: string }[] = [
  { value: 'price_pump', label: 'Price Pump', description: 'Price increased significantly' },
  { value: 'price_dump', label: 'Price Dump', description: 'Price decreased significantly' },
  { value: 'volume_spike', label: 'Volume Spike', description: 'Volume increased significantly' },
  { value: 'volume_drop', label: 'Volume Drop', description: 'Volume decreased significantly' },
  { value: 'vcp_signal', label: 'VCP Signal', description: 'VCP pattern detected' },
  { value: 'fibonacci_break', label: 'Fibonacci Break', description: 'Price broke Fibonacci level' },
  { value: 'trend_reversal', label: 'Trend Reversal', description: 'Trend direction changed' },
]

const TIMEFRAMES: Timeframe[] = ['5s', '15s', '30s', '1m', '3m', '5m', '15m']

const COMPARISONS: { value: AlertCondition['comparison']; label: string }[] = [
  { value: 'greater_than', label: 'Greater than (>)' },
  { value: 'less_than', label: 'Less than (<)' },
  { value: 'equals', label: 'Equals (=)' },
]

const SEVERITIES: { value: AlertSeverity; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-blue-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'critical', label: 'Critical', color: 'text-red-400' },
]

export function CustomAlertBuilder({ onSave, onCancel }: CustomAlertBuilderProps) {
  const [ruleName, setRuleName] = useState('')
  const [conditions, setConditions] = useState<AlertCondition[]>([
    {
      type: 'price_pump',
      threshold: 5,
      comparison: 'greater_than',
      timeframe: '1m',
    },
  ])
  const [severity, setSeverity] = useState<AlertSeverity>('medium')
  const [symbols, setSymbols] = useState<string>('')
  const [notificationEnabled, setNotificationEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [errors, setErrors] = useState<string[]>([])

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        type: 'price_pump',
        threshold: 5,
        comparison: 'greater_than',
        timeframe: '1m',
      },
    ])
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const updateCondition = (index: number, updates: Partial<AlertCondition>) => {
    setConditions(
      conditions.map((condition, i) =>
        i === index ? { ...condition, ...updates } : condition
      )
    )
  }

  const validate = (): boolean => {
    const newErrors: string[] = []

    if (!ruleName.trim()) {
      newErrors.push('Rule name is required')
    }

    if (conditions.length === 0) {
      newErrors.push('At least one condition is required')
    }

    conditions.forEach((condition, index) => {
      if (condition.threshold === undefined || isNaN(condition.threshold)) {
        newErrors.push(`Condition ${index + 1}: Invalid threshold value`)
      }
    })

    // Validate symbol format if provided
    if (symbols.trim()) {
      const symbolList = symbols.split(',').map((s) => s.trim()).filter(Boolean)
      const invalidSymbols = symbolList.filter(
        (s) => !/^[A-Z0-9]+$/.test(s)
      )
      if (invalidSymbols.length > 0) {
        newErrors.push(`Invalid symbols: ${invalidSymbols.join(', ')}`)
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSave = () => {
    if (!validate()) {
      return
    }

    const symbolList = symbols
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)

    const rule: AlertRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: ruleName.trim(),
      enabled: true,
      symbols: symbolList,
      conditions,
      severity,
      notificationEnabled,
      soundEnabled,
      createdAt: Date.now(),
    }

    onSave(rule)
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">Custom Alert Rule</h4>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-sm font-medium text-red-400">Please fix the following errors:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-300">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rule Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Rule Name *
        </label>
        <Input
          value={ruleName}
          onChange={(e) => setRuleName(e.target.value)}
          placeholder="e.g., High Volume Pump Alert"
          className="w-full"
        />
      </div>

      {/* Conditions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">
            Conditions * ({conditions.length})
          </label>
          <Button onClick={addCondition} variant="secondary" size="sm">
            + Add Condition
          </Button>
        </div>

        <div className="space-y-3">
          {conditions.map((condition, index) => (
            <div
              key={index}
              className="relative rounded-lg border border-gray-700 bg-gray-900/50 p-3"
            >
              {/* Remove button */}
              {conditions.length > 1 && (
                <button
                  onClick={() => removeCondition(index)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors"
                  title="Remove condition"
                >
                  ✕
                </button>
              )}

              <div className="space-y-3 pr-6">
                {/* Alert Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Alert Type
                  </label>
                  <select
                    value={condition.type}
                    onChange={(e) =>
                      updateCondition(index, { type: e.target.value as AlertType })
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    {ALERT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Comparison */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Comparison
                    </label>
                    <select
                      value={condition.comparison}
                      onChange={(e) =>
                        updateCondition(index, {
                          comparison: e.target.value as AlertCondition['comparison'],
                        })
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    >
                      {COMPARISONS.map((comp) => (
                        <option key={comp.value} value={comp.value}>
                          {comp.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Threshold */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Threshold (%)
                    </label>
                    <Input
                      type="number"
                      value={condition.threshold}
                      onChange={(e) =>
                        updateCondition(index, { threshold: parseFloat(e.target.value) })
                      }
                      step="0.1"
                      min="0"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Timeframe */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Timeframe
                  </label>
                  <select
                    value={condition.timeframe || ''}
                    onChange={(e) =>
                      updateCondition(index, {
                        timeframe: e.target.value ? (e.target.value as Timeframe) : undefined,
                      })
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Any timeframe</option>
                    {TIMEFRAMES.map((tf) => (
                      <option key={tf} value={tf}>
                        {tf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-2 text-xs text-gray-500">
          All conditions must be met (AND logic) for the alert to trigger
        </p>
      </div>

      {/* Symbols */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Watch Symbols (optional)
        </label>
        <Input
          value={symbols}
          onChange={(e) => setSymbols(e.target.value)}
          placeholder="e.g., BTCUSDT, ETHUSDT (leave empty for all)"
          className="w-full"
        />
        <p className="mt-1 text-xs text-gray-500">
          Comma-separated list. Leave empty to watch all symbols.
        </p>
      </div>

      {/* Severity */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Severity</label>
        <div className="grid grid-cols-4 gap-2">
          {SEVERITIES.map((sev) => (
            <button
              key={sev.value}
              onClick={() => setSeverity(sev.value)}
              className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                severity === sev.value
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
              }`}
            >
              {sev.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={notificationEnabled}
            onChange={(e) => setNotificationEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-300">Enable in-app notifications</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-300">Enable sound alerts</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} variant="primary" className="flex-1">
          Save Rule
        </Button>
        <Button onClick={onCancel} variant="secondary" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}
