import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import EffectSelector from '@/components/EffectSelector.vue'
import { useAudioStore } from '@/stores/audioStore'

describe('EffectSelector.vue', () => {
  let wrapper
  let audioStore

  beforeEach(() => {
    setActivePinia(createPinia())
    audioStore = useAudioStore()

    wrapper = mount(EffectSelector)
  })

  describe('Effect List Rendering', () => {
    it('should render all 5 effects', () => {
      const effectCards = wrapper.findAll('.effect-card')
      expect(effectCards.length).toBe(5)
    })

    it('should display correct effect names', () => {
      const effectNames = wrapper.findAll('.effect-name')
      expect(effectNames[0].text()).toBe('波形海浪')
      expect(effectNames[1].text()).toBe('粒子爆发')
      expect(effectNames[2].text()).toBe('星空漫游')
      expect(effectNames[3].text()).toBe('极光流动')
      expect(effectNames[4].text()).toBe('频谱柱状')
    })

    it('should display correct effect icons', () => {
      const effectIcons = wrapper.findAll('.effect-icon')
      expect(effectIcons[0].text()).toBe('🌊')
      expect(effectIcons[1].text()).toBe('✨')
      expect(effectIcons[2].text()).toBe('🌌')
      expect(effectIcons[3].text()).toBe('🌈')
      expect(effectIcons[4].text()).toBe('📊')
    })

    it('should display header with effect count', () => {
      const headerCount = wrapper.find('.header-count')
      expect(headerCount.text()).toBe('5 种风格')
    })
  })

  describe('Effect Switching', () => {
    it('should switch to particleBurst effect', async () => {
      const effectCards = wrapper.findAll('.effect-card')
      await effectCards[1].trigger('click')
      
      expect(audioStore.currentEffect).toBe('particleBurst')
    })

    it('should switch to starryNight effect', async () => {
      const effectCards = wrapper.findAll('.effect-card')
      await effectCards[2].trigger('click')
      
      expect(audioStore.currentEffect).toBe('starryNight')
    })

    it('should switch to auroraFlow effect', async () => {
      const effectCards = wrapper.findAll('.effect-card')
      await effectCards[3].trigger('click')
      
      expect(audioStore.currentEffect).toBe('auroraFlow')
    })

    it('should switch to spectrumBars effect', async () => {
      const effectCards = wrapper.findAll('.effect-card')
      await effectCards[4].trigger('click')
      
      expect(audioStore.currentEffect).toBe('spectrumBars')
    })

    it('should switch back to waveOcean effect', async () => {
      audioStore.setEffect('starryNight')
      
      const effectCards = wrapper.findAll('.effect-card')
      await effectCards[0].trigger('click')
      
      expect(audioStore.currentEffect).toBe('waveOcean')
    })
  })

  describe('Active Effect Highlighting', () => {
    it('should highlight waveOcean by default', () => {
      const effectCards = wrapper.findAll('.effect-card')
      expect(effectCards[0].classes()).toContain('active')
    })

    it('should highlight particleBurst when selected', async () => {
      audioStore.setEffect('particleBurst')
      
      await wrapper.vm.$nextTick()
      
      const effectCards = wrapper.findAll('.effect-card')
      expect(effectCards[1].classes()).toContain('active')
    })

    it('should highlight starryNight when selected', async () => {
      audioStore.setEffect('starryNight')
      
      await wrapper.vm.$nextTick()
      
      const effectCards = wrapper.findAll('.effect-card')
      expect(effectCards[2].classes()).toContain('active')
    })

    it('should highlight auroraFlow when selected', async () => {
      audioStore.setEffect('auroraFlow')
      
      await wrapper.vm.$nextTick()
      
      const effectCards = wrapper.findAll('.effect-card')
      expect(effectCards[3].classes()).toContain('active')
    })

    it('should highlight spectrumBars when selected', async () => {
      audioStore.setEffect('spectrumBars')
      
      await wrapper.vm.$nextTick()
      
      const effectCards = wrapper.findAll('.effect-card')
      expect(effectCards[4].classes()).toContain('active')
    })

    it('should only have one active effect at a time', async () => {
      audioStore.setEffect('particleBurst')
      
      await wrapper.vm.$nextTick()
      
      const effectCards = wrapper.findAll('.effect-card')
      const activeCards = effectCards.filter(card => card.classes().includes('active'))
      expect(activeCards.length).toBe(1)
    })

    it('should show active indicator for selected effect', async () => {
      audioStore.setEffect('starryNight')
      
      await wrapper.vm.$nextTick()
      
      const effectCards = wrapper.findAll('.effect-card')
      const activeIndicator = effectCards[2].find('.active-indicator')
      expect(activeIndicator.exists()).toBe(true)
    })

    it('should not show active indicator for non-selected effects', () => {
      const effectCards = wrapper.findAll('.effect-card')
      const activeIndicator = effectCards[1].find('.active-indicator')
      expect(activeIndicator.exists()).toBe(false)
    })
  })

  describe('Callback Triggering', () => {
    it('should trigger callback when switching effects', async () => {
      const setEffectSpy = vi.spyOn(audioStore, 'setEffect')
      
      const effectCards = wrapper.findAll('.effect-card')
      await effectCards[1].trigger('click')
      
      expect(setEffectSpy).toHaveBeenCalledWith('particleBurst')
    })

    it('should not trigger callback when clicking already selected effect', async () => {
      const setEffectSpy = vi.spyOn(audioStore, 'setEffect')
      
      const effectCards = wrapper.findAll('.effect-card')
      await effectCards[0].trigger('click')
      
      expect(setEffectSpy).not.toHaveBeenCalled()
    })
  })

  describe('Gradient and Glow Styles', () => {
    it('should generate gradient style for effect', () => {
      const effect = audioStore.effects[0]
      const gradientStyle = wrapper.vm.getGradientStyle(effect)
      
      expect(gradientStyle.background).toContain('linear-gradient')
      expect(gradientStyle.background).toContain(effect.colors[0])
    })

    it('should generate glow style for effect', () => {
      const effect = audioStore.effects[0]
      const glowStyle = wrapper.vm.getGlowStyle(effect)
      
      expect(glowStyle.background).toContain('radial-gradient')
      expect(glowStyle.background).toContain(effect.colors[0])
    })

    it('should use third color if available in gradient', () => {
      const effect = audioStore.effects[0]
      const gradientStyle = wrapper.vm.getGradientStyle(effect)
      
      expect(effect.colors.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Effect Data Structure', () => {
    it('should have correct structure for all effects', () => {
      audioStore.effects.forEach(effect => {
        expect(effect).toHaveProperty('id')
        expect(effect).toHaveProperty('name')
        expect(effect).toHaveProperty('icon')
        expect(effect).toHaveProperty('description')
        expect(effect).toHaveProperty('colors')
        expect(Array.isArray(effect.colors)).toBe(true)
        expect(effect.colors.length).toBeGreaterThanOrEqual(3)
      })
    })

    it('should have unique ids for all effects', () => {
      const ids = audioStore.effects.map(e => e.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })
})
