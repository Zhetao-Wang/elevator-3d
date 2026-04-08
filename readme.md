<p align="center">
  <img src="assets/logo.png" width="180" alt="3D Elevator Configurator"/>
</p>

<h1 align="center">3D 电梯配置器</h1>

<p align="center">
  <b>基于 Three.js 的电梯可视化配置系统</b>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/Features-%E5%B1%82%E9%97%A8%20|%20%E8%BD%BF%E5%8E%A2-blue" alt="Features"/></a>
  &ensp;
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"/></a>
  &ensp;
  <img src="https://img.shields.io/badge/Three.js-r160-000000?logo=three.js&logoColor=white" alt="Three.js"/>
  &ensp;
  <img src="https://img.shields.io/badge/Vite-5.0+-646CFF?logo=vite&logoColor=white" alt="Vite"/>
</p>

---

## ✨ 功能特性

- 🚪 **层门配置器** - 大门套、小门套、层门、召唤盒的可视化配置
- 🏢 **轿厢配置器** - 地板、侧墙、后墙、前左墙、前右墙、天花板、轿厢门的材质定制
- 🎨 **材质库管理** - 拉丝不锈钢、镜面不锈钢、拉丝钛金、镜面钛金、黑钛拉丝、黑钛镜面
- 🔧 **组件化架构** - 所有 3D 部件继承自 BaseComponent，遵循统一接口规范
- 📡 **EventBus 交互** - 松耦合的组件通信机制
- 📱 **响应式设计** - 适配不同屏幕尺寸

## 🚀 快速开始

### 环境要求

- Node.js 18+
- 支持 WebGL 的现代浏览器

### 安装

1. 克隆仓库

```bash
git clone https://github.com/yourusername/elevator-3d.git
cd elevator-3d
```

2. 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

然后在浏览器中打开 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

构建产物将位于 `dist/` 目录。

## 📁 项目结构

```
elevator-3d/
├── src/
│   ├── components/           # 3D 组件
│   │   ├── BaseComponent.js  # 基础组件类
│   │   ├── DoorFrame.js      # 大门套
│   │   ├── DoorLeaf.js       # 层门
│   │   ├── CallBox.js        # 召唤盒
│   │   └── cabin/            # 轿厢组件
│   ├── materials/            # 材质管理
│   │   └── MaterialLibrary.js
│   ├── door-configurator.js  # 层门配置器
│   └── cabin-configurator.js # 轿厢配置器
├── index.html               # 主页面
├── package.json
└── README.md
```

## 🏗️ 架构设计

### 组件继承体系

所有 3D 部件必须继承自 `BaseComponent`，实现以下接口：

```javascript
class MyComponent extends BaseComponent {
  create() {}           // 创建 3D 对象
  applyMaterial(key) {} // 应用材质
  getConfig() {}        // 获取当前配置
  dispose() {}          // 资源释放
}
```

### 材质系统

材质通过 `MaterialLibrary` 集中管理，支持：

| 材质编码 | 名称 | 描述 |
|---------|------|------|
| `st-hairline` | 拉丝不锈钢 | 银灰色拉丝质感 |
| `st-mirror` | 镜面不锈钢 | 高反射镜面效果 |
| `ti-hairline` | 拉丝钛金 | 金色拉丝质感 |
| `ti-mirror` | 镜面钛金 | 金色镜面效果 |
| `bk-hairline` | 黑钛拉丝 | 黑色拉丝质感 |
| `bk-mirror` | 黑钛镜面 | 黑色镜面效果 |

### 配置数据格式

```json
{
  "materials": {
    "st-hairline": {
      "name": "拉丝不锈钢",
      "roughness": 0.4,
      "metalness": 0.8,
      "color": "#aaaaaa"
    }
  }
}
```

## 🎯 使用指南

### 层门配置

1. 点击顶部「层门配置」标签
2. 点击场景中的组件（大门套/小门套/层门/召唤盒）
3. 在右侧面板中选择材质或型号
4. 拖拽旋转视角，滚轮缩放

### 轿厢配置

1. 点击顶部「轿厢配置」标签
2. 选择轿厢内的各个墙面或组件
3. 自定义材质、按钮颜色、面板颜色、屏幕类型
4. 部分组件支持分组同步材质

## 🤝 如何贡献

我们欢迎任何友好的建议和贡献！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证开源。

## 🙏 致谢

- [Three.js](https://threejs.org/) - 强大的 3D 图形库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

---

<p align="center">
  Made with ❤️ for elevator configuration
</p>
