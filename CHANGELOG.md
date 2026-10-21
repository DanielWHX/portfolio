# 修改日志

## 2026-10-21 · v0.2.0

### 资料与发布
- Agent 增加 Luca：比熊，2026-10-21 记录时 11 岁；不推算生日或永久固定年龄，Profile Card 保持不变。
- v0.2.0 汇总当天的像素健身房、TopGym 精简、Fun Facts 总结入口与个人资料更新；密钥、生成目录和本地测试产物不进入 Git。

### Fun Facts 总结与入口
- Fun Facts 先展示基于新公开资料生成的 AI 总结，再显示紧凑的 TopGym、LeetCode notes、Whatnot 和 Footprints 入口；TopGym 点击展开，Whatnot 与旅行足迹标记 Coming soon。
- TopGym 移除旧名称、kicker、tagline、footer 与可见操作说明；THE BIG THREE / 560 kg 成为主标题，计数和完成效果改为标准五角星。
- Agent 增加 ENTP 自述、好奇心、多角度思考、跨地区交流、旅行/跳伞/滑雪/游戏/朋友/LeetCode，以及大学 Whatnot 合作经历。22,000 美元最高月流水和150,000美元总流水严格区分利润、个人收入与持股。
- 国籍、成长地、高中、家庭和内容偏好仅在直接相关提问时提供给 Agent，不加入 Profile Card、Fun Facts 总结或主动追问；前端产物检查未含这些背景值。高中保留原始「二中」，不猜学校全称。
- 旧 Fun Facts 缓存保留可读历史，下一次点击时为扩展后的资料刷新一次；之后重复点击和刷新仍复用新总结。LeetCode 使用用户提供的 Notion 链接，未宣称已读取笔记内容。
- 本次验证：Build、TypeScript、22 项 API 检查、57 项浏览器检查通过；ESLint 无错误、6 条原生图片建议。真实 AI Fun Facts 返回 200，生成多角度思考、兴趣、跨地区交流与 Whatnot 经历的总结；桌面和手机预览已检查。仅更新本地预览，服务器尚未部署。

### Kirby’s Gym 本地版本
- Fun Facts 增加与现有白色细边卡片协调的 2D 像素健身房；深蹲、卧推、硬拉和休息可切换，蓄力进入薄荷绿色区间后松开，三次成功完成一组并显示星星。
- 展示已确认的深蹲 200 kg、卧推 160 kg、硬拉 200 kg；560 kg 仅为三项数值相加。资料同时提供给 AI，不虚构训练经历、体重、比赛成绩或视频。
- 保留首次 AI、后续 cache 规则，并兼容已保存的文字 Fun Facts；卡片恢复后仍可操作。游戏本身不调用模型，独立 `/gym` 无需 API Key 即可试玩。
- 支持键盘、鼠标及手机长按；失焦、触摸取消和切换动作会取消未完成的举重。支持 reduced-motion。真实举重视频尚未提供，电视仅保留后续入口的视觉位置。
- 本地开发验证：Build、TypeScript、22 项 API 检查及 54 项浏览器回归通过；ESLint 无错误，有 6 条原生图片建议。手机与桌面布局已检查。本次尚未部署到服务器。

## 2026-10-19

### AI 追问
- 采用已选定的「轻浮上升」方案：两条追问置于五个 Quick questions 上方，保留浅蓝细边、轻量思考气泡尾与错开入场；时长采用预览中调整的 400ms，支持手机和 reduced-motion。
- Me、Projects、Skills、Fun Facts 的追问通过独立 `/api/followups` 实时生成，根据当前栏目、已确认资料及最近对话提问，并排除近期重复；New ideas 可换一组，点击问题继续普通对话。
- 主回答 cache 保持立即恢复；追问异步更新，不重复生成主回答，不占用问答次数。切换栏目与 New chat 取消过时请求；Contact 和达到上限时隐藏。
- 修正本地 API 配置说明：Cloudflare dev 使用根目录 `.dev.vars`；自动化测试为 mock，不能作为真实 API 已连通的证据。
- 本次开发验证：Build、TypeScript、22 项 API 检查及 45 项浏览器回归通过；ESLint 无错误，仅有 3 条既有图片建议。桌面与手机截图已检查。
- 开发时本地服务未配置 `OPENAI_API_KEY`，真实请求返回 503；本次生产环境已复用服务器凭据完成真实模型验收。

