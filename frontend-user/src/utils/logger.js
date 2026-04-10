/**
 * 日志工具类
 * 提供统一的日志记录功能，支持不同级别的日志输出
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
}

// 当前日志级别，生产环境只显示 WARN 和 ERROR
const currentLevel = import.meta.env.PROD ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG

// 日志颜色配置
const LOG_STYLES = {
  DEBUG: 'color: #64748b; font-weight: normal;',
  INFO: 'color: #22d3ee; font-weight: normal;',
  WARN: 'color: #fbbf24; font-weight: bold;',
  ERROR: 'color: #ef4444; font-weight: bold;'
}

// 日志前缀
const PREFIX = '[AudioVisualizer]'

// 格式化时间戳
const getTimestamp = () => {
  const now = new Date()
  return now.toISOString().substr(11, 12)
}

// 格式化日志消息
const formatMessage = (level, module, message) => {
  return `${PREFIX} [${getTimestamp()}] [${level}] [${module}] ${message}`
}

// 日志存储（用于调试和测试）
const logHistory = []
const MAX_LOG_HISTORY = 100

const addToHistory = (level, module, message, data) => {
  logHistory.push({
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    data
  })
  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.shift()
  }
}

/**
 * 创建模块日志器
 * @param {string} moduleName - 模块名称
 * @returns {Object} 日志器对象
 */
export const createLogger = (moduleName) => {
  return {
    debug: (message, data = null) => {
      if (currentLevel <= LOG_LEVELS.DEBUG) {
        const formatted = formatMessage('DEBUG', moduleName, message)
        console.log(`%c${formatted}`, LOG_STYLES.DEBUG, data || '')
      }
      addToHistory('DEBUG', moduleName, message, data)
    },

    info: (message, data = null) => {
      if (currentLevel <= LOG_LEVELS.INFO) {
        const formatted = formatMessage('INFO', moduleName, message)
        console.log(`%c${formatted}`, LOG_STYLES.INFO, data || '')
      }
      addToHistory('INFO', moduleName, message, data)
    },

    warn: (message, data = null) => {
      if (currentLevel <= LOG_LEVELS.WARN) {
        const formatted = formatMessage('WARN', moduleName, message)
        console.warn(`%c${formatted}`, LOG_STYLES.WARN, data || '')
      }
      addToHistory('WARN', moduleName, message, data)
    },

    error: (message, error = null) => {
      if (currentLevel <= LOG_LEVELS.ERROR) {
        const formatted = formatMessage('ERROR', moduleName, message)
        console.error(`%c${formatted}`, LOG_STYLES.ERROR, error || '')
        if (error?.stack) {
          console.error(error.stack)
        }
      }
      addToHistory('ERROR', moduleName, message, error)
    },

    // 性能计时
    time: (label) => {
      if (currentLevel <= LOG_LEVELS.DEBUG) {
        console.time(`${PREFIX} [${moduleName}] ${label}`)
      }
    },

    timeEnd: (label) => {
      if (currentLevel <= LOG_LEVELS.DEBUG) {
        console.timeEnd(`${PREFIX} [${moduleName}] ${label}`)
      }
    }
  }
}

/**
 * 获取日志历史记录
 * @returns {Array} 日志历史
 */
export const getLogHistory = () => [...logHistory]

/**
 * 清空日志历史
 */
export const clearLogHistory = () => {
  logHistory.length = 0
}

/**
 * 导出日志历史为 JSON
 * @returns {string} JSON 字符串
 */
export const exportLogs = () => {
  return JSON.stringify(logHistory, null, 2)
}

// 默认日志器
export const logger = createLogger('App')
