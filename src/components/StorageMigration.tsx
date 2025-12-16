/**
 * StorageMigration Component
 * 
 * Handles one-time migration from localStorage to IndexedDB.
 * Runs automatically on app initialization.
 */

import { useEffect, useState } from 'react'
import { migrateFromLocalStorage, getStorageStats } from '@/services/storage'
import { debug } from '@/utils/debug'
import { STORAGE_KEYS } from '@/types/config'

/**
 * Hook to handle storage migration
 */
export function useStorageMigration() {
  const [migrationStatus, setMigrationStatus] = useState<{
    isComplete: boolean
    hadData: boolean
    error: Error | null
  }>({
    isComplete: false,
    hadData: false,
    error: null,
  })

  useEffect(() => {
    const performMigration = async () => {
      try {
        // Check if migration has already been done
        const migrationKey = 'storage_migration_v1_complete'
        const alreadyMigrated = localStorage.getItem(migrationKey)

        if (alreadyMigrated === 'true') {
          setMigrationStatus({
            isComplete: true,
            hadData: false,
            error: null,
          })
          return
        }

        // Get keys to migrate
        const keysToMigrate = [
          STORAGE_KEYS.USER_PREFERENCES,
          STORAGE_KEYS.HISTORICAL_DATA,
          STORAGE_KEYS.ALERT_RULES,
          STORAGE_KEYS.WATCHLISTS,
        ]

        // Check if there's any data to migrate
        const hasData = keysToMigrate.some((key) => localStorage.getItem(key) !== null)

        if (hasData) {
          debug.log('🔄 Migrating localStorage data to IndexedDB...')
          await migrateFromLocalStorage(keysToMigrate)
          
          // Get storage stats after migration
          const stats = await getStorageStats()
          debug.log('📊 Storage stats:', {
            type: stats.type,
            keys: stats.keys.length,
            size: `${(stats.estimatedSize / 1024).toFixed(2)} KB`,
          })
        }

        // Mark migration as complete
        localStorage.setItem(migrationKey, 'true')

        setMigrationStatus({
          isComplete: true,
          hadData: hasData,
          error: null,
        })

        if (hasData) {
          debug.log('✅ Migration complete - using IndexedDB')
        } else {
          debug.log('ℹ️ No data to migrate - using IndexedDB for new data')
        }
      } catch (error) {
        console.error('❌ Migration failed:', error)
        setMigrationStatus({
          isComplete: true,
          hadData: false,
          error: error as Error,
        })
      }
    }

    performMigration()
  }, [])

  return migrationStatus
}

/**
 * StorageMigration Component
 * Place this near the root of your app to ensure migration runs early
 */
export function StorageMigration() {
  useStorageMigration()

  // This component doesn't render anything
  // It just handles the migration side effect
  return null
}

/**
 * StorageDebugInfo Component
 * Useful for development - shows storage information
 */
export function StorageDebugInfo() {
  const [stats, setStats] = useState<{
    type: string
    keys: number
    size: string
  } | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      const storageStats = await getStorageStats()
      setStats({
        type: storageStats.type,
        keys: storageStats.keys.length,
        size: `${(storageStats.estimatedSize / 1024).toFixed(2)} KB`,
      })
    }

    loadStats()
  }, [])

  if (!stats) return null

  // Only show in development (check import.meta.env for Vite)
  if (import.meta.env.PROD) return null

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg text-xs shadow-lg z-50 max-w-xs">
      <div className="font-bold mb-1">Storage Info</div>
      <div className="space-y-1 text-gray-300">
        <div>Type: {stats.type}</div>
        <div>Keys: {stats.keys}</div>
        <div>Size: {stats.size}</div>
      </div>
    </div>
  )
}
