# Domain Model Context: AutoYJ

Canonical glossary and domain entities for Youguard Auto Export Supply Chain portal.

---

## 1. Automotive Catalog Domain (车型目录域)

- **VehicleModel (车系/车型总括)**: 顶层车系定义（如 *BYD Yangwang U8*, *Zeekr 001*），包含品牌（brand）、车型定位（segment）、动力类型（powertrain_type）、综合指导价格区间及主打技术亮点。
- **VehicleTrim (配置级/版本)**: 归属于具体 VehicleModel 的特定配置版本（如 *2026 旗舰版*, *长续航超享版*），包含具体电池容量（kWh）、电机功率（kW）、CLTC 续航（km）与官方人民币指导价。
- **Vehicle (可交付现车资源/库存单车)**: 真实物理在售或在库车源，拥有唯一定位地（location）、车漆/内饰颜色、现车库存数量（inventory_count）、交货等待周期（wait_days）以及外贸计价条款（EXW/FCA/FOB 美元价格）。

---

## 2. Inquiries & Discussions Domain (询价与多方沟通域)

- **Inquiry (外贸询价单)**: 海外采购商或合作伙伴针对特定车型/车源发起的需求单据。系统生成唯一询价编号 `inquiryNo`（如 `INQ-20260823-XXXX`），包含采购台数（quantity > 0）、目标口岸、期望贸易条款（EXW/FOB/CIF）。
- **InquiryStatus (询价生命周期状态)**:
  - `open`: 进行中的有效询价单，支持追加沟通与出具报价。
  - `closed`: 已归档/已结案的询价单。仅管理员与销售具备操作权限。
- **InquiryParticipant (询价利益相关方)**: 参与此单据协作的角色实体，涵盖发起客户（Customer）、专属销售顾问（Sales）、外贸渠道合伙人（Partner）与平台管理员（Admin）。
- **InquiryNote (跟进记录/留言讨论)**: 询价单下的双向流转记录，支持结构化回复引用（`parentNoteId`）与内部备忘标记（`isPublic: false` 对客户不可见）。
- **InquiryRead (已读状态记录)**: 记录各用户对特定询价单最新留言的查阅时间戳（`lastReadAt`），用于未读高亮提示。

---

## 3. Quotation & Order Lifecycle Domain (报价与订单履约域)

- **Quotation (正式外贸报价单)**: 销售代表针对 Inquiry 出具的具有商业法律效力的报价明细（`quoteNo`），锁定单车外贸单价、贸易术语、装船港口、交期及报价有效期（validityDays）。
- **Order (履约订单)**: 客户接受报价（Accept Quote）后生成的实际交付订单，状态流转遵循 `Draft -> Confirmed -> Deposit Paid -> In Production -> Shipped -> Customs Cleared -> Delivered`。

---

## 4. Identity & Notification Domain (认证与通知域)

- **User (用户主体)**: Better Auth 驱动的用户账号，划分为 4 种核心角色：`admin` | `sales` | `partner` | `customer`。
- **TelegramUserBinding (Telegram 双向绑定)**: 记录系统内部 `userId` 与 Telegram `chat_id` / 用户名的映射关系，提供实时的多渠道询价雷达通知与一键回访链接。
- **PushSubscription (PWA 浏览器推送订阅)**: 记录用户在各终端设备（1:N）上授权的 W3C Web Push 凭据（包含 `endpoint`、`p256dh` 与 `auth` 密钥），用于在未绑定 Telegram 或桌面在线时实现即时商机弹窗。
- **NotificationDeliveryPolicy (通知多通道投递策略)**: 询价产生新动态时，优先走 Telegram 机器人直推；若用户未绑定 Telegram，自动降级（Fallback）投递名下所有有效 `PushSubscription`，在收到 410/404 响应时自动清理失效订阅。

