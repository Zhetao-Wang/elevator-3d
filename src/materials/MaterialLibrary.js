import * as THREE from 'three';

/**
 * 材质库管理器
 * 负责加载、缓存和生成 MeshStandardMaterial
 * 单例模式
 */
export class MaterialLibrary {
    static instance = null;

    /**
     * 获取单例实例
     * @returns {MaterialLibrary}
     */
    static getInstance() {
        if (!MaterialLibrary.instance) {
            MaterialLibrary.instance = new MaterialLibrary();
        }
        return MaterialLibrary.instance;
    }

    constructor() {
        if (MaterialLibrary.instance) {
            return MaterialLibrary.instance;
        }

        this.materials = new Map();
        this.textureCache = new Map();
        this.configData = null;
        this.textureLoader = new THREE.TextureLoader();
        this.isInitialized = false;
    }

    /**
     * 初始化材质库
     * @param {Object} configData - config-data.json 的数据对象
     * @returns {Promise<void>}
     */
    async initialize(configData) {
        if (this.isInitialized) {
            console.warn('MaterialLibrary 已经初始化');
            return;
        }

        this.configData = configData;

        if (configData.materials) {
            await this._preloadTextures(configData.materials);
            this._createMaterials(configData.materials);
        }

        this.isInitialized = true;
        console.log('MaterialLibrary 初始化完成');
    }

    /**
     * 预加载纹理
     * @private
     */
    async _preloadTextures(materialsConfig) {
        const loadPromises = [];

        for (const [key, config] of Object.entries(materialsConfig)) {
            if (config.preview) {
                const promise = this._loadTexture(config.preview)
                    .then(texture => {
                        this.textureCache.set(key, texture);
                    })
                    .catch(err => {
                        console.warn(`纹理加载失败: ${config.preview}`, err);
                    });
                loadPromises.push(promise);
            }
        }

        await Promise.all(loadPromises);
    }

    /**
     * 加载纹理
     * @private
     */
    _loadTexture(url) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(url, resolve, undefined, reject);
        });
    }

    /**
     * 根据配置创建材质
     * @private
     */
    _createMaterials(materialsConfig) {
        for (const [key, config] of Object.entries(materialsConfig)) {
            const material = this._buildMaterial(config);
            this.materials.set(key, material);
        }
    }

    /**
     * 构建单个材质
     * @private
     */
    _buildMaterial(config) {
        const params = {
            color: config.hex ?? this._hexToNumber(config.color),
            metalness: config.metalness ?? 1.0,
            roughness: config.roughness ?? 0.35,
            side: THREE.FrontSide
        };

        // 如果有纹理且已缓存，应用到材质
        if (this.textureCache.has(config.key)) {
            const texture = this.textureCache.get(config.key);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            params.map = texture;
        }

        const material = new THREE.MeshStandardMaterial(params);

        // 存储材质元数据
        material.userData = {
            key: config.key,
            name: config.name,
            nameEn: config.nameEn,
            category: config.category
        };

        return material;
    }

    /**
     * 将十六进制字符串转换为数字
     * @private
     */
    _hexToNumber(hex) {
        if (typeof hex === 'number') return hex;
        if (typeof hex === 'string') {
            return parseInt(hex.replace('#', ''), 16);
        }
        return 0xaaaaaa;
    }

    /**
     * 获取材质
     * @param {string} key - 材质键名 (如: 'st-hairline')
     * @returns {THREE.MeshStandardMaterial|null}
     */
    get(key) {
        if (!this.materials.has(key)) {
            console.warn(`材质不存在: ${key}`);
            return null;
        }
        return this.materials.get(key);
    }

    /**
     * 获取材质的克隆（用于独立修改）
     * @param {string} key - 材质键名
     * @returns {THREE.MeshStandardMaterial|null}
     */
    getClone(key) {
        const material = this.get(key);
        return material ? material.clone() : null;
    }

    /**
     * 获取所有材质
     * @returns {Map<string, THREE.MeshStandardMaterial>}
     */
    getAll() {
        return new Map(this.materials);
    }

    /**
     * 获取材质列表（用于UI展示）
     * @returns {Array<{key: string, name: string, nameEn: string, category: string}>}
     */
    getMaterialList() {
        const list = [];
        for (const [key, material] of this.materials) {
            list.push({
                key,
                name: material.userData.name,
                nameEn: material.userData.nameEn,
                category: material.userData.category
            });
        }
        return list;
    }

    /**
     * 按类别获取材质
     * @param {string} category - 类别名 (stainless|titanium|black)
     * @returns {Array<{key: string, material: THREE.MeshStandardMaterial}>}
     */
    getByCategory(category) {
        const result = [];
        for (const [key, material] of this.materials) {
            if (material.userData.category === category) {
                result.push({ key, material });
            }
        }
        return result;
    }

    /**
     * 检查材质是否存在
     * @param {string} key - 材质键名
     * @returns {boolean}
     */
    has(key) {
        return this.materials.has(key);
    }

    /**
     * 获取材质预览图URL
     * @param {string} key - 材质键名
     * @returns {string|null}
     */
    getPreview(key) {
        if (this.configData?.materials?.[key]) {
            return this.configData.materials[key].preview || null;
        }
        return null;
    }

    /**
     * 获取材质配置数据
     * @param {string} key - 材质键名
     * @returns {Object|null}
     */
    getConfig(key) {
        return this.configData?.materials?.[key] || null;
    }

    /**
     * 销毁所有材质和纹理，释放内存
     */
    dispose() {
        this.materials.forEach(material => material.dispose());
        this.materials.clear();

        this.textureCache.forEach(texture => texture.dispose());
        this.textureCache.clear();

        this.isInitialized = false;
        this.configData = null;
    }
}

export default MaterialLibrary;
