// 蝴蝶环绕飞行组件，带上下起伏效果
AFRAME.registerComponent('butterfly-flight', {
  schema: {
    radius: {type: 'number', default: 2.5},     // 飞行半径
    speed: {type: 'number', default: 0.5},      // 飞行速度
    baseHeight: {type: 'number', default: 1.8}, // 蝴蝶飞行的基础高度
    heightVariation: {type: 'number', default: 0.2}, // 上下起伏幅度
    verticalSpeed: {type: 'number', default: 1.5},  // 垂直起伏的速度
    centerX: {type: 'number', default: 0},      // 环绕中心点X坐标
    centerZ: {type: 'number', default: 0}       // 环绕中心点Z坐标
  },
  
  init: function() {
    this.angle = 0;           // 水平角度
    this.verticalAngle = 0;   // 垂直方向的角度
  },
  
  tick: function(time, deltaTime) {
    // 更新水平角度 (将deltaTime转换为秒并应用速度)
    this.angle += this.data.speed * (deltaTime / 1000);
    
    // 更新垂直角度，速度可以不同，使得上下起伏和水平移动看起来不同步
    this.verticalAngle += this.data.verticalSpeed * (deltaTime / 1000);
    
    // 计算新位置
    const x = this.data.centerX + this.data.radius * Math.cos(this.angle);
    // 加入上下起伏效果
    const y = this.data.baseHeight + Math.sin(this.verticalAngle) * this.data.heightVariation;
    const z = this.data.centerZ + this.data.radius * Math.sin(this.angle);
    
    // 更新蝴蝶位置
    this.el.setAttribute('position', {x: x, y: y, z: z});
    
    // 设置蝴蝶的朝向，让它始终面向飞行方向
    const rotationY = Math.atan2(Math.cos(this.angle + Math.PI/2), Math.sin(this.angle + Math.PI/2)) * (180 / Math.PI);
    
    // 添加一点点倾斜，根据垂直运动方向
    const tiltX = Math.cos(this.verticalAngle) * 15; // 上升时向上倾斜，下降时向下倾斜
    
    // 添加一点左右摇摆
    const tiltZ = Math.sin(this.angle * 2) * 5;
    
    this.el.setAttribute('rotation', {
      x: tiltX, 
      y: rotationY, 
      z: tiltZ
    });
  }
});

// 文档加载后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 获取蝴蝶元素
  const butterfly = document.getElementById('butterfly');
  
  // 应用飞行组件
  if (butterfly && !butterfly.hasAttribute('butterfly-flight')) {
    butterfly.setAttribute('butterfly-flight', '');
  }
});