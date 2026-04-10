<template>
  <div class="visualizer-container" ref="containerRef">
    <canvas ref="canvasRef" class="visualizer-canvas"></canvas>
    <div class="empty-state" v-if="!analyser">
      <div class="empty-content">
        <div class="empty-icon">
          <div class="icon-ring"></div>
          <div class="icon-ring delay-1"></div>
          <div class="icon-ring delay-2"></div>
          <el-icon :size="40"><VideoPlay /></el-icon>
        </div>
        <h3 class="empty-title">准备就绪</h3>
        <p class="empty-desc">上传音频文件，开启视觉之旅</p>
      </div>
    </div>
    <div class="error-state" v-if="hasError">
      <el-icon :size="32"><WarningFilled /></el-icon>
      <p>渲染出错，请刷新页面</p>
    </div>
    <div class="canvas-corner top-left"></div>
    <div class="canvas-corner top-right"></div>
    <div class="canvas-corner bottom-left"></div>
    <div class="canvas-corner bottom-right"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAudioStore } from '@/stores/audioStore'
import { WaveOcean } from '@/components/visualizers/WaveOcean'
import { ParticleBurst } from '@/components/visualizers/ParticleBurst'
import { StarryNight } from '@/components/visualizers/StarryNight'
import { AuroraFlow } from '@/components/visualizers/AuroraFlow'
import { SpectrumBars } from '@/components/visualizers/SpectrumBars'
import { createLogger } from '@/utils/logger'

const logger = createLogger('VisualizerCanvas')
const audioStore = useAudioStore()
const containerRef = ref(null)
const canvasRef = ref(null)
const analyser = ref(null)
const hasError = ref(false)

let ctx = null
let animationId = null
let visualizers = {}
let currentVisualizer = null

const initVisualizers = () => {
  try {
    const canvas = canvasRef.value
    if (!canvas || !ctx) throw new Error('Canvas not available')
    visualizers = {
      waveOcean: new WaveOcean(canvas, ctx),
      particleBurst: new ParticleBurst(canvas, ctx),
      starryNight: new StarryNight(canvas, ctx),
      auroraFlow: new AuroraFlow(canvas, ctx),
      spectrumBars: new SpectrumBars(canvas, ctx)
    }
    currentVisualizer = visualizers[audioStore.currentEffect]
  } catch (error) {
    logger.error('Failed to initialize visualizers', error)
    hasError.value = true
  }
}

const setAnalyser = (newAnalyser) => {
  analyser.value = newAnalyser
  hasError.value = false
  if (newAnalyser) startVisualization()
  else stopVisualization()
}

const startVisualization = () => {
  if (!analyser.value || !ctx) return
  const bufferLength = analyser.value.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  const waveformArray = new Uint8Array(bufferLength)
  let lastTimestamp = 0

  const render = (timestamp) => {
    animationId = requestAnimationFrame(render)
    
    // 计算 deltaTime（秒），确保动画速度与帧率无关
    const deltaTime = lastTimestamp ? (timestamp - lastTimestamp) / 1000 : 0.016
    lastTimestamp = timestamp
    
    try {
      analyser.value.getByteFrequencyData(dataArray)
      analyser.value.getByteTimeDomainData(waveformArray)
      ctx.fillStyle = '#050508'
      ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
      if (currentVisualizer) {
        currentVisualizer.render(dataArray, waveformArray, deltaTime, audioStore.isPlaying)
      }
    } catch (error) {
      if (hasError.value) stopVisualization()
      hasError.value = true
    }
  }
  render(performance.now())
}

const stopVisualization = () => {
  if (animationId) { cancelAnimationFrame(animationId); animationId = null }
  if (ctx && canvasRef.value) {
    ctx.fillStyle = '#050508'
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }
}

const resizeCanvas = () => {
  if (!containerRef.value || !canvasRef.value) return
  const container = containerRef.value
  const canvas = canvasRef.value
  const dpr = window.devicePixelRatio || 1
  const width = container.clientWidth
  const height = container.clientHeight
  if (width === 0 || height === 0) return
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  Object.values(visualizers).forEach(v => { if (v?.resize) v.resize(width, height) })
}

let resizeTimeout = null
const debouncedResize = () => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(resizeCanvas, 100)
}

watch(() => audioStore.currentEffect, (newEffect) => {
  currentVisualizer = visualizers[newEffect]
  if (currentVisualizer?.reset) currentVisualizer.reset()
})

defineExpose({ setAnalyser })

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) { hasError.value = true; return }
  ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) { hasError.value = true; return }
  initVisualizers()
  resizeCanvas()
  window.addEventListener('resize', debouncedResize)
})

onUnmounted(() => {
  stopVisualization()
  if (resizeTimeout) clearTimeout(resizeTimeout)
  window.removeEventListener('resize', debouncedResize)
  visualizers = {}
  currentVisualizer = null
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.visualizer-container {
  width: 100%;
  height: 100%;
  min-height: 180px;
  background: $bg-darker;
  border-radius: $radius-xl;
  overflow: hidden;
  position: relative;
}

.visualizer-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.empty-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, rgba($primary-color, 0.08) 0%, transparent 70%);
  z-index: 5;
}

.empty-content {
  text-align: center;
  animation: fadeIn 0.8s $ease-out-expo;
}

.empty-icon {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto $spacing-md;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-muted;
  
  .el-icon {
    position: relative;
    z-index: 1;
  }
}

.icon-ring {
  position: absolute;
  inset: 0;
  border: 1px solid rgba($primary-color, 0.25);
  border-radius: 50%;
  animation: ringPulse 3s ease-out infinite;
  
  &.delay-1 { animation-delay: 1s; }
  &.delay-2 { animation-delay: 2s; }
}

@keyframes ringPulse {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.empty-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.empty-desc {
  font-size: $font-size-sm;
  color: $text-muted;
}

.error-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: $accent-pink;
  background: rgba($bg-dark, 0.95);
  padding: $spacing-2xl;
  border-radius: $radius-lg;
  backdrop-filter: $glass-blur;
  z-index: 10;
  
  p {
    margin-top: $spacing-md;
    font-size: $font-size-md;
  }
}

.canvas-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  pointer-events: none;
  z-index: 2;
  
  &::before, &::after {
    content: '';
    position: absolute;
    background: rgba($primary-color, 0.4);
  }
  
  &.top-left {
    top: $spacing-md;
    left: $spacing-md;
    &::before { top: 0; left: 0; width: 100%; height: 1px; }
    &::after { top: 0; left: 0; width: 1px; height: 100%; }
  }
  
  &.top-right {
    top: $spacing-md;
    right: $spacing-md;
    &::before { top: 0; right: 0; width: 100%; height: 1px; }
    &::after { top: 0; right: 0; width: 1px; height: 100%; }
  }
  
  &.bottom-left {
    bottom: $spacing-md;
    left: $spacing-md;
    &::before { bottom: 0; left: 0; width: 100%; height: 1px; }
    &::after { bottom: 0; left: 0; width: 1px; height: 100%; }
  }
  
  &.bottom-right {
    bottom: $spacing-md;
    right: $spacing-md;
    &::before { bottom: 0; right: 0; width: 100%; height: 1px; }
    &::after { bottom: 0; right: 0; width: 1px; height: 100%; }
  }
}
</style>
