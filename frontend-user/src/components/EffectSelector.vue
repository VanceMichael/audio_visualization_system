<template>
  <div class="effect-selector">
    <div class="selector-header">
      <span class="header-label">可视化效果</span>
      <span class="header-count">{{ audioStore.effects.length }} 种风格</span>
    </div>
    <div class="effect-list">
      <button 
        v-for="(effect, index) in audioStore.effects" 
        :key="effect.id"
        class="effect-card"
        :class="{ active: audioStore.currentEffect === effect.id }"
        @click="selectEffect(effect.id)"
        :style="{ '--delay': `${index * 0.06}s`, '--accent': effect.colors[0] }"
      >
        <!-- 背景层 -->
        <div class="card-backdrop"></div>
        
        <!-- 渐变背景 -->
        <div class="card-gradient" :style="getGradientStyle(effect)"></div>
        
        <!-- 光晕效果 -->
        <div class="card-glow" :style="getGlowStyle(effect)"></div>
        
        <!-- 网格纹理 -->
        <div class="card-grid"></div>
        
        <!-- 主内容 -->
        <div class="card-content">
          <div class="icon-wrapper">
            <span class="effect-icon">{{ effect.icon }}</span>
            <div class="icon-reflection">{{ effect.icon }}</div>
          </div>
          <span class="effect-name">{{ effect.name }}</span>
        </div>
        
        <!-- 悬停边框 -->
        <div class="hover-border"></div>
        
        <!-- 选中状态 -->
        <div class="active-indicator" v-if="audioStore.currentEffect === effect.id">
          <div class="indicator-ring"></div>
          <div class="indicator-dot"></div>
        </div>
        
        <!-- 角标 -->
        <div class="corner-accent top-left"></div>
        <div class="corner-accent bottom-right"></div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAudioStore } from '@/stores/audioStore'
import { ElMessage } from 'element-plus'

const audioStore = useAudioStore()

const selectEffect = (effectId) => {
  if (audioStore.currentEffect === effectId) return
  
  audioStore.setEffect(effectId)
  const effect = audioStore.effects.find(e => e.id === effectId)
  ElMessage({
    message: `${effect.icon} 已切换至 ${effect.name}`,
    type: 'success',
    duration: 1500,
    offset: 60
  })
}

const getGradientStyle = (effect) => {
  const [c1, c2, c3] = effect.colors
  return {
    background: `linear-gradient(145deg, ${c1}25 0%, ${c2}15 50%, ${c3 || c1}10 100%)`
  }
}

const getGlowStyle = (effect) => {
  return {
    background: `radial-gradient(ellipse at 50% 0%, ${effect.colors[0]}40, transparent 70%)`
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.effect-selector {
  background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
  backdrop-filter: $glass-blur;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: $radius-xl;
  padding: $spacing-md $spacing-lg;
}

.selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
  padding: 0 $spacing-xs;
}

.header-label {
  font-size: $font-size-sm;
  font-weight: 600;
  color: $text-primary;
  letter-spacing: 0.02em;
}

.header-count {
  font-size: $font-size-xs;
  color: $text-muted;
  background: rgba(255,255,255,0.05);
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-full;
}

.effect-list {
  display: flex;
  gap: $spacing-md;
  overflow-x: auto;
  padding: $spacing-sm;
  margin: -$spacing-sm;
  
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.effect-card {
  --accent: #{$primary-color};
  flex-shrink: 0;
  width: 115px;
  height: 90px;
  position: relative;
  background: transparent;
  border: none;
  border-radius: $radius-lg;
  cursor: pointer;
  overflow: hidden;
  animation: cardEnter 0.5s $ease-out-expo backwards;
  animation-delay: var(--delay);
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: 1px solid rgba(255,255,255,0.08);
    transition: border-color $transition-normal;
    pointer-events: none;
    z-index: 5;
  }

  &:hover {
    &::before {
      border-color: rgba(255,255,255,0.15);
    }
    
    .card-backdrop {
      background: rgba(255,255,255,0.04);
    }
    
    .card-gradient {
      opacity: 0.9;
    }
    
    .card-glow {
      opacity: 1;
    }
    
    .icon-wrapper {
      transform: translateY(-4px) scale(1.1);
    }
    
    .icon-reflection {
      opacity: 0.3;
    }
    
    .hover-border {
      opacity: 1;
    }
    
    .corner-accent {
      opacity: 1;
      &.top-left { transform: translate(0, 0); }
      &.bottom-right { transform: translate(0, 0); }
    }
    
    .effect-name {
      color: $text-primary;
    }
  }

  &.active {
    &::before {
      border-color: transparent;
    }
    
    .card-backdrop {
      background: rgba(255,255,255,0.05);
    }
    
    .card-gradient {
      opacity: 1;
    }
    
    .card-glow {
      opacity: 1;
      animation: glowPulse 2s ease-in-out infinite;
    }
    
    .effect-name {
      color: $text-primary;
      text-shadow: 0 0 20px var(--accent);
    }
    
    .corner-accent {
      opacity: 1;
      background: var(--accent);
      &.top-left { transform: translate(0, 0); }
      &.bottom-right { transform: translate(0, 0); }
    }
  }
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.card-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.02);
  transition: background $transition-normal;
}

