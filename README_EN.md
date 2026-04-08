[中文](README.md) | [English](README_EN.md)

<h1 align="center">3D Elevator Configurator</h1>

<p align="center">
  <b>Elevator Visualization Configuration System Based on Three.js</b>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/Features-Door%20|%20Cabin-blue" alt="Features"/></a>
  &ensp;
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"/></a>
  &ensp;
  <img src="https://img.shields.io/badge/Three.js-r160-000000?logo=three.js&logoColor=white" alt="Three.js"/>
  &ensp;
  <img src="https://img.shields.io/badge/Vite-5.0+-646CFF?logo=vite&logoColor=white" alt="Vite"/>
</p>

---

## ✨ Features

- 🚪 **Landing Door Configurator** - Visual configuration for door frame, inner frame, door leaf, and call box
- 🏢 **Cabin Configurator** - Customize materials for floor, side walls, rear wall, front walls, ceiling, and cabin door
- 🎨 **Material Library** - Hairline stainless steel, mirror stainless steel, hairline titanium, mirror titanium, black titanium hairline, black titanium mirror
- 🔧 **Component Architecture** - All 3D parts inherit from BaseComponent, following unified interface specifications
- 📡 **EventBus Interaction** - Loosely coupled component communication mechanism
- 📱 **Responsive Design** - Adapts to different screen sizes

## 🚀 Quick Start

### Requirements

- Node.js 18+
- Modern browser with WebGL support

### Installation

1. Clone the repository

```bash
git clone https://github.com/Zhetao-Wang/elevator-3d.git
cd elevator-3d
```

2. Install dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## 📁 Project Structure

```
elevator-3d/
├── src/
│   ├── components/           # 3D Components
│   │   ├── BaseComponent.js  # Base component class
│   │   ├── DoorFrame.js      # Door frame
│   │   ├── DoorLeaf.js       # Door leaf
│   │   ├── CallBox.js        # Call box
│   │   └── cabin/            # Cabin components
│   ├── materials/            # Material management
│   │   └── MaterialLibrary.js
│   ├── door-configurator.js  # Door configurator
│   └── cabin-configurator.js # Cabin configurator
├── index.html               # Main page
├── package.json
└── README.md
```

## 🏗️ Architecture Design

### Component Inheritance

All 3D parts must inherit from `BaseComponent` and implement the following interface:

```javascript
class MyComponent extends BaseComponent {
  create() {}           // Create 3D objects
  applyMaterial(key) {} // Apply materials
  getConfig() {}        // Get current configuration
  dispose() {}          // Resource cleanup
}
```

### Material System

Materials are centrally managed through `MaterialLibrary`:

| Code | Name | Description |
|------|------|-------------|
| `st-hairline` | Hairline Stainless Steel | Silver gray hairline texture |
| `st-mirror` | Mirror Stainless Steel | High reflection mirror effect |
| `ti-hairline` | Hairline Titanium | Gold hairline texture |
| `ti-mirror` | Mirror Titanium | Gold mirror effect |
| `bk-hairline` | Black Titanium Hairline | Black hairline texture |
| `bk-mirror` | Black Titanium Mirror | Black mirror effect |

### Configuration Data Format

```json
{
  "materials": {
    "st-hairline": {
      "name": "Hairline Stainless Steel",
      "roughness": 0.4,
      "metalness": 0.8,
      "color": "#aaaaaa"
    }
  }
}
```

## 🎯 User Guide

### Landing Door Configuration

1. Click the "Landing Door Config" tab at the top
2. Click on components in the scene (door frame/inner frame/door leaf/call box)
3. Select materials or models in the right panel
4. Drag to rotate view, scroll to zoom

### Cabin Configuration

1. Click the "Cabin Config" tab at the top
2. Select walls or components inside the cabin
3. Customize materials, button colors, panel colors, and screen types
4. Some components support grouped material synchronization

## 🤝 How to Contribute

We welcome any friendly suggestions and contributions!

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Zhetao-Wang/elevator-3d&type=Date)](https://star-history.com/#Zhetao-Wang/elevator-3d&Date)

## 📄 License

This project is open-sourced under the [MIT](LICENSE) License.

## 🙏 Acknowledgements

- [Three.js](https://threejs.org/) - Powerful 3D graphics library
- [Vite](https://vitejs.dev/) - Next-generation frontend build tool

---

<p align="center">
  Made with ❤️ for elevator configuration
</p>
