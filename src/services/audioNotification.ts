/**
 * Audio notification service for alert sounds
 * Uses Web Audio API to generate alert tones
 */

export type AlertSeverity = 'info' | 'warning' | 'critical'

class AudioNotificationService {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    // Initialize AudioContext on first user interaction to avoid autoplay policy
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      // Lazy initialization
    }
  }

  /**
   * Initialize AudioContext (call on user interaction)
   */
  private initAudioContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  /**
   * Enable or disable audio notifications
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  /**
   * Check if audio notifications are enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Play a beep tone with specified frequency and duration
   */
  private playTone(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.enabled) return

    this.initAudioContext()
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine'

    // Fade in/out to avoid clicks
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  /**
   * Play notification sound based on severity
   */
  playAlert(severity: AlertSeverity) {
    switch (severity) {
      case 'info':
        // Single medium tone - 500Hz for 150ms
        this.playTone(500, 0.15, 0.2)
        break

      case 'warning':
        // Two ascending tones - 600Hz then 800Hz
        this.playTone(600, 0.12, 0.25)
        setTimeout(() => this.playTone(800, 0.12, 0.25), 120)
        break

      case 'critical':
        // Three urgent tones - 900Hz, 1100Hz, 900Hz
        this.playTone(900, 0.1, 0.3)
        setTimeout(() => this.playTone(1100, 0.1, 0.3), 100)
        setTimeout(() => this.playTone(900, 0.1, 0.3), 200)
        break
    }
  }

  /**
   * Test the audio system with a sample sound
   */
  testSound() {
    this.initAudioContext()
    this.playTone(440, 0.2, 0.25) // A4 note for 200ms
  }
}

// Export singleton instance
export const audioNotificationService = new AudioNotificationService()
