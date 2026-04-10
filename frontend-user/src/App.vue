<template>
  <div class="app-container">
    <!-- 动态背景 -->
    <div class="dynamic-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="noise-overlay"></div>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <header class="app-header">
        <div class="header-left">
          <div class="logo-wrapper">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#logoGrad)"/>
                <path d="M8 9v6M11 7v10M14 10v4M17 8v8" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <defs>
                  <linearGradient id="logoGrad" x1="2" y1="2" x2="22" y2="22">
                    <stop stop-color="#667eea"/>
                    <stop offset="1" stop-color="#764ba2"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="logo-text">
              <span class="logo-title">AudioViz</span>
              <span class="logo-badge">PRO</span>
            </div>
          </div>
        </div>
        
        <div class="header-center">
          <h1 class="page-title">
            <span class="title-icon">🎵</span>
            音频可视化
          </h1>
        </div>
        
        <div class="header-right">
          <button class="icon-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏模式'">
            <el-icon :size="18">
              <FullScreen v-if="!isFullscreen" />
              <Close v-else />
            </el-icon>
          </button>
        </div>
      </header>

      <!-- 可视化区域 -->
      <div class="visualizer-section">
        <VisualizerCanvas ref="visualizerRef" />
        
        <!-- 当前效果标签 -->
        <div class="current-effect-badge" v-if="audioStore.fileName">
          <span class="effect-icon">{{ audioStore.currentEffectConfig?.icon }}</span>
          <span class="effect-name">{{ audioStore.currentEffectConfig?.name }}</span>
        </div>
      </div>

      <!-- 底部控制区 -->
      <div class="control-section">
        <!-- 效果选择器 -->
        <EffectSelector />
        
        <!-- 音频播放器 -->
        <AudioPlayer @audio-ready="handleAudioReady" />
      </div>
    </div>

    <!-- 装饰元素 -->
    <div class="corner-decoration top-left"></div>
    <div class="corner-decoration top-right"></div>
    <div class="corner-decoration bottom-left"></div>
    <div class="corner-decoration bottom-right"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudioStore } from '@/stores/audioStore'
import VisualizerCanvas from '@/components/VisualizerCanvas.vue'
import EffectSelector from '@/components/EffectSelector.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'

const audioStore = useAudioStore()
const visualizerRef = ref(null)
const isFullscreen = ref(false)

const handleAudioReady = (analyser) => {
  if (visualizerRef.value) {
    visualizerRef.value.setAnalyser(analyser)
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: $bg-darker;
}

// ========================================
// 动态背景
// ========================================

.dynamic-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float 20s ease-in-out infinite;
  
  &.orb-1 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba($primary-color, 0.4) 0%, transparent 70%);
    top: -200px;
    left: -100px;
    animation-delay: 0s;
  }
  
  &.orb-2 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba($accent-pink, 0.3) 0%, transparent 70%);
    bottom: -150px;
    right: -100px;
    animation-delay: -7s;
  }
  
  &.orb-3 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba($accent-cyan, 0.25) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: -14s;
  }
}

.noise-overlay {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}

// ========================================
// 主内容
// ========================================

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: $spacing-md $spacing-xl $spacing-lg;
  position: relative;
  z-index: 1;
  min-height: 0;
  gap: $spacing-md;
}

// ========================================
// 顶部导航
// ========================================

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm 0;
  flex-shrink: 0;
}

.header-left {
  flex: 1;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  
  .logo-icon {
    width: 40px;
    height: 40px;
    
    svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 4px 12px rgba($primary-color, 0.4));
    }
  }
  
  .logo-text {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    
    .logo-title {
      font-size: $font-size-lg;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, $text-primary, $text-secondary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .logo-badge {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.1em;
      padding: 3px 6px;
      background: $primary-gradient;
      border-radius: $radius-xs;
      color: white;
    }
  }
}

.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
  
  .page-title {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-secondary;
    
    .title-icon {
      font-size: $font-size-lg;
    }
  }
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.icon-btn {
  width: 40px;
  height: 40px;
  background: $bg-glass;
  backdrop-filter: $glass-blur;
  border: $glass-border;
  border-radius: $radius-md;
  color: $text-secondary;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-normal;

  &:hover {
    background: $bg-card-hover;
    color: $text-primary;
    border-color: $border-light;
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}

// ========================================
// 可视化区域
// ========================================

.visualizer-section {
  flex: 1;
  min-height: 180px;
  position: relative;
  border-radius: $radius-xl;
  overflow: hidden;
  
  // 边框发光效果
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: $radius-xl;
    padding: 1px;
    background: linear-gradient(135deg, 
      rgba($primary-color, 0.5), 
      rgba($accent-cyan, 0.3), 
      rgba($accent-pink, 0.3),
      rgba($primary-color, 0.5)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 10;
  }
}

.current-effect-badge {
  position: absolute;
  top: $spacing-lg;
  left: $spacing-lg;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  background: $bg-glass;
  backdrop-filter: $glass-blur;
  border: $glass-border;
  border-radius: $radius-full;
  z-index: 20;
  animation: fadeIn 0.5s $ease-out-expo;
  
  .effect-icon {
    font-size: $font-size-md;
  }
  
  .effect-name {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $text-primary;
  }
}

// ========================================
// 控制区域
// ========================================

.control-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

// ========================================
// 角落装饰
// ========================================

.corner-decoration {
  position: absolute;
  width: 100px;
  height: 100px;
  pointer-events: none;
  z-index: 0;
  
  &::before, &::after {
    content: '';
    position: absolute;
    background: linear-gradient(135deg, rgba($primary-color, 0.2), transparent);
  }
  
  &.top-left {
    top: 0;
    left: 0;
    &::before {
      top: 20px;
      left: 20px;
      width: 40px;
      height: 1px;
    }
    &::after {
      top: 20px;
      left: 20px;
      width: 1px;
      height: 40px;
    }
  }
  
  &.top-right {
    top: 0;
    right: 0;
    &::before {
      top: 20px;
      right: 20px;
      width: 40px;
      height: 1px;
    }
    &::after {
      top: 20px;
      right: 20px;
      width: 1px;
      height: 40px;
    }
  }
  
  &.bottom-left {
    bottom: 0;
    left: 0;
    &::before {
      bottom: 20px;
      left: 20px;
      width: 40px;
      height: 1px;
    }
    &::after {
      bottom: 20px;
      left: 20px;
      width: 1px;
      height: 40px;
    }
  }
  
  &.bottom-right {
    bottom: 0;
    right: 0;
    &::before {
      bottom: 20px;
      right: 20px;
      width: 40px;
      height: 1px;
    }
    &::after {
      bottom: 20px;
      right: 20px;
      width: 1px;
      height: 40px;
    }
  }
}

// ========================================
// 响应式
// ========================================

@media (max-width: 768px) {
  .main-content {
    padding: $spacing-md;
  }
  
  .header-center {
    display: none;
  }
  
  .logo-text {
    display: none !important;
  }
}
</style>
