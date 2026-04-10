<template>
  <div class="audio-player">
    <!-- 文件上传区域 -->
    <div 
      class="upload-zone"
      :class="{ 'has-file': audioStore.fileName, 'dragging': isDragging }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input 
        ref="fileInput"
        type="file" 
        accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/x-wav"
        @change="handleFileSelect"
        hidden
      />
      
      <!-- 未上传状态 -->
      <div v-if="!audioStore.fileName" class="upload-placeholder">
        <div class="upload-icon-wrapper">
          <div class="upload-icon-bg"></div>
          <el-icon :size="28" class="upload-icon"><Upload /></el-icon>
        </div>
        <div class="upload-text">
          <p class="upload-title">拖放音频文件到这里</p>
          <p class="upload-hint">或点击选择文件 · 支持 MP3, WAV, OGG</p>
        </div>
      </div>
      
      <!-- 已上传状态 -->
      <div v-else class="file-display">
        <!-- 专辑封面占位 -->
        <div class="album-art">
          <div class="album-art-bg"></div>
          <el-icon :size="24" class="album-icon"><Headset /></el-icon>
          <div class="album-pulse" v-if="audioStore.isPlaying"></div>
        </div>
        
        <!-- 文件信息 -->
        <div class="file-info">
          <p class="file-name">{{ audioStore.fileName }}</p>
          <p class="file-meta">
            <span class="duration">{{ formatTime(audioStore.duration) }}</span>
            <span class="separator">·</span>
            <span class="format">{{ getFileFormat() }}</span>
          </p>
        </div>
        
        <!-- 删除按钮 -->
        <button class="remove-btn" @click.stop="removeFile">
          <el-icon :size="16"><Close /></el-icon>
        </button>
      </div>
    </div>

    <!-- 播放控制区域 -->
    <div class="player-controls" v-if="audioStore.fileName">
      <!-- 进度条 -->
      <div class="progress-section">
        <span class="time current">{{ formatTime(isDraggingProgress ? dragTime : audioStore.currentTime) }}</span>
        <div 
          class="progress-bar"
          :class="{ active: isDraggingProgress || isHoveringProgress }"
          @mouseenter="isHoveringProgress = true"
          @mouseleave="isHoveringProgress = false"
        >
          <!-- 轨道背景 -->
          <div class="track-bg"></div>
          
          <!-- 已播放进度 -->
          <div class="track-fill" :style="{ width: progressValue + '%' }"></div>
          
          <!-- 拖拽手柄 -->
          <div class="track-thumb" :style="{ left: progressValue + '%' }"></div>
          
          <!-- 时间提示 -->
          <div 
            class="track-tooltip" 
            v-show="isDraggingProgress"
            :style="{ left: progressValue + '%' }"
          >
            {{ formatTime(dragTime) }}
          </div>
          
          <!-- 隐藏的滑块 -->
          <input 
            type="range" 
            class="track-input"
            :value="progressValue"
            @input="handleProgressInput"
            @change="handleSeek"
            @mousedown="startDragging"
            @mouseup="stopDragging"
            @touchstart="startDragging"
            @touchend="stopDragging"
            min="0"
            max="100"
            step="0.1"
          />
        </div>
        <span class="time total">{{ formatTime(audioStore.duration) }}</span>
      </div>

      <!-- 控制按钮 -->
      <div class="control-buttons">
        <!-- 音量控制 -->
        <div class="volume-control">
          <button class="volume-btn" @click="toggleMute">
            <el-icon :size="18">
              <svg v-if="isMuted || volumeValue === 0" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
                <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
                <path d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z"/>
              </svg>
            </el-icon>
          </button>
          <div class="volume-slider-wrapper">
            <div class="volume-bar-bg"></div>
            <div class="volume-bar-fill" :style="{ width: volumeValue + '%' }"></div>
            <input 
              type="range"
              class="volume-input"
              :value="volumeValue"
              @input="handleVolumeInput"
              min="0"
              max="100"
            />
          </div>
        </div>

        <!-- 播放/暂停按钮 -->
        <button 
          class="play-btn"
          :class="{ playing: audioStore.isPlaying, loading: audioStore.isLoading }"
          @click="togglePlay"
          :disabled="audioStore.isLoading"
        >
          <div class="play-btn-bg"></div>
          <div class="play-btn-glow"></div>
          <el-icon :size="28" class="play-icon" v-if="audioStore.isLoading">
            <Loading />
          </el-icon>
          <el-icon :size="28" class="play-icon" v-else-if="audioStore.isPlaying">
            <VideoPause />
          </el-icon>
          <el-icon :size="28" class="play-icon" v-else>
            <VideoPlay />
          </el-icon>
        </button>

        <!-- 占位 -->
        <div class="spacer"></div>
      </div>
    </div>

    <!-- 隐藏的 audio 元素 -->
    <audio 
      ref="audioElement" 
      @ended="handleEnded"
      @error="handleAudioError"
      @waiting="handleWaiting"
      @canplay="handleCanPlay"
    ></audio>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, onMounted } from 'vue'
