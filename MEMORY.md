# 项目进度记录

## 当前状态
- 已完成: 核心架构、所有组件、主配置器、UI 面板
- 进行中: 优化与调试

## 核心文件

### BaseComponent.js
位置: `src/components/BaseComponent.js`
- 抽象基类，所有3D组件的父类
- 提供 `applyMaterial()` 材质应用接口
- 提供 `onClick()` 点击事件接口
- 集成 `THREE.EventDispatcher` 实现事件系统
- 支持资源清理 `dispose()`

### MaterialLibrary.js
位置: `src/materials/MaterialLibrary.js`
- 单例模式管理材质
- 根据 `config-data.json` 缓存并生成 `MeshStandardMaterial`
- 支持纹理预加载
- 提供分类查询 `getByCategory()`

### 组件文件
- `DoorFrame.js` - 大门套（2.2m×2.3m），支持材质切换
- `InnerFrame.js` - 小门套（1.9m×2.15m），支持材质切换
- `DoorLeaf.js` - 层门（双开门扇），仅标准型（1.7m宽），静态展示
- `FloorDisplay.js` - 楼层显示器，位置在门楣上方（y=1.15），支持型号切换
- `CallBox.js` - 召唤盒（新增），壁挂于门右侧，支持材质/按钮型号/按钮颜色/显示器型号切换

### door-configurator.js
位置: `src/door-configurator.js`
- 主配置器类，管理所有组件
- 相机目标设为大门套中心 (0, 1.15, 0)
- 初始化 Three.js 场景、相机、渲染器
- 处理 Raycaster 点击交互
- 提供全局 EventBus 供 UI 面板通信

### index.html
- 集成 3D 画布和右侧面板
- 支持材质、型号、按钮型号、按钮颜色、显示器型号的配置
- 显示当前选中组件名称

## 已删除的文件
- `src/counter.js` - 无用示例文件
- `src/materials.js` - 被 MaterialLibrary.js 取代
- `style.css` - 空文件

## 运行方式
```bash
npm run dev
```
访问 `http://localhost:5173`

## 操作说明
- 🖱️ **点击** 门组件（大门套/小门套/层门/显示器/召唤盒）打开右侧面板
- 🎨 **选择材质** 实时预览不同材质效果
- 📐 **切换型号** 显示器可在"黑底白字段码"和"红色点阵"间切换
- 🔘 **召唤盒** 可配置按钮形状（圆形/方形）、按钮颜色（白/红/蓝）、显示器型号
- 🔄 **拖拽旋转** 查看不同角度
- 🔍 **滚轮缩放** 调整视图远近

## 下一步目标
1. 添加选中高亮效果
2. 优化材质预览
