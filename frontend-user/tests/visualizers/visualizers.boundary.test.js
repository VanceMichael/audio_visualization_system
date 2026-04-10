import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WaveOcean } from '@/components/visualizers/WaveOcean'
import { ParticleBurst } from '@/components/visualizers/ParticleBurst'
import { StarryNight } from '@/components/visualizers/StarryNight'
import { AuroraFlow } from '@/components/visualizers/AuroraFlow'
import { SpectrumBars } from '@/components/visualizers/SpectrumBars'

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
  })),
  clearRect: vi.fn()
})

const createMockCanvas = () => ({
  width: 800,
  height: 600
})

describe('Visualizers - Boundary Tests', () => {
  let mockCanvas
  let mockCtx
  let originalCreateElement

  beforeEach(() => {
    mockCanvas = createMockCanvas()
    mockCtx = createMockContext()
    
    originalCreateElement = document.createElement
    document.createElement = vi.fn((tag) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => createMockContext()
        }
      }
      return originalCreateElement.call(document, tag)
    })
  })

  afterEach(() => {
    document.createElement = originalCreateElement
  })

  describe('Empty Data Input', () => {
    const visualizerClasses = [
      { name: 'WaveOcean', Class: WaveOcean },
      { name: 'ParticleBurst', Class: ParticleBurst },
      { name: 'StarryNight', Class: StarryNight },
      { name: 'AuroraFlow', Class: AuroraFlow },
      { name: 'SpectrumBars', Class: SpectrumBars }
    ]

    visualizerClasses.forEach(({ name, Class }) => {
      describe(name, () => {
        it('should not crash with zero-filled data', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const zeroData = new Uint8Array(1024).fill(0)

          expect(() => {
            visualizer.render(zeroData, zeroData, 0.016, true)
          }).not.toThrow()
        })

        it('should handle single element data array', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const singleData = new Uint8Array([128])

          expect(() => {
            visualizer.render(singleData, singleData, 0.016, true)
          }).not.toThrow()
        })
      })
    })
  })

  describe('Extreme Frequency Data', () => {
    const visualizerClasses = [
      { name: 'WaveOcean', Class: WaveOcean },
      { name: 'ParticleBurst', Class: ParticleBurst },
      { name: 'StarryNight', Class: StarryNight },
      { name: 'AuroraFlow', Class: AuroraFlow },
      { name: 'SpectrumBars', Class: SpectrumBars }
    ]

    visualizerClasses.forEach(({ name, Class }) => {
      describe(name, () => {
        it('should handle maximum frequency values (255)', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const maxData = new Uint8Array(1024).fill(255)

          expect(() => {
            visualizer.render(maxData, maxData, 0.016, true)
          }).not.toThrow()
        })

        it('should handle minimum frequency values (0)', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const minData = new Uint8Array(1024).fill(0)

          expect(() => {
            visualizer.render(minData, minData, 0.016, true)
          }).not.toThrow()
        })

        it('should handle alternating extreme values', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const altData = new Uint8Array(1024)
          for (let i = 0; i < altData.length; i++) {
            altData[i] = i % 2 === 0 ? 0 : 255
          }

          expect(() => {
            visualizer.render(altData, altData, 0.016, true)
          }).not.toThrow()
        })

        it('should handle waveform data with all 128 (silence)', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const silenceData = new Uint8Array(1024).fill(128)

          expect(() => {
            visualizer.render(silenceData, silenceData, 0.016, true)
          }).not.toThrow()
        })

        it('should handle large data arrays', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const largeData = new Uint8Array(8192).fill(128)

          expect(() => {
            visualizer.render(largeData, largeData, 0.016, true)
          }).not.toThrow()
        })
      })
    })
  })

  describe('DeltaTime Edge Cases', () => {
    const visualizerClasses = [
      { name: 'WaveOcean', Class: WaveOcean },
      { name: 'ParticleBurst', Class: ParticleBurst },
      { name: 'StarryNight', Class: StarryNight },
      { name: 'AuroraFlow', Class: AuroraFlow },
      { name: 'SpectrumBars', Class: SpectrumBars }
    ]

    visualizerClasses.forEach(({ name, Class }) => {
      describe(name, () => {
        it('should handle deltaTime of 0', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const frequencyData = new Uint8Array(1024).fill(128)

          expect(() => {
            visualizer.render(frequencyData, frequencyData, 0, true)
          }).not.toThrow()
        })

        it('should handle negative deltaTime', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const frequencyData = new Uint8Array(1024).fill(128)

          expect(() => {
            visualizer.render(frequencyData, frequencyData, -0.016, true)
          }).not.toThrow()
        })

        it('should handle very large deltaTime', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const frequencyData = new Uint8Array(1024).fill(128)

          expect(() => {
            visualizer.render(frequencyData, frequencyData, 1000, true)
          }).not.toThrow()
        })

        it('should handle very small deltaTime', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const frequencyData = new Uint8Array(1024).fill(128)

          expect(() => {
            visualizer.render(frequencyData, frequencyData, 0.0001, true)
          }).not.toThrow()
        })
      })
    })
  })

  describe('Canvas Size Edge Cases', () => {
    const visualizerClasses = [
      { name: 'WaveOcean', Class: WaveOcean },
      { name: 'ParticleBurst', Class: ParticleBurst },
      { name: 'StarryNight', Class: StarryNight },
      { name: 'AuroraFlow', Class: AuroraFlow },
      { name: 'SpectrumBars', Class: SpectrumBars }
    ]

    visualizerClasses.forEach(({ name, Class }) => {
      describe(name, () => {
        it('should handle very small canvas', () => {
          const smallCanvas = { width: 1, height: 1 }
          const visualizer = new Class(smallCanvas, mockCtx)
          const frequencyData = new Uint8Array(1024).fill(128)

          expect(() => {
            visualizer.render(frequencyData, frequencyData, 0.016, true)
          }).not.toThrow()
        })

        it('should handle very large canvas', () => {
          const largeCanvas = { width: 4000, height: 3000 }
          const visualizer = new Class(largeCanvas, mockCtx)
          const frequencyData = new Uint8Array(1024).fill(128)

          expect(() => {
            visualizer.render(frequencyData, frequencyData, 0.016, true)
          }).not.toThrow()
        })

        it('should handle non-square canvas (wide)', () => {
          const wideCanvas = { width: 1920, height: 108 }
          const visualizer = new Class(wideCanvas, mockCtx)
          const frequencyData = new Uint8Array(1024).fill(128)

          expect(() => {
            visualizer.render(frequencyData, frequencyData, 0.016, true)
          }).not.toThrow()
        })

        it('should handle non-square canvas (tall)', () => {
          const tallCanvas = { width: 108, height: 1920 }
          const visualizer = new Class(tallCanvas, mockCtx)
          const frequencyData = new Uint8Array(1024).fill(128)

          expect(() => {
            visualizer.render(frequencyData, frequencyData, 0.016, true)
          }).not.toThrow()
        })
      })
    })
  })

  describe('isPlaying State', () => {
    const visualizerClasses = [
      { name: 'WaveOcean', Class: WaveOcean },
      { name: 'ParticleBurst', Class: ParticleBurst },
      { name: 'StarryNight', Class: StarryNight },
      { name: 'AuroraFlow', Class: AuroraFlow },
      { name: 'SpectrumBars', Class: SpectrumBars }
    ]

    visualizerClasses.forEach(({ name, Class }) => {
      describe(name, () => {
        it('should handle isPlaying=false', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const frequencyData = new Uint8Array(1024).fill(128)

          expect(() => {
            visualizer.render(frequencyData, frequencyData, 0.016, false)
          }).not.toThrow()
        })

        it('should handle isPlaying=true', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const frequencyData = new Uint8Array(1024).fill(128)

          expect(() => {
            visualizer.render(frequencyData, frequencyData, 0.016, true)
          }).not.toThrow()
        })
      })
    })
  })

  describe('Combined Edge Cases', () => {
    const visualizerClasses = [
      { name: 'WaveOcean', Class: WaveOcean },
      { name: 'ParticleBurst', Class: ParticleBurst },
      { name: 'StarryNight', Class: StarryNight },
      { name: 'AuroraFlow', Class: AuroraFlow },
      { name: 'SpectrumBars', Class: SpectrumBars }
    ]

    visualizerClasses.forEach(({ name, Class }) => {
      describe(name, () => {
        it('should handle empty data with zero deltaTime', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const emptyData = new Uint8Array(0)

          expect(() => {
            visualizer.render(emptyData, emptyData, 0, false)
          }).not.toThrow()
        })

        it('should handle extreme data with negative deltaTime', () => {
          const visualizer = new Class(mockCanvas, mockCtx)
          const extremeData = new Uint8Array(1024).fill(255)

          expect(() => {
            visualizer.render(extremeData, extremeData, -0.016, true)
          }).not.toThrow()
        })

        it('should handle small canvas with large data', () => {
          const smallCanvas = { width: 10, height: 10 }
          const visualizer = new Class(smallCanvas, mockCtx)
          const largeData = new Uint8Array(8192).fill(128)

          expect(() => {
            visualizer.render(largeData, largeData, 0.016, true)
          }).not.toThrow()
        })
      })
    })
  })
})
