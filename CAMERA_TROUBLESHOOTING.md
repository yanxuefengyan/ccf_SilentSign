# 摄像头故障排查指南

## 问题描述
在使用 SilentSign 项目时，点击"启动摄像头"按钮后，摄像头无法正常启动。

## 故障排查步骤

### 1. 检查浏览器支持
**问题**: 浏览器不支持 getUserMedia API

**解决方案**:
- 使用最新版本的 Chrome、Firefox 或 Edge 浏览器
- 检查浏览器版本是否过旧
- 避免使用 IE 浏览器（不支持该功能）

**测试方法**:
打开浏览器控制台（F12），输入：
```javascript
console.log('支持getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
```

### 2. 检查摄像头权限
**问题**: 浏览器摄像头权限被拒绝

**解决方案**:
1. **Chrome浏览器**:
   - 点击地址栏左侧的锁形图标或摄像头图标
   - 选择"站点设置"
   - 将"摄像头"权限设置为"允许"
   - 刷新页面

2. **Firefox浏览器**:
   - 点击地址栏左侧的图标
   - 在"权限"中找到"使用摄像头"
   - 选择"允许"
   - 刷新页面

3. **Edge浏览器**:
   - 点击地址栏右侧的"..."菜单
   - 选择"网站权限"
   - 将"摄像头"设置为"允许"
   - 刷新页面

### 3. 检查摄像头硬件
**问题**: 摄像头设备未连接或驱动异常

**解决方案**:
1. **检查物理连接**:
   - 重新插拔USB摄像头
   - 确保笔记本摄像头开关已打开
   - 尝试连接到其他USB接口

2. **检查设备管理器** (Windows):
   - 按 Win + X，选择"设备管理器"
   - 展开"照相机"或"图像设备"
   - 查看是否有黄色感叹号或红色叉号
   - 右键选择"更新驱动程序"

3. **测试摄像头**:
   - Windows: 打开"相机"应用测试
   - 在线测试: 访问 https://webcamtests.com/

### 4. 检查应用占用
**问题**: 摄像头被其他应用占用

**解决方案**:
1. 关闭可能占用摄像头的应用：
   - 腾讯会议 / Zoom / Teams
   - Skype / 微信视频通话
   - OBS / 其他直播软件
   - 其他浏览器标签页

2. **Windows任务管理器检查**:
   - 按 Ctrl + Shift + Esc 打开任务管理器
   - 查找并结束占用摄像头的进程

### 5. 检查HTTPS连接
**问题**: 非HTTPS环境下摄像头权限受限

**解决方案**:
- 本地开发环境（localhost）已自动支持
- 如需远程访问，必须使用HTTPS协议
- 可以使用 ngrok 等工具创建HTTPS隧道

### 6. 检查防火墙和安全软件
**问题**: 安全软件阻止摄像头访问

**解决方案**:
1. 暂时禁用防火墙测试
2. 检查杀毒软件的摄像头保护功能
3. 将浏览器添加到白名单

### 7. 浏览器控制台错误信息

打开浏览器控制台（F12），查看具体错误信息：

**NotAllowedError**: 权限被拒绝
- 解决方法：参考步骤2

**NotFoundError**: 未找到摄像头设备
- 解决方法：参考步骤3

**NotReadableError**: 摄像头被占用
- 解决方法：参考步骤4

**OverconstrainedError**: 不支持请求的分辨率
- 解决方法：使用更低分辨率或不同的摄像头

**TypeError**: 请求格式错误
- 解决方法：刷新页面重试

## 优化建议

### 1. 使用我们改进的代码
我们已经对摄像头启动代码进行了以下优化：
- 自动检测可用摄像头设备
- 尝试多种分辨率配置
- 提供详细的错误信息和解决方案
- 增加10秒超时保护

### 2. 测试步骤
1. 打开 http://localhost:3000
2. 切换到"手语转语音"模式
3. 点击"📷 启动摄像头"按钮
4. 查看浏览器地址栏是否弹出权限请求
5. 选择"允许"
6. 观察页面提示和浏览器控制台信息

### 3. 如果问题依然存在
请提供以下信息以便进一步诊断：
- 操作系统版本
- 浏览器类型和版本
- 摄像头型号
- 浏览器控制台的完整错误信息
- 截图或录屏

## 快速测试脚本

在浏览器控制台中运行以下代码测试摄像头：

```javascript
// 测试摄像头访问
async function testCamera() {
    try {
        console.log('开始测试摄像头...');
        
        // 检查API支持
        if (!navigator.mediaDevices?.getUserMedia) {
            console.error('❌ 浏览器不支持getUserMedia API');
            return;
        }
        console.log('✅ 浏览器支持getUserMedia API');
        
        // 枚举设备
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        console.log(`✅ 找到 ${videoDevices.length} 个摄像头设备:`, videoDevices);
        
        // 请求摄像头
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('✅ 摄像头启动成功！');
        
        // 停止流
        stream.getTracks().forEach(track => track.stop());
        console.log('✅ 测试完成');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.name, error.message);
    }
}

testCamera();
```

## 联系支持
如果以上方法都无法解决问题，请：
1. 提交 GitHub Issue，附上详细的错误信息
2. 查看项目 README.md 获取更多帮助
3. 尝试使用项目的离线模式功能