document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    
    // 创建淡入效果
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
    
    // 等待场景加载
    if (scene.hasLoaded) {
        setupTransition();
    } else {
        scene.addEventListener('loaded', setupTransition);
    }
    
    function setupTransition() {
        const camera = document.querySelector('[camera]');
        const position = camera.object3D.position;
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
        
        // 清理淡入效果
        setTimeout(() => {
            if (fadeEffect.parentNode) {
                fadeEffect.parentNode.removeChild(fadeEffect);
            }
        }, 1100);
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    
    // 创建淡入效果
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

    // 检测是否为 Oculus 浏览器
    const isOculusBrowser = /OculusBrowser/.test(navigator.userAgent);
    console.log('Is Oculus Browser:', isOculusBrowser);

    function autoEnterVR() {
        if (isOculusBrowser) {
            // 只有在Oculus浏览器上自动进入VR模式
            const enterVRButton = document.querySelector('.a-enter-vr-button');
            if (enterVRButton) {
                console.log('Found VR button on Oculus, attempting to enter VR');
                // 模拟触摸事件而不是点击事件
                const touchStart = new TouchEvent('touchstart', {
                    bubbles: true,
                    cancelable: true
                });
                const touchEnd = new TouchEvent('touchend', {
                    bubbles: true,
                    cancelable: true
                });
                
                enterVRButton.dispatchEvent(touchStart);
                setTimeout(() => {
                    enterVRButton.dispatchEvent(touchEnd);
                }, 50);
            } else {
                console.log('VR button not found on Oculus');
                // 如果按钮还没准备好，稍后重试
                setTimeout(autoEnterVR, 1000);
            }
        } else {
            // 桌面端不自动进入VR模式
            console.log('Desktop detected, not auto-entering VR');
            // 显示手动VR按钮
            document.getElementById('manual-vr-button').style.display = 'block';
        }
    }

    function setupTransition() {
        console.log('Setting up transition');
        const camera = document.querySelector('[camera]');
        const position = camera.object3D.position;
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
        
        // 清理淡入效果并尝试进入VR模式
        setTimeout(() => {
            if (fadeEffect.parentNode) {
                fadeEffect.parentNode.removeChild(fadeEffect);
            }
            
            // 确保场景已完全加载
            if (scene.hasLoaded) {
                // 只有在Oculus浏览器上自动进入VR
                if (isOculusBrowser) {
                    setTimeout(autoEnterVR, 2000);
                } else {
                    // 在桌面设备上显示手动VR按钮
                    document.getElementById('manual-vr-button').style.display = 'block';
                }
            } else {
                scene.addEventListener('loaded', () => {
                    if (isOculusBrowser) {
                        setTimeout(autoEnterVR, 2000);
                    } else {
                        document.getElementById('manual-vr-button').style.display = 'block';
                    }
                });
            }
        }, 1100);
    }

    // 监听场景加载
    if (scene.hasLoaded) {
        console.log('Scene already loaded');
        setupTransition();
    } else {
        console.log('Waiting for scene to load');
        scene.addEventListener('loaded', setupTransition);
    }

    // 添加错误处理和重试机制
    let retryCount = 0;
    const maxRetries = 3;

    scene.addEventListener('enter-vr-failed', (evt) => {
        console.error('VR entry failed:', evt);
        if (retryCount < maxRetries && isOculusBrowser) {
            retryCount++;
            console.log(`Retrying VR entry (${retryCount}/${maxRetries})`);
            setTimeout(autoEnterVR, 1000);
        } else {
            // 显示手动进入VR按钮
            document.getElementById('manual-vr-button').style.display = 'block';
        }
    });

    // 监听 WebXR 会话状态
    if (navigator.xr) {
        navigator.xr.addEventListener('sessiongranted', () => {
            console.log('XR Session granted');
            if (isOculusBrowser) {
                autoEnterVR();
            }
        });
    }

    // 为 Oculus 添加触摸事件监听
    if (isOculusBrowser) {
        document.addEventListener('touchend', () => {
            if (!scene.is('vr-mode')) {
                autoEnterVR();
            }
        }, { once: true });
    }

    // 创建手动VR按钮
    const manualVRButton = document.createElement('button');
    manualVRButton.id = 'manual-vr-button';
    manualVRButton.textContent = 'Enter VR';
    manualVRButton.style.position = 'fixed';
    manualVRButton.style.bottom = '20px';
    manualVRButton.style.left = '20px';
    manualVRButton.style.zIndex = '9999';
    manualVRButton.style.display = 'none'; // 默认隐藏
    manualVRButton.style.padding = '10px 20px';
    manualVRButton.style.backgroundColor = '#ffffff';
    manualVRButton.style.border = 'none';
    manualVRButton.style.borderRadius = '5px';
    manualVRButton.style.cursor = 'pointer';

    manualVRButton.addEventListener('click', () => {
        const scene = document.querySelector('a-scene');
        const isOculusBrowser = /OculusBrowser/.test(navigator.userAgent);
        
        if (isOculusBrowser) {
            const enterVRButton = document.querySelector('.a-enter-vr-button');
            if (enterVRButton) {
                const touchStart = new TouchEvent('touchstart', {
                    bubbles: true,
                    cancelable: true
                });
                const touchEnd = new TouchEvent('touchend', {
                    bubbles: true,
                    cancelable: true
                });
                
                enterVRButton.dispatchEvent(touchStart);
                setTimeout(() => {
                    enterVRButton.dispatchEvent(touchEnd);
                }, 50);
            }
        } else if (scene) {
            scene.enterVR().catch(err => console.error('Manual VR entry failed:', err));
        }
    });
  

    document.body.appendChild(manualVRButton);

    // 确保场景有正确的VR设置
    if (!scene.hasAttribute('vr-mode-ui')) {
        scene.setAttribute('vr-mode-ui', 'enabled: true');
    }
    if (!scene.hasAttribute('webxr')) {
        scene.setAttribute('webxr', 'requiredFeatures: hit-test,local-floor');
    }
});


// 添加到 main.js 或创建一个新的脚本文件
document.addEventListener('DOMContentLoaded', () => {
  const tele2 = document.querySelector('#tele2');
  
  if (tele2) {
    // 确切的动画持续时间（毫秒）
    const animationDuration = 8000; // 8秒动画
    
    // 在动画播放了75%时开始淡出
    const fadeOutStartTime = animationDuration * 0.75; // 在第6秒开始淡出
    
    // 淡出持续时间（毫秒）
    const fadeOutDuration = 3000; // 3秒淡出
    
    // 模型加载完成并开始动画时
    tele2.addEventListener('model-loaded', () => {
      console.log('Tele model loaded, animation starting');
      
      // 设置淡出动画持续时间
      tele2.setAttribute('animation__fadeout', 'dur', fadeOutDuration);
      
      // 安排淡出动画
      setTimeout(() => {
        console.log('Starting fadeout');
        tele2.emit('start-fadeout');
      }, fadeOutStartTime);
      
      // 动画+淡出完成后隐藏元素
      setTimeout(() => {
        tele2.setAttribute('visible', 'false');
      }, animationDuration + 500); // 给一点额外时间确保淡出完成
    });
  }
});