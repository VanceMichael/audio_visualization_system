/**
 * 极光流动效果 - 优化版本
 * 流畅的极光动画，正确的定位
 */
export class AuroraFlow {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx
    this.width = 800
    this.height = 600
    this.time = 0
    this.stars = []
    this.shootingStars = []
  }

  resize(width, height) {
    this.width = width
    this.height = height
    this.initStars()
  }

  initStars() {
    this.stars = []
    const count = Math.min(80, Math.floor(this.width * this.height / 8000))
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height * 0.65,
        size: 0.5 + Math.random() * 1.2,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5
      })
    }
  }

  reset() {
    this.time = 0
    this.shootingStars = []
    this.initStars()
  }

  render(frequencyData, waveformData, deltaTime, isPlaying) {
    const safeFrequencyData = frequencyData || new Uint8Array(1024)
    const safeWaveformData = waveformData || new Uint8Array(1024)
    const safeDeltaTime = Math.max(0, deltaTime || 0)
    
    const ctx = this.ctx
    const w = this.width
    const h = this.height
    
    // 使用 deltaTime 更新时间
    this.time += safeDeltaTime
    
    // 基准速度乘数
    const dtScale = safeDeltaTime * 60

    // 音频分析
    let bass = 0, mid = 0, avg = 0
    const len = safeFrequencyData.length
    for (let i = 0; i < len; i++) {
      const val = safeFrequencyData[i]
      avg += val
      if (i < len * 0.15) bass += val
      else if (i < len * 0.5) mid += val
    }
    bass = bass / (len * 0.15) / 255
    mid = mid / (len * 0.35) / 255
    avg = avg / len / 255
    const intensity = isPlaying ? avg : 0.25

    // 背景渐变 - 深空
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
    bgGrad.addColorStop(0, '#010205')
    bgGrad.addColorStop(0.3, '#030810')
    bgGrad.addColorStop(0.6, '#051018')
    bgGrad.addColorStop(1, '#020508')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, w, h)

    // 星星
    for (const s of this.stars) {
      const twinkle = Math.sin(this.time * s.speed + s.twinkle) * 0.4 + 0.6
      const alpha = (0.4 + intensity * 0.4) * twinkle
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size * twinkle, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
      ctx.fill()
    }

    // 流星
    if (isPlaying && Math.random() > 0.995) {
      this.shootingStars.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.3,
        vx: 3 + Math.random() * 4,
        vy: 2 + Math.random() * 3,
        life: 1,
        length: 30 + Math.random() * 50
      })
    }

    this.shootingStars = this.shootingStars.filter(star => {
      star.x += star.vx * dtScale
      star.y += star.vy * dtScale
      star.life -= 0.02 * dtScale

      if (star.life <= 0 || star.x > w || star.y > h) return false

      const grad = ctx.createLinearGradient(
        star.x, star.y,
        star.x - star.vx * star.length / 5, star.y - star.vy * star.length / 5
      )
      grad.addColorStop(0, `rgba(255, 255, 255, ${star.life})`)
      grad.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.moveTo(star.x, star.y)
      ctx.lineTo(star.x - star.vx * star.length / 5, star.y - star.vy * star.length / 5)
      ctx.strokeStyle = grad
      ctx.lineWidth = 1.5
      ctx.stroke()

      return true
    })

    // 极光层 - 从上往下，位于画面中上部
    // yRatio 控制极光的垂直位置（0=顶部，1=底部）
    // ampRatio 控制波动幅度
    const auroraLayers = [
      { yRatio: 0.22, ampRatio: 0.12, color: [80, 255, 200], opacity: 0.45, speed: 0.3 },
      { yRatio: 0.32, ampRatio: 0.10, color: [100, 180, 255], opacity: 0.40, speed: 0.35 },
      { yRatio: 0.42, ampRatio: 0.09, color: [160, 120, 255], opacity: 0.35, speed: 0.4 },
      { yRatio: 0.52, ampRatio: 0.07, color: [255, 100, 200], opacity: 0.30, speed: 0.45 }
    ]

    for (let idx = 0; idx < auroraLayers.length; idx++) {
      const layer = auroraLayers[idx]
      this.drawAuroraLayer(ctx, w, h, layer, intensity, bass, idx)
    }

    // 山脉剪影
    this.drawMountains(ctx, w, h)

    // 地面反射光
    const reflectGrad = ctx.createLinearGradient(0, h * 0.75, 0, h)
    reflectGrad.addColorStop(0, 'transparent')
    reflectGrad.addColorStop(0.5, `rgba(80, 200, 180, ${0.03 + intensity * 0.02})`)
    reflectGrad.addColorStop(1, `rgba(100, 150, 255, ${0.02 + intensity * 0.02})`)
    ctx.fillStyle = reflectGrad
    ctx.fillRect(0, h * 0.75, w, h * 0.25)
  }

  drawAuroraLayer(ctx, w, h, layer, intensity, bass, idx) {
    const { yRatio, ampRatio, color, opacity, speed } = layer
    const baseY = h * yRatio
    const amp = h * ampRatio * (0.8 + bass * 0.4)
    const segments = 50

    // 生成波形路径
    const points = []
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * w
      const n = i * 0.1
      const t = this.time * speed
      const y = baseY + 
        Math.sin(n + t + idx * 0.8) * amp +
        Math.sin(n * 1.5 + t * 1.3) * amp * 0.35 +
        Math.sin(n * 0.5 + t * 0.7) * amp * 0.2
      points.push({ x, y })
    }

    // 填充区域
    ctx.beginPath()
    ctx.moveTo(0, h * 0.8)
    for (const p of points) {
      ctx.lineTo(p.x, p.y)
    }
    ctx.lineTo(w, h * 0.8)
    ctx.closePath()

    const alpha = opacity * (0.6 + intensity * 0.4)
    const fillGrad = ctx.createLinearGradient(0, baseY - amp, 0, h * 0.8)
    fillGrad.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`)
    fillGrad.addColorStop(0.25, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.6})`)
    fillGrad.addColorStop(0.5, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.25})`)
    fillGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = fillGrad
    ctx.fill()

    // 顶部发光边缘
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.8})`
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 光柱效果 - 垂直的光线
    if (intensity > 0.2) {
      const rayCount = 8
      for (let i = 0; i < rayCount; i++) {
        const rayX = w * (0.1 + (i / rayCount) * 0.8)
        const rayIdx = Math.floor((i / rayCount) * segments)
        const rayY = points[Math.min(rayIdx, points.length - 1)].y

        const rayGrad = ctx.createLinearGradient(rayX, rayY, rayX, h * 0.75)
        rayGrad.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.15 * intensity})`)
        rayGrad.addColorStop(1, 'transparent')

        ctx.fillStyle = rayGrad
        ctx.fillRect(rayX - 15, rayY, 30, h * 0.75 - rayY)
      }
    }
  }

  drawMountains(ctx, w, h) {
    // 远山
    ctx.beginPath()
    ctx.moveTo(0, h)
    ctx.lineTo(0, h * 0.78)
    ctx.lineTo(w * 0.1, h * 0.74)
    ctx.lineTo(w * 0.2, h * 0.78)
    ctx.lineTo(w * 0.3, h * 0.72)
    ctx.lineTo(w * 0.4, h * 0.76)
    ctx.lineTo(w * 0.5, h * 0.70)
    ctx.lineTo(w * 0.6, h * 0.74)
    ctx.lineTo(w * 0.7, h * 0.68)
    ctx.lineTo(w * 0.8, h * 0.73)
    ctx.lineTo(w * 0.9, h * 0.71)
    ctx.lineTo(w, h * 0.75)
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fillStyle = '#020406'
    ctx.fill()

    // 近山
    ctx.beginPath()
    ctx.moveTo(0, h)
    ctx.lineTo(0, h * 0.85)
    ctx.lineTo(w * 0.15, h * 0.82)
    ctx.lineTo(w * 0.25, h * 0.86)
    ctx.lineTo(w * 0.4, h * 0.80)
    ctx.lineTo(w * 0.55, h * 0.84)
    ctx.lineTo(w * 0.7, h * 0.78)
    ctx.lineTo(w * 0.85, h * 0.83)
    ctx.lineTo(w, h * 0.80)
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fillStyle = '#010304'
    ctx.fill()
  }
}
