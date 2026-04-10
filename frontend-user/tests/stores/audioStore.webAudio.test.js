import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAudioStore } from '@/stores/audioStore'

const createMockAnalyser = () => ({
  fftSize: 2048,
  frequencyBinCount: 1024,
  smoothingTimeConstant: 0.8,
  minDecibels: -90,
  maxDecibels: -10,
  connect: vi.fn(),
  disconnect: vi.fn(),
  getFloatFrequencyData: vi.fn(),
  getByteFrequencyData: vi.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }),
  getFloatTimeDomainData: vi.fn(),
  getByteTimeDomainData: vi.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  })
})

const createMockAudioContext = () => ({
  state: 'running',
  sampleRate: 44100,
  currentTime: 0,
  destination: {},
  createAnalyser: vi.fn(() => createMockAnalyser()),
  createOscillator: vi.fn(),
  createGain: vi.fn(),
  createMediaElementSource: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn()
  })),
  createBuffer: vi.fn(() => ({
    length: 44100,
    duration: 1,
    sampleRate: 44100,
    numberOfChannels: 2,
    getChannelData: vi.fn(() => new Float32Array(44100))
  })),
  createBufferSource: vi.fn(),
  resume: vi.fn().mockResolvedValue(undefined),
  suspend: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  decodeAudioData: vi.fn().mockResolvedValue({
    length: 44100,
    duration: 1,
    sampleRate: 44100,
    numberOfChannels: 2,
    getChannelData: vi.fn(() => new Float32Array(44100))
  })
})

describe('AudioStore - Web Audio API Mock Tests', () => {
  let store
  let mockAudioContext

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAudioStore()
    mockAudioContext = createMockAudioContext()

    vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext))
    vi.stubGlobal('webkitAudioContext', vi.fn(() => mockAudioContext))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('Web Audio API Integration', () => {
    it('should create AudioContext successfully', () => {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioContext()
      expect(ctx).toBeDefined()
      expect(ctx.createAnalyser).toBeDefined()
    })

    it('should create analyser node with correct settings', () => {
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()

      expect(analyser.fftSize).toBe(2048)
      expect(analyser.frequencyBinCount).toBe(1024)
      expect(analyser.smoothingTimeConstant).toBe(0.8)
    })

    it('should handle audio context state', () => {
      const ctx = new AudioContext()
      expect(ctx.state).toBe('running')
    })

    it('should resume suspended audio context', async () => {
      mockAudioContext.state = 'suspended'
      const ctx = new AudioContext()
      await ctx.resume()
      expect(ctx.resume).toHaveBeenCalled()
    })

    it('should decode audio data', async () => {
      const ctx = new AudioContext()
      const audioData = new ArrayBuffer(100)
      const decoded = await ctx.decodeAudioData(audioData)

      expect(decoded).toBeDefined()
      expect(decoded.duration).toBe(1)
      expect(decoded.sampleRate).toBe(44100)
    })

    it('should create media element source', () => {
      const ctx = new AudioContext()
      const mockAudio = document.createElement('audio')
      const source = ctx.createMediaElementSource(mockAudio)

      expect(source).toBeDefined()
      expect(source.connect).toBeDefined()
    })

    it('should connect analyser to destination', () => {
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.connect(ctx.destination)

      expect(analyser.connect).toHaveBeenCalledWith(ctx.destination)
    })

    it('should close audio context', async () => {
      const ctx = new AudioContext()
      await ctx.close()
      expect(ctx.close).toHaveBeenCalled()
    })
  })

  describe('Audio Loading State Management', () => {
    it('should set loading state to true', () => {
      store.setLoading(true)
      expect(store.isLoading).toBe(true)
    })

    it('should set loading state to false', () => {
      store.setLoading(true)
      store.setLoading(false)
      expect(store.isLoading).toBe(false)
    })

    it('should track loading state transitions', () => {
      const states = []

      store.setLoading(true)
      states.push(store.isLoading)

      store.setLoading(false)
      states.push(store.isLoading)

      expect(states).toEqual([true, false])
    })

    it('should maintain loading state independently', () => {
      store.setLoading(true)
      store.setPlaying(true)
      expect(store.isLoading).toBe(true)
      expect(store.isPlaying).toBe(true)
    })
  })

  describe('Playback Progress Updates', () => {
    it('should update current time', () => {
      store.setCurrentTime(30.5)
      expect(store.currentTime).toBe(30.5)
    })

    it('should calculate progress percentage', () => {
      store.setDuration(100)
      store.setCurrentTime(25)
      expect(store.progress).toBe(25)
    })

    it('should handle progress at 0%', () => {
      store.setDuration(100)
      store.setCurrentTime(0)
      expect(store.progress).toBe(0)
    })

    it('should handle progress at 100%', () => {
      store.setDuration(100)
      store.setCurrentTime(100)
      expect(store.progress).toBe(100)
    })

    it('should handle progress beyond duration', () => {
      store.setDuration(100)
      store.setCurrentTime(150)
      expect(store.progress).toBe(150)
    })

    it('should update progress continuously', () => {
      store.setDuration(180)

      const times = [0, 30, 60, 90, 120, 150, 180]
      const expectedProgress = [0, 16.67, 33.33, 50, 66.67, 83.33, 100]

      times.forEach((time, index) => {
        store.setCurrentTime(time)
        expect(store.progress).toBeCloseTo(expectedProgress[index], 1)
      })
    })

    it('should handle fractional progress', () => {
      store.setDuration(100)
      store.setCurrentTime(33.3333)
      expect(store.progress).toBeCloseTo(33.33, 1)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid file type', () => {
      const invalidFile = { name: 'test.txt', type: 'text/plain' }
      store.setAudioFile(invalidFile)
      expect(store.fileName).toBe('test.txt')
    })

    it('should handle empty file name', () => {
      const emptyFile = { name: '', type: 'audio/mp3' }
      store.setAudioFile(emptyFile)
      expect(store.fileName).toBe('')
    })

    it('should reset properly after error', () => {
      store.setAudioFile({ name: 'test.mp3' })
      store.setPlaying(true)
      store.setCurrentTime(50)
      store.setDuration(100)

      store.reset()

      expect(store.audioFile).toBeNull()
      expect(store.fileName).toBe('')
      expect(store.isPlaying).toBe(false)
      expect(store.currentTime).toBe(0)
      expect(store.duration).toBe(0)
    })
  })

  describe('Frequency Data Handling', () => {
    it('should create analyser with expected frequency bin count', () => {
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      
      const frequencyData = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(frequencyData)
      
      expect(frequencyData.length).toBe(1024)
    })

    it('should get byte frequency data', () => {
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      
      const frequencyData = new Uint8Array(1024)
      analyser.getByteFrequencyData(frequencyData)
      
      expect(frequencyData.length).toBe(1024)
    })
  })

  describe('Audio Buffer Operations', () => {
    it('should create audio buffer', () => {
      const ctx = new AudioContext()
      const buffer = ctx.createBuffer()
      expect(buffer).toBeDefined()
      expect(buffer.length).toBe(44100)
    })

    it('should handle buffer with different channel counts', () => {
      const ctx = new AudioContext()
      const mono = ctx.createBuffer(1, 44100, 44100)
      const stereo = ctx.createBuffer(2, 44100, 44100)
      
      expect(mono.numberOfChannels).toBe(1)
      expect(stereo.numberOfChannels).toBe(2)
    })
  })
})
