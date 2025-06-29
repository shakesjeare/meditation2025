AFRAME.registerComponent('seed-box-controller', {
  schema: {
    startY: {type: 'number', default: 0.1},            // 起始高度
    finalY: {type: 'number', default: 1.65},           // 最终高度
    dropDistance: {type: 'number', default: 4},        // 下落距离
    initialDelay: {type: 'number', default: 10000},     // 初始延迟(毫秒)
    teleAnimDuration: {type: 'number', default: 3000}, // tele动画持续时间
    riseDuration: {type: 'number', default: 3000},     // 上升动画持续时间
    dropDuration: {type: 'number', default: 2000},     // 下落动画持续时间
    autoStart: {type: 'boolean', default: true}        // 是否自动开始动画
  },
  
  init: function() {
    // 获取相关实体
    this.seedModel = this.el.querySelector('#seed2');
    this.tele = document.querySelector('#tele2');
    this.teleseed = document.querySelector('#teleseed2');
    this.seedLight = document.querySelector('#seedLight2');
    this.teleseedLight = document.querySelector('#teleseedLight2');
    
    // 状态变量
    this.phase = 'initial';  // 阶段: initial, waiting, rising, hovering, dropping, completed
    this.isInteractable = false;
    this.isDropping = false;
    
    // 绑定方法
    this.onClick = this.onClick.bind(this);
    this.onRaycasterIntersected = this.onRaycasterIntersected.bind(this);
    this.onRaycasterIntersectedCleared = this.onRaycasterIntersectedCleared.bind(this);
    this.onTriggerDown = this.onTriggerDown.bind(this);
    this.onAnimationComplete = this.onAnimationComplete.bind(this);
    
    // 设置动画数据
    this.setupAnimations();
    
    // 添加事件监听
    this.el.addEventListener('click', this.onClick);
    this.el.addEventListener('raycaster-intersected', this.onRaycasterIntersected);
    this.el.addEventListener('raycaster-intersected-cleared', this.onRaycasterIntersectedCleared);
    this.el.sceneEl.addEventListener('triggerdown', this.onTriggerDown);
    this.el.addEventListener('animationcomplete', this.onAnimationComplete);
    
    // 设置初始位置
    this.el.setAttribute('position', {
      x: -1,
      y: this.data.startY,
      z: -4
    });
    
    // 如果设置了自动开始，延迟后启动
    if (this.data.autoStart) {
      setTimeout(() => this.startSequence(), this.data.initialDelay);
    }
    
    console.log('Seed box controller initialized');
  },
  
  setupAnimations: function() {
    // 上升动画
    this.el.setAttribute('animation__rise', {
      property: 'position.y',
      from: this.data.startY,
      to: this.data.finalY,
      dur: this.data.riseDuration,
      easing: 'easeOutCubic',
      startEvents: 'startRise'
    });
    
    // 下落动画
    this.el.setAttribute('animation__drop', {
      property: 'position.y',
      to: this.data.finalY - this.data.dropDistance,
      dur: this.data.dropDuration,
      easing: 'easeInQuad',
      startEvents: 'startDrop'
    });
    
    // 悬浮动画
    this.el.setAttribute('animation__hover', {
      property: 'position.y',
      from: this.data.finalY,
      to: this.data.finalY + 0.1,
      dir: 'alternate',
      dur: 2000,
      easing: 'easeInOutSine',
      loop: true,
      startEvents: 'startHover',
      pauseEvents: 'pauseHover'
    });
    
    // 种子旋转动画
    if (this.seedModel) {
      this.seedModel.setAttribute('animation__spin', {
        property: 'rotation.y',
        from: 30,
        to: 390, // 旋转一圈
        dur: 10000,
        easing: 'linear',
        loop: true,
        startEvents: 'startHover',
        pauseEvents: 'pauseHover'
      });
      
      // 种子下落时的快速旋转
      this.seedModel.setAttribute('animation__fastspin', {
        property: 'rotation.y',
        to: 1080, // 旋转3圈
        dur: this.data.dropDuration,
        easing: 'easeInQuad',
        startEvents: 'startDrop',
        pauseEvents: 'pauseDrop'
      });
      
      // 种子下落时的前后翻滚
      this.seedModel.setAttribute('animation__tilt', {
        property: 'rotation.x',
        from: 0,
        to: 45,
        dur: this.data.dropDuration,
        easing: 'easeInQuad',
        startEvents: 'startDrop',
        pauseEvents: 'pauseDrop'
      });
    }
    
    // 光源动画
    if (this.seedLight) {
      this.seedLight.setAttribute('animation__glow', {
        property: 'light.intensity',
        from: 1,
        to: 2,
        dir: 'alternate',
        dur: 1000,
        easing: 'easeInOutSine',
        loop: true,
        startEvents: 'startHover',
        pauseEvents: 'pauseHover'
      });
      
      // 下落时光强减弱
      this.seedLight.setAttribute('animation__dim', {
        property: 'light.intensity',
        to: 0,
        dur: this.data.dropDuration,
        easing: 'easeInQuad',
        startEvents: 'startDrop',
        pauseEvents: 'pauseDrop'
      });
    }
    
    // Tele淡出动画
    if (this.tele) {
      this.tele.setAttribute('animation__fadeout', {
        property: 'material.opacity',
        from: 1,
        to: 0,
        dur: 2000,
        easing: 'easeInOutSine',
        startEvents: 'startTeleFade'
      });
    }
    
    // Teleseed淡入动画
    if (this.teleseed) {
      this.teleseed.setAttribute('animation__fadein', {
        property: 'material.opacity',
        from: 0,
        to: 1,
        dur: 2000,
        easing: 'easeInOutSine',
        startEvents: 'startTeleseedFade'
      });
    }
  },
  
  startSequence: function() {
    if (this.phase !== 'initial') return;
    
    console.log('Starting animation sequence');
    this.phase = 'waiting';
    
    // 等待tele动画
    setTimeout(() => {
      if (this.phase === 'waiting') {
        // 开始上升动画
        console.log('Starting rise animation');
        this.phase = 'rising';
        this.el.emit('startRise');
        
        // 上升结束后，进入悬浮状态
        setTimeout(() => {
          if (this.phase === 'rising') {
            console.log('Rise completed, starting hover');
            this.phase = 'hovering';
            this.isInteractable = true;
            
            // 开始悬浮动画
            this.el.emit('startHover');
            if (this.seedModel) this.seedModel.emit('startHover');
            if (this.seedLight) this.seedLight.emit('startHover');
            
            // 显示粒子效果并淡出tele
            if (this.teleseed) this.teleseed.setAttribute('visible', 'true');
            if (this.teleseed) this.teleseed.emit('startTeleseedFade');
            if (this.tele) this.tele.emit('startTeleFade');
            
            // 延迟后隐藏tele
            setTimeout(() => {
              if (this.tele) this.tele.setAttribute('visible', 'false');
            }, 2000);
          }
        }, this.data.riseDuration);
      }
    }, this.data.teleAnimDuration);
  },
  
  onRaycasterIntersected: function(evt) {
    this.intersectedRaycaster = evt.detail.el;
    console.log('Box intersected by raycaster:', evt.detail.el.id);
    
    // 仅在悬浮阶段突出显示
    if (this.phase === 'hovering') {
      this.el.setAttribute('material', 'emissive', '#ff0000');
      this.el.setAttribute('material', 'emissiveIntensity', 0.5);
    }
  },
  
  onRaycasterIntersectedCleared: function(evt) {
    this.intersectedRaycaster = null;
    console.log('Box intersection cleared');
    
    // 恢复正常
    this.el.setAttribute('material', 'emissive', '#000000');
    this.el.setAttribute('material', 'emissiveIntensity', 0);
  },
  
  onClick: function() {
    console.log('Box clicked, phase:', this.phase);
    if (this.phase === 'hovering' && this.isInteractable) {
      this.startDrop();
    }
  },
  
  onTriggerDown: function(evt) {
    // 检查是否是当前交叉的控制器触发
    if (this.phase === 'hovering' && this.isInteractable && this.intersectedRaycaster) {
      if (evt.detail && evt.detail.el === this.intersectedRaycaster) {
        console.log('Trigger down on intersected raycaster');
        this.startDrop();
      }
    }
  },
  
  startDrop: function() {
    if (this.phase !== 'hovering' || this.isDropping) return;
    
    console.log('⭐ Starting seed drop ⭐');
    this.phase = 'dropping';
    this.isInteractable = false;
    this.isDropping = true;
    
    // 暂停悬浮动画
    this.el.emit('pauseHover');
    if (this.seedModel) {
      this.seedModel.emit('pauseHover');
      this.seedModel.emit('startDrop');
    }
    if (this.seedLight) {
      this.seedLight.emit('pauseHover');
      this.seedLight.emit('startDrop');
    }
    
    // 隐藏粒子效果
    if (this.teleseed) {
      this.teleseed.setAttribute('visible', 'false');
    }
    
    // 开始下落动画
    this.el.emit('startDrop');
    
    // 触发振动反馈
    this.triggerHapticFeedback();
  },
  

  onAnimationComplete: function(evt) {
  const animName = evt.detail.name;
  console.log('Animation completed:', animName);
  
  // 如果下落动画完成
  if (animName === 'animation__drop' && this.phase === 'dropping') {
    console.log('Drop animation completed, moving to completed phase');
    this.phase = 'completed';
    
    // 触发花朵上升动画
    const flowersContainer = document.querySelector('#flowers-container');
    if (flowersContainer) {
      console.log('Triggering flowers rise animation');
      flowersContainer.emit('flowers-rise');
      
      // 播放生长音效
      const growingSound = document.querySelector('#growing-sound');
      if (growingSound && growingSound.components.sound) {
        console.log('Playing growing sound');
        growingSound.components.sound.playSound();
      } else {
        console.warn('Growing sound not found or sound component not available');
      }
      
      // 播放旁白音频并安排花朵开放序列
      const narration2 = document.querySelector('#narration-sound-2');
      if (narration2 && narration2.components.sound) {
        console.log('Playing narration 2');
        narration2.components.sound.playSound();
        
        // 开始花朵开放序列
        this.startFlowerBloomSequence(narration2.components.sound);
      } else {
        console.warn('Narration sound 2 not found or sound component not available');
      }
    }
    
    // 延迟后完全隐藏
    setTimeout(() => {
      this.el.setAttribute('visible', 'false');
      this.el.emit('seed-dropped', {}, true); // 触发事件通知其他组件
    }, 500);
  }
},
  
  // 添加你的新函数在这里
startFlowerBloomSequence: function(soundComponent) {
  // 使用确切的音频持续时间：18分55秒 = 1135秒 = 1135000毫秒
  const audioDuration = 1135000; // 18:55 转换为毫秒
  console.log('Audio duration set to 18:55 (1135000ms)');
  
  // 定义要依次开放的花朵ID列表（按照你希望的顺序）
  const flowerIds = ['flower2', 'flower3', 'flower4', 'flower5', 'flower6', 'flower7', 'flower9', 'flower10', 'flower11'];
  
  // 设置较慢的动画速度
  const slowPlaybackSpeed = 0.3; // 原速的30%
  
  // 定义每朵花开放的百分比位置 - 从快到慢
  const bloomPercentages = [
    2,    // 第一朵 - 音频2%的位置
    4,    // 第二朵 - 音频4%的位置
    7,    // 第三朵 - 音频7%的位置
    10,   // 第四朵 - 音频10%的位置
    24,   // 第五朵 - 音频14%的位置
    30,   // 第六朵 - 音频20%的位置
    55,   // 第七朵 - 音频25%的位置
    75,   // 第八朵 - 音频30%的位置
    97,   // 第九朵 - 音频37%的位置
  ];
  
  // 获取blooming-sound元素 (新添加的开花音效)
  const bloomingSound = document.querySelector('#blooming-sound');
  if (!bloomingSound) {
    console.warn('Blooming sound element not found');
  } else {
    console.log('Blooming sound element found:', bloomingSound);
  }
  
  // 为了避免太多音效同时播放而创建的声音队列
  const soundQueue = [];
  let isPlayingSound = false;
  
  // 播放声音队列中的下一个音效
  const playNextSound = () => {
    if (soundQueue.length === 0 || isPlayingSound) {
      return;
    }
    
    isPlayingSound = true;
    const currentSound = soundQueue.shift();
    
    if (bloomingSound && bloomingSound.components && bloomingSound.components.sound) {
      const soundComponent = bloomingSound.components.sound;
      
      // 确保声音重置到开始位置
      soundComponent.stopSound();
      
      // 短暂延迟后播放
      setTimeout(() => {
        console.log(`Playing blooming sound for flower ${currentSound.flowerId}`);
        soundComponent.playSound();
        
        // 监听声音播放结束
        const soundDuration = 2000; // 假设声音持续2秒
        setTimeout(() => {
          isPlayingSound = false;
          playNextSound(); // 播放队列中的下一个声音
        }, soundDuration);
      }, 50);
    } else {
      console.warn('Sound component not found on blooming-sound entity');
      isPlayingSound = false;
      setTimeout(playNextSound, 50); // 继续尝试下一个
    }
  };
  
  // 将声音添加到队列并开始播放
  const queueSound = (flowerId) => {
    soundQueue.push({ flowerId });
    if (!isPlayingSound) {
      playNextSound();
    }
  };
  
  // 计算每朵花开始开放的时间点
  flowerIds.forEach((flowerId, index) => {
    // 计算此花朵应该在音频播放的哪个时间点开始开放（毫秒）
    const bloomPercentage = bloomPercentages[index];
    const startTime = (bloomPercentage / 100) * audioDuration;
    
    // 安排在指定时间触发花朵开放
    setTimeout(() => {
      const flower = document.querySelector(`#${flowerId}`);
      if (flower) {
        console.log(`Blooming ${flowerId} at ${(startTime/1000).toFixed(1)}s (${bloomPercentage}% of narration) with slow speed: ${slowPlaybackSpeed}`);
        
        // 将timeScale从0改为slowPlaybackSpeed将开始缓慢播放动画
        flower.setAttribute('animation-mixer', 'timeScale', slowPlaybackSpeed);
        
        // 将这朵花的音效加入队列
        queueSound(flowerId);
      }
    }, startTime);
  });
  
  // 记录最后一朵花的开放时间
  const lastPercentage = bloomPercentages[bloomPercentages.length - 1];
  const lastFlowerTime = (lastPercentage / 100) * audioDuration;
  console.log(`Last flower will bloom at ${(lastFlowerTime/1000).toFixed(1)}s, which is ${lastPercentage}% of the narration`);
  
  // 根据花朵开放动画时长和减速因子，估算所有花朵完全开放的时间点
  const estimatedAnimationDuration = 3000; // 假设原始动画持续3秒
  const slowedAnimationDuration = estimatedAnimationDuration / slowPlaybackSpeed;
  const allBloomedTime = lastFlowerTime + slowedAnimationDuration;
  const allBloomedPercentage = (allBloomedTime / audioDuration) * 100;
  
  console.log(`Estimated time for all flowers to be fully bloomed: ${(allBloomedTime/1000).toFixed(1)}s (${allBloomedPercentage.toFixed(1)}% of narration)`);
  
  // 原始功能保持不变（下方代码可选，如果你在onAnimationComplete中已经处理了growing-sound，可以移除这部分）
  const growingSound = document.querySelector('#growing-sound');
  if (growingSound && growingSound.components && growingSound.components.sound) {
    console.log('Playing original growing sound');
    growingSound.components.sound.playSound();
  }
},
  
  
  triggerHapticFeedback: function() {
    // 尝试为左右手柄添加振动
    ['#leftHand', '#rightHand'].forEach(selector => {
      const controller = document.querySelector(selector);
      if (controller && controller.components && controller.components.haptics) {
        controller.components.haptics.pulse(0.7, 100); // 强度0.7，持续100ms
      }
    });
    
    // 兼容原生Web Gamepad API
    try {
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i].vibrationActuator) {
          gamepads[i].vibrationActuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: 300,
            weakMagnitude: 0.8,
            strongMagnitude: 0.8
          });
        }
      }
    } catch(e) {
      console.log('Haptic feedback not available', e);
    }
  },
  
  remove: function() {
    // 移除事件监听
    this.el.removeEventListener('click', this.onClick);
    this.el.removeEventListener('raycaster-intersected', this.onRaycasterIntersected);
    this.el.removeEventListener('raycaster-intersected-cleared', this.onRaycasterIntersectedCleared);
    this.el.sceneEl.removeEventListener('triggerdown', this.onTriggerDown);
    this.el.removeEventListener('animationcomplete', this.onAnimationComplete);
    
    // 移除动画
    this.el.removeAttribute('animation__rise');
    this.el.removeAttribute('animation__drop');
    this.el.removeAttribute('animation__hover');
    
    // 清理子元素动画
    if (this.seedModel) {
      this.seedModel.removeAttribute('animation__spin');
      this.seedModel.removeAttribute('animation__fastspin');
      this.seedModel.removeAttribute('animation__tilt');
    }
    
    if (this.seedLight) {
      this.seedLight.removeAttribute('animation__glow');
      this.seedLight.removeAttribute('animation__dim');
    }
    
    if (this.tele) {
      this.tele.removeAttribute('animation__fadeout');
    }
    
    if (this.teleseed) {
      this.teleseed.removeAttribute('animation__fadein');
    }
  }
});  