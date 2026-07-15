# I18n Locale 与 Vehicle Models 一次性关联设计

## 目标

在飞书多维表格中为车型专属翻译建立可维护的双向关联，使维护人员能够从 `I18n Locale` 找到对应车型，也能从 `Vehicle Models` 查看该车型的全部车型专属翻译。

该关联只服务数据库维护，不参与 Worker、API 或前端运行时逻辑。

## 当前结构

- Base：`Xvdfbpk7cadLrnsVCFFcHbhOnCb`
- `Vehicle Models`：`tblJq4Un2LQQaFPU`
- `I18n Locale`：`tblATd4EWHge1l1k`
- 当前车型数：47
- 每辆车型当前有两条车型专属翻译：
  - `catalog.models.<slug>.displayName`
  - `catalog.models.<slug>.cardHighlight`
- 本次预计建立 94 条翻译记录关联。

已验证示例：

- `Vehicle Models` 中 `MDL-019 / AITO M9` 的记录 ID 为 `recvo71bRgGhhf`。
- `I18n Locale` 中 `catalog.models.aito-m9.displayName` 的记录 ID 为 `recvpqtGxzUZO2`。
- 两条记录应通过新关联字段直接连接。

## 字段设计

在 `I18n Locale` 创建：

- 字段名：`Vehicle Model`
- 类型：`link`
- 关联表：`Vehicle Models`
- 双向关联：是
- 每条翻译记录的目标：一个车型记录

在 `Vehicle Models` 自动创建反向字段：

- 字段名：`I18n Translations`
- 类型：`link`
- 关联表：`I18n Locale`
- 每辆车型当前应显示两条翻译记录

字段命名沿用现有 Base 的英文业务字段风格，并明确区分车型记录与翻译记录。

## 关联范围

只关联满足以下格式的车型专属翻译：

```text
catalog.models.<slug>.displayName
catalog.models.<slug>.cardHighlight
```

不关联：

- `catalog.filters.*`
- `catalog.cardField.*`
- `productsRevenueKing.*`
- `productsEliteFlagship.*`
- `productsUtilityPro.*`
- 其他不属于单一车型的翻译

本次是一次性迁移。现有 i18n 同步脚本不会在未来自动创建或修改这些关联。

## 匹配规则

不能使用中文名、英文名或阿姆哈拉语名称匹配，因为名称可能被翻译或校正。

唯一匹配键为 slug：

1. 从翻译 Key 中解析 `<slug>`。
2. 从 `Vehicle Models.Product Path` 取最后一个路径段作为车型 slug。
3. 要求每个翻译 slug 精确匹配且只匹配一条 Vehicle Model。

示例：

```text
catalog.models.aito-m9.displayName
                    └─ aito-m9

/products/elite-flagship/aito-m9
                            └─ aito-m9
```

`Model ID` 用于验收和人工识别，但不作为自动匹配键。

## 一次性迁移流程

### 1. 只读预检

- 分页读取全部 47 条 `Vehicle Models`，投影 `Model ID`、`Product Path`、`Brand`、`Model`。
- 读取全部 `catalog.models.*` 翻译记录。
- 校验：
  - 47 个唯一车型 slug
  - 94 个唯一车型翻译 Key
  - 每个车型恰好存在 `displayName` 和 `cardHighlight`
  - 每个翻译 slug 恰好匹配一个车型
- 任何缺失、重复或无法匹配都中止，且不创建字段、不写记录。

### 2. 创建双向字段

预检全部通过后，在 `I18n Locale` 创建 `Vehicle Model` 双向关联字段，并自动生成 `Vehicle Models.I18n Translations`。

### 3. 写入关联

逐条按翻译记录 ID 更新 `Vehicle Model`：

```json
{
  "Vehicle Model": [{ "id": "<vehicle_model_record_id>" }]
}
```

每条记录写入不同的车型 ID，因此不使用“同值批量更新”。迁移操作可重复执行：重复执行只会把同一条翻译记录设置为同一车型关联，不创建重复翻译记录。

### 4. 验收

- `I18n Locale` 中 94 条目标记录全部有且仅有一个 `Vehicle Model`。
- 47 条 `Vehicle Models` 全部有 `I18n Translations`。
- 每辆车型反向关联恰好两条记录。
- 反向记录 Key 分别以 `.displayName` 和 `.cardHighlight` 结尾。
- 非 `catalog.models.*` 记录的 `Vehicle Model` 保持为空。
- 抽查 `MDL-019 / AITO M9`：反向关联必须包含：
  - `catalog.models.aito-m9.displayName`
  - `catalog.models.aito-m9.cardHighlight`

## 失败与恢复

- 预检失败：不执行任何数据库写入。
- 字段已创建但记录写入中断：保留字段和已成功关联的数据，修复原因后重跑迁移；重跑不会产生重复关系。
- 单条关联失败：记录失败的翻译 Key、翻译记录 ID 和目标车型 ID，继续前先定位具体错误。
- 如需回滚：清空 94 条翻译记录的 `Vehicle Model` 后，再经明确确认删除关联字段；不自动执行破坏性回滚。

## 对现有系统的影响

- 不修改 `Vehicle Models` 的车型业务数据。
- 不修改翻译 Key、ZH、EN、AM、Module 或 Notes。
- 不修改 `vehicle_variants` 或 `Trim Configurations Pruned`。
- Worker/API 未投影新字段，前端也不读取新字段，因此网站行为保持不变。
- 不修改现有 i18n 同步流程。

## 非目标

- 不为通用筛选翻译建立车型关联。
- 不自动推断未来新增翻译是否属于某一车型。
- 不建立新的中间表。
- 不让前端依赖该关系。
