/**
 * 粒子爆发效果 - 狂放版
 * 大量粒子、多重爆发、能量波
 */
export class ParticleBurst {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx
    this.width = 800
    this.height = 600
    this.particles = []
    this.sparks = []
    this.rings = []
    this.beams = []
    this.hue = 0
    this.lastBeat = 0
    this.lastMidBeat = 0
    this.time = 0
    this.energy = 0
    this.particleCache = new Map()
  }

  resize(width, height) {
    this.width = width
    this.height = height
    this.particleCache.clear()
  }

  reset() {
    this.particles = []
    this.sparks = []
    this.rings = []
    this.beams = []
    this.time = 0
    this.energy = 0
    this.particleCache.clear()
  }

  getParticleImage(hue, size) {
    const key = `${Math.round(hue / 15) * 15}-${Math.round(size / 2) * 2}`
    if (this.particleCache.has(key)) return this.particleCache.get(key)
    if (this.particleCache.size > 80) {
      const firstKey = this.particleCache.keys().next().value
      this.particleCache.delete(firstKey)
    }
    const canvas = document.createElement('canvas')
    const s = Math.max(size * 4, 12)
    canvas.width = s
    canvas.height = s
    const ctx = canvas.getContext('2d')
    const cx = s / 2
    const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx)
    grad.addColorStop(0, `hsla(${hue}, 100%, 95%, 1)`)
    grad.addColorStop(0.2, `hsla(${hue}, 100%, 70%, 0.9)`)
    grad.addColorStop(0.5, `hsla(${hue}, 100%, 50%, 0.4)`)
    grad.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, s, s)
    this.particleCache.set(key, canvas)
    return canvas
  }

  // 主爆发
  createBurst(x, y, count, power, hue) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8
      const speed = 5 + Math.random() * 12 * power
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 10 + Math.random() * 20 * power,
        life: 1,
        decay: 0.008 + Math.random() * 0.006,
        hue: hue + (Math.random() - 0.5) * 80,
        gravity: 0.02,
        friction: 0.98
      })
    }
    // 冲击波
    this.rings.push({ x, y, radius: 10, targetRadius: 150 + power * 200, life: 1, hue, width: 6 + power * 4 })
    this.rings.push({ x, y, radius: 5, targetRadius: 80 + power * 100, life: 1, hue: hue + 60, width: 3 })
  }

  // 火花
  createSparks(x, y, count, hue) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 6
      this.sparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 2 + Math.random() * 4,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        hue
      })
    }
  }

  // 能量光束
  createBeam(angle, hue) {
    this.beams.push({
      angle,
      length: 0,
      targetLength: this.width * 0.6 + Math.random() * this.width * 0.3,
      width: 3 + Math.random() * 5,
      life: 1,
      hue
    })
  }

  render(frequencyData, waveformData, deltaTime, isPlaying) {
    const ctx = this.ctx
    const w = this.width
    const h = this.height
    const cx = w / 2
    const cy = h / 2
    
    // 使用 deltaTime 更新时间
    this.time += deltaTime
    
    // 基准速度乘数（将 deltaTime 转换为 60fps 等效）
    const dtScale = deltaTime * 60

    // 音频分析
    let bass = 0, mid = 0, high = 0, avg = 0
    const len = frequencyData.length
    for (let i = 0; i < len; i++) {
      const val = frequencyData[i]
      avg += val
      if (i < len * 0.12) bass += val
      else if (i < len * 0.4) mid += val
      else high += val
    }
    bass = bass / (len * 0.12) / 255
    mid = mid / (len * 0.28) / 255
    high = high / (len * 0.6) / 255
    avg = avg / len / 255

    const intensity = isPlaying ? avg : 0.1
    this.energy = this.energy * (1 - 0.05 * dtScale) + intensity * 0.05 * dtScale

    // 背景
    ctx.fillStyle = `rgba(3, 3, 8, ${0.12 + intensity * 0.08})`
    ctx.fillRect(0, 0, w, h)

    const now = Date.now()

    // 低音爆发
    if (isPlaying && bass > 0.5 && now - this.lastBeat > 120) {
      this.lastBeat = now
      const power = bass
      this.createBurst(cx, cy, 80 + Math.floor(power * 60), power, this.hue)
      
      // 随机位置爆发
      for (let i = 0; i < 2 + Math.floor(power * 2); i++) {
        const rx = w * 0.1 + Math.random() * w * 0.8
        const ry = h * 0.1 + Math.random() * h * 0.8
        this.createBurst(rx, ry, 30 + Math.floor(Math.random() * 30), power * 0.6, this.hue + 60 + Math.random() * 120)
      }

      // 能量光束
      const beamCount = 3 + Math.floor(power * 4)
      for (let i = 0; i < beamCount; i++) {
        this.createBeam(Math.random() * Math.PI * 2, this.hue + Math.random() * 60)
      }
    }

    // 中频爆发
    if (isPlaying && mid > 0.45 && now - this.lastMidBeat > 80) {
      this.lastMidBeat = now
      const angle = Math.random() * Math.PI * 2
      const dist = 100 + Math.random() * 100
      this.createSparks(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 20 + Math.floor(mid * 30), this.hue + 90)
    }

    // 持续粒子流
    if (isPlaying && this.particles.length < 800) {
      const emitCount = Math.floor(intensity * 15)
      for (let i = 0; i < emitCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const dist = 30 + Math.random() * 50
        const speed = 1 + Math.random() * 4 * intensity
        this.particles.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 4 + Math.random() * 10,
          life: 1,
          decay: 0.01 + Math.random() * 0.01,
          hue: this.hue + Math.random() * 60,
          gravity: 0.01,
          friction: 0.995
        })
      }
    }

    // 背景能量场
    const fieldRadius = 250 + this.energy * 150 + Math.sin(this.time * 3) * 30
    const field = ctx.createRadialGradient(cx, cy, 0, cx, cy, fieldRadius)
    field.addColorStop(0, `hsla(${this.hue}, 100%, 60%, ${0.15 + intensity * 0.2})`)
    field.addColorStop(0.3, `hsla(${this.hue + 30}, 80%, 50%, ${0.08 + intensity * 0.1})`)
    field.addColorStop(0.6, `hsla(${this.hue + 60}, 70%, 40%, ${0.03 + intensity * 0.05})`)
    field.addColorStop(1, 'transparent')
    ctx.fillStyle = field
    ctx.fillRect(0, 0, w, h)

    // 绘制光束
    this.beams = this.beams.filter(beam => {
      beam.length += (beam.targetLength - beam.length) * 0.15
      beam.life -= 0.025
      if (beam.life <= 0) return false

      const x1 = cx
      const y1 = cy
      const x2 = cx + Math.cos(beam.angle) * beam.length
      const y2 = cy + Math.sin(beam.angle) * beam.length

      const grad = ctx.createLinearGradient(x1, y1, x2, y2)
      grad.addColorStop(0, `hsla(${beam.hue}, 100%, 80%, ${beam.life * 0.8})`)
      grad.addColorStop(0.3, `hsla(${beam.hue}, 100%, 60%, ${beam.life * 0.5})`)
      grad.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = grad
      ctx.lineWidth = beam.width * beam.life
      ctx.lineCap = 'round'
      ctx.stroke()
      return true
    })

    // 绘制冲击波
    this.rings = this.rings.filter(ring => {
      ring.radius += (ring.targetRadius - ring.radius) * 0.12
      ring.life -= 0.02
      if (ring.life <= 0) return false

      ctx.beginPath()
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2)
      ctx.strokeStyle = `hsla(${ring.hue}, 100%, 70%, ${ring.life * 0.7})`
      ctx.lineWidth = ring.width * ring.life
      ctx.stroke()
      return true
    })

    // 绘制火花
    this.sparks = this.sparks.filter(s => {
      s.vx *= 0.96
      s.vy *= 0.96
      s.vy += 0.15
      s.x += s.vx
      s.y += s.vy
      s.life -= s.decay
      if (s.life <= 0) return false

      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${s.hue}, 100%, 80%, ${s.life})`
      ctx.fill()
      return true
    })

    // 绘制粒子
    ctx.globalCompositeOperation = 'lighter'
    this.particles = this.particles.filter(p => {
      p.vx *= p.friction
      p.vy *= p.friction
      p.vy += p.gravity
      p.x += p.vx
      p.y += p.vy
      p.life -= p.decay
      if (p.life <= 0) return false

      const size = p.size * (0.3 + p.life * 0.7)
      const img = this.getParticleImage(p.hue, size)
      const drawSize = size * 2.5
      ctx.globalAlpha = p.life
      ctx.drawImage(img, p.x - drawSize / 2, p.y - drawSize / 2, drawSize, drawSize)
      return true
    })
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1

    // 中心核心
    const coreSize = 35 + bass * 60 + Math.sin(this.time * 8) * 10
    const pulse = Math.sin(this.time * 6) * 8

    // 核心外发光
    const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 5)
    coreGlow.addColorStop(0, `hsla(${this.hue}, 100%, 70%, ${0.4 + intensity * 0.4})`)
    coreGlow.addColorStop(0.25, `hsla(${this.hue + 30}, 90%, 60%, ${0.2 + intensity * 0.2})`)
    coreGlow.addColorStop(0.5, `hsla(${this.hue + 60}, 80%, 50%, ${0.1 + intensity * 0.1})`)
    coreGlow.addColorStop(1, 'transparent')
    ctx.fillStyle = coreGlow
    ctx.beginPath()
    ctx.arc(cx, cy, coreSize * 5, 0, Math.PI * 2)
    ctx.fill()

    // 核心
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize + pulse)
    core.addColorStop(0, `hsla(${this.hue}, 20%, 98%, 1)`)
    core.addColorStop(0.3, `hsla(${this.hue}, 80%, 75%, 0.8)`)
    core.addColorStop(0.7, `hsla(${this.hue}, 100%, 55%, 0.4)`)
    core.addColorStop(1, 'transparent')
    ctx.fillStyle = core
    ctx.beginPath()
    ctx.arc(cx, cy, coreSize + pulse, 0, Math.PI * 2)
    ctx.fill()

    // 频率环 - 双层
    if (isPlaying) {
      const bars = 64
      ctx.lineCap = 'round'

      // 外环
      const outerR = 90 + bass * 30
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2
        const fi = Math.floor((i / bars) * len * 0.5)
        const val = frequencyData[fi] / 255
        const barLen = 25 + val * 80 * intensity

        const x1 = cx + Math.cos(angle) * outerR
        const y1 = cy + Math.sin(angle) * outerR
        const x2 = cx + Math.cos(angle) * (outerR + barLen)
        const y2 = cy + Math.sin(angle) * (outerR + barLen)

        const barGrad = ctx.createLinearGradient(x1, y1, x2, y2)
        barGrad.addColorStop(0, `hsla(${this.hue + i * 5}, 100%, 65%, 0.9)`)
        barGrad.addColorStop(1, `hsla(${this.hue + i * 5 + 60}, 100%, 70%, 0.1)`)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = barGrad
        ctx.lineWidth = 3.5
        ctx.stroke()
      }

      // 内环（反向）
      const innerR = 55
      for (let i = 0; i < bars / 2; i++) {
        const angle = (i / (bars / 2)) * Math.PI * 2 + Math.PI / 2 + this.time * 0.5
        const fi = Math.floor((i / (bars / 2)) * len * 0.3)
        const val = frequencyData[fi] / 255
        const barLen = 10 + val * 30 * intensity

        const x1 = cx + Math.cos(angle) * innerR
        const y1 = cy + Math.sin(angle) * innerR
        const x2 = cx + Math.cos(angle) * (innerR - barLen)
        const y2 = cy + Math.sin(angle) * (innerR - barLen)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `hsla(${this.hue + 180 + i * 10}, 100%, 70%, ${0.6 * intensity})`
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    this.hue = (this.hue + 0.6 * dtScale) % 360
  }

  destroy() {
    this.particles = []
    this.sparks = []
    this.rings = []
    this.beams = []
    this.particleCache.clear()
  }
}
