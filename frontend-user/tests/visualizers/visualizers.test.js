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

  describe('Boundary Tests - Empty and Null Data Input', () => {
    const visualizerClasses = [
      { name: 'WaveOcean', Class: WaveOcean },
      { name: 'ParticleBurst', Class: ParticleBurst },
      { name: 'StarryNight', Class: StarryNight },
      { name: 'AuroraFlow', Class: AuroraFlow },
      { name: 'SpectrumBars', Class: SpectrumBars }
    ]

    visualizerClasses.forEach(({ name, Class }) => {
      describe(`${name} - No Crash on Invalid Data Input`, () => {
        let visualizer

        beforeEach(() => {
          visualizer = new Class(mockCanvas, createMockContext())
        })

        it('should not crash on null frequencyData', () => {
          expect(() => {
            visualizer.render(null, waveformData, 0.016, true)
          }).not.toThrow()
        })

        it('should not crash on undefined frequencyData', () => {
          expect(() => {
            visualizer.render(undefined, waveformData, 0.016, true)
          }).not.toThrow()
        })

        it('should not crash on null waveformData', () => {
          expect(() => {
            visualizer.render(frequencyData, null, 0.016, true)
          }).not.toThrow()
        })

        it('should not crash on zero-length frequency array', () => {
          const zeroLengthData = new Uint8Array(0)
          expect(() => {
            visualizer.render(zeroLengthData, waveformData, 0.016, true)
          }).not.toThrow()
        })

        it('should not crash on single element frequency array', () => {
          const singleData = new Uint8Array([128])
          expect(() => {
            visualizer.render(singleData, singleData, 0.016, true)
          }).not.toThrow()
        })

        it('should not crash on all null data inputs', () => {
          expect(() => {
            visualizer.render(null, null, 0.016, true)
          }).not.toThrow()
        })
      })
    })
  })

  describe('Boundary Tests - Extreme Frequency Data Values', () => {
    const visualizerClasses = [
      { name: 'WaveOcean', Class: WaveOcean },
      { name: 'ParticleBurst', Class: ParticleBurst },
      { name: 'StarryNight', Class: StarryNight },
      { name: 'AuroraFlow', Class: AuroraFlow },
      { name: 'SpectrumBars', Class: SpectrumBars }
    ]

    visualizerClasses.forEach(({ name, Class }) => {
      describe(`${name} - Extreme Value Handling`, () => {
        let visualizer

        beforeEach(() => {
          visualizer = new Class(mockCanvas, createMockContext())
        })

        it('should handle all frequency values at minimum (0)', () => {
          const allZeros = new Uint8Array(1024).fill(0)
          expect(() => {
            for (let i = 0; i < 5; i++) {
              visualizer.render(allZeros, allZeros, 0.016, true)
            }
          }).not.toThrow()
        })

        it('should handle all frequency values at maximum (255)', () => {
          const allMax = new Uint8Array(1024).fill(255)
          expect(() => {
            for (let i = 0; i < 5; i++) {
              visualizer.render(allMax, allMax, 0.016, true)
            }
          }).not.toThrow()
        })

        it('should handle alternating extreme values (0, 255, 0, 255...)', () => {
          const alternating = new Uint8Array(1024)
          for (let i = 0; i < alternating.length; i++) {
            alternating[i] = i % 2 === 0 ? 0 : 255
          }
          expect(() => {
            for (let i = 0; i < 5; i++) {
              visualizer.render(alternating, alternating, 0.016, true)
            }
          }).not.toThrow()
        })

        it('should handle rapid extreme value changes across frames', () => {
          const allZeros = new Uint8Array(1024).fill(0)
          const allMax = new Uint8Array(1024).fill(255)
          expect(() => {
            for (let i = 0; i < 20; i++) {
              const freqData = i % 2 === 0 ? allZeros : allMax
              visualizer.render(freqData, freqData, 0.016, true)
            }
          }).not.toThrow()
        })
      })
    })
  })

  describe('Boundary Tests - deltaTime Parameter Edge Cases', () => {
    const visualizerClasses = [
      { name: 'WaveOcean', Class: WaveOcean },
      { name: 'ParticleBurst', Class: ParticleBurst },
      { name: 'StarryNight', Class: StarryNight },
      { name: 'AuroraFlow', Class: AuroraFlow },
      { name: 'SpectrumBars', Class: SpectrumBars }
    ]

    visualizerClasses.forEach(({ name, Class }) => {
      describe(`${name} - deltaTime Edge Cases`, () => {
        let visualizer

        beforeEach(() => {
          visualizer = new Class(mockCanvas, createMockContext())
        })

        it('should handle deltaTime = 0 without crashing', () => {
          expect(() => {
            visualizer.render(frequencyData, waveformData, 0, true)
          }).not.toThrow()
        })

        it('should handle multiple consecutive deltaTime = 0 frames', () => {
          expect(() => {
            for (let i = 0; i < 30; i++) {
              visualizer.render(frequencyData, waveformData, 0, true)
            }
          }).not.toThrow()
        })

        it('should handle negative deltaTime values', () => {
          expect(() => {
            visualizer.render(frequencyData, waveformData, -0.016, true)
          }).not.toThrow()
        })

        it('should handle very small negative deltaTime', () => {
          expect(() => {
            visualizer.render(frequencyData, waveformData, -0.000001, true)
          }).not.toThrow()
        })

        it('should handle very large positive deltaTime (10 seconds)', () => {
          expect(() => {
            visualizer.render(frequencyData, waveformData, 10.0, true)
          }).not.toThrow()
        })

        it('should handle extremely large deltaTime (1 hour)', () => {
          expect(() => {
            visualizer.render(frequencyData, waveformData, 3600, true)
          }).not.toThrow()
        })

        it('should handle rapid deltaTime value fluctuations', () => {
          const varyingDeltaTimes = [0, 0.016, -0.016, 1.0, -1.0, 100, 0, 0.001]
          expect(() => {
            varyingDeltaTimes.forEach(dt => {
              visualizer.render(frequencyData, waveformData, dt, true)
            })
          }).not.toThrow()
        })
      })
    })
  })

  describe('Boundary Tests - Combined Extreme Conditions', () => {
    const visualizerClasses = [
      { name: 'WaveOcean', Class: WaveOcean },
      { name: 'ParticleBurst', Class: ParticleBurst },
      { name: 'StarryNight', Class: StarryNight },
      { name: 'AuroraFlow', Class: AuroraFlow },
      { name: 'SpectrumBars', Class: SpectrumBars }
    ]

    visualizerClasses.forEach(({ name, Class }) => {
      describe(`${name} - Combined Stress Test`, () => {
        let visualizer

        beforeEach(() => {
          visualizer = new Class(mockCanvas, createMockContext())
        })

        it('should handle combination: null data + deltaTime=0 + not playing', () => {
          expect(() => {
            visualizer.render(null, null, 0, false)
          }).not.toThrow()
        })

        it('should handle combination: max values + negative deltaTime + playing', () => {
          const allMax = new Uint8Array(1024).fill(255)
          expect(() => {
            visualizer.render(allMax, allMax, -0.5, true)
          }).not.toThrow()
        })

        it('should handle combination: min values + large deltaTime + rapid toggle play state', () => {
          const allZeros = new Uint8Array(1024).fill(0)
          expect(() => {
            for (let i = 0; i < 20; i++) {
              visualizer.render(allZeros, allZeros, 100, i % 2 === 0)
            }
          }).not.toThrow()
        })

        it('should survive a comprehensive chaos monkey stress test', () => {
          const allZeros = new Uint8Array(1024).fill(0)
          const allMax = new Uint8Array(1024).fill(255)
          const dataOptions = [allZeros, allMax, null, undefined, new Uint8Array(0)]
          const deltaTimeOptions = [0, 0.016, -0.016, 1, -1, 100, 3600]
          const playOptions = [true, false]

          expect(() => {
            for (let i = 0; i < 50; i++) {
              const freqData = dataOptions[Math.floor(Math.random() * dataOptions.length)]
              const waveData = dataOptions[Math.floor(Math.random() * dataOptions.length)]
              const dt = deltaTimeOptions[Math.floor(Math.random() * deltaTimeOptions.length)]
              const playing = playOptions[Math.floor(Math.random() * playOptions.length)]
              visualizer.render(freqData, waveData, dt, playing)
            }
          }).not.toThrow()
        })
      })
    })
  })
})