import { useAudioStore } from '@/stores/audioStore'
import { ElMessage } from 'element-plus'
import { createLogger } from '@/utils/logger'
import { AppError, ErrorTypes } from '@/utils/errorHandler'

const logger = createLogger('AudioPlayer')

const emit = defineEmits(['audio-ready'])
const audioStore = useAudioStore()

const fileInput = ref(null)
const audioElement = ref(null)
const isDragging = ref(false)
const isMuted = ref(false)
const previousVolume = ref(0.8)
const isBuffering = ref(false)

let audioContext = null
let analyser = null
let source = null
let animationId = null
let objectUrl = null

const progressValue = ref(0)
const volumeValue = ref(80)
const isDraggingProgress = ref(false)
const isHoveringProgress = ref(false)
const dragTime = ref(0)

watch(() => audioStore.progress, (val) => {
  if (!isNaN(val) && !isDraggingProgress.value) progressValue.value = val
})

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getFileFormat = () => {
  const name = audioStore.fileName
  const ext = name.split('.').pop()?.toUpperCase()
  return ext || 'AUDIO'
}

const triggerFileInput = () => {
  if (!audioStore.fileName) {
    fileInput.value?.click()
  }
}

const handleDragOver = (e) => {
  isDragging.value = true
  e.dataTransfer.dropEffect = 'copy'
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files?.length > 0) {
    processFile(files[0])
  }
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files?.length > 0) {
    processFile(files[0])
  }
  e.target.value = ''
}

const validateFile = (file) => {
  const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-wav', 'audio/wave']
  const validExtensions = /\.(mp3|wav|ogg|wave)$/i
  
  if (!file) return { valid: false, error: '未选择文件' }
  if (file.size === 0) return { valid: false, error: '文件为空' }
  if (file.size > 100 * 1024 * 1024) return { valid: false, error: '文件过大，请选择小于 100MB 的文件' }
  
  const isValidType = validTypes.includes(file.type) || validExtensions.test(file.name)
  if (!isValidType) return { valid: false, error: '不支持的文件格式' }
  
  return { valid: true }
}

const cleanupResources = async () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  if (source) {
    try { source.disconnect() } catch (e) {}
    source = null
  }
  if (audioContext && audioContext.state !== 'closed') {
    try { await audioContext.close() } catch (e) {}
    audioContext = null
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
  analyser = null
  
  // 重置音频元素
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.src = ''
    audioElement.value.load()
  }
}

const processFile = async (file) => {
  const validation = validateFile(file)
  if (!validation.valid) {
    ElMessage.error(validation.error)
    return
  }

  audioStore.setLoading(true)
  
  try {
    await cleanupResources()

    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) {
      throw new AppError(ErrorTypes.AUDIO_CONTEXT, '您的浏览器不支持 Web Audio API')
    }
    
    audioContext = new AudioContextClass()
    
    // 确保 AudioContext 处于运行状态
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }
    
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.8
    analyser.minDecibels = -90
    analyser.maxDecibels = -10

    objectUrl = URL.createObjectURL(file)
    audioElement.value.src = objectUrl
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new AppError(ErrorTypes.AUDIO_LOAD, '音频加载超时')), 30000)
      audioElement.value.onloadedmetadata = () => { clearTimeout(timeout); resolve() }
      audioElement.value.onerror = () => {
        clearTimeout(timeout)
        reject(new AppError(ErrorTypes.AUDIO_LOAD, '音频加载失败'))
      }
    })

    source = audioContext.createMediaElementSource(audioElement.value)
    source.connect(analyser)
    analyser.connect(audioContext.destination)

    audioStore.setAudioFile(file)
    audioStore.setDuration(audioElement.value.duration)
    audioStore.setCurrentTime(0)
    audioElement.value.volume = volumeValue.value / 100

    emit('audio-ready', analyser)
    startTimeUpdate()

    ElMessage.success({ message: '🎵 音频加载成功', offset: 60 })
  } catch (error) {
    await cleanupResources()
    audioStore.reset()
    ElMessage.error(error instanceof AppError ? error.message : '音频加载失败')
  } finally {
    audioStore.setLoading(false)
  }
}

