import { describe, it, expect, beforeEach, vi, vitest } from 'vitest'
import { mount, shallowMount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AudioPlayer from '@/components/AudioPlayer.vue'
import { useAudioStore } from '@/stores/audioStore'
import ElementPlus from 'element-plus'

vi.mock('element-plus', () => ({
  default: {
    install: vi.fn()
  },
  ElMessage: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

describe('AudioPlayer.vue', () => {
  let wrapper
  let store

  const createMockFile = (name, type, size = 1024) => {
    return new File(['audio content'], name, { type })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    store = useAudioStore()
    
    Object.defineProperty(window, 'AudioContext', {
      value: vi.fn(() => ({
        state: 'running',
        resume: vi.fn().mockResolvedValue(true),
        close: vi.fn().mockResolvedValue(true),
        createAnalyser: vi.fn(() => ({
          fftSize: 2048,
          smoothingTimeConstant: 0.8,
          minDecibels: -90,
          maxDecibels: -10
        })),
        createMediaElementSource: vi.fn(() => ({
          connect: vi.fn()
        })),
        destination: {}
      })),
      writable: true
    })

    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:http://localhost/mock'),
      writable: true
    })

    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(),
      writable: true
    })

    wrapper = mount(AudioPlayer, {
      global: {
        plugins: [ElementPlus]
      }
    })
  })

  describe('File Upload - Click', () => {
    it('should trigger file input click when upload zone is clicked', async () => {
      const clickSpy = vi.spyOn(wrapper.vm.$refs.fileInput, 'click')
      await wrapper.find('.upload-zone').trigger('click')
      expect(clickSpy).toHaveBeenCalled()
    })

    it('should not trigger file input click when file is already uploaded', async () => {
      store.setAudioFile({ name: 'test.mp3' })
      await flushPromises()
      const clickSpy = vi.spyOn(wrapper.vm.$refs.fileInput, 'click')
      await wrapper.find('.upload-zone').trigger('click')
      expect(clickSpy).not.toHaveBeenCalled()
    })
  })

  describe('File Upload - Drag and Drop', () => {
    it('should handle dragover event', async () => {
      wrapper.vm.handleDragOver({ preventDefault: vi.fn(), dataTransfer: {} })
      expect(wrapper.vm.isDragging).toBe(true)
    })

    it('should handle dragleave event', async () => {
      wrapper.vm.isDragging = true
      await wrapper.find('.upload-zone').trigger('dragleave')
      expect(wrapper.vm.isDragging).toBe(false)
    })

    it('should handle drop with valid file', async () => {
      const mockFile = createMockFile('test.mp3', 'audio/mpeg')
      Object.defineProperty(mockFile, 'size', { value: 1024, writable: true })
      wrapper.vm.isDragging = true
      wrapper.vm.handleDrop({
        preventDefault: vi.fn(),
        dataTransfer: { files: [mockFile] }
      })
      expect(wrapper.vm.isDragging).toBe(false)
    })

    it('should handle drop with no files', async () => {
      const dropEvent = {
        dataTransfer: { files: [] }
      }
      const processFileSpy = vi.spyOn(wrapper.vm, 'processFile')
      await wrapper.find('.upload-zone').trigger('drop', dropEvent)
      expect(processFileSpy).not.toHaveBeenCalled()
    })
  })

  describe('File Type Validation', () => {
    it('should accept mp3 files', () => {
      const mp3File = createMockFile('audio.mp3', 'audio/mpeg')
      const result = wrapper.vm.validateFile(mp3File)
      expect(result.valid).toBe(true)
    })

    it('should accept wav files', () => {
      const wavFile = createMockFile('audio.wav', 'audio/wav')
      const result = wrapper.vm.validateFile(wavFile)
      expect(result.valid).toBe(true)
    })

    it('should accept ogg files', () => {
      const oggFile = createMockFile('audio.ogg', 'audio/ogg')
      const result = wrapper.vm.validateFile(oggFile)
      expect(result.valid).toBe(true)
    })

    it('should accept files with valid extension but unknown type', () => {
      const mp3File = createMockFile('audio.mp3', '')
      const result = wrapper.vm.validateFile(mp3File)
      expect(result.valid).toBe(true)
    })

    it('should reject txt files', () => {
      const txtFile = createMockFile('file.txt', 'text/plain')
      const result = wrapper.vm.validateFile(txtFile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('不支持的文件格式')
    })

    it('should reject pdf files', () => {
      const pdfFile = createMockFile('file.pdf', 'application/pdf')
      const result = wrapper.vm.validateFile(pdfFile)
      expect(result.valid).toBe(false)
    })

    it('should reject files with invalid extension', () => {
      const invalidFile = createMockFile('file.exe', 'application/exe')
      const result = wrapper.vm.validateFile(invalidFile)
      expect(result.valid).toBe(false)
    })

    it('should reject empty files', () => {
      const emptyFile = createMockFile('empty.mp3', 'audio/mpeg', 0)
      Object.defineProperty(emptyFile, 'size', { value: 0, writable: true })
      const result = wrapper.vm.validateFile(emptyFile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('文件为空')
    })

    it('should reject files larger than 100MB', () => {
      const largeFile = createMockFile('large.mp3', 'audio/mpeg')
      Object.defineProperty(largeFile, 'size', { value: 101 * 1024 * 1024, writable: true })
      const result = wrapper.vm.validateFile(largeFile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('文件过大，请选择小于 100MB 的文件')
    })

    it('should reject undefined/null file', () => {
      const result = wrapper.vm.validateFile(undefined)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('未选择文件')
    })
  })

  describe('Play/Pause Button', () => {
    it('should show play icon when not playing', async () => {
      store.setAudioFile({ name: 'test.mp3' })
      store.setPlaying(false)
      store.setLoading(false)
      await flushPromises()
      expect(wrapper.find('.play-btn').exists()).toBe(true)
      expect(wrapper.find('.play-btn.playing').exists()).toBe(false)
    })

    it('should show pause icon when playing', async () => {
      store.setAudioFile({ name: 'test.mp3' })
      store.setPlaying(true)
      store.setLoading(false)
      await flushPromises()
      expect(wrapper.find('.play-btn.playing').exists()).toBe(true)
    })

    it('should show loading state', async () => {
      store.setAudioFile({ name: 'test.mp3' })
      store.setLoading(true)
      await flushPromises()
      expect(wrapper.find('.play-btn.loading').exists()).toBe(true)
    })

    it('should disable button when loading', async () => {
      store.setAudioFile({ name: 'test.mp3' })
      store.setLoading(true)
      await flushPromises()
      expect(wrapper.find('.play-btn').attributes('disabled')).toBeDefined()
    })
  })

  describe('Progress Bar', () => {
    it('should update progress value', async () => {
      store.setDuration(100)
      store.setCurrentTime(50)
      await flushPromises()
      expect(wrapper.vm.progressValue).toBe(50)
    })

    it('should handle start dragging', () => {
      wrapper.vm.startDragging()
      expect(wrapper.vm.isDraggingProgress).toBe(true)
    })

    it('should handle stop dragging', () => {
      wrapper.vm.isDraggingProgress = true
      wrapper.vm.stopDragging()
      expect(wrapper.vm.isDraggingProgress).toBe(false)
    })

    it('should handle progress input', () => {
      store.setDuration(200)
      const event = { target: { value: 50 } }
      wrapper.vm.handleProgressInput(event)
      expect(wrapper.vm.progressValue).toBe(50)
      expect(wrapper.vm.dragTime).toBe(100)
    })
  })

  describe('Volume Control', () => {
    it('should have default volume at 80%', () => {
      expect(wrapper.vm.volumeValue).toBe(80)
    })

    it('should handle volume input', () => {
      const event = { target: { value: 50 } }
      wrapper.vm.handleVolumeInput(event)
      expect(wrapper.vm.volumeValue).toBe(50)
      expect(store.volume).toBe(0.5)
    })

    it('should toggle mute from unmuted to muted', () => {
      wrapper.vm.isMuted = false
      wrapper.vm.volumeValue = 80
      wrapper.vm.toggleMute()
      expect(wrapper.vm.isMuted).toBe(true)
      expect(wrapper.vm.volumeValue).toBe(0)
    })

    it('should toggle mute from muted to unmuted', () => {
      wrapper.vm.isMuted = true
      wrapper.vm.previousVolume = 0.8
      wrapper.vm.toggleMute()
      expect(wrapper.vm.isMuted).toBe(false)
      expect(wrapper.vm.volumeValue).toBe(80)
    })

    it('should be muted when volume is 0', () => {
      const event = { target: { value: 0 } }
      wrapper.vm.handleVolumeInput(event)
      expect(wrapper.vm.isMuted).toBe(true)
    })
  })

  describe('formatTime', () => {
    it('should format 0 seconds as 0:00', () => {
      expect(wrapper.vm.formatTime(0)).toBe('0:00')
    })

    it('should format 59 seconds as 0:59', () => {
      expect(wrapper.vm.formatTime(59)).toBe('0:59')
    })

    it('should format 60 seconds as 1:00', () => {
      expect(wrapper.vm.formatTime(60)).toBe('1:00')
    })

    it('should format 125 seconds as 2:05', () => {
      expect(wrapper.vm.formatTime(125)).toBe('2:05')
    })

    it('should handle NaN as 0:00', () => {
      expect(wrapper.vm.formatTime(NaN)).toBe('0:00')
    })

    it('should handle Infinity as 0:00', () => {
      expect(wrapper.vm.formatTime(Infinity)).toBe('0:00')
    })

    it('should handle undefined as 0:00', () => {
      expect(wrapper.vm.formatTime(undefined)).toBe('0:00')
    })
  })

  describe('getFileFormat', () => {
    it('should get mp3 format', () => {
      store.setAudioFile({ name: 'song.mp3' })
      expect(wrapper.vm.getFileFormat()).toBe('MP3')
    })

    it('should get wav format', () => {
      store.setAudioFile({ name: 'song.wav' })
      expect(wrapper.vm.getFileFormat()).toBe('WAV')
    })

    it('should get ogg format', () => {
      store.setAudioFile({ name: 'song.ogg' })
      expect(wrapper.vm.getFileFormat()).toBe('OGG')
    })
  })
})
