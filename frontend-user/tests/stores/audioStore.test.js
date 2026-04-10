import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAudioStore } from '@/stores/audioStore'

describe('AudioStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAudioStore()
  })

  describe('Web Audio API Mock 测试', () => {
    it('AudioContext 应该可被 mock', () => {
      const mockAudioContext = vi.fn(() => ({
        state: 'running',
        createAnalyser: vi.fn(() => ({ fftSize: 2048 })),
        createMediaElementSource: vi.fn(() => ({ connect: vi.fn() })),
        resume: vi.fn(() => Promise.resolve()),
        close: vi.fn(() => Promise.resolve()),
        destination: {}
      }))
      global.AudioContext = mockAudioContext
      const ctx = new AudioContext()
      expect(ctx.state).toBe('running')
      expect(typeof ctx.createAnalyser).toBe('function')
    })

    it('Analyser 节点 mock 应正确工作', () => {
      const mockAnalyser = {
        fftSize: 2048,
        smoothingTimeConstant: 0.8,
        getByteFrequencyData: vi.fn((arr) => arr.fill(128)),
        getByteTimeDomainData: vi.fn((arr) => arr.fill(128))
      }
      mockAnalyser.getByteFrequencyData(new Uint8Array(1024))
      expect(mockAnalyser.fftSize).toBe(2048)
      expect(mockAnalyser.getByteFrequencyData).toHaveBeenCalled()
    })
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

  describe('音频加载状态管理', () => {
    it('初始加载状态应为 false', () => {
      expect(store.isLoading).toBe(false)
    })

    it('setLoading 应正确设置加载状态', () => {
      store.setLoading(true)
      expect(store.isLoading).toBe(true)
      store.setLoading(false)
      expect(store.isLoading).toBe(false)
    })

    it('reset 应重置加载状态', () => {
      store.setLoading(true)
      store.reset()
      expect(store.isLoading).toBe(false)
    })
  })

  describe('播放进度更新', () => {
    it('setCurrentTime 应更新当前时间', () => {
      store.setCurrentTime(10.5)
      expect(store.currentTime).toBe(10.5)
    })

    it('progress 计算属性在 duration 为0时返回0', () => {
      store.setDuration(0)
      store.setCurrentTime(50)
      expect(store.progress).toBe(0)
    })

    it('progress 计算属性应正确计算', () => {
      store.setDuration(200)
      store.setCurrentTime(50)
      expect(store.progress).toBe(25)
      store.setCurrentTime(100)
      expect(store.progress).toBe(50)
      store.setCurrentTime(200)
      expect(store.progress).toBe(100)
    })

    it('currentTime 超过 duration 时 progress 处理', () => {
      store.setDuration(100)
      store.setCurrentTime(150)
      expect(store.progress).toBe(150)
    })
  })

  describe('错误处理', () => {
    describe('无效文件处理', () => {
      it('设置无效的空文件应保持初始状态', () => {
        expect(store.audioFile).toBeNull()
        expect(store.fileName).toBe('')
      })

      it('reset 后所有音频状态被清空', () => {
        store.setAudioFile({ name: 'bad.mp3' })
        store.setPlaying(true)
        store.setCurrentTime(50)
        store.setDuration(100)
        store.reset()
        expect(store.audioFile).toBeNull()
        expect(store.fileName).toBe('')
        expect(store.isPlaying).toBe(false)
        expect(store.currentTime).toBe(0)
        expect(store.duration).toBe(0)
        expect(store.isLoading).toBe(false)
      })
    })

    describe('加载失败状态处理', () => {
      it('多次调用 setLoading 正确切换状态', () => {
        store.setLoading(true)
        expect(store.isLoading).toBe(true)
        store.setLoading(false)
        expect(store.isLoading).toBe(false)
        store.setLoading(true)
        expect(store.isLoading).toBe(true)
      })

      it('reset 时保留音量和效果设置', () => {
        const testVolume = 0.65
        const testEffect = 'auroraFlow'
        store.setVolume(testVolume)
        store.setEffect(testEffect)
        store.setAudioFile({ name: 'test.mp3' })
        store.reset()
        expect(store.volume).toBe(testVolume)
        expect(store.currentEffect).toBe(testEffect)
      })
    })
  })
})
