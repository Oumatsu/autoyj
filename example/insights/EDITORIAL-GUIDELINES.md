# Youguard Insights — 内容创作方法论

> 适用范围：所有发布于 Youguard Insights Desk 的文章  
> 版本：v1.1 · 2026年5月

---

## 一、文章的根本目标

这些文章不是新闻报道，也不是学术论文。它们是面向非洲EV进口商和经销商的**内容营销文章**，服务于四个具体目标：

1. **SEO引流** — 通过高价值关键词被目标客户搜索发现
2. **专业感建立** — 让潜在客户相信Youguard懂这个行业
3. **持续引流** — 常青内容，长期被搜索和分享
4. **严谨态度** — 不为流量牺牲准确性，损害品牌信誉

优先级顺序：**严谨性 > 专业感 > 持续引流 > SEO**。  
严谨性是底线，其余三个在严谨的前提下追求最大化。

---

## 二、内容分类系统

| 文件夹 | 显示名称 | 内容方向 |
|--------|----------|----------|
| `policy-tariffs/` | Policy & Tariffs | 各国进口关税、EV政策、免税资格 |
| `market-analysis/` | Market Analysis | 市场宏观趋势、品牌格局、行业报告解读 |
| `sourcing-intelligence/` | Sourcing Intelligence | 采购实操：清关文件、港口、运输、车型选择 |
| `pricing-trade/` | Pricing & Trade | 价格趋势、汇率、运价、谈判策略 |
| `product-watch/` | Product Watch | 具体车型、电池技术、新品发布 |
| `operator-hub/` | Operator Hub | 经销商运营：售后、充电、客户管理 |

---

## 三、文件结构规范

每篇文章一个独立文件夹：

```
content/insights/[分类文件夹]/[文章slug]/
  article.md        ← 文章正文
  hero.jpg          ← 主图（本地下载）
  [其他图片].jpg    ← 正文内图（本地下载）
```

**文章slug命名规则：**
- 全小写，用连字符分隔
- 包含核心关键词
- 可以包含年份（`-2026`）增加时效性信号
- 示例：`kenya-ev-mobility-policy-2026`、`roro-vs-container`

---

## 四、文章MD格式模板

```markdown
# [标题]

**Category:** [分类显示名称]
**Date:** [月 日, 年]
**Read Time:** [N] min
**Tag:** [关键词1] · [关键词2] · [关键词3] · [关键词4]

---

![图片ALT描述](hero.jpg)
*图片说明文字——1-2句，补充背景信息*

---

## Overview

[3-5句摘要：这篇文章解决什么问题，对读者有什么具体价值]

---

## [H2 章节标题]

[正文内容]

---

![图片ALT描述](image.jpg)
*图片说明文字*

---

## [H2 章节标题]

[正文内容，可包含表格]

---

## Sources

- [来源机构] — [报告/文章名称]（年份）
- [来源机构] — [报告/文章名称]（年份）

[如需要，在Sources后、分隔线前加时效提示脚注]

---

*Published by Youguard Intelligence Desk · [月份] [年份]*
```

---

## 五、配图规范

### 配图工作流

Claude在生成文章内容的同时，为每张图片输出一条专属AI生图prompt。用户将prompt提交至图片生成工具出图，保存到文章文件夹。

| 工具 | 适用场景 | 成本 |
|------|----------|------|
| **DALL-E 3**（ChatGPT Plus） | 日常文章配图，快速出图 | 已含在订阅内 |
| **Midjourney** | Hero图或需要高质量精品图时 | 已含在订阅内 |
| Unsplash | 备选，AI出图效果不理想时 | 免费 |

### Claude输出的图片prompt格式

Claude为每张图生成英文prompt，包含以下要素：

```
[主体场景], [地理/文化背景], [光线/氛围], [摄影风格]

示例：
"Electric vehicle charging station on a commercial street in Nairobi Kenya, 
warm afternoon light, urban East Africa background, 
professional commercial photography, sharp focus"
```

