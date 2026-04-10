import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WaveOcean } from '@/components/visualizers/WaveOcean'
import { ParticleBurst } from '@/components/visualizers/ParticleBurst'
import { StarryNight } from '@/components/visualizers/StarryNight'
import { AuroraFlow } from '@/components/visualizers/AuroraFlow'
import { SpectrumBars } from '@/components/visualizers/SpectrumBars'

// Mock canvas context
const createMockContext = () => ({
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  shadowColor: '',
  shadowBlur: 0,
  font: '',
  textAlign: 'left',
  lineCap: 'butt',
  fillRect: vi.fn(),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  closePath: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  }))
})

const createMockCanvas = () => ({
  width: 800,
  height: 600
})

describe('Visualizers', () => {
  let mockCanvas
  let mockCtx
  let frequencyData
  let waveformData

  beforeEach(() => {
    mockCanvas = createMockCanvas()
    mockCtx = createMockContext()
    frequencyData = new Uint8Array(1024).fill(128)
    waveformData = new Uint8Array(1024).fill(128)
  })

  describe('WaveOcean', () => {
    let visualizer

    beforeEach(() => {
      visualizer = new WaveOcean(mockCanvas, mockCtx)
    })

    it('should initialize with correct dimensions', () => {
      expect(visualizer.width).toBe(800)
      expect(visualizer.height).toBe(600)
    })

    it('should have waves array', () => {
      expect(visualizer.waves).toBeDefined()
      expect(visualizer.waves.length).toBeGreaterThan(0)
    })

    it('should render without errors', () => {
      expect(() => {
        visualizer.render(frequencyData, waveformData, 0.016, true)
      }).not.toThrow()
    })

    it('should resize correctly', () => {
      visualizer.resize(1024, 768)
      expect(visualizer.width).toBe(1024)
      expect(visualizer.height).toBe(768)
    })

    it('should reset time on reset()', () => {
      visualizer.time = 100
      visualizer.reset()
      expect(visualizer.time).toBe(0)
    })
  })

  describe('ParticleBurst', () => {
    let visualizer

    beforeEach(() => {
      visualizer = new ParticleBurst(mockCanvas, mockCtx)
      // Mock document.createElement for particle cache
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: () => createMockContext()
          }
        }
        return document.createElement(tag)
      })
    })

    it('should initialize with empty particles array', () => {
      expect(visualizer.particles).toEqual([])
    })

    it('should have particle cache', () => {
      expect(visualizer.particleCache).toBeDefined()
      expect(visualizer.particleCache instanceof Map).toBe(true)
    })

    it('should render without errors', () => {
      expect(() => {
        visualizer.render(frequencyData, waveformData, 0.016, true)
      }).not.toThrow()
    })

    it('should create particles when playing', () => {
      // Render multiple frames to generate particles
      for (let i = 0; i < 10; i++) {
        visualizer.render(frequencyData, waveformData, 0.016, true)
      }
      expect(visualizer.particles.length).toBeGreaterThan(0)
    })

    it('should reset particles on reset()', () => {
      visualizer.particles = [{ x: 0, y: 0 }]
      visualizer.reset()
      expect(visualizer.particles).toEqual([])
    })
  })

  describe('StarryNight', () => {
    let visualizer

    beforeEach(() => {
      visualizer = new StarryNight(mockCanvas, mockCtx)
    })

    it('should initialize with stars', () => {
      expect(visualizer.stars.length).toBe(visualizer.maxStars)
    })

    it('should render without errors', () => {
      expect(() => {
        visualizer.render(frequencyData, waveformData, 0.016, true)
      }).not.toThrow()
    })

    it('should reinitialize stars on reset()', () => {
      const originalStars = [...visualizer.stars]
      visualizer.reset()
      expect(visualizer.stars.length).toBe(visualizer.maxStars)
    })
  })

  describe('AuroraFlow', () => {
    let visualizer

    beforeEach(() => {
      visualizer = new AuroraFlow(mockCanvas, mockCtx)
    })

    it('should initialize with stars array', () => {
      expect(visualizer.stars).toBeDefined()
      expect(Array.isArray(visualizer.stars)).toBe(true)
    })

    it('should render without errors', () => {
      expect(() => {
        visualizer.render(frequencyData, waveformData, 0.016, true)
      }).not.toThrow()
    })

    it('should reset time on reset()', () => {
      visualizer.time = 100
      visualizer.reset()
      expect(visualizer.time).toBe(0)
    })
  })

  describe('SpectrumBars', () => {
    let visualizer

    beforeEach(() => {
      visualizer = new SpectrumBars(mockCanvas, mockCtx)
    })

    it('should initialize with correct bar count', () => {
      expect(visualizer.barCount).toBe(64)
    })

    it('should initialize peaks array', () => {
      expect(visualizer.peaks.length).toBe(64)
      expect(visualizer.peaks.every(p => p === 0)).toBe(true)
    })

    it('should render without errors', () => {
      expect(() => {
        visualizer.render(frequencyData, waveformData, 0.016, true)
      }).not.toThrow()
    })

    it('should reset peaks on reset()', () => {
      visualizer.peaks = visualizer.peaks.map(() => 100)
      visualizer.reset()
      expect(visualizer.peaks.every(p => p === 0)).toBe(true)
    })
  })

  describe('Common behavior', () => {
    const visualizerClasses = [
      { name: 'WaveOcean', Class: WaveOcean },
      { name: 'ParticleBurst', Class: ParticleBurst },
      { name: 'StarryNight', Class: StarryNight },
      { name: 'AuroraFlow', Class: AuroraFlow },
      { name: 'SpectrumBars', Class: SpectrumBars }
    ]

    visualizerClasses.forEach(({ name, Class }) => {
      describe(name, () => {
        it('should have resize method', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          expect(typeof visualizer.resize).toBe('function')
        })

        it('should have reset method', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          expect(typeof visualizer.reset).toBe('function')
        })

        it('should have render method', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          expect(typeof visualizer.render).toBe('function')
        })

        it('should handle empty frequency data', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const emptyData = new Uint8Array(1024)
          expect(() => {
            visualizer.render(emptyData, emptyData, 0.016, false)
          }).not.toThrow()
        })

        it('should handle isPlaying=false', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          expect(() => {
            visualizer.render(frequencyData, waveformData, 0.016, false)
          }).not.toThrow()
        })
      })
    })
  })
})
