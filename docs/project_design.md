# 音频可视化系统 - 项目设计文档

## 1. 项目概述

一个基于 Web Audio API 和 Canvas 2D 的音频可视化单页应用，支持 5 种可视化效果，采用 Vue 3 组合式 API 构建。

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      App.vue                            │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  AudioPlayer    │  │    VisualizerCanvas         │  │
│  │  - 文件上传     │  │    - Canvas 渲染            │  │
│  │  - 播放控制     │  │    - 5种可视化效果          │  │
│  │  - 音量控制     │  │                             │  │
│  │  - Web Audio    │  │  ┌─────────────────────┐    │  │
│  └────────┬────────┘  │  │   visualizers/      │    │  │
│           │           │  │   - WaveOcean.js    │    │  │
│           │ analyser  │  │   - ParticleBurst.js│    │  │
│           └───────────┼──│   - StarryNight.js  │    │  │
│                       │  │   - AuroraFlow.js   │    │  │
│  ┌─────────────────┐  │  │   - SpectrumBars.js │    │  │
│  │ EffectSelector  │  │  └─────────────────────┘    │  │
│  │ - 效果切换      │  └─────────────────────────────┘  │
│  └─────────────────┘                                   │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Pinia Store (audioStore)            │  │
│  │  - 播放状态、当前时间、音量、当前效果            │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 3. 技术选型

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | Vue 3 | Composition API，无路由（单页应用） |
| 构建 | Vite | 快速开发服务器和构建 |
| 状态 | Pinia | 轻量级状态管理 |
| 样式 | SCSS | 变量和模块化样式 |
| UI | Element Plus | 图标和消息提示组件 |
| 音频 | Web Audio API | 原生浏览器 API |
| 渲染 | Canvas 2D | requestAnimationFrame 动画循环 |
| 容器 | Docker | Nginx 静态服务 |

## 4. 目录结构

```
frontend-user/
├── src/
│   ├── App.vue                 # 根组件（单页应用入口）
│   ├── main.js                 # 应用初始化
│   ├── components/
│   │   ├── AudioPlayer.vue     # 音频播放器（上传、播放、音量）
│   │   ├── VisualizerCanvas.vue # 可视化画布容器
│   │   ├── EffectSelector.vue  # 效果选择器
│   │   └── visualizers/        # 5种可视化效果类
│   │       ├── WaveOcean.js    # 波形海浪
│   │       ├── ParticleBurst.js # 粒子爆发
│   │       ├── StarryNight.js  # 星空漫游
│   │       ├── AuroraFlow.js   # 极光流动
│   │       └── SpectrumBars.js # 频谱柱状
│   ├── stores/
│   │   └── audioStore.js       # 音频状态管理
│   ├── styles/
│   │   ├── variables.scss      # SCSS 变量
│   │   └── global.scss         # 全局样式
│   └── utils/
│       ├── logger.js           # 日志工具
│       └── errorHandler.js     # 错误处理
├── tests/                      # 单元测试
├── Dockerfile                  # Docker 构建
├── nginx.conf                  # Nginx 配置
└── package.json
```

## 5. 核心模块说明

### 5.1 AudioPlayer.vue
- 文件上传（拖拽/点击）
- Web Audio API 初始化（AudioContext、AnalyserNode）
- 播放/暂停控制
- 进度条拖拽
- 音量控制

### 5.2 VisualizerCanvas.vue
- Canvas 尺寸管理（DPR 适配）
- 可视化效果实例管理
- requestAnimationFrame 渲染循环
- 音频数据传递给当前效果

### 5.3 可视化效果类接口
每个效果类实现统一接口：
```javascript
class Visualizer {
  constructor(canvas, ctx) {}
  resize(width, height) {}      // 尺寸变化
  reset() {}                    // 重置状态
  render(frequencyData, waveformData, deltaTime, isPlaying) {}  // 渲染帧
  destroy() {}                  // 清理资源（可选）
}
```

### 5.4 audioStore.js
管理全局音频状态：
- `audioFile` / `fileName` - 当前文件
- `isPlaying` - 播放状态
- `currentTime` / `duration` - 时间
- `volume` - 音量
- `currentEffect` - 当前效果 ID
- `effects` - 效果列表配置

## 6. 五种可视化效果

| 效果 | 描述 | 核心技术 |
|------|------|----------|
| 波形海浪 | 多层正弦波叠加，海浪起伏 | 波形数据 + 正弦函数 |
| 粒子爆发 | 中心爆发粒子，节拍触发 | 粒子系统 + 物理模拟 |
| 星空漫游 | 3D 透视星空穿梭 | 3D 投影 + Z 轴运动 |
| 极光流动 | 多层极光波动 | 多层渐变 + 正弦波 |
| 频谱柱状 | 经典频谱分析 | 频率数据 + 峰值保持 |

## 7. 动画渲染机制

采用 Delta Time 机制确保动画在不同刷新率下速度一致：

```javascript
// VisualizerCanvas.vue 渲染循环
let lastTime = 0
const render = (timestamp) => {
  const deltaTime = lastTime ? (timestamp - lastTime) / 1000 : 0.016
  lastTime = timestamp
  
  currentVisualizer.render(frequencyData, waveformData, deltaTime, isPlaying)
  requestAnimationFrame(render)
}
```

## 8. 部署

```bash
# 开发
cd frontend-user
npm install
npm run dev

# 构建
npm run build

# Docker
docker-compose up -d
# 访问 http://localhost:8081
```

## 9. 测试

```bash
npm test           # 运行测试
npm run test:ui    # 测试 UI
```

覆盖：
- 工具函数测试（logger、errorHandler）
- Store 测试（audioStore）
- 可视化效果测试（5 种效果的接口和渲染）
