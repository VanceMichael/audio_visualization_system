/**
 * 频谱柱状效果 - 升级版
 * 霓虹风格 + 镜像 + 粒子
 */
export class SpectrumBars {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx
    this.width = canvas.width
    this.height = canvas.height
    this.barCount = 64
    this.peaks = new Array(this.barCount).fill(0)
    this.peakDecay = 0.97
    this.peakHoldTime = new Array(this.barCount).fill(0)
    this.particles = []
  }

  resize(width, height) {
    this.width = width
    this.height = height
  }

  reset() {
    this.peaks = new Array(this.barCount).fill(0)
    this.peakHoldTime = new Array(this.barCount).fill(0)
    this.particles = []
  }

  render(frequencyData, waveformData, deltaTime, isPlaying) {
    const ctx = this.ctx
    const centerY = this.height / 2
    
    // 基准速度乘数
    const dtScale = deltaTime * 60

    // 背景
    ctx.fillStyle = '#050508'
    ctx.fillRect(0, 0, this.width, this.height)

    // 网格
    this.drawGrid(ctx)

    // 中心线发光
    this.drawCenterLine(ctx, centerY)

    // 计算柱子参数
    const padding = 60
    const barWidth = (this.width - padding * 2) / this.barCount
    const gap = 3
    const maxBarHeight = (this.height - 120) / 2

    // 绘制频谱柱
    for (let i = 0; i < this.barCount; i++) {
      const freqIndex = Math.floor(Math.pow(i / this.barCount, 1.5) * frequencyData.length * 0.5)
      const value = frequencyData[freqIndex] / 255
      const barHeight = value * maxBarHeight * (isPlaying ? 1 : 0.1)

      const x = padding + i * barWidth
      
      // 更新峰值
      if (barHeight > this.peaks[i]) {
        this.peaks[i] = barHeight
        this.peakHoldTime[i] = 25
      } else if (this.peakHoldTime[i] > 0) {
        this.peakHoldTime[i] -= dtScale
      } else {
        // 使用 deltaTime 调整衰减速度
        this.peaks[i] *= Math.pow(this.peakDecay, dtScale)
      }

      // 颜色计算
      const hue = 180 + (i / this.barCount) * 120 // 青色到紫色
      
      // 上半部分
      const topGrad = ctx.createLinearGradient(x, centerY - barHeight, x, centerY)
      topGrad.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.9)`)
      topGrad.addColorStop(0.5, `hsla(${hue}, 100%, 60%, 0.7)`)
      topGrad.addColorStop(1, `hsla(${hue}, 100%, 50%, 0.5)`)
      
      ctx.fillStyle = topGrad
      ctx.fillRect(x, centerY - barHeight, barWidth - gap, barHeight)

      // 下半部分（镜像）
      const bottomGrad = ctx.createLinearGradient(x, centerY, x, centerY + barHeight * 0.7)
      bottomGrad.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.4)`)
      bottomGrad.addColorStop(1, `hsla(${hue}, 100%, 40%, 0.05)`)
      
      ctx.fillStyle = bottomGrad
      ctx.fillRect(x, centerY, barWidth - gap, barHeight * 0.7)

      // 峰值指示器
      if (this.peaks[i] > 5) {
        ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.9)`
        ctx.shadowColor = `hsla(${hue}, 100%, 60%, 1)`
        ctx.shadowBlur = 10
        ctx.fillRect(x, centerY - this.peaks[i] - 4, barWidth - gap, 3)
        ctx.shadowBlur = 0
      }

      // 顶部发光
      if (barHeight > maxBarHeight * 0.6) {
        ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.8)`
        ctx.shadowBlur = 20
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.3)`
        ctx.fillRect(x - 2, centerY - barHeight - 5, barWidth - gap + 4, 10)
        ctx.shadowBlur = 0

        // 生成粒子
        if (Math.random() > 0.8 && this.particles.length < 100) {
          this.particles.push({
            x: x + (barWidth - gap) / 2,
            y: centerY - barHeight,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3 - 1,
            size: Math.random() * 3 + 1,
            life: 1,
            hue
          })
        }
      }
    }

    // 更新粒子
    this.updateParticles(ctx, dtScale)

    // 装饰
    this.drawDecorations(ctx, frequencyData, isPlaying, centerY)
  }

  drawGrid(ctx) {
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)'
    ctx.lineWidth = 1

    const hLines = 12
    for (let i = 0; i <= hLines; i++) {
      const y = (this.height / hLines) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(this.width, y)
      ctx.stroke()
    }

    const vLines = 20
    for (let i = 0; i <= vLines; i++) {
      const x = (this.width / vLines) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, this.height)
      ctx.stroke()
    }
  }

  drawCenterLine(ctx, centerY) {
    const grad = ctx.createLinearGradient(0, centerY, this.width, centerY)
    grad.addColorStop(0, 'transparent')
    grad.addColorStop(0.2, 'rgba(6, 255, 210, 0.3)')
    grad.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)')
    grad.addColorStop(0.8, 'rgba(255, 45, 146, 0.3)')
    grad.addColorStop(1, 'transparent')
    
    ctx.fillStyle = grad
    ctx.fillRect(0, centerY - 1, this.width, 2)
  }

  updateParticles(ctx, dtScale) {
    this.particles = this.particles.filter(p => {
      p.x += p.vx * dtScale
      p.y += p.vy * dtScale
      p.vy += 0.1 * dtScale
      p.life -= 0.02 * dtScale

      if (p.life <= 0) return false

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.life})`
      ctx.fill()

      return true
    })
  }

  drawDecorations(ctx, frequencyData, isPlaying, centerY) {
    // 左侧 dB 刻度
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.font = '10px Inter, sans-serif'
    ctx.textAlign = 'right'
    
    const dbLabels = ['0', '-6', '-12', '-18', '-24']
    const maxHeight = (this.height - 120) / 2
    
    dbLabels.forEach((label, i) => {
      const y = centerY - (maxHeight * (1 - i * 0.25))
      ctx.fillText(label + 'dB', 50, y + 4)
    })

    // 底部频率刻度
    ctx.textAlign = 'center'
    const freqLabels = ['60', '250', '1K', '4K', '16K']
    const padding = 60
    const barWidth = (this.width - padding * 2) / this.barCount
    
    freqLabels.forEach((label, i) => {
      const x = padding + (i / (freqLabels.length - 1)) * (this.barCount - 1) * barWidth
      ctx.fillText(label, x, this.height - 25)
    })

    // 右上角音量
    if (isPlaying) {
      let avgVolume = 0
      for (let i = 0; i < frequencyData.length; i++) {
        avgVolume += frequencyData[i]
      }
      avgVolume = Math.round((avgVolume / frequencyData.length / 255) * 100)

      ctx.fillStyle = '#06ffd2'
      ctx.font = 'bold 28px Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.shadowColor = '#06ffd2'
      ctx.shadowBlur = 10
      ctx.fillText(`${avgVolume}%`, this.width - 40, 50)
      ctx.shadowBlur = 0
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.font = '11px Inter, sans-serif'
      ctx.fillText('LEVEL', this.width - 40, 68)
    }

    // 左上角标题
    ctx.fillStyle = 'rgba(139, 92, 246, 0.8)'
    ctx.font = 'bold 12px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.letterSpacing = '0.1em'
    ctx.fillText('SPECTRUM ANALYZER', 40, 45)
  }
}
