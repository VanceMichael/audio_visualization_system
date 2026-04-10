import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import EffectSelector from '@/components/EffectSelector.vue'
import ElementPlus from 'element-plus'

describe('EffectSelector.vue', () => {
  let wrapper
  let pinia
  let store

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    wrapper = mount(EffectSelector, {
      global: {
        plugins: [pinia, ElementPlus],
      },
      attachTo: document.body
    })
    store = wrapper.vm.audioStore
  })

  afterEach(() => {
    wrapper.unmount()
    vi.clearAllMocks()
  })

  describe('5种效果的切换', () => {
    it('应显示5种效果卡片', () => {
      const effectCards = wrapper.findAll('.effect-card')
      expect(effectCards.length).toBe(5)
      expect(store.effects.length).toBe(5)
    })

    it('点击 waveOcean 应切换效果', async () => {
      store.setEffect('particleBurst')
      await flushPromises()
      expect(store.currentEffect).toBe('particleBurst')

      const firstCard = wrapper.find('.effect-card')
      await firstCard.trigger('click')
      await flushPromises()

      expect(store.currentEffect).toBe('waveOcean')
    })

    it('点击 particleBurst 应切换效果', async () => {
      const cards = wrapper.findAll('.effect-card')
      await cards[1].trigger('click')
      await flushPromises()
      expect(store.currentEffect).toBe('particleBurst')
    })

    it('点击 starryNight 应切换效果', async () => {
      const cards = wrapper.findAll('.effect-card')
      await cards[2].trigger('click')
      await flushPromises()
      expect(store.currentEffect).toBe('starryNight')
    })

    it('点击 auroraFlow 应切换效果', async () => {
      const cards = wrapper.findAll('.effect-card')
      await cards[3].trigger('click')
      await flushPromises()
      expect(store.currentEffect).toBe('auroraFlow')
    })

    it('点击 spectrumBars 应切换效果', async () => {
      const cards = wrapper.findAll('.effect-card')
      await cards[4].trigger('click')
      await flushPromises()
      expect(store.currentEffect).toBe('spectrumBars')
    })
  })

  describe('当前选中效果的高亮状态', () => {
    it('waveOcean 被选中时应有 active class', async () => {
      store.setEffect('waveOcean')
      await flushPromises()
      const cards = wrapper.findAll('.effect-card')
      expect(cards[0].classes()).toContain('active')
    })

    it('particleBurst 被选中时应有 active class', async () => {
      store.setEffect('particleBurst')
      await flushPromises()
      const cards = wrapper.findAll('.effect-card')
      expect(cards[1].classes()).toContain('active')
    })

    it('starryNight 被选中时应有 active class', async () => {
      store.setEffect('starryNight')
      await flushPromises()
      const cards = wrapper.findAll('.effect-card')
      expect(cards[2].classes()).toContain('active')
    })

    it('auroraFlow 被选中时应有 active class', async () => {
      store.setEffect('auroraFlow')
      await flushPromises()
      const cards = wrapper.findAll('.effect-card')
      expect(cards[3].classes()).toContain('active')
    })

    it('spectrumBars 被选中时应有 active class', async () => {
      store.setEffect('spectrumBars')
      await flushPromises()
      const cards = wrapper.findAll('.effect-card')
      expect(cards[4].classes()).toContain('active')
    })

    it('active 卡片应显示选中指示器', async () => {
      store.setEffect('waveOcean')
      await flushPromises()
      const activeCard = wrapper.find('.effect-card.active')
      const indicator = activeCard.find('.active-indicator')
      expect(indicator.exists()).toBe(true)
    })
  })

  describe('效果切换时的回调触发', () => {
    it('切换效果时应调用 setEffect', async () => {
      const setEffectSpy = vi.spyOn(store, 'setEffect')
      const cards = wrapper.findAll('.effect-card')
      await cards[1].trigger('click')
      expect(setEffectSpy).toHaveBeenCalledWith('particleBurst')
    })

    it('点击已选中的效果不重复调用 setEffect', async () => {
      store.setEffect('waveOcean')
      await flushPromises()
      const setEffectSpy = vi.spyOn(store, 'setEffect')
      const cards = wrapper.findAll('.effect-card')
      await cards[0].trigger('click')
      expect(setEffectSpy).not.toHaveBeenCalled()
    })
  })
})
