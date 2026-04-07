# 3D电梯门配置器开发规范

## 技术栈
- 核心: Three.js (ES6 Modules)
- 构建: Vite
- 数据: JSON 驱动配置

## 架构原则
- 所有 3D 部件必须继承自 `src/components/BaseComponent.js`。
- 材质必须通过 `src/materials/MaterialLibrary.js` 管理，禁止散落在组件中。
- 交互逻辑遵循 EventBus 模式。

## 命令集
- 开发: `npm run dev`
- 构建: `npm run build`
