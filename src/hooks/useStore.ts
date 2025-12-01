import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CurrencyPair, Coin, CoinSort } from '@/types/coin'
import type { ScreeningListId } from '@/types/screener'
import type { AppConfig } from '@/types/config'
import { DEFAULT_CONFIG, STORAGE_KEYS } from '@/types/config'
import type { AlertRule, AlertSettings, Alert } from '@/types/alert'
import { createIndexedDBStorage } from '@/services/storage'
import { alertHistory } from '@/services/alertHistory'

interface AppState {
  // Current selections
  currentPair: CurrencyPair
  currentList: ScreeningListId
  currentPage: number

  // Coin data
  coins: Coin[]
  filteredCoins: Coin[]
  isLoading: boolean
  error: string | null
  lastUpdated: number | null

  // Sorting
  sort: CoinSort

  // Settings
  config: AppConfig
  autoRefresh: boolean
  refreshInterval: number
  theme: 'dark' | 'light'

  // UI State
  leftSidebarCollapsed: boolean
  rightSidebarCollapsed: boolean

  // Alert system
  alertRules: AlertRule[]
  alertSettings: AlertSettings
  activeAlerts: Alert[]

  // Actions
  setCurrentPair: (pair: CurrencyPair) => void
  setCurrentList: (list: ScreeningListId) => void
  setCurrentPage: (page: number) => void
  setCoins: (coins: Coin[]) => void
  setFilteredCoins: (coins: Coin[]) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLastUpdated: (timestamp: number) => void
  setSort: (sort: CoinSort) => void
  setAutoRefresh: (enabled: boolean) => void
  setRefreshInterval: (interval: number) => void
  updateConfig: (config: Partial<AppConfig>) => void
  setTheme: (theme: 'dark' | 'light') => void
  setLeftSidebarCollapsed: (collapsed: boolean) => void
  setRightSidebarCollapsed: (collapsed: boolean) => void
  
  // Alert actions
  addAlertRule: (rule: AlertRule) => void
  updateAlertRule: (ruleId: string, updates: Partial<AlertRule>) => void
  deleteAlertRule: (ruleId: string) => void
  toggleAlertRule: (ruleId: string, enabled: boolean) => void
  updateAlertSettings: (settings: Partial<AlertSettings>) => void
  addAlert: (alert: Alert) => void
  dismissAlert: (alertId: string) => void
  clearAlerts: () => void
  
  reset: () => void
}

const initialState = {
  currentPair: DEFAULT_CONFIG.data.currentPair,
  currentList: DEFAULT_CONFIG.data.currentList,
  currentPage: 1,
  coins: [],
  filteredCoins: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  sort: {
    field: 'priceChangePercent' as const,
    direction: 'desc' as const,
  },
  config: DEFAULT_CONFIG,
  autoRefresh: DEFAULT_CONFIG.refresh.enabled,
  refreshInterval: DEFAULT_CONFIG.refresh.interval,
  theme: 'dark' as const,
  leftSidebarCollapsed: false,
  rightSidebarCollapsed: false,
  
  // Alert system defaults
  alertRules: [] as AlertRule[],
  alertSettings: {
    enabled: true,
    soundEnabled: false,
    notificationEnabled: true,
    maxAlertsPerSymbol: 5,
    alertCooldown: 60, // 1 minute between alerts for same symbol
    autoDismissAfter: 30, // Auto-dismiss after 30 seconds
  } as AlertSettings,
  activeAlerts: [] as Alert[],
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentPair: (pair) =>
        set({ currentPair: pair, currentPage: 1, coins: [], filteredCoins: [] }),

      setCurrentList: (list) =>
        set({ currentList: list, currentPage: 1 }),

      setCurrentPage: (page) =>
        set({ currentPage: page }),

      setCoins: (coins) =>
        set({ coins, lastUpdated: Date.now() }),

      setFilteredCoins: (filteredCoins) =>
        set({ filteredCoins }),

      setIsLoading: (isLoading) =>
        set({ isLoading }),

      setError: (error) =>
        set({ error }),

      setLastUpdated: (lastUpdated) =>
        set({ lastUpdated }),

      setSort: (sort) =>
        set({ sort }),

      setAutoRefresh: (autoRefresh) =>
        set({ autoRefresh }),

      setRefreshInterval: (refreshInterval) =>
        set({ refreshInterval }),

      updateConfig: (configUpdate) =>
        set((state) => ({
          config: { ...state.config, ...configUpdate },
        })),

      setTheme: (theme) =>
        set({ theme }),

      setLeftSidebarCollapsed: (leftSidebarCollapsed) =>
        set({ leftSidebarCollapsed }),

      setRightSidebarCollapsed: (rightSidebarCollapsed) =>
        set({ rightSidebarCollapsed }),

      // Alert actions
      addAlertRule: (rule) =>
        set((state) => ({
          alertRules: [...state.alertRules, rule],
        })),

      updateAlertRule: (ruleId, updates) =>
        set((state) => ({
          alertRules: state.alertRules.map((rule) =>
            rule.id === ruleId ? { ...rule, ...updates } : rule
          ),
        })),

      deleteAlertRule: (ruleId) =>
        set((state) => ({
          alertRules: state.alertRules.filter((rule) => rule.id !== ruleId),
        })),

      toggleAlertRule: (ruleId, enabled) =>
        set((state) => ({
          alertRules: state.alertRules.map((rule) =>
            rule.id === ruleId ? { ...rule, enabled } : rule
          ),
        })),

      updateAlertSettings: (settings) =>
        set((state) => ({
          alertSettings: { ...state.alertSettings, ...settings },
        })),

      addAlert: (alert) => {
        // Save to history asynchronously
        alertHistory.addToHistory(alert).catch((err) =>
          console.error('Failed to save alert to history:', err)
        )
        set((state) => ({
          activeAlerts: [...state.activeAlerts, alert],
        }))
      },

      dismissAlert: (alertId) =>
        set((state) => ({
          activeAlerts: state.activeAlerts.filter((alert) => alert.id !== alertId),
        })),

      clearAlerts: () =>
        set({ activeAlerts: [] }),

      reset: () =>
        set(initialState),
    }),
    {
      name: STORAGE_KEYS.USER_PREFERENCES,
      storage: createJSONStorage(() => createIndexedDBStorage()),
      partialize: (state) => ({
        currentPair: state.currentPair,
        currentList: state.currentList,
        sort: state.sort,
        config: state.config,
        autoRefresh: state.autoRefresh,
        refreshInterval: state.refreshInterval,
        theme: state.theme,
        leftSidebarCollapsed: state.leftSidebarCollapsed,
        rightSidebarCollapsed: state.rightSidebarCollapsed,
        alertRules: state.alertRules,
        alertSettings: state.alertSettings,
      }),
    }
  )
)
