# 修改日志

## 2026-10-19

### 调整
- 统一五个 Quick questions：首次通过 AI 回答，成功后在当前标签页会话中缓存；重复点击立即定位已有回答，不重复请求、动画或消耗问答次数。刷新保留，New chat 清空；失败可重试。
- 移除 Projects、Skills 首次请求绕过 AI 的固定回复；从详情页返回 Projects 复用同一预设缓存。
- Profile Card 与 Contact Card 统一白底浅色边框，移除暗色阴影；Contact 移除 GET IN TOUCH 与重复引导段落。
- Profile Card 更换为用户提供的完整 JPG 原照，保留背景与完整比例。

### 文档
- 记录独立域名 `hongxiangwang1017.com` 的上线验收：主站 HTTPS、HTTP/www 跳转与 Projects 交互已验证。
- 记录证书自动续期演练通过，Nginx、Docker 和容器自动恢复配置已核对；尚未进行整机重启验收。
- 明确真实 AI 问答仍因 `401 / invalid_api_key` 受阻，JChatMind 新服务器 Demo 尚未部署，避免把静态卡片正常误认为完整 AI 链路上线。

## 2026-10-15

### 新增
- Projects 增加 Portfolio 卡片，使用倾斜的首页截图，与其他项目卡片统一，点击在当前标签页返回首页，不新增详情页。

### 调整
- 项目卡片顺序调整为 Portfolio、JChatMind、Lyntra，其余项目顺延。
- 首页五个 Quick questions 入口改为图标在左、文字在右的白底细边框圆角按钮，移除原卡片玻璃效果与厚阴影。
- 复用聊天页 SVG 线框图标：笑脸、公文包、叠层、礼花、联系人搜索，保留对应配色。
- 调整字号、图标大小、间距及键盘焦点；窄屏保留横向滚动，原跳转行为不变。
