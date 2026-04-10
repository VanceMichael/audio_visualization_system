import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AudioPlayer from '@/components/AudioPlayer.vue'
import { useAudioStore } from '@/stores/audioStore'

const mockAudioContext = {
  state: 'running',
  createAnalyser: vi.fn(() => ({
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    minDecibels: -90,
    maxDecibels: -10,
    connect: vi.fn(),
    disconnect: vi.fn()
  })),
  createMediaElementSource: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn()
  })),
  destination: {},
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined)
}

const createMockAudio = () => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  src: '',
  duration: 0,
  currentTime: 0,
  volume: 0.8,
  onloadedmetadata: null,
  onerror: null
})

describe('AudioPlayer.vue', () => {
  let wrapper
  let audioStore
  let mockAudioElement

  beforeEach(() => {
    setActivePinia(createPinia())
    audioStore = useAudioStore()

    vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext))
    vi.stubGlobal('webkitAudioContext', vi.fn(() => mockAudioContext))
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn()
    })

    mockAudioElement = createMockAudio()

    wrapper = mount(AudioPlayer, {
      global: {
        stubs: {
          ElMessage: {
            success: vi.fn(),
            error: vi.fn(),
            warning: vi.fn(),
            info: vi.fn()
          }
        }
      }
    })

    wrapper.vm.audioElement = mockAudioElement
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    wrapper?.unmount()
  })

  describe('File Upload - Drag and Click', () => {
    it('should show upload placeholder when no file is loaded', () => {
      expect(wrapper.find('.upload-placeholder').exists()).toBe(true)
      expect(wrapper.find('.upload-title').text()).toContain('拖放音频文件到这里')
    })

    it('should add dragging class when dragover event is triggered', async () => {
      const uploadZone = wrapper.find('.upload-zone')
      await uploadZone.trigger('dragover', { dataTransfer: { dropEffect: 'copy' } })
      expect(wrapper.vm.isDragging).toBe(true)
      expect(uploadZone.classes()).toContain('dragging')
    })

    it('should remove dragging class when dragleave event is triggered', async () => {
      wrapper.vm.isDragging = true
      const uploadZone = wrapper.find('.upload-zone')
      await uploadZone.trigger('dragleave')
      expect(wrapper.vm.isDragging).toBe(false)
    })

    it('should handle file drop event', async () => {
      const mockFile = new File(['audio'], 'test.mp3', { type: 'audio/mp3' })
      const uploadZone = wrapper.find('.upload-zone')
      
      await uploadZone.trigger('drop', {
        dataTransfer: { files: [mockFile] }
      })
    })

    it('should trigger file input when clicking upload zone without file', async () => {
      const fileInput = wrapper.findComponent({ name: 'input' })
      const triggerSpy = vi.spyOn(wrapper.vm, 'triggerFileInput')
      
      const uploadZone = wrapper.find('.upload-zone')
      await uploadZone.trigger('click')
      
      expect(triggerSpy).toHaveBeenCalled()
    })

    it('should not trigger file input when file already exists', async () => {
      audioStore.setAudioFile({ name: 'test.mp3' })
      audioStore.setDuration(180)
      
      const uploadZone = wrapper.find('.upload-zone')
      await uploadZone.trigger('click')
      
      expect(wrapper.find('.file-display').exists()).toBe(true)
    })

    it('should display file info when file is loaded', () => {
      audioStore.setAudioFile({ name: 'test.mp3' })
      audioStore.setDuration(180)
      
      wrapper = mount(AudioPlayer, {
        global: {
          stubs: {
            ElMessage: {
              success: vi.fn(),
              error: vi.fn(),
              warning: vi.fn(),
              info: vi.fn()
            }
          }
        }
      })
      
      expect(wrapper.find('.file-display').exists()).toBe(true)
      expect(wrapper.find('.file-name').text()).toBe('test.mp3')
    })
  })

  describe('Play/Pause Button State', () => {
    beforeEach(() => {
      audioStore.setAudioFile({ name: 'test.mp3' })
      audioStore.setDuration(180)
      wrapper = mount(AudioPlayer, {
        global: {
          stubs: {
            ElMessage: {
              success: vi.fn(),
              error: vi.fn(),
              warning: vi.fn(),
              info: vi.fn()
            }
          }
        }
      })
      wrapper.vm.audioElement = mockAudioElement
    })

    it('should show play icon when not playing', () => {
      expect(wrapper.find('.play-btn').exists()).toBe(true)
      expect(wrapper.find('.play-btn').classes()).not.toContain('playing')
    })

    it('should show pause icon when playing', () => {
      audioStore.setPlaying(true)
      wrapper.vm.$nextTick()
      
      expect(wrapper.find('.play-btn').classes()).toContain('playing')
    })

    it('should toggle play state when button is clicked', async () => {
      audioStore.setPlaying(false)
      
      await wrapper.find('.play-btn').trigger('click')
      
      expect(mockAudioElement.play).toHaveBeenCalled()
    })

    it('should pause when already playing', async () => {
      audioStore.setPlaying(true)
      
      await wrapper.find('.play-btn').trigger('click')
      
      expect(mockAudioElement.pause).toHaveBeenCalled()
    })

    it('should show loading state when isLoading is true', () => {
      audioStore.setLoading(true)
      
      expect(wrapper.find('.play-btn').classes()).toContain('loading')
    })

    it('should disable button when loading', () => {
      audioStore.setLoading(true)
      
      expect(wrapper.find('.play-btn').attributes('disabled')).toBeDefined()
    })

    it('should not toggle play when no audio source', async () => {
      wrapper.vm.audioElement.src = ''
      
      await wrapper.find('.play-btn').trigger('click')
      
      expect(mockAudioElement.play).not.toHaveBeenCalled()
    })
  })

  describe('Progress Bar Drag', () => {
    beforeEach(() => {
      audioStore.setAudioFile({ name: 'test.mp3' })
      audioStore.setDuration(180)
      audioStore.setCurrentTime(60)
      wrapper = mount(AudioPlayer, {
        global: {
          stubs: {
            ElMessage: {
              success: vi.fn(),
              error: vi.fn(),
              warning: vi.fn(),
              info: vi.fn()
            }
          }
        }
      })
      wrapper.vm.audioElement = mockAudioElement
    })

    it('should display progress percentage correctly', () => {
      expect(wrapper.vm.progressValue).toBeCloseTo(33.33, 1)
    })

    it('should update progress value on input', async () => {
      const trackInput = wrapper.find('.track-input')
      await trackInput.trigger('input', { target: { value: 50 } })
      
      expect(wrapper.vm.progressValue).toBe(50)
      expect(wrapper.vm.dragTime).toBe(90)
    })

    it('should start dragging on mousedown', async () => {
      const progressBar = wrapper.find('.progress-bar')
      await progressBar.trigger('mousedown')
      
      expect(wrapper.vm.isDraggingProgress).toBe(true)
    })

    it('should stop dragging on mouseup', async () => {
      wrapper.vm.isDraggingProgress = true
      
      await wrapper.find('.track-input').trigger('mouseup')
      
      expect(wrapper.vm.isDraggingProgress).toBe(false)
    })

    it('should seek to correct time on change', async () => {
      mockAudioElement.duration = 180
      const trackInput = wrapper.find('.track-input')
      await trackInput.trigger('change', { target: { value: 50 } })
      
      expect(mockAudioElement.currentTime).toBe(90)
    })

    it('should show tooltip when dragging', () => {
      wrapper.vm.isDraggingProgress = true
      wrapper.vm.dragTime = 90
      
      expect(wrapper.find('.track-tooltip').exists()).toBe(true)
    })
  })

  describe('Volume Control', () => {
    beforeEach(() => {
      audioStore.setAudioFile({ name: 'test.mp3' })
      audioStore.setDuration(180)
      wrapper = mount(AudioPlayer, {
        global: {
          stubs: {
            ElMessage: {
              success: vi.fn(),
              error: vi.fn(),
              warning: vi.fn(),
              info: vi.fn()
            }
          }
        }
      })
      wrapper.vm.audioElement = mockAudioElement
    })

    it('should display volume value', () => {
      expect(wrapper.vm.volumeValue).toBe(80)
    })

    it('should update volume on input', async () => {
      const volumeInput = wrapper.find('.volume-input')
      await volumeInput.trigger('input', { target: { value: 50 } })
      
      expect(wrapper.vm.volumeValue).toBe(50)
      expect(mockAudioElement.volume).toBe(0.5)
      expect(audioStore.volume).toBe(0.5)
    })

    it('should mute when clicking mute button', async () => {
      wrapper.vm.volumeValue = 80
      
      await wrapper.find('.volume-btn').trigger('click')
      
      expect(wrapper.vm.isMuted).toBe(true)
      expect(mockAudioElement.volume).toBe(0)
    })

    it('should restore previous volume when unmuting', async () => {
      wrapper.vm.volumeValue = 0
      wrapper.vm.isMuted = true
      wrapper.vm.previousVolume = 0.8
      
      await wrapper.find('.volume-btn').trigger('click')
      
      expect(wrapper.vm.isMuted).toBe(false)
      expect(mockAudioElement.volume).toBe(0.8)
    })

    it('should show visual indicator when muted', () => {
      wrapper.vm.isMuted = true
      
      expect(wrapper.find('.volume-btn').exists()).toBe(true)
    })
  })

  describe('File Type Validation', () => {
    beforeEach(() => {
      wrapper = mount(AudioPlayer, {
        global: {
          stubs: {
            ElMessage: {
              success: vi.fn(),
              error: vi.fn(),
              warning: vi.fn(),
              info: vi.fn()
            }
          }
        }
      })
    })

    it('should accept valid mp3 file', () => {
      const mockFile = new File(['audio'], 'test.mp3', { type: 'audio/mp3' })
      const result = wrapper.vm.validateFile(mockFile)
      expect(result.valid).toBe(true)
    })

    it('should accept valid wav file', () => {
      const mockFile = new File(['audio'], 'test.wav', { type: 'audio/wav' })
      const result = wrapper.vm.validateFile(mockFile)
      expect(result.valid).toBe(true)
    })

    it('should accept valid ogg file', () => {
      const mockFile = new File(['audio'], 'test.ogg', { type: 'audio/ogg' })
      const result = wrapper.vm.validateFile(mockFile)
      expect(result.valid).toBe(true)
    })

    it('should accept file by extension even without valid type', () => {
      const mockFile = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' })
      const result = wrapper.vm.validateFile(mockFile)
      expect(result.valid).toBe(true)
    })

    it('should reject invalid file type', () => {
      const mockFile = new File(['audio'], 'test.txt', { type: 'text/plain' })
      const result = wrapper.vm.validateFile(mockFile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('不支持的文件格式')
    })

    it('should reject empty file', () => {
      const mockFile = new File([], 'test.mp3', { type: 'audio/mp3' })
      const result = wrapper.vm.validateFile(mockFile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('文件为空')
    })

    it('should reject file over 100MB', () => {
      const mockFile = new File(['a'.repeat(101 * 1024 * 1024)], 'test.mp3', { type: 'audio/mp3' })
      const result = wrapper.vm.validateFile(mockFile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('文件过大，请选择小于 100MB 的文件')
    })

    it('should reject null file', () => {
      const result = wrapper.vm.validateFile(null)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('未选择文件')
    })
  })

  describe('Time Formatting', () => {
    beforeEach(() => {
      wrapper = mount(AudioPlayer)
    })

    it('should format seconds correctly', () => {
      expect(wrapper.vm.formatTime(65)).toBe('1:05')
    })

    it('should handle zero seconds', () => {
      expect(wrapper.vm.formatTime(0)).toBe('0:00')
    })

    it('should handle NaN', () => {
      expect(wrapper.vm.formatTime(NaN)).toBe('0:00')
    })

    it('should handle undefined', () => {
      expect(wrapper.vm.formatTime(undefined)).toBe('0:00')
    })

    it('should handle Infinity', () => {
      expect(wrapper.vm.formatTime(Infinity)).toBe('0:00')
    })
  })

  describe('File Format Display', () => {
    beforeEach(() => {
      audioStore.setAudioFile({ name: 'test.mp3' })
      wrapper = mount(AudioPlayer)
    })

    it('should display file extension', () => {
      expect(wrapper.vm.getFileFormat()).toBe('MP3')
    })

    it('should handle file without extension', () => {
      audioStore.setAudioFile({ name: 'testfile' })
      expect(wrapper.vm.getFileFormat()).toBe('AUDIO')
    })
  })

  describe('Remove File', () => {
    beforeEach(() => {
      audioStore.setAudioFile({ name: 'test.mp3' })
      audioStore.setDuration(180)
      wrapper = mount(AudioPlayer, {
        global: {
          stubs: {
            ElMessage: {
              success: vi.fn(),
              error: vi.fn(),
              warning: vi.fn(),
              info: vi.fn()
            }
          }
        }
      })
      wrapper.vm.audioElement = mockAudioElement
    })

    it('should remove file and reset state', async () => {
      await wrapper.find('.remove-btn').trigger('click.stop')
      
      expect(audioStore.fileName).toBe('')
      expect(audioStore.duration).toBe(0)
    })
  })

  describe('Audio Events', () => {
    beforeEach(() => {
      audioStore.setAudioFile({ name: 'test.mp3' })
      audioStore.setDuration(180)
      wrapper = mount(AudioPlayer, {
        global: {
          stubs: {
            ElMessage: {
              success: vi.fn(),
              error: vi.fn(),
              warning: vi.fn(),
              info: vi.fn()
            }
          }
        }
      })
      wrapper.vm.audioElement = mockAudioElement
    })

    it('should handle audio ended event', () => {
      wrapper.vm.handleEnded()
      
      expect(audioStore.isPlaying).toBe(false)
      expect(audioStore.currentTime).toBe(0)
      expect(mockAudioElement.currentTime).toBe(0)
    })

    it('should handle waiting event', () => {
      wrapper.vm.handleWaiting()
      
      expect(wrapper.vm.isBuffering).toBe(true)
    })

    it('should handle canplay event', () => {
      wrapper.vm.isBuffering = true
      wrapper.vm.handleCanPlay()
      
      expect(wrapper.vm.isBuffering).toBe(false)
    })
  })
})
