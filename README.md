# 音频可视化系统 | Audio Visualizer

一个基于 Web Audio API 和 Canvas 2D 的音频可视化单页应用，支持 5 种精美的可视化效果。

## 快速开始

### Docker 部署（推荐）

```bash
# 构建并启动（支持 ARM64/AMD64）
docker-compose up --build -d

# 访问应用
open http://localhost:8081

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 本地开发

```bash
cd frontend-user

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试（81 个测试用例）
npm test

# 构建生产版本
npm run build
```

## 服务信息

| 服务 | 端口 | 说明 |
|------|------|------|
| Audio Visualizer | 8081 | 音频可视化前端 |

## 功能特性

### 🎵 音频控制
- 拖拽/点击上传 MP3、WAV、OGG 文件
- 播放/暂停、进度拖拽、音量调节

### 🎨 五种可视化效果

| 效果 | 描述 |
|------|------|
| 🌊 波形海浪 | 多层正弦波叠加，海浪起伏效果 |
| ✨ 粒子爆发 | 节拍触发粒子爆发，能量光束 |
| 🌌 星空漫游 | 3D 透视星空穿梭，光速线效果 |
| 🌈 极光流动 | 北极光波动，山脉剪影 |
| 📊 频谱柱状 | 经典频谱分析，峰值保持 |

## 技术实现

### 核心技术
- **Vue 3** + Composition API（无路由单页应用）
- **Vite** 构建工具
- **Pinia** 状态管理
- **Web Audio API** 音频分析（AnalyserNode）
- **Canvas 2D** + requestAnimationFrame 渲染

### 动画机制
采用 Delta Time 机制确保动画在不同刷新率（60Hz/120Hz/144Hz）下速度一致：

```javascript
// 渲染循环
const render = (timestamp) => {
  const deltaTime = (timestamp - lastTimestamp) / 1000
  visualizer.render(frequencyData, waveformData, deltaTime, isPlaying)
}
```

## 项目结构

```
├── frontend-user/
│   ├── src/
│   │   ├── App.vue                 # 根组件
│   │   ├── main.js                 # 入口
│   │   ├── components/
│   │   │   ├── AudioPlayer.vue     # 音频播放器
│   │   │   ├── VisualizerCanvas.vue # 可视化画布
│   │   │   ├── EffectSelector.vue  # 效果选择
│   │   │   └── visualizers/        # 5 种效果
│   │   ├── stores/audioStore.js    # 状态管理
│   │   ├── styles/                 # SCSS 样式
│   │   └── utils/                  # 工具函数
│   ├── tests/                      # 81 个测试用例
│   ├── Dockerfile                  # 多架构构建
│   └── nginx.conf
├── docs/project_design.md          # 设计文档
├── docker-compose.yml
└── README.md
```

## 测试覆盖

```bash
npm test
# ✓ 81 tests passed
```

- 工具函数测试（logger、errorHandler）
- Store 测试（audioStore）
- 可视化效果测试（5 种效果接口和渲染）

## 浏览器支持

Chrome 80+ / Firefox 75+ / Safari 14+ / Edge 80+

## License

MIT
# audio_visualization_system
