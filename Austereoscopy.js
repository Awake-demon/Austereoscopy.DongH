/* 全局变量，calcOffset函数内更新 */
var offsetX = 0;
var offsetY = 0;
var deg = 0;

period = 40; ax = 10; ay = 10; // 自定义x、y方向上的加速度，period表示刷新周期(ms)
xmax = document.documentElement.clientWidth - 50;
ymax = document.documentElement.clientHeight - 50;
keyControl = false;
ballInterval = null;

window.addEventListener('keydown', (e) => {
  if (e.key == '\`') {
    if(!keyControl) {
      document.body.style.setProperty('cursor', 'none');
      document.onmousemove = function(e) {
        var title = document.getElementById('title');
        beta = (title.getBoundingClientRect().y + title.clientHeight / 2 - e.pageY);
        gamma = (title.getBoundingClientRect().x + title.clientWidth / 2 - e.pageX);
        calcOffset(beta / ymax * 90, gamma / xmax * 180);
        console.log(`${offsetX}, ${offsetY}`)
        document.getElementById('info').style.opacity = 0.4;
        refreshScreen();
      }
    } else {
      document.body.style.setProperty('cursor', 'auto');
      document.onmousemove = null;
      offsetX = 0;
      offsetY = 0;
      document.getElementById('info').style.opacity = 1;
      refreshScreen();
    }
    keyControl = !keyControl;
  }
});

// 检查手机是否支持
if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', (event) => {

    if (event.alpha == null) {    // PC端提示
      info = document.getElementById('info');
      info.innerHTML = 'DeviceOrientation接口回传的数据为空<br\>点击“~”键开始监听鼠标位置';
      info.setAttribute('class', 'show');
      return;
    }
    
    /* 根据beta和gamma值的变化更新偏移值 */
    calcOffset(event.beta, event.gamma);
    
    /* 显示当下的值 */
    document.getElementById('alpha').innerHTML = 'x = ' + (event.alpha).toFixed(2); // 东南西北朝向，正北为360/0
    document.getElementById('beta').innerHTML = 'y = ' + event.beta.toFixed(2); // 手机竖向立倒
    document.getElementById('gamma').innerHTML = 'z = ' + (event.gamma).toFixed(2); // 手机横向立倒    
    document.getElementById('deg').innerHTML = 'deg = ' + -( deg + 45 ).toFixed(2); // 相对x轴夹角
    // 显示当前的各项数据
    spans = document.getElementsByTagName('span');
    for (item of spans)
      item.setAttribute('class', 'show');
    
    // 更新屏幕显示内容
    refreshScreen();
  }, false);
} else {
    alert('您的浏览器不支持DeviceOrientation接口');
}

function refreshScreen() {
  /* 根据偏移量的变化改变阴影位置 */
  title = document.getElementById('title');
  title.style.setProperty('--shadow-x', `${offsetX * 15}px`); // 数值范围：-90~90
  title.style.setProperty('--shadow-y', `${offsetY * 15}px`); // 数值范围：-180~180    
  title.style.setProperty('--deg-x', `${-offsetY * 20}deg`);
  title.style.setProperty('--deg-y', `${-offsetX * 40}deg`);

  /* 根据偏移量的变化改变小球位置 */    
  ball = document.getElementById('ball');
  ball.setAttribute('class', 'ball');  // 显示小球
  ball.style.setProperty('--deg', `${deg}deg`);
  if ( ballInterval == null )
    ballInterval = setInterval(function() {
      // 获取原位置，根据偏移量计算新位置
      ballX = Number(ball.style.getPropertyValue("--ball-x").replace(' ','').replace('px','')) + ax * offsetX;
      ballY = Number(ball.style.getPropertyValue("--ball-y").replace(' ','').replace('px','')) + ay * offsetY;
      // 刷新小球位置，并防止小球越界
      ball.style.setProperty('--ball-x', `${ballX < 0 ? 0 : (ballX > xmax ? xmax : ballX)}px`);
      ball.style.setProperty('--ball-y', `${ballY < 0 ? 0 : (ballY > ymax ? ymax : ballY)}px`);
  }, period);
}

function calcOffset(beta, gamma) {
  offsetX = Math.sin(( Math.abs(beta) < 90 ? gamma : -gamma ) * Math.PI / 180 );  // - 90 < beta < 90 时，手机朝上
  offsetY = Math.sin( beta * Math.PI / 180 );
  
  // 这里需要用到你小学二年级学过的直角坐标转极坐标的方法
  // 最后的-45是为了让箭头初始指向x轴正方向
  // css的rotate()函数旋转的方向和极坐标系是相反的
  // 同样，text-shadow阴影的offsetY也与y轴是相反的
  deg = -Math.atan( -offsetY / offsetX ) * 180 / Math.PI + ( offsetX < 0 ? -180 : 0 ) - 45;
}