.card-gradient {
  position: absolute;
  inset: 0;
  opacity: 0.6;
  transition: opacity $transition-normal;
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -25%;
  right: -25%;
  height: 100%;
  opacity: 0;
  transition: opacity $transition-normal;
  pointer-events: none;
}

.card-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.5;
}

.card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-md;
}

.icon-wrapper {
  position: relative;
  transition: transform $transition-bounce;
}

.effect-icon {
  font-size: 30px;
  display: block;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
}

.icon-reflection {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) scaleY(-1);
  font-size: 30px;
  opacity: 0.15;
  filter: blur(2px);
  mask-image: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
  transition: opacity $transition-normal;
  pointer-events: none;
}

.effect-name {
  font-size: $font-size-xs;
  font-weight: 600;
  color: $text-secondary;
  text-align: center;
  transition: all $transition-normal;
  letter-spacing: 0.05em;
}

.hover-border {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  transition: opacity $transition-normal;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent, rgba(255,255,255,0.1));
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
  }
}

.active-indicator {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
  width: 22px;
  height: 22px;
  z-index: 10;
}

.indicator-ring {
  position: absolute;
  inset: 0;
  border: 2px solid var(--accent);
  border-radius: 50%;
  animation: ringScale 0.4s $ease-out-expo;
  box-shadow: 0 0 12px var(--accent);
}

.indicator-dot {
  position: absolute;
  inset: 5px;
  background: var(--accent);
  border-radius: 50%;
  animation: dotScale 0.3s $ease-out-expo 0.1s backwards;
  box-shadow: 0 0 8px var(--accent);
}

@keyframes ringScale {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes dotScale {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

.corner-accent {
  position: absolute;
  width: 16px;
  height: 16px;
  opacity: 0;
  transition: all $transition-normal;
  pointer-events: none;
  
  &::before, &::after {
    content: '';
    position: absolute;
    background: rgba(255,255,255,0.3);
  }
  
  &.top-left {
    top: 0;
    left: 0;
    transform: translate(-4px, -4px);
    &::before { top: 0; left: 0; width: 100%; height: 1px; }
    &::after { top: 0; left: 0; width: 1px; height: 100%; }
  }
  
  &.bottom-right {
    bottom: 0;
    right: 0;
    transform: translate(4px, 4px);
    &::before { bottom: 0; right: 0; width: 100%; height: 1px; }
    &::after { bottom: 0; right: 0; width: 1px; height: 100%; }
  }
}

// 响应式
@media (max-width: 768px) {
  .effect-selector {
    padding: $spacing-sm $spacing-md;
  }
  
  .effect-card {
    width: 100px;
    height: 80px;
  }
  
  .effect-icon {
    font-size: 26px;
  }
  
  .icon-reflection {
    font-size: 26px;
  }
}
</style>