const startTimeUpdate = () => {
  const update = () => {
    if (audioElement.value && !isNaN(audioElement.value.currentTime)) {
      audioStore.setCurrentTime(audioElement.value.currentTime)
    }
    animationId = requestAnimationFrame(update)
  }
  update()
}

const togglePlay = async () => {
  if (!audioElement.value?.src) return

  try {
    if (audioContext?.state === 'suspended') {
      await audioContext.resume()
    }

    if (audioStore.isPlaying) {
      audioElement.value.pause()
      audioStore.setPlaying(false)
    } else {
      await audioElement.value.play()
      audioStore.setPlaying(true)
    }
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      ElMessage.warning('请点击页面后再尝试播放')
    } else {
      ElMessage.error('播放失败')
    }
  }
}

const handleProgressInput = (e) => {
  const value = parseFloat(e.target.value)
  progressValue.value = value
  if (audioStore.duration && isFinite(audioStore.duration)) {
    dragTime.value = (value / 100) * audioStore.duration
  }
}

const startDragging = () => {
  isDraggingProgress.value = true
  dragTime.value = audioStore.currentTime
}

const stopDragging = () => {
  isDraggingProgress.value = false
}

const handleSeek = (e) => {
  const value = parseFloat(e.target.value)
  if (audioElement.value && audioStore.duration && isFinite(audioStore.duration)) {
    const time = (value / 100) * audioStore.duration
    audioElement.value.currentTime = time
    audioStore.setCurrentTime(time)
  }
}

const handleVolumeInput = (e) => {
  const value = parseInt(e.target.value)
  volumeValue.value = value
  if (audioElement.value) {
    audioElement.value.volume = value / 100
    audioStore.setVolume(value / 100)
    isMuted.value = value === 0
  }
}

const toggleMute = () => {
  if (isMuted.value) {
    volumeValue.value = previousVolume.value * 100
    handleVolumeInput({ target: { value: volumeValue.value } })
    isMuted.value = false
  } else {
    previousVolume.value = volumeValue.value / 100
    volumeValue.value = 0
    handleVolumeInput({ target: { value: 0 } })
    isMuted.value = true
  }
}

const handleEnded = () => {
  audioStore.setPlaying(false)
  audioStore.setCurrentTime(0)
  if (audioElement.value) audioElement.value.currentTime = 0
}

const handleAudioError = () => {}
const handleWaiting = () => { isBuffering.value = true }
const handleCanPlay = () => { isBuffering.value = false }

const removeFile = async () => {
  await cleanupResources()
  audioStore.reset()
  emit('audio-ready', null)
  ElMessage.info({ message: '已移除音频', offset: 60 })
}

onMounted(() => {})
onUnmounted(async () => { await cleanupResources() })
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.audio-player {
  background: $bg-glass;
  backdrop-filter: $glass-blur;
  border: $glass-border;
  border-radius: $radius-xl;
  padding: $spacing-xl;
}

// ========================================
// 上传区域
// ========================================

.upload-zone {
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: $radius-lg;
  padding: $spacing-2xl;
  text-align: center;
  cursor: pointer;
  transition: all $transition-normal;
  background: rgba(255, 255, 255, 0.02);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba($primary-color, 0.1), rgba($accent-cyan, 0.05));
    opacity: 0;
    transition: opacity $transition-normal;
  }

  &:hover, &.dragging {
    border-color: rgba($primary-color, 0.5);
    
    &::before {
      opacity: 1;
    }
    
    .upload-icon-wrapper {
      transform: scale(1.1);
      
      .upload-icon-bg {
        opacity: 1;
      }
    }
  }

  &.has-file {
    border-style: solid;
    border-color: transparent;
    cursor: default;
    padding: $spacing-lg;
    background: rgba(255, 255, 255, 0.03);
  }
}

.upload-placeholder {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-lg;
}

.upload-icon-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $transition-bounce;
  
  .upload-icon-bg {
    position: absolute;
    inset: 0;
    background: $primary-gradient;
    border-radius: $radius-lg;
    opacity: 0.8;
    transition: opacity $transition-normal;
  }
  
  .upload-icon {
    position: relative;
    z-index: 1;
    color: white;
  }
}

.upload-text {
  .upload-title {
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }
  
  .upload-hint {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

// ========================================
// 文件显示
// ========================================

.file-display {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  position: relative;
  z-index: 1;
}

.album-art {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: $radius-md;
  overflow: hidden;
  flex-shrink: 0;
  
  .album-art-bg {
    position: absolute;
    inset: 0;
    background: $primary-gradient;
  }
  
  .album-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    z-index: 1;
  }
  
  .album-pulse {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.2);
    animation: pulse 1.5s ease-in-out infinite;
  }
}

