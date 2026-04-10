/**
 * 全局错误处理器
 * 提供统一的错误捕获和处理机制
 */

import { createLogger } from './logger'
import { ElMessage } from 'element-plus'

const logger = createLogger('ErrorHandler')

// 错误类型枚举
export const ErrorTypes = {
  AUDIO_LOAD: 'AUDIO_LOAD',
  AUDIO_PLAY: 'AUDIO_PLAY',
  AUDIO_CONTEXT: 'AUDIO_CONTEXT',
  FILE_INVALID: 'FILE_INVALID',
  CANVAS_RENDER: 'CANVAS_RENDER',
  VISUALIZER: 'VISUALIZER',
  UNKNOWN: 'UNKNOWN'
}

// 错误消息映射
const ErrorMessages = {
  [ErrorTypes.AUDIO_LOAD]: '音频加载失败，请检查文件格式',
  [ErrorTypes.AUDIO_PLAY]: '音频播放失败，请重试',
  [ErrorTypes.AUDIO_CONTEXT]: '音频上下文初始化失败',
  [ErrorTypes.FILE_INVALID]: '无效的文件格式',
  [ErrorTypes.CANVAS_RENDER]: '画布渲染错误',
  [ErrorTypes.VISUALIZER]: '可视化效果渲染错误',
  [ErrorTypes.UNKNOWN]: '发生未知错误'
}

/**
 * 自定义应用错误类
 */
export class AppError extends Error {
  constructor(type, message, originalError = null) {
    super(message || ErrorMessages[type] || ErrorMessages[ErrorTypes.UNKNOWN])
    this.name = 'AppError'
    this.type = type
    this.originalError = originalError
    this.timestamp = new Date().toISOString()
  }
}

/**
 * 处理错误
 * @param {Error} error - 错误对象
 * @param {string} context - 错误上下文
 * @param {boolean} showMessage - 是否显示用户提示
 */
export const handleError = (error, context = '', showMessage = true) => {
  const errorType = error instanceof AppError ? error.type : ErrorTypes.UNKNOWN
  const errorMessage = error instanceof AppError ? error.message : ErrorMessages[ErrorTypes.UNKNOWN]

  // 记录错误日志
  logger.error(`[${context}] ${errorMessage}`, {
    type: errorType,
    message: error.message,
    stack: error.stack,
    originalError: error instanceof AppError ? error.originalError : null
  })

  // 显示用户提示
  if (showMessage) {
    ElMessage.error({
      message: errorMessage,
      duration: 3000,
      showClose: true
    })
  }

  return { type: errorType, message: errorMessage }
}

/**
 * 安全执行异步函数
 * @param {Function} fn - 要执行的异步函数
 * @param {string} context - 上下文描述
 * @param {*} fallback - 失败时的返回值
 */
export const safeAsync = async (fn, context = '', fallback = null) => {
  try {
    return await fn()
  } catch (error) {
    handleError(error, context)
    return fallback
  }
}

/**
 * 安全执行同步函数
 * @param {Function} fn - 要执行的函数
 * @param {string} context - 上下文描述
 * @param {*} fallback - 失败时的返回值
 */
export const safeSync = (fn, context = '', fallback = null) => {
  try {
    return fn()
  } catch (error) {
    handleError(error, context)
    return fallback
  }
}

/**
 * 安装全局错误处理器
 * @param {Object} app - Vue 应用实例
 */
export const installErrorHandler = (app) => {
  // Vue 错误处理
  app.config.errorHandler = (err, instance, info) => {
    logger.error(`Vue Error: ${info}`, err)
    handleError(err, `Vue Component: ${info}`)
  }

  // Vue 警告处理
  app.config.warnHandler = (msg, instance, trace) => {
    logger.warn(`Vue Warning: ${msg}`, { trace })
  }

  // 全局未捕获错误
  window.addEventListener('error', (event) => {
    logger.error('Uncaught Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    })
  })

  // Promise 未捕获拒绝
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', {
      reason: event.reason
    })
  })

  logger.info('Global error handler installed')
}
