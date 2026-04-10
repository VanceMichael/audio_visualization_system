import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAudioStore = defineStore('audio', () => {
  // 状态
  const audioFile = ref(null)
  const fileName = ref('')
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.8)
  const currentEffect = ref('waveOcean')
  const isLoading = ref(false)

  // 可用的可视化效果
  const effects = ref([
    {
      id: 'waveOcean',
      name: '波形海浪',
      icon: '🌊',
      description: '如海浪般起伏的波形效果',
      colors: ['#0ea5e9', '#06b6d4', '#22d3ee']
    },
    {
      id: 'particleBurst',
      name: '粒子爆发',
      icon: '✨',
      description: '随节奏爆发的绚丽粒子',
      colors: ['#f472b6', '#a855f7', '#6366f1']
    },
    {
      id: 'starryNight',
      name: '星空漫游',
      icon: '🌌',
      description: '穿越星空的沉浸体验',
      colors: ['#fbbf24', '#f59e0b', '#ffffff']
    },
    {
      id: 'auroraFlow',
      name: '极光流动',
      icon: '🌈',
      description: '梦幻极光的流动光影',
      colors: ['#34d399', '#a855f7', '#3b82f6']
    },
    {
      id: 'spectrumBars',
      name: '频谱柱状',
      icon: '📊',
      description: '经典专业的频谱分析',
      colors: ['#6366f1', '#22d3ee', '#34d399']
    }
  ])

  // 计算属性
  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  const currentEffectConfig = computed(() => {
    return effects.value.find(e => e.id === currentEffect.value)
  })

  // 方法
  const setAudioFile = (file) => {
    audioFile.value = file
    fileName.value = file.name
  }

  const setPlaying = (playing) => {
    isPlaying.value = playing
  }

  const setCurrentTime = (time) => {
    currentTime.value = time
  }

  const setDuration = (dur) => {
    duration.value = dur
  }

  const setVolume = (vol) => {
    volume.value = vol
  }

  const setEffect = (effectId) => {
    currentEffect.value = effectId
  }

  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const reset = () => {
    audioFile.value = null
    fileName.value = ''
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
    isLoading.value = false
  }

  return {
    // 状态
    audioFile,
    fileName,
    isPlaying,
    currentTime,
    duration,
    volume,
    currentEffect,
    isLoading,
    effects,
    // 计算属性
    progress,
    currentEffectConfig,
    // 方法
    setAudioFile,
    setPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setEffect,
    setLoading,
    reset
  }
})
