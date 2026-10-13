# 招聘信息聚合平台（JobHub）

## 产品定位
面向想换工作、缺少招聘信息来源的人群，聚合政府机构、事业单位、央企国企、劳务派遣、外包等岗位的招聘信息。核心价值：**帮你发现信息差、不错过报名机会**。

## 设计规范

### 色彩系统
- 主色（Primary）：深蓝 `#1e40af` — 专业、可信赖，用于导航、按钮、重点标签
- 主色浅：`#3b82f6` — hover 状态、渐变辅助
- 主色背景：`#eff6ff` — 选中态、徽标背景
- 强调色（Accent）：橙红 `#ef4444` — 倒计时、紧急提醒、临期标签
- 强调色背景：`#fef2f2`
- 成功色：`#10b981` — 会员、认证
- 成功色背景：`#ecfdf5`
- 文字主色：`#111827`（gray-900）
- 文字次色：`#6b7280`（gray-500）
- 文字辅助：`#9ca3af`（gray-400）
- 边框色：`#e5e7eb`（gray-200）
- 分割线：`#f3f4f6`（gray-100）
- 背景色：`#f9fafb`（gray-50）
- 卡片背景：`#ffffff`

### 排版
- 字体：系统默认 sans-serif
- 标题层级：
  - H1：24px / font-bold / leading-tight（页面大标题）
  - H2：20px / font-semibold（区块标题）
  - H3：18px / font-semibold（卡片标题）
  - H4：16px / font-semibold（小标题）
- 正文：14px / font-normal / leading-relaxed
- 辅助文字：12px / font-normal
- 数字强调：font-semibold / tabular-nums

### 间距系统
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px
- 3xl: 48px

### 布局
- 最大内容宽度：1200px，居中
- 页面左右内边距：移动端 16px，桌面端 24px
- 卡片圆角：8px（rounded-lg）
- 按钮圆角：6px（rounded-md）
- 阴影：卡片 `shadow-sm`，hover `shadow-md`

### 组件规范
- **岗位卡片**：白色背景 + 浅边框 + rounded-lg，hover 阴影加深，左侧可加类型色条
- **标签（Badge）**：小圆角 px-2 py-0.5 text-xs font-medium
  - 公务员：bg-blue-100 text-blue-700
  - 事业单位：bg-purple-100 text-purple-700
  - 央企国企：bg-amber-100 text-amber-700
  - 劳务派遣：bg-green-100 text-green-700
  - 外包：bg-gray-100 text-gray-700
- **倒计时**：橙红色背景 + 白色数字，临期（≤3天）用红色强提醒，≤1天闪烁感
- **筛选器**：白底浅边框，行内排列，选中态用主色背景 + 白色文字
- **按钮**：
  - 主按钮：bg-primary text-white，hover 加深
  - 次按钮：border border-gray-300 bg-white text-gray-700
  - 文字按钮：text-primary hover:bg-primary-50

## 功能模块

### 1. 首页 / 岗位列表页
- 顶部导航：Logo、搜索入口、会员中心、登录注册
- Hero 区：大标题 + 价值主张 + 主搜索框
- 快速筛选栏：岗位类型 tab
- 高级筛选：地区、学历、发布时间
- 岗位卡片列表：职位名、单位、类型标签、地区、学历、截止时间（倒计时）、来源
- 分页加载

### 2. 职位详情页
- 基本信息区：标题、单位、地点、学历、人数、报名时间
- 倒计时横幅 + 投递提醒按钮（会员功能）
- 职位描述与要求
- 公告原文链接
- 相关推荐

### 3. 会员订阅页
- 免费版 vs 专业版对比卡片
- 套餐选择（月/季/年）
- 权益说明列表
- 订阅按钮

### 4. 登录注册
- 弹窗形式
- 手机号 + 验证码
- 登录/注册切换

## 技术架构
- 前端：React + Tailwind + shadcn/ui
- 后端：NestJS，提供岗位列表、详情、筛选接口
- 数据：示例数据（内存 mock），展示产品形态