.file-info {
  flex: 1;
  min-width: 0;
  text-align: left;
  
  .file-name {
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: $spacing-xs;
  }
  
  .file-meta {
    font-size: $font-size-sm;
    color: $text-muted;
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    
    .separator {
      opacity: 0.5;
    }
  }
}

.remove-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $radius-sm;
  color: $text-muted;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-normal;
  
  &:hover {
    background: rgba($accent-pink, 0.2);
    border-color: rgba($accent-pink, 0.3);
    color: $accent-pink;
  }
}

// ========================================
// 播放控制
// ========================================

.player-controls {
  margin-top: $spacing-xl;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;
  
  .time {
    font-size: $font-size-xs;
    font-weight: 500;
    color: $text-muted;
    min-width: 36px;
    font-variant-numeric: tabular-nums;
    
    &.current {
      text-align: right;
    }
  }
}

// ========================================
// 进度条 - Spotify 风格
// ========================================

.progress-section {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
  
  .time {
    font-size: 11px;
    font-weight: 500;
    color: $text-muted;
    min-width: 40px;
    font-variant-numeric: tabular-nums;
    
    &.current { text-align: right; }
    &.total { text-align: left; }
  }
}

.progress-bar {
  flex: 1;
  height: 4px;
  position: relative;
  cursor: pointer;
  
  // 悬停/拖拽时变粗
  &.active {
    .track-bg, .track-fill {
      height: 6px;
      margin-top: -1px;
    }
    
    .track-thumb {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    
    .track-fill {
      background: $accent-cyan;
    }
  }
}

.track-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  transition: height 0.1s ease, margin-top 0.1s ease;
}

.track-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 4px;
  background: $text-primary;
  border-radius: 2px;
  transition: height 0.1s ease, margin-top 0.1s ease, background 0.1s ease;
}

.track-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: $text-primary;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: opacity 0.1s ease, transform 0.1s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  z-index: 2;
}

.track-tooltip {
  position: absolute;
  bottom: 100%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 4px 8px;
  background: $bg-dark;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: $text-primary;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: $bg-dark;
  }
}

.track-input {
  position: absolute;
  top: -6px;
  left: 0;
  width: 100%;
  height: 16px;
  opacity: 0;
  cursor: pointer;
  margin: 0;
  z-index: 5;
}

.control-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2xl;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  width: 140px;
}

.volume-btn {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  color: $text-secondary;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-sm;
  transition: all $transition-fast;
  
  &:hover {
    color: $text-primary;
    background: rgba(255, 255, 255, 0.05);
  }
}

.volume-slider-wrapper {
  flex: 1;
  height: 4px;
  position: relative;
  border-radius: $radius-full;
  
  .volume-bar-bg {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: $radius-full;
  }
  
  .volume-bar-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: $text-secondary;
    border-radius: $radius-full;
  }
  
  .volume-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    margin: 0;
  }
}

.play-btn {
  position: relative;
  width: 72px;
  height: 72px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-normal;
  
  .play-btn-bg {
    position: absolute;
    inset: 0;
    background: $primary-gradient;
    border-radius: 50%;
    transition: transform $transition-normal;
  }
  
  .play-btn-glow {
    position: absolute;
    inset: -10px;
    background: radial-gradient(circle, rgba($primary-color, 0.4), transparent 70%);
    border-radius: 50%;
    opacity: 0;
    transition: opacity $transition-normal;
  }
  
  .play-icon {
    position: relative;
    z-index: 1;
    color: white;
    transition: transform $transition-fast;
  }
  
  &:hover:not(:disabled) {
    .play-btn-bg {
      transform: scale(1.05);
    }
    
    .play-btn-glow {
      opacity: 1;
    }
  }
  
  &:active:not(:disabled) {
    .play-btn-bg {
      transform: scale(0.95);
    }
  }
  
  &.playing {
    .play-btn-glow {
      opacity: 1;
      animation: pulse 2s ease-in-out infinite;
    }
  }
  
  &.loading {
    .play-icon {
      animation: rotate 1s linear infinite;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.spacer {
  width: 140px;
}

// 响应式
@media (max-width: 768px) {
  .audio-player {
    padding: $spacing-lg;
  }
  
  .upload-zone {
    padding: $spacing-xl;
  }
  
  .volume-control {
    display: none;
  }
  
  .spacer {
    display: none;
  }
  
  .play-btn {
    width: 64px;
    height: 64px;
  }
}
</style>
