import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createLogger, getLogHistory, clearLogHistory, exportLogs } from '@/utils/logger'

describe('Logger', () => {
  let logger

  beforeEach(() => {
    clearLogHistory()
    logger = createLogger('TestModule')
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('createLogger', () => {
    it('should create a logger with all methods', () => {
      expect(logger).toHaveProperty('debug')
      expect(logger).toHaveProperty('info')
      expect(logger).toHaveProperty('warn')
      expect(logger).toHaveProperty('error')
      expect(logger).toHaveProperty('time')
      expect(logger).toHaveProperty('timeEnd')
    })

    it('should log debug messages', () => {
      logger.debug('Test debug message')
      const history = getLogHistory()
      expect(history.length).toBe(1)
      expect(history[0].level).toBe('DEBUG')
      expect(history[0].module).toBe('TestModule')
      expect(history[0].message).toBe('Test debug message')
    })

    it('should log info messages', () => {
      logger.info('Test info message', { key: 'value' })
      const history = getLogHistory()
      expect(history.length).toBe(1)
      expect(history[0].level).toBe('INFO')
      expect(history[0].data).toEqual({ key: 'value' })
    })

    it('should log warn messages', () => {
      logger.warn('Test warning')
      const history = getLogHistory()
      expect(history[0].level).toBe('WARN')
    })

    it('should log error messages', () => {
      const error = new Error('Test error')
      logger.error('Error occurred', error)
      const history = getLogHistory()
      expect(history[0].level).toBe('ERROR')
      expect(history[0].data).toBe(error)
    })
  })

  describe('getLogHistory', () => {
    it('should return a copy of log history', () => {
      logger.info('Message 1')
      logger.info('Message 2')
      const history = getLogHistory()
      expect(history.length).toBe(2)
      // Verify it's a copy
      history.push({ fake: true })
      expect(getLogHistory().length).toBe(2)
    })
  })

  describe('clearLogHistory', () => {
    it('should clear all log history', () => {
      logger.info('Message 1')
      logger.info('Message 2')
      expect(getLogHistory().length).toBe(2)
      clearLogHistory()
      expect(getLogHistory().length).toBe(0)
    })
  })

  describe('exportLogs', () => {
    it('should export logs as JSON string', () => {
      logger.info('Test message')
      const exported = exportLogs()
      const parsed = JSON.parse(exported)
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed.length).toBe(1)
      expect(parsed[0].message).toBe('Test message')
    })
  })

  describe('log history limit', () => {
    it('should limit log history to MAX_LOG_HISTORY entries', () => {
      // Log more than MAX_LOG_HISTORY (100) entries
      for (let i = 0; i < 110; i++) {
        logger.debug(`Message ${i}`)
      }
      const history = getLogHistory()
      expect(history.length).toBe(100)
      // First message should be removed
      expect(history[0].message).toBe('Message 10')
    })
  })
})
