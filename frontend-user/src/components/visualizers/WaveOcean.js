/**
 * 波形海浪效果 - 升级版
 * 多层波浪 + 粒子 + 光效
 */
export class WaveOcean {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx
    this.width = canvas.width
    this.height = canvas.height
    this.time = 0
    this.particles = []
    this.initWaves()
    this.initParticles()
  }

  initWaves() {
    this.waves = [
      { amplitude: 60, frequency: 0.015, speed: 0.02, color: 'rgba(6, 255, 210, 0.15)', yOffset: 0.65 },
      { amplitude: 50, frequency: 0.02, speed: 0.03, color: 'rgba(0, 212, 255, 0.2)', yOffset: 0.6 },
      { amplitude: 40, frequency: 0.025, speed: 0.04, color: 'rgba(102, 126, 234, 0.25)', yOffset: 0.55 },
      { amplitude: 35, frequency: 0.03, speed: 0.05, color: 'rgba(139, 92, 246, 0.3)', yOffset: 0.5 }
    ]
  }

  initParticles() {
    this.particles = []
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height * 0.5,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.5 + 0.3
      })
    }
  }

  resize(width, height) {
    this.width = width
    this.height = height
    this.initParticles()
  }

  reset() {
    this.time = 0
  }

  render(frequencyData, waveformData, deltaTime, isPlaying) {
    const safeFrequencyData = frequencyData || new Uint8Array(1024)
    const safeDeltaTime = Math.max(0, deltaTime || 0)
    
    const ctx = this.ctx
    
    // 使用 deltaTime 更新时间，确保动画速度与帧率无关
    this.time += safeDeltaTime
    
    let avgFrequency = 0, bassFrequency = 0
    for (let i = 0; i < safeFrequencyData.length; i++) {
      avgFrequency += safeFrequencyData[i]
      if (i < safeFrequencyData.length / 4) bassFrequency += safeFrequencyData[i]
    }
    avgFrequency /= safeFrequencyData.length || 1
    bassFrequency /= (safeFrequencyData.length / 4) || 1
    
    const intensity = isPlaying ? avgFrequency / 128 : 0.3
    const bassIntensity = isPlaying ? bassFrequency / 128 : 0.3

    // 深空渐变背景
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height)
    bgGrad.addColorStop(0, '#050508')
    bgGrad.addColorStop(0.4, '#0a0a1a')
    bgGrad.addColorStop(0.7, '#0f1525')
    bgGrad.addColorStop(1, '#0a1020')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, this.width, this.height)

    // 星星
    this.drawStars(ctx, intensity)
    
    // 粒子 - 传入 deltaTime
    this.updateParticles(ctx, intensity, safeDeltaTime)

    // 月亮/光源
    this.drawMoon(ctx, intensity)

    // 波浪
    this.waves.forEach((wave, index) => {
      this.drawWave(ctx, wave, intensity, bassIntensity, index)
    })

    // 波形线
    if (isPlaying) {
      const safeWaveformData = waveformData || new Uint8Array(1024)
      this.drawWaveform(ctx, safeWaveformData, intensity)
    }

    // 底部渐变
    const bottomGrad = ctx.createLinearGradient(0, this.height * 0.7, 0, this.height)
    bottomGrad.addColorStop(0, 'transparent')
    bottomGrad.addColorStop(1, 'rgba(6, 255, 210, 0.05)')
    ctx.fillStyle = bottomGrad
    ctx.fillRect(0, this.height * 0.7, this.width, this.height * 0.3)
  }

  drawStars(ctx, intensity) {
    for (let i = 0; i < 80; i++) {
      const x = ((i * 7919) % 1000) / 1000 * this.width
      const y = ((i * 104729) % 1000) / 1000 * this.height * 0.45
      const size = ((i * 7) % 3) + 0.5
      const twinkle = Math.sin(this.time * 2 + i) * 0.3 + 0.7
      
      ctx.beginPath()
      ctx.arc(x, y, size * (0.5 + intensity * 0.3), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${(0.3 + intensity * 0.4) * twinkle})`
      ctx.fill()
    }
  }

  updateParticles(ctx, intensity, deltaTime) {
    const speed60fps = 60 // 基准速度（60fps 时的速度）
    this.particles.forEach(p => {
      p.y -= p.speed * (0.5 + intensity) * deltaTime * speed60fps
      if (p.y < 0) {
        p.y = this.height * 0.5
        p.x = Math.random() * this.width
      }
      
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(6, 255, 210, ${p.opacity * intensity})`
      ctx.fill()
    })
  }

  drawMoon(ctx, intensity) {
    const x = this.width * 0.8
    const y = this.height * 0.15
    const radius = 35

    // 光晕
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 4)
    glow.addColorStop(0, `rgba(139, 92, 246, ${0.2 + intensity * 0.2})`)
    glow.addColorStop(0.5, `rgba(102, 126, 234, ${0.1 + intensity * 0.1})`)
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(x - radius * 4, y - radius * 4, radius * 8, radius * 8)

    // 月亮
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    const moonGrad = ctx.createRadialGradient(x - 10, y - 10, 0, x, y, radius)
    moonGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
    moonGrad.addColorStop(1, 'rgba(200, 200, 255, 0.8)')
    ctx.fillStyle = moonGrad
    ctx.fill()
  }

  drawWave(ctx, wave, intensity, bassIntensity, index) {
    const { amplitude, frequency, speed, color, yOffset } = wave
    const baseY = this.height * yOffset
    const dynamicAmplitude = amplitude * (0.5 + bassIntensity * 1.2)

    ctx.beginPath()
    ctx.moveTo(0, this.height)

    for (let x = 0; x <= this.width; x += 3) {
      const y = baseY + 
        Math.sin(x * frequency + this.time * speed * 60 + index) * dynamicAmplitude +
        Math.sin(x * frequency * 2 + this.time * speed * 40) * dynamicAmplitude * 0.3
      ctx.lineTo(x, y)
    }

    ctx.lineTo(this.width, this.height)
    ctx.closePath()

    const gradient = ctx.createLinearGradient(0, baseY - dynamicAmplitude, 0, this.height)
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.fill()
  }

  drawWaveform(ctx, waveformData, intensity) {
    const sliceWidth = this.width / waveformData.length
    const centerY = this.height * 0.3

    ctx.beginPath()
    ctx.strokeStyle = `rgba(6, 255, 210, ${0.4 + intensity * 0.4})`
    ctx.lineWidth = 2
    ctx.shadowColor = '#06ffd2'
    ctx.shadowBlur = 15

    for (let i = 0; i < waveformData.length; i++) {
      const v = waveformData[i] / 128.0
      const y = centerY + (v - 1) * 60 * intensity
      if (i === 0) ctx.moveTo(0, y)
      else ctx.lineTo(i * sliceWidth, y)
    }

    ctx.stroke()
    ctx.shadowBlur = 0
  }
}
