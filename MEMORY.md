# 项目进度记录

## 当前状态
- 已完成: 核心架构、所有组件、主配置器
- 进行中: 集成测试

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
- `DoorFrame.js` - 大门套，支持材质切换
- `InnerFrame.js` - 小门套，支持材质切换
- `DoorLeaf.js` - 层门（双开门扇），支持型号和材质切换，静态展示
- `FloorDisplay.js` - 楼层显示器，支持型号切换

### door-configurator.js
位置: `src/door-configurator.js`
- 主配置器类，管理所有组件
- 初始化 Three.js 场景、相机、渲染器
- 处理 Raycaster 点击交互
- 提供全局 EventBus 供 UI 面板通信

## 删除的文件
- `src/counter.js` - 无用示例文件
- `src/materials.js` - 被 MaterialLibrary.js 取代
- `style.css` - 空文件

## 使用方式
```javascript
import { DoorConfigurator } from './door-configurator.js';
import configData from '../config-data.json';

const configurator = new DoorConfigurator(container);
await configurator.initialize(configData);

// 应用材质
configurator.applyMaterial('doorFrame', 'ti-mirror');

// 切换型号
configurator.setModel('doorLeaf', 'wide');
```

## 下一步目标
1. 创建右侧面板 UI (ConfigPanel.js)
2. 更新 index.html 集成配置器
3. 添加选中高亮效果
