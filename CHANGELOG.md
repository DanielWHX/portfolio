# 修改日志

## 2026-10-28 · v0.2.4 — Refined Visuals & Motion

### 全端视觉更新

- 保留封面页，统一聊天区的 system sans 字体、黑灰信息层级、borderless 内容、轻灰输入框、深色发送按钮及线性图标；适配桌面和 320px / 390px 手机布局。
- Me、Projects、Skills、Fun Facts、Contact 五个入口保留细边框和彩色图标；Projects 恢复蓝色渐变与倾斜截图，轮播箭头移到标题旁；Me 的 Fitness / SaaS companies 标签使用柔和绿紫色。
- Skills 深蓝突出 Python、Java、Spring Boot、Flask、RAG、LLM Integration、Tool Calling；浅蓝强调 Spring AI、TypeScript、React、PostgreSQL、pgvector、Docker。Soft Skills 与其他常规标签统一，视觉强调不代表熟练度评分。

### AI 动画与交互优化

- AI 按钮静止时保留晶莹泡泡与四角星；hover 或键盘 focus 时切换到粉蓝液体动画，鼠标停止移动后继续循环，移开自然回到星星。
- 使用用户提供切片中重复的一圈：15 帧、1.5 秒循环、显示帧率插值，呈现 S 形卷曲与饱满圆球的变化；单张 WebP 图集约 56 KB。素材只含球体，来源与生成说明见 `public/ai/README.md`。
- 保留追问折叠、五个入口的弹性联动、两颗尾巴圆点和固定点击范围；加载中 / 失败、触屏及 reduced motion 保留静态入口，失焦和卸载停止动画。
- 回答以完整文字轻浮淡入，取消逐字等待；缓存和刷新恢复不重复播放，继续保留回答缓存、项目关联追问及取消过时请求。

### 内容与体验细化

- Big Three Record 移除小游戏、计分和主题效果，改为 borderless 视频选项卡：Squat 200 kg、Bench press 160 kg、Deadlift 200 kg，560 kg 合计紧邻标题。
- 三段训练视频按需加载、完整显示纵向画面，切换 / 关闭暂停；保留原生控件、键盘操作、失败回退、弹窗焦点和草稿恢复。照片及视频弹窗打开时暂停追问。
- Whatnot 使用黄色标识；Contact 复制成功仅显示对勾，按钮尺寸不跳动，无额外成功提示，失败时保留手动复制说明。
- 新增仅开发环境开放的 `/preview/chat`，集中展示最终卡片与交互；预览使用标明的示例内容，不请求模型，生产环境返回 404。

### 验证与发布

- 发布复验：构建、TypeScript、30 项 mock API 与 92 项浏览器回归通过；ESLint 无错误，保留 3 条已有图片警告。覆盖缓存 / 刷新、项目追问、照片 / 视频弹窗、球体循环与加载降级、复制反馈及手机布局。未执行真实模型或生产服务器验收。
- 本次发布范围为 GitHub 源码、版本 Tag 与 Release；服务器部署另行执行，不代表线上网站已更新。

## 2026-10-26 · v0.2.3

### Fun Facts 更新

- 以用户提供的跳伞照片开场，保留完整比例；AI 简介请求精简为两句、最多 300 字符，Big Three Record、LeetCode、Whatnot 和 Footprints 入口保留在下方。
- 照片、简介、入口分层轻浮入场；简介取消逐字动画，恢复缓存不重复入场，旧简介下一次点击时仅刷新一次。
- 照片支持从原位置放大、关闭返回；Escape、关闭按钮及背景点击均可退出并恢复焦点，聊天草稿与滚动位置保留。照片和小游戏打开时暂停追问。

### AI 按钮更新

