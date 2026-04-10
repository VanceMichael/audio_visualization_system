import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppError, ErrorTypes, handleError, safeAsync, safeSync } from '@/utils/errorHandler'

// Mock element-plus
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  }
}))

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AppError', () => {
    it('should create an error with type and message', () => {
      const error = new AppError(ErrorTypes.AUDIO_LOAD, 'Custom message')
      expect(error.name).toBe('AppError')
      expect(error.type).toBe(ErrorTypes.AUDIO_LOAD)
      expect(error.message).toBe('Custom message')
      expect(error.timestamp).toBeDefined()
    })

    it('should use default message when not provided', () => {
      const error = new AppError(ErrorTypes.FILE_INVALID)
      expect(error.message).toBe('无效的文件格式')
    })

    it('should store original error', () => {
      const originalError = new Error('Original')
      const error = new AppError(ErrorTypes.UNKNOWN, 'Wrapped', originalError)
      expect(error.originalError).toBe(originalError)
    })
  })

  describe('ErrorTypes', () => {
    it('should have all expected error types', () => {
      expect(ErrorTypes.AUDIO_LOAD).toBe('AUDIO_LOAD')
      expect(ErrorTypes.AUDIO_PLAY).toBe('AUDIO_PLAY')
      expect(ErrorTypes.AUDIO_CONTEXT).toBe('AUDIO_CONTEXT')
      expect(ErrorTypes.FILE_INVALID).toBe('FILE_INVALID')
      expect(ErrorTypes.CANVAS_RENDER).toBe('CANVAS_RENDER')
      expect(ErrorTypes.VISUALIZER).toBe('VISUALIZER')
      expect(ErrorTypes.UNKNOWN).toBe('UNKNOWN')
    })
  })

  describe('handleError', () => {
    it('should return error type and message', () => {
      const error = new AppError(ErrorTypes.AUDIO_LOAD, 'Test error')
      const result = handleError(error, 'TestContext', false)
      expect(result.type).toBe(ErrorTypes.AUDIO_LOAD)
      expect(result.message).toBe('Test error')
    })

    it('should handle non-AppError errors', () => {
      const error = new Error('Generic error')
      const result = handleError(error, 'TestContext', false)
      expect(result.type).toBe(ErrorTypes.UNKNOWN)
    })
  })

  describe('safeAsync', () => {
    it('should return result on success', async () => {
      const fn = async () => 'success'
      const result = await safeAsync(fn, 'test')
      expect(result).toBe('success')
    })

    it('should return fallback on error', async () => {
      const fn = async () => { throw new Error('fail') }
      const result = await safeAsync(fn, 'test', 'fallback')
      expect(result).toBe('fallback')
    })

    it('should return null as default fallback', async () => {
      const fn = async () => { throw new Error('fail') }
      const result = await safeAsync(fn, 'test')
      expect(result).toBeNull()
    })
  })

  describe('safeSync', () => {
    it('should return result on success', () => {
      const fn = () => 'success'
      const result = safeSync(fn, 'test')
      expect(result).toBe('success')
    })

    it('should return fallback on error', () => {
      const fn = () => { throw new Error('fail') }
      const result = safeSync(fn, 'test', 'fallback')
      expect(result).toBe('fallback')
    })
  })
})
