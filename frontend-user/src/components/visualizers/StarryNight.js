/**
 * 星空漫游效果 - 超空间穿梭
 * 参考星际穿越、太空歌剧的视觉效果
 */
export class StarryNight {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx
    this.width = canvas.width
    this.height = canvas.height
    this.stars = []
    this.maxStars = 600
    this.warpLines = []
    this.maxWarpLines = 80
    this.time = 0
    this.init()
  }

  init() {
    this.stars = []
    this.warpLines = []
    
    // 创建星星
    for (let i = 0; i < this.maxStars; i++) {
      this.stars.push(this.createStar())
    }
    
    // 创建光速线
    for (let i = 0; i < this.maxWarpLines; i++) {
      this.warpLines.push(this.createWarpLine())
    }
  }

  createStar() {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * Math.max(this.width, this.height) * 0.8
    
    return {
      angle,
      radius,
      z: Math.random() * 2000,
      speed: 0.5 + Math.random() * 1.5,
      size: 0.3 + Math.random() * 1.2,
      brightness: 0.5 + Math.random() * 0.5,
      colorIndex: Math.floor(Math.random() * 5)
    }
  }

  createWarpLine() {
    const angle = Math.random() * Math.PI * 2
    return {
      angle,
      length: 50 + Math.random() * 150,
      z: Math.random() * 2000,
      speed: 2 + Math.random() * 3,
      width: 0.5 + Math.random() * 1.5,
      colorIndex: Math.floor(Math.random() * 3)
    }
  }

  resize(width, height) {
    this.width = width
    this.height = height
  }

  reset() {
    this.init()
  }

  render(frequencyData, waveformData, deltaTime, isPlaying) {
    const ctx = this.ctx
    const centerX = this.width / 2
    const centerY = this.height / 2
    
    // 使用 deltaTime 更新时间
    this.time += deltaTime
    
    // 基准速度乘数
    const dtScale = deltaTime * 60

    // 计算音频强度
    let bass = 0, mid = 0, high = 0, avg = 0
    const len = frequencyData.length
    for (let i = 0; i < len; i++) {
      const val = frequencyData[i]
      avg += val
      if (i < len * 0.15) bass += val
      else if (i < len * 0.5) mid += val
      else high += val
    }
    bass /= (len * 0.15)
    mid /= (len * 0.35)
    high /= (len * 0.5)
    avg /= len

    const intensity = isPlaying ? avg / 180 : 0.2
    const warpSpeed = (isPlaying ? 15 + bass / 6 : 5) * dtScale
    const starSpeed = (isPlaying ? 8 + bass / 10 : 3) * dtScale

    // 绘制深空背景
    this.drawBackground(ctx, centerX, centerY, intensity)

    // 绘制星云
    this.drawNebulae(ctx, centerX, centerY, intensity)

    // 绘制光速线（在星星后面）
    if (isPlaying && intensity > 0.3) {
      this.drawWarpLines(ctx, centerX, centerY, warpSpeed, intensity)
    }

    // 绘制星星
    this.drawStars(ctx, centerX, centerY, starSpeed, intensity, isPlaying)

    // 绘制中心光源
    this.drawCenterGlow(ctx, centerX, centerY, intensity, bass / 255)

    // 绘制边缘晕影
    this.drawVignette(ctx)
  }

  drawBackground(ctx, cx, cy, intensity) {
    // 深空渐变
    const maxDist = Math.sqrt(cx * cx + cy * cy) * 1.5
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDist)
    grad.addColorStop(0, '#0d0d1a')
    grad.addColorStop(0.3, '#080812')
    grad.addColorStop(0.7, '#04040a')
    grad.addColorStop(1, '#010103')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, this.width, this.height)
  }

  drawNebulae(ctx, cx, cy, intensity) {
    const alpha = 0.03 + intensity * 0.04

    // 紫色星云 - 左上
    const n1 = ctx.createRadialGradient(
      cx * 0.3, cy * 0.4, 0,
      cx * 0.3, cy * 0.4, this.width * 0.5
    )
    n1.addColorStop(0, `rgba(139, 92, 246, ${alpha * 1.5})`)
    n1.addColorStop(0.4, `rgba(99, 102, 241, ${alpha})`)
    n1.addColorStop(1, 'transparent')
    ctx.fillStyle = n1
    ctx.fillRect(0, 0, this.width, this.height)

    // 青色星云 - 右下
    const n2 = ctx.createRadialGradient(
      cx * 1.6, cy * 1.4, 0,
      cx * 1.6, cy * 1.4, this.width * 0.4
    )
    n2.addColorStop(0, `rgba(6, 255, 210, ${alpha})`)
    n2.addColorStop(0.5, `rgba(0, 212, 255, ${alpha * 0.5})`)
    n2.addColorStop(1, 'transparent')
    ctx.fillStyle = n2
    ctx.fillRect(0, 0, this.width, this.height)

    // 粉色星云 - 右上
    const n3 = ctx.createRadialGradient(
      cx * 1.5, cy * 0.3, 0,
      cx * 1.5, cy * 0.3, this.width * 0.35
    )
    n3.addColorStop(0, `rgba(255, 45, 146, ${alpha * 0.8})`)
    n3.addColorStop(0.5, `rgba(191, 90, 242, ${alpha * 0.4})`)
    n3.addColorStop(1, 'transparent')
    ctx.fillStyle = n3
    ctx.fillRect(0, 0, this.width, this.height)
  }

  drawStars(ctx, cx, cy, speed, intensity, isPlaying) {
    const colors = [
      '#ffffff',
      '#e0e7ff', 
      '#c7d2fe',
      '#a5b4fc',
      '#fef3c7'
    ]

    this.stars.forEach((star, i) => {
      // 更新 Z 位置
      star.z -= speed * star.speed
      
      // 重置到远处
      if (star.z <= 1) {
        star.z = 2000
        star.angle = Math.random() * Math.PI * 2
        star.radius = Math.random() * Math.max(this.width, this.height) * 0.8
      }

      // 3D 投影
      const scale = 800 / star.z
      const x = cx + Math.cos(star.angle) * star.radius * scale
      const y = cy + Math.sin(star.angle) * star.radius * scale

      // 跳过屏幕外的星星
      if (x < -20 || x > this.width + 20 || y < -20 || y > this.height + 20) {
        return
      }

      const size = star.size * scale * (0.8 + intensity * 0.4)
      const alpha = Math.min(1, (2000 - star.z) / 800) * star.brightness

      // 绘制拖尾（高速时）
      if (isPlaying && speed > 8 && star.z < 1500) {
        const tailScale = 800 / (star.z + speed * 8)
        const tailX = cx + Math.cos(star.angle) * star.radius * tailScale
        const tailY = cy + Math.sin(star.angle) * star.radius * tailScale

        const tailGrad = ctx.createLinearGradient(x, y, tailX, tailY)
        tailGrad.addColorStop(0, colors[star.colorIndex])
        tailGrad.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(tailX, tailY)
        ctx.strokeStyle = tailGrad
        ctx.lineWidth = size * 0.6
        ctx.globalAlpha = alpha * 0.5
        ctx.stroke()
      }

      // 绘制星星光晕
      if (size > 1) {
        const glowSize = size * 4
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowSize)
        glow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.3})`)
        glow.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.1})`)
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.arc(x, y, glowSize, 0, Math.PI * 2)
        ctx.fill()
      }

      // 绘制星星核心
      ctx.beginPath()
      ctx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2)
      ctx.fillStyle = colors[star.colorIndex]
      ctx.globalAlpha = alpha
      ctx.fill()
      ctx.globalAlpha = 1
    })
  }

  drawWarpLines(ctx, cx, cy, speed, intensity) {
    const colors = [
      'rgba(99, 102, 241, 0.6)',
      'rgba(6, 255, 210, 0.5)',
      'rgba(255, 255, 255, 0.4)'
    ]

    this.warpLines.forEach((line, i) => {
      line.z -= speed * line.speed
      
      if (line.z <= 1) {
        line.z = 2000
        line.angle = Math.random() * Math.PI * 2
      }

      const startScale = 800 / line.z
      const endScale = 800 / (line.z + line.length)
      
      const dist = Math.max(this.width, this.height) * 0.6
      const startX = cx + Math.cos(line.angle) * dist * startScale
      const startY = cy + Math.sin(line.angle) * dist * startScale
      const endX = cx + Math.cos(line.angle) * dist * endScale
      const endY = cy + Math.sin(line.angle) * dist * endScale

      const alpha = Math.min(1, (2000 - line.z) / 1000) * intensity

      const grad = ctx.createLinearGradient(startX, startY, endX, endY)
      grad.addColorStop(0, colors[line.colorIndex])
      grad.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.strokeStyle = grad
      ctx.lineWidth = line.width * startScale
      ctx.globalAlpha = alpha
      ctx.stroke()
      ctx.globalAlpha = 1
    })
  }

  drawCenterGlow(ctx, cx, cy, intensity, bassNorm) {
    // 核心光点
    const coreSize = 3 + intensity * 5 + bassNorm * 8
    
    // 外层光晕
    const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 20)
    outerGlow.addColorStop(0, `rgba(255, 255, 255, ${0.1 + intensity * 0.15})`)
    outerGlow.addColorStop(0.2, `rgba(139, 92, 246, ${0.05 + intensity * 0.08})`)
    outerGlow.addColorStop(0.5, `rgba(99, 102, 241, ${0.02 + intensity * 0.03})`)
    outerGlow.addColorStop(1, 'transparent')
    ctx.fillStyle = outerGlow
    ctx.fillRect(cx - coreSize * 20, cy - coreSize * 20, coreSize * 40, coreSize * 40)

    // 内层光晕
    const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 5)
    innerGlow.addColorStop(0, `rgba(255, 255, 255, ${0.5 + intensity * 0.4})`)
    innerGlow.addColorStop(0.3, `rgba(200, 200, 255, ${0.2 + intensity * 0.2})`)
    innerGlow.addColorStop(1, 'transparent')
    ctx.fillStyle = innerGlow
    ctx.beginPath()
    ctx.arc(cx, cy, coreSize * 5, 0, Math.PI * 2)
    ctx.fill()

    // 核心亮点
    ctx.beginPath()
    ctx.arc(cx, cy, coreSize, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + intensity * 0.2})`
    ctx.fill()
  }

  drawVignette(ctx) {
    const cx = this.width / 2
    const cy = this.height / 2
    const maxDist = Math.sqrt(cx * cx + cy * cy)

    const vignette = ctx.createRadialGradient(cx, cy, maxDist * 0.5, cx, cy, maxDist * 1.2)
    vignette.addColorStop(0, 'transparent')
    vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)')
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, this.width, this.height)
  }
}
