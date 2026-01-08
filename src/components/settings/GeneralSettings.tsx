/**
 * GeneralSettings Component
 * 
 * General application settings and preferences.
 * Placeholder for future features like theme, language, etc.
 * 
 * Phase 8.1.4: Create Settings Modal
 */
export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚙️</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          General Settings
        </h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Additional settings will be available here in future updates.
          This includes theme preferences, language selection, and more.
        </p>
      </div>

      {/* About Section */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          About
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Application</span>
            <span className="text-white font-semibold">Crypto Screener</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Version</span>
            <span className="text-white font-mono">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Build Date</span>
            <span className="text-white font-mono">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Environment</span>
            <span className="text-white font-mono">
              {import.meta.env.MODE === 'production' ? 'Production' : 'Development'}
            </span>
          </div>
        </div>
      </div>

      {/* Planned Features */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Coming Soon
        </h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-accent">•</span>
            <span>Theme selection (Dark / Light modes)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent">•</span>
            <span>Language preferences (English / Turkish)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent">•</span>
            <span>Notification preferences and sound controls</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent">•</span>
            <span>Data management (Export / Import / Clear cache)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent">•</span>
            <span>Keyboard shortcuts customization</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
