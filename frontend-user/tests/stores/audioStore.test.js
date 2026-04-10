import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAudioStore } from '@/stores/audioStore'

describe('AudioStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAudioStore()
  })

  describe('initial state', () => {
    it('should have correct initial values', () => {
      expect(store.audioFile).toBeNull()
      expect(store.fileName).toBe('')
      expect(store.isPlaying).toBe(false)
      expect(store.currentTime).toBe(0)
      expect(store.duration).toBe(0)
      expect(store.volume).toBe(0.8)
      expect(store.currentEffect).toBe('waveOcean')
      expect(store.isLoading).toBe(false)
    })

    it('should have 5 effects defined', () => {
      expect(store.effects.length).toBe(5)
      expect(store.effects.map(e => e.id)).toEqual([
        'waveOcean',
        'particleBurst',
        'starryNight',
        'auroraFlow',
        'spectrumBars'
      ])
    })
  })

  describe('setAudioFile', () => {
    it('should set audio file and filename', () => {
      const mockFile = { name: 'test.mp3' }
      store.setAudioFile(mockFile)
      expect(store.audioFile).toEqual(mockFile)
      expect(store.fileName).toBe('test.mp3')
    })
  })

  describe('setPlaying', () => {
    it('should set playing state', () => {
      store.setPlaying(true)
      expect(store.isPlaying).toBe(true)
      store.setPlaying(false)
      expect(store.isPlaying).toBe(false)
    })
  })

  describe('setCurrentTime', () => {
    it('should set current time', () => {
      store.setCurrentTime(30.5)
      expect(store.currentTime).toBe(30.5)
    })
  })

  describe('setDuration', () => {
    it('should set duration', () => {
      store.setDuration(180)
      expect(store.duration).toBe(180)
    })
  })

  describe('setVolume', () => {
    it('should set volume', () => {
      store.setVolume(0.5)
      expect(store.volume).toBe(0.5)
    })
  })

  describe('setEffect', () => {
    it('should set current effect', () => {
      store.setEffect('particleBurst')
      expect(store.currentEffect).toBe('particleBurst')
    })
  })

  describe('setLoading', () => {
    it('should set loading state', () => {
      store.setLoading(true)
      expect(store.isLoading).toBe(true)
    })
  })

  describe('reset', () => {
    it('should reset all audio-related state', () => {
      // Set some values
      store.setAudioFile({ name: 'test.mp3' })
      store.setPlaying(true)
      store.setCurrentTime(60)
      store.setDuration(180)

      // Reset
      store.reset()

      // Verify reset
      expect(store.audioFile).toBeNull()
      expect(store.fileName).toBe('')
      expect(store.isPlaying).toBe(false)
      expect(store.currentTime).toBe(0)
      expect(store.duration).toBe(0)
    })

    it('should not reset volume and effect', () => {
      store.setVolume(0.5)
      store.setEffect('starryNight')
      store.reset()
      expect(store.volume).toBe(0.5)
      expect(store.currentEffect).toBe('starryNight')
    })
  })

  describe('computed: progress', () => {
    it('should return 0 when duration is 0', () => {
      expect(store.progress).toBe(0)
    })

    it('should calculate progress percentage', () => {
      store.setDuration(100)
      store.setCurrentTime(25)
      expect(store.progress).toBe(25)
    })

    it('should return 100 at end of track', () => {
      store.setDuration(100)
      store.setCurrentTime(100)
      expect(store.progress).toBe(100)
    })
  })

  describe('computed: currentEffectConfig', () => {
    it('should return current effect configuration', () => {
      const config = store.currentEffectConfig
      expect(config.id).toBe('waveOcean')
      expect(config.name).toBe('波形海浪')
      expect(config.icon).toBe('🌊')
    })

    it('should update when effect changes', () => {
      store.setEffect('starryNight')
      const config = store.currentEffectConfig
      expect(config.id).toBe('starryNight')
      expect(config.name).toBe('星空漫游')
    })
  })
})
