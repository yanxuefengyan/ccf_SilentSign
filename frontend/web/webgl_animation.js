// webgl_animation.js - WebGL手语动画渲染系统
class SignAnimationRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
        this.animationMixer = null;
        this.currentAction = null;
        this.clock = new THREE.Clock();
        
        this._initializeScene();
        this._loadAnimationModels();
    }
    
    _initializeScene() {
        // 设置渲染器
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.renderer.shadowMap.enabled = true;
        
        // 设置相机位置
        this.camera.position.z = 5;
        
        // 添加灯光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }
    
    async _loadAnimationModels() {
        try {
            // 加载手语动画模型
            const loader = new THREE.GLTFLoader();
            
            // 加载基础模型
            const baseModel = await loader.loadAsync('/models/sign_base.gltf');
            this.scene.add(baseModel.scene);
            
            // 加载动画数据
            const animationData = await loader.loadAsync('/models/sign_animations.gltf');
            this.animationMixer = new THREE.AnimationMixer(baseModel.scene);
            
            // 解析动画剪辑
            this.animations = {};
            animationData.animations.forEach(clip => {
                this.animations[clip.name] = this.animationMixer.clipAction(clip);
            });
            
            console.log('动画模型加载完成，支持的动画:', Object.keys(this.animations));
            
        } catch (error) {
            console.error('动画模型加载失败:', error);
            // 回退到简化的2D渲染
            this._fallbackTo2DRendering();
        }
    }
    
    _fallbackTo2DRendering() {
        console.log('使用2D渲染作为备选方案');
        // 实现简化的2D手语动画渲染
        this.is2DRendering = true;
        this.canvas.getContext('2d').fillStyle = '#f0f0f0';
        this.canvas.getContext('2d').fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    playAnimation(animationName, emotion = 'neutral') {
        if (this.is2DRendering) {
            this._play2DAnimation(animationName, emotion);
            return;
        }
        
        if (this.animationMixer && this.animations[animationName]) {
            if (this.currentAction) {
                this.currentAction.stop();
            }
            
            this.currentAction = this.animations[animationName];
            this.currentAction.play();
            
            // 根据情感调整动画
            this._applyEmotion(emotion);
        } else {
            console.warn('动画不可用:', animationName);
        }
    }
    
    _play2DAnimation(animationName, emotion) {
        // 简化的2D动画实现
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制简单的手语表示
        ctx.fillStyle = '#333';
        ctx.font = '24px Arial';
        ctx.fillText(`动画: ${animationName}`, 20, 40);
        ctx.fillText(`表情: ${emotion}`, 20, 80);
        
        // 绘制简单的手势示意图
        this._draw2DSign(ctx, animationName);
    }
    
    _draw2DSign(ctx, sign) {
        // 根据手语绘制简单的示意图
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 3;
        
        switch(sign) {
            case 'hello':
                this._drawHelloSign(ctx);
                break;
            case 'thankyou':
                this._drawThankYouSign(ctx);
                break;
            case 'help':
                this._drawHelpSign(ctx);
                break;
            default:
                this._drawDefaultSign(ctx);
        }
    }
    
    _drawHelloSign(ctx) {
        // 绘制"你好"的手语示意图
        ctx.beginPath();
        ctx.arc(150, 150, 50, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(150, 150);
        ctx.lineTo(150, 50);
        ctx.stroke();
    }
    
    _drawThankYouSign(ctx) {
        // 绘制"谢谢"的手语示意图
        ctx.beginPath();
        ctx.moveTo(100, 150);
        ctx.lineTo(200, 150);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(150, 150);
        ctx.lineTo(150, 250);
        ctx.stroke();
    }
    
    _drawHelpSign(ctx) {
        // 绘制"帮助"的手语示意图
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(200, 200);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(200, 100);
        ctx.lineTo(100, 200);
        ctx.stroke();
    }
    
    _drawDefaultSign(ctx) {
        // 默认手势
        ctx.beginPath();
        ctx.moveTo(150, 100);
        ctx.lineTo(150, 200);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(100, 150);
        ctx.lineTo(200, 150);
        ctx.stroke();
    }
    
    _applyEmotion(emotion) {
        // 根据情感调整模型外观
        if (this.is2DRendering) {
            return;
        }
        
        // 这里可以实现更复杂的情感表现
        switch(emotion) {
            case 'happy':
                // 调整为开心表情
                break;
            case 'sad':
                // 调整为悲伤表情
                break;
            case 'angry':
                // 调整为愤怒表情
                break;
            case 'urgent':
                // 调整为紧急表情
                break;
            default:
                // 中性表情
        }
    }
    
    update() {
        if (this.animationMixer) {
            const delta = this.clock.getDelta();
            this.animationMixer.update(delta);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// 初始化动画渲染器
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('signCanvas')) {
        window.signRenderer = new SignAnimationRenderer('signCanvas');
        
        // 启动动画循环
        function animate() {
            requestAnimationFrame(animate);
            if (window.signRenderer) {
                window.signRenderer.update();
            }
        }
        animate();
    }
});