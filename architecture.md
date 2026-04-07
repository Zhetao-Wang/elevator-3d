# 3D电梯门配置器架构设计

## 文件结构

```
/src
├── main.js                    # 入口文件，复用现有召唤盒代码
├── door-configurator.js       # 主配置器，管理所有组件
├── components/
│   ├── BaseComponent.js       # 抽象基类（applyMaterial, onClick）
│   ├── DoorFrame.js           # 大门套组件
│   ├── InnerFrame.js          # 小门套组件
│   ├── DoorLeaf.js            # 层门组件
│   └── FloorDisplay.js        # 楼层显示器组件
├── materials/
│   └── MaterialLibrary.js     # 材质库（发纹、镜面、钛金等）
└── panels/
    └── ConfigPanel.js         # 右侧面板组件
/config-data.json              # 配置数据（材质、型号等）
/architecture.md               # 本文件
```

## 组件设计

### 1. BaseComponent 抽象基类
```javascript
class BaseComponent {
    constructor(scene, name, configKey) {
        this.scene = scene;
        this.name = name;
        this.configKey = configKey;
        this.mesh = null;
    }
    
    // 应用材质
    applyMaterial(materialKey) {}
    
    // 点击回调
    onClick() {
        EventBus.emit('component:selected', this);
    }
    
    // 获取当前配置
    getConfig() {}
}
```

### 2. DoorFrame（大门套）
- **几何体**: BoxGeometry，外部尺寸 2.2m × 2.3m × 0.15m
- **结构**: 门框主体 + 4边包边
- **材质**: 从 MaterialLibrary 获取
- **交互**: 点击后右侧面板显示材质选项

### 3. InnerFrame（小门套）
- **几何体**: BoxGeometry，内嵌于大门套，尺寸 1.8m × 2.1m × 0.1m
- **结构**: 内部门框
- **材质**: 独立材质选择，可与大门套不同
- **交互**: 点击后右侧面板显示材质选项

### 4. DoorLeaf（层门）
- **几何体**: 双开门扇，每个 0.85m × 2.05m × 0.05m
- **结构**: 左门 + 右门（中分双折）
- **配置项**:
  - 型号: 标准型、加宽型
  - 材质: 同大门套材质库
- **交互**: 点击后显示型号+材质选择

### 5. FloorDisplay（楼层显示器）
- **复用**: 现有 src/main.js 中的显示器实现
- **位置**: 安装在门楣上方或召唤盒上
- **型号**: 
  - 4.3寸黑底白字段码
  - 4.3寸红色点阵
- **交互**: 点击后显示型号选择

### 6. MaterialLibrary（材质库）
```javascript
const materials = {
    'st-hairline': {  // 发纹不锈钢
        color: 0xaaaaaa,
        metalness: 1.0,
        roughness: 0.35,
        map: 'hairline-texture.jpg'
    },
    'st-mirror': {    // 镜面不锈钢
        color: 0xaaaaaa,
        metalness: 1.0,
        roughness: 0.05
    },
    'ti-hairline': {  // 钛金发纹
        color: 0xc5a059,
        metalness: 1.0,
        roughness: 0.35
    },
    'ti-mirror': {    // 钛金镜面
        color: 0xc5a059,
        metalness: 1.0,
        roughness: 0.05
    },
    'bk-hairline': {  // 黑钛发纹
        color: 0x222222,
        metalness: 1.0,
        roughness: 0.35
    },
    'bk-mirror': {    // 黑钛镜面
        color: 0x222222,
        metalness: 1.0,
        roughness: 0.05
    }
};
```

## 交互流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   用户点击   │────▶│  raycaster  │────▶│ 组件被选中  │
│  3D部件     │     │   拾取mesh   │     │  触发事件   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   更新3D     │◀────│  应用材质/   │◀────│ 右侧面板    │
│   模型       │     │   型号      │     │ 显示配置选项 │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 详细流程

1. **初始化阶段**
   - 加载 config-data.json
   - 初始化 MaterialLibrary
   - 创建所有组件实例
   - 右侧面板默认隐藏

2. **点击交互**
   - Raycaster 检测点击的 mesh
   - 通过 mesh.userData.componentRef 获取组件实例
   - EventBus 触发 `component:selected` 事件

3. **面板响应**
   - 右侧面板监听事件
   - 根据组件类型渲染对应配置选项
   - 材质：显示6种材质卡片
   - 型号：显示型号选择按钮

4. **配置更新**
   - 用户选择配置
   - 调用 component.applyMaterial() / setModel()
   - 更新 3D 模型材质

## 数据流

```
config-data.json
      │
      ▼
MaterialLibrary ──▶ 组件创建
      │
      ▼
用户点击 ──▶ ConfigPanel 更新 ──▶ 组件方法调用 ──▶ 3D 更新
```

## 性能考虑

1. **材质缓存**: MaterialLibrary 缓存材质实例，避免重复创建
2. **纹理复用**: 发纹纹理加载一次，复用到所有发纹材质
3. **阴影优化**: 层门开启使用 CSS 过渡动画，3D 只做材质更新
4. **LOD**: 远景使用简化材质（无纹理）