| 文章主题 | Claude生成的prompt方向 |
|----------|----------------------|
| 埃塞俄比亚EV关税 | Ethiopia customs office / Djibouti cargo port with containers |
| 中国EV价格战 | Chinese EV factory production line, modern manufacturing |
| 东非港口指南 | Mombasa port aerial view / cargo ships East Africa coast |
| 售后零件供应 | Auto parts workshop Africa / vehicle maintenance technician |
| 充电基础设施 | Solar EV charging station East Africa / off-grid charging setup |

### ALT文本格式

格式：`[图片实际内容] representing [与文章的关联意义]`

```markdown
![Electric vehicle charging station in East Africa representing the infrastructure 
gap that fleet operators must plan around](hero.jpg)
```

### 图片说明文字（caption）

caption将图片锚定到文章语境，说明它在本文中代表什么：

```
*Nairobi's commercial districts are seeing the first wave of EV charging 
infrastructure investment — but coverage remains uneven across East Africa, 
making depot charging the only reliable solution for most fleet operators.*
```

### Product Watch类文章的特殊处理

涉及具体车型时，优先使用品牌官方新闻稿配图（注明图片来源）；无法获取时，用AI生图生成该车型类别的场景图。

### 图片数量要求

- 每篇至少2张（hero + 1张正文内图）
- 正文内图每隔2–3个H2章节插入一张，避免长段落无视觉间隔

---

## 六、信源标准

### 信源分级

| 级别 | 类型 | 使用方式 |
|------|------|----------|
| **一级** | 各国税务局/海关、港务局官网、品牌官方公告、IEA/UNCTAD等国际机构报告 | 可直接引用，注明来源 |
| **二级** | EV24.Africa、CnEVPost、BloombergNEF、AEMA报告、乘联会月报 | 标注"根据[来源]报道"，不升格为一级 |
| **三级** | Reuters、Bloomberg、SCMP、The East African、CNBC Africa等权威综合媒体 | 可作为来源，但须至少2个独立来源交叉核实，标注"据[媒体]报道" |
| **四级** | 编辑基于行业实践的综合估算 | 必须显式标注为"编辑估算"或"参考估算" |

**三级来源的使用条件：**
- 至少找到2个不同媒体机构的独立报道
- 同一媒体集团旗下不同子媒体不算独立来源
- 各来源描述有重大出入时，降级为"有报道称"并注明存疑

### 品牌官方来源

涉及具体车型规格、价格、售后政策时，优先查阅**Youguard当前在售品牌的官方网站**（以网站车型目录页为准，不固定罗列品牌名称）。品牌官方网站属于一级来源。

### 关键原则

**正确写法：**
> "According to EV24.Africa's reporting on Ghana's import framework, the zero-tariff exemption applies to..."

> "Reuters and Bloomberg both reported that..."（三级来源，需双源核实）

**错误写法：**
> "The Ghana Revenue Authority confirmed that..."（信源实为EV24.Africa，不可升格）

### 数据表格规则

- 数据来自一级来源 → 直接注明来源
- 数据为编辑综合估算 → 表格上方加中文免责声明
- 精确数字无一级来源 → 改为区间范围，注明"参考估算"

---

## 七、严谨性红线（禁止事项）

1. **虚构机构名称**  
   错误示例："Dubai Auto Parts Hub"  
   → 改为描述性语言："迪拜作为中东/非洲中国EV零件集散地"

2. **把低级来源升格为高级来源**  
   错误示例："GRA confirmed..."（信源实为EV24.Africa）  
   → 改为："According to EV24.Africa's reporting..."

3. **把政策草案写成已实施**  
   错误示例："Kenya's policy requires dealers to..."  
   → 改为："Kenya's emerging policy framework is expected to..."，并加核实提示

4. **把发布会规格当作量产规格**  
   → 必须注明："以上规格为展会公布数据，量产出口版本请向供应商确认"

5. **精确数字无来源**  
   → 加免责声明，改为估算区间

---

## 八、时效性管理

以下类型文章**必须**添加时效提示脚注：

