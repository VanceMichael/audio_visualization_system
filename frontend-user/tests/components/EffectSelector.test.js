import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import EffectSelector from '@/components/EffectSelector.vue'
import { useAudioStore } from '@/stores/audioStore'
import ElementPlus from 'element-plus'

vi.mock('element-plus', () => {
  const ElMessage = vi.fn()
  ElMessage.error = vi.fn()
  ElMessage.success = vi.fn()
  ElMessage.warning = vi.fn()
  ElMessage.info = vi.fn()
  return {
    default: {
      install: vi.fn()
    },
    ElMessage
  }
})

describe('EffectSelector.vue', () => {
  let wrapper
  let store

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    store = useAudioStore()
    wrapper = mount(EffectSelector, {
      global: {
        plugins: [ElementPlus]
      }
    })
  })

  describe('Initial Render', () => {
    it('should render all 5 effect cards', () => {
      const cards = wrapper.findAll('.effect-card')
      expect(cards.length).toBe(5)
    })

    it('should display correct header count', () => {
      expect(wrapper.find('.header-count').text()).toBe('5 种风格')
    })
  })

  describe('Effect Switching', () => {
    it('should switch to particleBurst effect', async () => {
      const cards = wrapper.findAll('.effect-card')
      await cards[1].trigger('click')
      expect(store.currentEffect).toBe('particleBurst')
    })

    it('should switch to starryNight effect', async () => {
      const cards = wrapper.findAll('.effect-card')
      await cards[2].trigger('click')
      expect(store.currentEffect).toBe('starryNight')
    })

    it('should switch to auroraFlow effect', async () => {
      const cards = wrapper.findAll('.effect-card')
      await cards[3].trigger('click')
      expect(store.currentEffect).toBe('auroraFlow')
    })

    it('should switch to spectrumBars effect', async () => {
      const cards = wrapper.findAll('.effect-card')
      await cards[4].trigger('click')
      expect(store.currentEffect).toBe('spectrumBars')
    })

    it('should switch back to waveOcean effect', async () => {
      store.setEffect('particleBurst')
      await flushPromises()
      const cards = wrapper.findAll('.effect-card')
      await cards[0].trigger('click')
      expect(store.currentEffect).toBe('waveOcean')
    })
  })

  describe('Active State Highlighting', () => {
    it('should have first card active by default', () => {
      const cards = wrapper.findAll('.effect-card')
      expect(cards[0].classes()).toContain('active')
    })

    it('should update active class when effect changes', async () => {
      const cards = wrapper.findAll('.effect-card')
      await cards[1].trigger('click')
      await flushPromises()
      expect(cards[0].classes()).not.toContain('active')
      expect(cards[1].classes()).toContain('active')
    })

    it('should show active indicator on active card only', async () => {
      const cards = wrapper.findAll('.effect-card')
      let indicators = wrapper.findAll('.active-indicator')
      expect(indicators.length).toBe(1)
      expect(cards[0].find('.active-indicator').exists()).toBe(true)
      await cards[2].trigger('click')
      await flushPromises()
      indicators = wrapper.findAll('.active-indicator')
      expect(indicators.length).toBe(1)
      expect(cards[2].find('.active-indicator').exists()).toBe(true)
    })

    it('should maintain active state through multiple changes', async () => {
      const cards = wrapper.findAll('.effect-card')
      for (let i = 0; i < 5; i++) {
        await cards[i].trigger('click')
        await flushPromises()
        expect(cards[i].classes()).toContain('active')
      }
    })
  })

  describe('Callback Trigger on Effect Switch', () => {
    it('should call ElMessage when switching effects', async () => {
      const elPlus = await import('element-plus')
      const cards = wrapper.findAll('.effect-card')
      await cards[1].trigger('click')
      expect(elPlus.ElMessage).toHaveBeenCalled()
    })

    it('should pass correct message to ElMessage', async () => {
      const elPlus = await import('element-plus')
      const cards = wrapper.findAll('.effect-card')
      elPlus.ElMessage.mockClear()
      await cards[1].trigger('click')
      expect(elPlus.ElMessage.mock.calls[0][0].message).toContain('✨')
      expect(elPlus.ElMessage.mock.calls[0][0].message).toContain('粒子爆发')
    })

    it('should not call ElMessage if clicking same effect', async () => {
      const elPlus = await import('element-plus')
      const cards = wrapper.findAll('.effect-card')
      await cards[0].trigger('click')
      elPlus.ElMessage.mockClear()
      await cards[0].trigger('click')
      expect(elPlus.ElMessage).not.toHaveBeenCalled()
      expect(store.currentEffect).toBe('waveOcean')
    })

    it('should call ElMessage with success type', async () => {
      const elPlus = await import('element-plus')
      const cards = wrapper.findAll('.effect-card')
      elPlus.ElMessage.mockClear()
      await cards[4].trigger('click')
      expect(elPlus.ElMessage.mock.calls[0][0].type).toBe('success')
    })

    it('should set correct effect id in store', async () => {
      const expectedIds = ['waveOcean', 'particleBurst', 'starryNight', 'auroraFlow', 'spectrumBars']
      const cards = wrapper.findAll('.effect-card')
      for (let i = 0; i < 5; i++) {
        await cards[i].trigger('click')
        expect(store.currentEffect).toBe(expectedIds[i])
      }
    })
  })

  describe('Card Content', () => {
    it('should display correct icons for all effects', () => {
      const expectedIcons = ['🌊', '✨', '🌌', '🌈', '📊']
      const icons = wrapper.findAll('.effect-icon')
      icons.forEach((icon, index) => {
        expect(icon.text()).toBe(expectedIcons[index])
      })
    })

    it('should display correct names for all effects', () => {
      const expectedNames = ['波形海浪', '粒子爆发', '星空漫游', '极光流动', '频谱柱状']
      const names = wrapper.findAll('.effect-name')
      names.forEach((name, index) => {
        expect(name.text()).toBe(expectedNames[index])
      })
    })
  })

  describe('Style Functions', () => {
    it('should generate gradient style with effect colors', () => {
      const style = wrapper.vm.getGradientStyle(store.effects[0])
      expect(style.background).toContain('linear-gradient')
      expect(style.background).toContain('#0ea5e9')
    })

    it('should generate glow style with effect colors', () => {
      const style = wrapper.vm.getGlowStyle(store.effects[1])
      expect(style.background).toContain('radial-gradient')
      expect(style.background).toContain('#f472b6')
    })

    it('should handle custom animation delay', () => {
      const cards = wrapper.findAll('.effect-card')
      cards.forEach((card, index) => {
        const expectedDelay = `--delay: ${index * 0.06}s`
        expect(card.attributes('style')).toContain(expectedDelay)
      })
    })
  })
})