- You could ask 可折叠为仅含四角星的晶莹玻璃泡泡，展开 / 收起时五个快捷入口同步弹性左移 / 右移；折叠后六个控件同排并限制在输入框宽度内。
- 透明玻璃壳、细虹彩边缘、轻高光和小星芒；内外光圈持续缓慢流动，hover 表面轻微磁吸、拉伸并弹回，48px / 44px 点击区域保持固定。
- 修复原有两颗尾巴圆点被折叠 clip 裁切的问题；折叠不额外调用 API，保留问题引用、草稿、回答缓存与问答次数。触屏不启用磁吸，reduced motion 停止相关动效。
- 视觉参考：[Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials)、[Codrops Magnetic Buttons](https://tympanus.net/codrops/2020/08/05/magnetic-buttons/)。未新增动画依赖。

### 预览与发布

- `/preview/fun-facts` 和 `/preview/followups` 提供标明示例文案的开发预览，不调用 AI；生产环境均返回 404。
- GitHub 源码版本发布；服务器部署单独执行和记录，该 Release 不代表服务器已更新。
- 验证：build、TypeScript、30 项 API 检查、88 项页面回归全部通过；lint 无错误、6 条已有图片警告。API 使用 mock，未宣称真实模型或生产环境验收通过。页面导航过程中仍观察到 Vinext 视频流 Premature close 日志，页面检查均通过。

## 2026-10-24

### 资料与入口
- Fun Facts 的 Whatnot 入口接入用户提供的账号链接，替代 Coming soon；原有合作流水与利润、个人收入边界保持不变。
- Agent 与 Fun Facts 追问资料补充 Apex Legends，以及用户自述的历史最高 Diamond I；不推断当前段位、赛季、平台或玩家 ID，Profile Card 保持不变。
- 更新 Fun Facts 缓存版本；旧摘要保留可读，下一次点击刷新一次，之后继续复用缓存。
- 验证：build、TypeScript、29 项 API 回归、6 项浏览器回归通过（含手机布局与缓存刷新）；lint 无错误、保留 6 项已有图片警告。API 回归使用模拟模型响应。
- 本次范围为 GitHub 更新；服务器部署另行执行和记录。

## 2026-10-23 · v0.2.2

- 将 40 道面试题整理为服务端英文公开问答快照，保留稳定 ID、项目、主题、中英关键词和事实边界；Notion 原文、中文备考备注不入库，运行时不访问 Notion。用户本日要求发布新版追问，整理后的快照随本版本公开；该授权不代表逐题审阅记录，见 [内容说明](docs/question-bank-review.md)。
- You could ask 在相关题目可用时用一次模型请求生成「题库启发 + 对话延伸」两问；Projects 停稳后的卡片和明确跨项目提问更新关联，Skills 优先项目题、Me 可参考行为题，Fun Facts / Contact 保持原方向。
- `/api/followups` 兼容原 questions 并附可选 questionIds；`/api/chat` 校验项目与题目引用，向原 Resume Agent tool 补充最多四条相关问答。按 ID、主题、关键词及相似文本排除近期/已问题目，手动输入也参与角度排除。
- 个人与团队、did / would、历史 Bug 与个人修复、未测量的规模与性能保持区分；回答默认 2–4 句，后续问题再深入。真实模型复测修正了不确定归属被说成确定否认、拟议恢复被说成现有机制的措辞。
- 保留原位置、轻浮上升动画、New ideas、preset cache、刷新恢复、取消过时请求、失败不阻断聊天及小游戏隔离。浏览项目不新增消息、不消耗问答次数、不重新生成主回答。
- Build、TypeScript、29 项 API 检查和 71 项浏览器回归通过；最后追问文本校验调整后，相关 12 项浏览器检查再次通过。ESLint 无错误，仅 6 条既有原生图片建议。真实本地 API 已验证项目题、SSE、中文跨项目和事实边界；遇到间歇性网络连接失败，已记录；成功重试不计为首次全程通过。答案快照未进入浏览器 JS。
- 本次发布包含此前 v0.2.1 的钢铁水泥健身房、动画与三段训练视频，以及新版题库追问。GitHub 与服务器的实际结果在完成后分别记录；此前开发验证属于历史记录，不替代本次复验。
- 最后定点真实检查通过：补齐 dropped/restarted 等关键词后，恢复话题延伸到拟议 idempotency；中文冲突问题后的两条建议均使用中文，并排除已问的冲突处理角度。

### GitHub 发布

- [PR #21](https://github.com/DanielWHX/portfolio/pull/21) 已合并，功能提交 `56680e3`；[v0.2.2 Release](https://github.com/DanielWHX/portfolio/releases/tag/v0.2.2) 已发布。同日已通过候选验收并部署到服务器，详见 [部署记录](docs/deployment-v0.2.2.md)。

### 本次发布复验

- 隔离发布 checkout 的 Build、TypeScript、29 项 API 检查和 71 项本地浏览器回归通过；ESLint 无错误，6 条既有原生图片建议。涵盖钢铁水泥效果、三段视频、手机窗口、缓存、跨项目和过时请求取消。
- 本机真实追问测试返回 502；直接经发布版 Worker 复现为连接 OpenAI 失败（network，未收到 HTTP 响应），不能记为真实模型通过。服务器候选环境须在切换前完成新版追问与答案边界验收。

### 服务器上线

- 17:44（北京时间）正式网站切至功能提交 `56680e3` / v0.2.2，镜像 `bc9685274000` healthy；保留 1 GiB 限额、loopback 3000、原私密配置与 JChatMind Demo 地址。
- 新版追问与回答在候选环境六次真实请求全部返回 200；公网追问返回题目 ID 并能点击引用继续回答。确认跨项目、消息级 SSE、个人贡献归属不确定性和拟议恢复边界，未将本地网络失败隐藏为成功。
- 首页、聊天、健身房和 JChatMind 项目页 HTTPS 200；默认钢铁水泥主题、三段视频及封面等 13 个素材与源文件 SHA256 一致。视频 Range 目前返回 200，未宣称额外验证 seeking。
- 内部候选容器已清理；旧镜像、配置和回滚脚本保留。临时 SSH 已撤销，独立重连被拒绝，本地临时私钥已删除。
- 公网视觉复查未确认：主站浏览器接管超时，Demo 访问此前被自动审批拒绝；本地 71 项浏览器回归与公网 HTTP/API 验收分别记录。

## 2026-10-22 · v0.2.1

- Big Three Record 取代用户可见的 TopGym 名称；Fun Facts 的游戏入口改为独立原生 dialog，避免聊天消息区高度和 You could ask 挤压游戏。打开时收起追问并取消待生成请求，关闭或 Escape 返回原位置和焦点。
- 最终选定 Iron & Concrete 钢铁水泥版，作为聊天游戏窗口与独立 `/gym` 的默认样式；操作台改为分段能量灯、圆形实体蓄力按钮和三次完成指示，保留原有判定区间、输入归属及取消保护。带 `theme` 参数的地址保留两套设计对比。
- Iron & Concrete 使用冷灰混凝土、钢铁和暖色压力灯；发力与成功时产生有限震动和临时地面裂纹。Impact 开关及 reduced-motion 均可关闭效果，失焦、视频和导航会清理状态，表现效果不修改计分。
- 接入用户提供的深蹲、卧推、硬拉三段真实视频，保留完整纵向画面与原音轨、faststart 和封面。场景电视按当前动作打开播放器；默认静音、不自动播放、按需加载。嵌套视频关闭后暂停并回到游戏，不连带关闭外层窗口。
- 资料更新视频可用状态与路径，不将画面当作重量的独立认证。三段视频均已通过浏览器实际解码检查。
- 版本：用户所称「0.21」按项目版本规范记录为 `0.2.1`，同步 package.json、lockfile、Changelog 与 GitHub Release。本次发布范围为 GitHub，服务器部署另行执行。
- 本次 Build、TypeScript、22 项 API 检查与 66 项浏览器回归均通过，包括默认钢铁水泥主题、桌面/手机遮挡修复、视频实际解码、缓存及效果开关；预览阶段另完成 8 项 Iron 冲击/清理检查。

## 2026-10-21 · v0.2.0

### 资料与发布
- Agent 增加 Luca：比熊，2026-10-21 记录时 11 岁；不推算生日或永久固定年龄，Profile Card 保持不变。
- v0.2.0 汇总当天的像素健身房、TopGym 精简、Fun Facts 总结入口与个人资料更新；密钥、生成目录和本地测试产物不进入 Git。

### 生产上线验收
- [PR #17](https://github.com/DanielWHX/portfolio/pull/17) 与 [PR #18](https://github.com/DanielWHX/portfolio/pull/18) 已合并。v0.2.0 已上线至 [正式网站](https://hongxiangwang1017.com/chat)，功能来源 `36e6ab6cd94fe426d8f61f464187a8b258cd7264`；Linux 构建补齐 lockfile 缺项并沿用 Node 部署配置，本次一并提交两处构建修正。
- 生产镜像 `3897eb27c2a3` 健康运行；保留 `127.0.0.1:3000`、1GiB 内存、`unless-stopped` 与原服务器凭据。首页、聊天页、`/gym` 和 7 张像素素材 HTTPS 200，HTTP/www 返回 301。
- 公网真实 AI 验证 Fun Facts 总结及四入口、Luca 的比熊品种和带日期年龄记录；Me 仍只显示原有两个兴趣标签，未加入宠物或家庭资料。
- 公网首次 Fun Facts、重复点击、刷新后再次点击合计仅 1 次 `/api/chat`；TopGym 完成三次举重并点亮三颗星，游戏操作新增 API 请求为 0。
- 新旧两个测试容器均已清理；临时 SSH 公钥已从服务器撤销，原有登录配置保留。旧镜像、配置、构建补丁、回滚脚本及真实验收结果保存在服务器 `/home/ubuntu/deploy-backups/portfolio-20261021-v020`。详见 [部署记录](docs/deployment-v0.2.0.md)。

### Fun Facts 总结与入口
- Fun Facts 先展示基于新公开资料生成的 AI 总结，再显示紧凑的 TopGym、LeetCode notes、Whatnot 和 Footprints 入口；TopGym 点击展开，Whatnot 与旅行足迹标记 Coming soon。
- TopGym 移除旧名称、kicker、tagline、footer 与可见操作说明；THE BIG THREE / 560 kg 成为主标题，计数和完成效果改为标准五角星。
- Agent 增加 ENTP 自述、好奇心、多角度思考、跨地区交流、旅行/跳伞/滑雪/游戏/朋友/LeetCode，以及大学 Whatnot 合作经历。22,000 美元最高月流水和150,000美元总流水严格区分利润、个人收入与持股。
- 国籍、成长地、高中、家庭和内容偏好仅在直接相关提问时提供给 Agent，不加入 Profile Card、Fun Facts 总结或主动追问；前端产物检查未含这些背景值。高中保留原始「二中」，不猜学校全称。
- 旧 Fun Facts 缓存保留可读历史，下一次点击时为扩展后的资料刷新一次；之后重复点击和刷新仍复用新总结。LeetCode 使用用户提供的 Notion 链接，未宣称已读取笔记内容。
- 开发验证：Build、TypeScript、22 项 API 检查、57 项浏览器检查通过；ESLint 无错误、6 条原生图片建议。真实 AI Fun Facts 返回 200，生成多角度思考、兴趣、跨地区交流与 Whatnot 经历的总结；桌面和手机预览已检查。后续生产结果见本日「生产上线验收」。

### Kirby’s Gym 本地版本
- Fun Facts 增加与现有白色细边卡片协调的 2D 像素健身房；深蹲、卧推、硬拉和休息可切换，蓄力进入薄荷绿色区间后松开，三次成功完成一组并显示星星。
- 展示已确认的深蹲 200 kg、卧推 160 kg、硬拉 200 kg；560 kg 仅为三项数值相加。资料同时提供给 AI，不虚构训练经历、体重、比赛成绩或视频。
- 保留首次 AI、后续 cache 规则，并兼容已保存的文字 Fun Facts；卡片恢复后仍可操作。游戏本身不调用模型，独立 `/gym` 无需 API Key 即可试玩。
- 支持键盘、鼠标及手机长按；失焦、触摸取消和切换动作会取消未完成的举重。支持 reduced-motion。真实举重视频尚未提供，电视仅保留后续入口的视觉位置。
- 此阶段本地验证：Build、TypeScript、22 项 API 检查及 54 项浏览器回归通过；ESLint 无错误，有 6 条原生图片建议。手机与桌面布局已检查；后续调整和生产验收见本日上方记录。

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