| 文章类型 | 脚注要求 |
|----------|----------|
| 税率/关税 | 注明政策依据文件编号，建议读者向税务局核实 |
| 汇率计算 | 注明所用汇率和计算时间点 |
| 港口/清关时效 | 注明数据采集时间，建议向货代确认 |
| 海运时间 | 注明是否含红海改道影响 |
| 清关文件清单 | 注明整理时间，提示政策可能变化 |

**脚注写法示例：**
> *本文税率基于[政策名称/文件编号]（生效日期）整理。建议在正式下单前向[相关机构]确认当前有效税率。*

---

## 九、SEO要求

### 标题规则
- 包含核心关键词（地名 + EV + 具体主题）
- 长度：50–70字符（英文）
- 建议加年份：`...in 2026`、`...H1 2026`
- 具体优于泛化：❌ "Africa EV Market Update" → ✅ "Kenya's EV Import Duty in 2026: What Dealers Need to Know"

### 关键词策略
- 每篇聚焦1个核心关键词 + 2–3个长尾关键词
- 核心关键词出现在：标题、Overview第一句、至少一个H2标题、Tag字段
- Tag字段4个词组，每个都是独立可搜索关键词

### 内容深度
- 计划型文章：最低1500字
- 热点响应型文章：最低800字
- 每篇至少1个数据表格或数字清单

### 常青性优先
- 优先写指南、方法论类内容，而非纯新闻评论
- 时效性内容需加时效提示，不要包装成常青内容

---

## 十、写作风格

- **语气**：专业但不学术，实用导向，像行业内部人给同行写简报
- **读者预设**：非洲EV进口商/经销商，有行业经验，时间有限，要能直接用的信息
- **段落长度**：每段不超过4句，长内容用表格或列表拆解
- **语言**：正文主体英文（面向英语读者市场）；注释、免责声明、脚注可用中文
- **不写**：直接销售话术、对Youguard自身的推销、无来源的乐观预测

---

## 十一、选题来源与内容生产流程

### 信息源清单