### AI 追问上线验收
- [PR #17](https://github.com/DanielWHX/portfolio/pull/17) 分支的运行代码 `25959dd` 已部署到 [主站](https://hongxiangwang1017.com/chat)，生产镜像 `b1864f148677` 健康运行，保留 1GiB 内存限制；PR 尚未合并到 `main`。
- 切换前，内部候选容器通过真实 Projects 追问、带 exclude 的换组及普通问答；四条候选问题不重复。切换后公网 Skills 追问返回 200、两条有效问题，本次约 2.3 秒；首页和聊天页均为 HTTPS 200。
- 公网浏览器已验证两条建议、New ideas 换组、点击建议继续真实问答，以及 Contact 隐藏建议；线上 CSS 确认使用 400ms 入场动画。
- 独立标签页的首次 Projects、New ideas、再次 Projects 合计新增 1 次 `/api/chat` 和 3 次 `/api/followups`，证明主回答继续复用 cache。
- 旧生产镜像和部署配置保存在服务器 `deploy-backups/portfolio-20261019-25959dd`，可通过固定 rollback tag 恢复；真实 API 证据和请求计数留在该目录，凭据未进入 Git。
- 收尾待办：OrcaTerm 会话再次过期并要求微信 MFA，内部测试容器 `portfolio-candidate-25959dd` 暂保留在 `127.0.0.1:3002`；再次验证后停止并移除该容器即可，不影响已验收的正式网站。

### 上线验收
- [PR #16](https://github.com/DanielWHX/portfolio/pull/16) 已合并，功能提交 `d4be690` 已部署到 [主站](https://hongxiangwang1017.com/)；生产容器健康，旧镜像与部署配置已备份。
- 公网五个预设首次真实 AI 请求全部返回 200；反复点击及刷新后复用缓存，验收期间请求总数保持为 5，未新增重复回答。
- 主站与聊天页 HTTPS、新头像及 HTTP/www 跳转已验证；公网 JPG 与提供的原照内容一致。

### 调整
- 统一五个 Quick questions：首次通过 AI 回答，成功后在当前标签页会话中缓存；重复点击立即定位已有回答，不重复请求、动画或消耗问答次数。刷新保留，New chat 清空；失败可重试。
- 移除 Projects、Skills 首次请求绕过 AI 的固定回复；从详情页返回 Projects 复用同一预设缓存。
- Profile Card 与 Contact Card 统一白底浅色边框，移除暗色阴影；Contact 移除 GET IN TOUCH 与重复引导段落。
- Profile Card 更换为用户提供的完整 JPG 原照，保留背景与完整比例。

### 文档
- 记录独立域名 `hongxiangwang1017.com` 的上线验收：主站 HTTPS、HTTP/www 跳转与 Projects 交互已验证。
- 记录证书自动续期演练通过，Nginx、Docker 和容器自动恢复配置已核对；尚未进行整机重启验收。
- 首次域名验收曾记录真实 AI 的 `401 / invalid_api_key` 问题；凭据另行更新后，本次上线已验证真实问答恢复。JChatMind 新服务器 Demo 尚未部署。

## 2026-10-15

### 新增
- Projects 增加 Portfolio 卡片，使用倾斜的首页截图，与其他项目卡片统一，点击在当前标签页返回首页，不新增详情页。

### 调整
- 项目卡片顺序调整为 Portfolio、JChatMind、Lyntra，其余项目顺延。
- 首页五个 Quick questions 入口改为图标在左、文字在右的白底细边框圆角按钮，移除原卡片玻璃效果与厚阴影。
- 复用聊天页 SVG 线框图标：笑脸、公文包、叠层、礼花、联系人搜索，保留对应配色。
- 调整字号、图标大小、间距及键盘焦点；窄屏保留横向滚动，原跳转行为不变。
