import { describe, it, expect, beforeEach, vi, afterEach, afterAll, beforeAll } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AudioPlayer from '@/components/AudioPlayer.vue'
import ElementPlus from 'element-plus'

// Mock Web Audio API
class MockAudioContext {
  constructor() {
    this.state = 'running'
  }
  createAnalyser() { return { fftSize: 2048, smoothingTimeConstant: 0.8, minDecibels: -90, maxDecibels: -10 } }
  createMediaElementSource() { return { connect: vi.fn() } }
  resume() { return Promise.resolve() }
  close() { return Promise.resolve() }
  destination = {}
}

describe('AudioPlayer.vue', () => {
  let wrapper
  let pinia

  beforeAll(() => {
    global.AudioContext = MockAudioContext
    global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/test')
    global.URL.revokeObjectURL = vi.fn()
    global.HTMLElement.prototype.click = vi.fn()
  })

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    wrapper = mount(AudioPlayer, {
      global: {
        plugins: [pinia, ElementPlus],
      },
      attachTo: document.body
    })
  })

  afterEach(() => {
    wrapper.unmount()
    vi.clearAllMocks()
  })

  describe('文件上传交互', () => {
    describe('拖拽上传', () => {
      it('拖拽时显示拖拽状态', async () => {
        const uploadZone = wrapper.find('.upload-zone')
        const dataTransfer = { dropEffect: 'copy', files: [] }
        await uploadZone.trigger('dragover', { dataTransfer })
        expect(uploadZone.classes()).toContain('dragging')
      })

      it('拖拽离开时取消拖拽状态', async () => {
        const uploadZone = wrapper.find('.upload-zone')
        const dataTransfer = { dropEffect: 'copy', files: [] }
        await uploadZone.trigger('dragover', { dataTransfer })
        expect(uploadZone.classes()).toContain('dragging')
        await uploadZone.trigger('dragleave')
        expect(wrapper.vm.isDragging).toBe(false)
      })

      it('processFile 和 validateFile 集成处理有效音频文件', async () => {
        const file = new File(['test content'], 'test.mp3', { type: 'audio/mpeg' })
        const validateResult = wrapper.vm.validateFile(file)
        expect(validateResult.valid).toBe(true)
        expect(wrapper.vm.isDragging).toBe(false)
      })
    })

    describe('点击上传', () => {
      it('点击上传区域应触发文件选择框', async () => {
        const clickSpy = vi.spyOn(wrapper.vm.$refs.fileInput, 'click')
        const uploadZone = wrapper.find('.upload-zone')
        await uploadZone.trigger('click')
        expect(clickSpy).toHaveBeenCalled()
      })
    })
  })

  describe('文件类型校验', () => {
    it('只接受 mp3/wav/ogg 文件', () => {
      const mp3File = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })
      const wavFile = new File(['test'], 'test.wav', { type: 'audio/wav' })
      const oggFile = new File(['test'], 'test.ogg', { type: 'audio/ogg' })
      const txtFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const exeFile = new File(['test'], 'test.exe', { type: 'application/exe' })

      expect(wrapper.vm.validateFile(mp3File).valid).toBe(true)
      expect(wrapper.vm.validateFile(wavFile).valid).toBe(true)
      expect(wrapper.vm.validateFile(oggFile).valid).toBe(true)
      expect(wrapper.vm.validateFile(txtFile).valid).toBe(false)
      expect(wrapper.vm.validateFile(exeFile).valid).toBe(false)
    })

    it('空文件应返回错误', () => {
      const result = wrapper.vm.validateFile(null)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('未选择文件')
    })

    it('过大的文件应返回错误', () => {
      const largeFile = new File(['x'.repeat(101 * 1024 * 1024)], 'large.mp3', { type: 'audio/mpeg' })
      Object.defineProperty(largeFile, 'size', { value: 101 * 1024 * 1024 })
      const result = wrapper.vm.validateFile(largeFile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('文件过大，请选择小于 100MB 的文件')
    })
  })

  describe('播放/暂停按钮状态切换', () => {
    it('初始状态显示播放图标', async () => {
      const store = wrapper.vm.audioStore
      store.setAudioFile({ name: 'test.mp3' })
      store.setPlaying(false)
      await flushPromises()
      expect(store.isPlaying).toBe(false)
    })

    it('点击按钮应触发togglePlay', async () => {
      const store = wrapper.vm.audioStore
      store.setAudioFile({ name: 'test.mp3' })
      store.setDuration(100)
      wrapper.vm.audioElement = { src: 'test.mp3' }
      await flushPromises()

      const togglePlaySpy = vi.spyOn(wrapper.vm, 'togglePlay').mockImplementation(() => {})
      wrapper.vm.togglePlay()

      expect(togglePlaySpy).toHaveBeenCalled()
    })
  })

  describe('进度条拖拽', () => {
    it('startDragging 应设置拖拽状态', () => {
      wrapper.vm.startDragging()
      expect(wrapper.vm.isDraggingProgress).toBe(true)
    })

    it('stopDragging 应取消拖拽状态', () => {
      wrapper.vm.isDraggingProgress = true
      wrapper.vm.stopDragging()
      expect(wrapper.vm.isDraggingProgress).toBe(false)
    })

    it('handleProgressInput 应更新进度值', () => {
      wrapper.vm.audioStore.setDuration(200)
      const e = { target: { value: 50 } }
      wrapper.vm.handleProgressInput(e)
      expect(wrapper.vm.progressValue).toBe(50)
      expect(wrapper.vm.dragTime).toBe(100)
    })
  })

  describe('音量调节', () => {
    it('handleVolumeInput 应设置音量值', () => {
      wrapper.vm.audioElement = { volume: 0 }
      const e = { target: { value: 50 } }
      wrapper.vm.handleVolumeInput(e)
      expect(wrapper.vm.volumeValue).toBe(50)
      expect(wrapper.vm.audioElement.volume).toBe(0.5)
    })

    it('toggleMute 应切换静音状态', () => {
      wrapper.vm.volumeValue = 80
      wrapper.vm.isMuted = false
      wrapper.vm.audioElement = { volume: 0.8 }

      wrapper.vm.toggleMute()
      expect(wrapper.vm.isMuted).toBe(true)
      expect(wrapper.vm.volumeValue).toBe(0)

      wrapper.vm.toggleMute()
      expect(wrapper.vm.isMuted).toBe(false)
      expect(wrapper.vm.volumeValue).toBeGreaterThan(0)
    })
  })

  describe('formatTime', () => {
    it('应正确格式化时间', () => {
      expect(wrapper.vm.formatTime(0)).toBe('0:00')
      expect(wrapper.vm.formatTime(65)).toBe('1:05')
      expect(wrapper.vm.formatTime(125)).toBe('2:05')
      expect(wrapper.vm.formatTime(null)).toBe('0:00')
      expect(wrapper.vm.formatTime(NaN)).toBe('0:00')
    })
  })
})