**非洲EV专项（首要监控）**
- [EV24.Africa](https://ev24.africa) — 非洲EV政策、关税、市场动态
- [Africa E-Mobility Alliance](https://africaemobility.org) — 季度/年度系统性报告
- [FurtherAfrica](https://furtherafrica.com) — 非洲商业新闻，含EV/交通板块
- [CNBC Africa](https://cnbcafrica.com) — BYD/Chery在非动态常见于此

**中国EV动态**
- [CnEVPost](https://cnevpost.com) — 中国EV新闻英文版，价格战/政策变化首选
- [CarNewsChina](https://carnewschina.com) — 车型发布、出口数据
- [乘联会月报](https://www.cpcaauto.com) — 官方销量/均价数据，每月中旬发布
- [ChinaEV100](https://chinaev100.org) — 政策研究

**贸易与物流**
- [Freightos](https://freightos.com) — 运价指数，红海影响实时跟踪
- [Drewry](https://drewry.co.uk) — 集装箱运价报告
- [UNCTAD](https://unctad.org) — 东非港口数据权威来源

**宏观市场**
- [IEA](https://iea.org) — 年度Global EV Outlook，数据权威
- [BloombergNEF](https://about.bnef.com) — 电池成本、EV价格预测
- [S&P Global Mobility](https://spglobal.com/mobility) — 供应链分析

**热点新闻（可作为三级来源，须交叉核实）**
- [Reuters](https://reuters.com) — 贸易政策、关税变化快讯
- [Bloomberg](https://bloomberg.com) — 全球EV产业、中国出口、非洲投资
- [SCMP](https://scmp.com) — 中国对非出口、中非贸易摩擦
- [The East African](https://theeastafrican.co.ke) — 东非权威英文商业媒体
- [Business Day SA](https://businesslive.co.za) — 南非EV市场动态

**选题发现工具（不作为来源）**
- Google Trends — 查目标国家EV关键词搜索热度
- LinkedIn — 行业KOL动态，比媒体早1–2周反映新动向

---

### 两轨制内容生产

| | 计划型常青内容 | 热点响应型内容 |
|--|---------------|--------------|
| **触发** | 固定信息扫描 | 热点新闻随时触发 |
| **字数** | 1500–2500字 | 800–1200字 |
| **生产周期** | 按步骤完成，灵活安排 | 当天完成发布 |
| **结构** | 完整MD模板 | 精简版（Overview + 3节 + Sources） |
| **时效提示** | 按类型决定 | 必须添加 |

热点响应型文章不占计划型配额，是额外发布。

---

### 计划型内容生产步骤

**第一步：信息扫描**

按顺序检查以下信号，找到1–2个值得写的选题：

1. EV24.Africa 近期有没有新的非洲政策更新？
2. CnEVPost / CarNewsChina 有没有在售品牌的重要动态？
3. 乘联会有没有新月报？
4. Freightos 运价有没有明显波动（>15%视为值得写）？
5. 有没有非洲EV相关负面事件？（反向选题：Operator Hub类）
6. Google Trends 目标市场（Kenya / Ethiopia / Nigeria）有没有EV词突然放量？

**第二步：选题判断**

| 维度 | 问题 | 标准 |
|------|------|------|
| **相关性** | 非洲EV经销商会在意吗？ | 直接影响采购/运营决策 |
| **可写性** | 有没有足够来源？ | 至少2个二级及以上来源 |
| **类型** | 常青还是热点？ | 常青优先；热点走快轨 |

**第三步：撰写**

按第四节MD格式模板和第七节严谨性红线撰写。

**第四步：发布前自检**

按第十二节自检清单逐项核对后发布。

---

### 热点响应型生产步骤

**第一步：发现热点**

来源：Reuters / Bloomberg / SCMP / The East African 等，或行业群组转发的新闻。

**第二步：核实（最长1小时，超时放弃）**

1. 找到**2个以上独立媒体机构**报道同一事实（同集团子媒体不算独立）
2. 确认时间、机构名称、数字等要素各来源一致
3. 判断是否有一级来源（官方声明/公告）  
   — 有 → 直接引用一级来源  
   — 仅媒体报道 → 用"据[媒体]报道"，不做确定性陈述
4. 核实失败（来源不足/信息矛盾）→ 放弃，不强行成文

**第三步：撰写**

精简结构：Overview + 3节正文 + Sources，目标800–1200字，当天完成。

**第四步：自检发布**

---

### 发布频率

- **最低保障**：每周至少1篇（计划型）
- **热点追加**：当周热点质量高时，可额外发布1–2篇热点响应型
- **每月配比建议**：

| 类型 | 建议数量 |
|------|----------|
| 常青指南（Sourcing / Operator类） | 2篇 |
| 政策或市场分析（Policy / Market类） | 1–2篇 |
| 热点响应型（不限分类） | 视热点质量，0–2篇 |

分类交替发布，避免连续发同类文章。

---

### 信息新鲜度标准

| 信息类型 | 可接受最大滞后时间 |
|----------|------------------|
| 关税/政策变化 | 3个月内 |
| 价格数据（工厂价/运价） | 2个月内 |
| 港口/物流数据 | 3个月内 |
| 行业报告数据（IEA/AEMA） | 12个月内（注明报告年份） |
| 车型技术规格 | 6个月内（注明规格来源日期） |

超过上限：①找更新来源替换，或②文中注明信息时间点并加时效提示脚注。

---

## 十二、发布前自检清单

- [ ] 所有具体数字是否有来源或注明为估算？
- [ ] 三级来源（新闻媒体）是否已双源交叉核实？
- [ ] 政策状态是否准确（草案/已实施/已修订）？
- [ ] 时效性强的数据是否加了时效提示脚注？
- [ ] Sources section 是否只列实际引用的来源？
- [ ] 标题是否包含核心关键词？
- [ ] Tag字段是否填写了4个可搜索关键词？
- [ ] 图片是否本地下载（非外链）？图片ALT文本是否符合规范？
- [ ] Category字段是否与文件夹分类一致？
- [ ] 署名是否为 *Published by Youguard Intelligence Desk*？
