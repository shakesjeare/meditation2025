// 开始体验函数
function startExperience(language) {
    console.log('Selected language:', language);
    
    // 获取所有相关元素
    const startUI = document.getElementById('start-ui');
    const vrScene = document.querySelector('a-scene');
    const meditationScene = document.getElementById('meditation');
    
    // 移除body的开始UI样式
    document.body.classList.remove('show-start-ui');
    
    // 移除背景图片
    document.body.style.backgroundImage = 'none';
    
    // 隐藏开始UI
    startUI.style.display = 'none';
    
    // 显示场景，隐藏第二个场景
    vrScene.style.display = 'block';
    if (meditationScene) {
        meditationScene.style.display = 'none';
    }
    
    // 确保场景正确加载
    if (vrScene.hasLoaded) {
        setupSceneAndEnterVR();
    } else {
        vrScene.addEventListener('loaded', setupSceneAndEnterVR);
    }
}

// 设置场景并进入VR模式
function setupSceneAndEnterVR() {
    console.log('Scene loaded, initializing and entering VR');
    
    // 创建淡入效果
    const scene = document.querySelector('a-scene');
    const fadeEffect = document.createElement('a-entity');
    fadeEffect.setAttribute('geometry', {
        primitive: 'sphere',
        radius: 0.1
    });
    fadeEffect.setAttribute('material', {
        color: '#000',
        opacity: 1,
        transparent: true,
        side: 'back'
    });
    fadeEffect.setAttribute('scale', '4 4 4');
    
    // 设置淡入效果的位置
    const camera = document.querySelector('[camera]');
    let position = { x: 0, y: 1.6, z: 0 };
    if (camera && camera.object3D) {
        position = camera.object3D.position;
    }
    fadeEffect.setAttribute('position', position);
    
    scene.appendChild(fadeEffect);
    
    // 淡入动画
    fadeEffect.setAttribute('animation__scale', {
        property: 'scale',
        to: '0.1 0.1 0.1',
        dur: 1000,
        easing: 'easeOutQuad'
    });
    
    fadeEffect.setAttribute('animation__opacity', {
        property: 'material.opacity',
        to: '0',
        dur: 1000,
        easing: 'easeOutQuad'
    });
    
    // 播放音频
    playAudio();
    
    // 清理淡入效果并尝试进入VR模式
    setTimeout(() => {
        if (fadeEffect.parentNode) {
            fadeEffect.parentNode.removeChild(fadeEffect);
        }
        
        // 尝试进入VR模式
        enterVR();
    }, 1100);
}

// 进入VR模式
function enterVR() {
    console.log('Attempting to enter VR mode');
    const scene = document.querySelector('a-scene');
    
    if (scene) {
        // 尝试进入VR模式
        scene.enterVR().catch(err => {
            console.error('VR entry failed:', err);
            // 如果失败，只记录错误，不显示额外的错误信息
            // 用户仍可以使用A-Frame自带的VR按钮进入VR
            console.log('Please use the VR button in the bottom-right corner to enter VR mode');
        });
    }
}

// 播放音频
function playAudio() {
    const bgMusic = document.querySelector('#background-sound');
    const narration = document.querySelector('#narration-sound-1');
    
    if (bgMusic && bgMusic.components && bgMusic.components.sound) {
        bgMusic.components.sound.playSound();
        console.log('Background music started');
    } else {
        console.log('Background music not found or not initialized');
    }
    
    if (narration && narration.components && narration.components.sound) {
        narration.components.sound.playSound();
        console.log('Narration started');
    } else {
        console.log('Narration not found or not initialized');
    }
}

// 当页面加载完成时初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded, initializing UI');
    
    // 添加 show-start-ui 类到 body
    document.body.classList.add('show-start-ui');
    
    // 确保初始状态正确
    const startUI = document.getElementById('start-ui');
    const vrScene = document.querySelector('a-scene');
    const meditationScene = document.getElementById('meditation');
    
    if (startUI) startUI.style.display = 'flex';
    if (vrScene) vrScene.style.display = 'none';
    if (meditationScene) meditationScene.style.display = 'none';
    
    // 检查VR可用性
    checkVRSupport();
});

// 检查VR支持
function checkVRSupport() {
    if (!navigator.xr) {
        console.warn('WebXR not supported');
        return;
    }
    
    navigator.xr.isSessionSupported('immersive-vr')
        .then(supported => {
            if (supported) {
                console.log('VR is supported');
            } else {
                console.log('VR is not supported');
                // 可以添加一个提示或降级处理
            }
        })
        .catch(err => {
            console.error('Error checking VR support:', err);
        });
}

// 错误处理函数
function handleError(error) {
    console.error('Error in UI:', error);
}

// 导出需要在其他文件中使用的函数
window.startExperience = startExperience;