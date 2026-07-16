# Insights 文章三语数据设计

## 目标

为 Articles 表中全部 30 条 Published 文章建立可维护的三语翻译数据。每篇文章在 I18n Locale 表中对应四条记录：`title`、`overview`、`date`、`content`，共 120 条记录。

## 数据结构

- Key：`insights.articles.<slug>.<field>`，其中 `<field>` 仅为 `title`、`overview`、`date`、`content`。
- EN：Articles 表对应英文源值。
- ZH：简体中文译文。
- AM：阿姆哈拉语译文；品牌、机构、车型、URL、数字和单位在不宜翻译时保留英文。
- Module：`洞察`。
- Notes：说明字段用途和翻译边界。
- Linked Articles：仅关联当前 slug 对应的 Articles 记录。

## 正文规则

`content` 保留 Markdown 结构、图片路径、链接目标、数字和单位，只翻译读者可见的标题、段落、列表、表格文字和图片说明。日期使用公历本地化格式，中文采用中文年月日，阿姆哈拉语采用阿姆哈拉语公历日期。

## 写入与验证

写入前确认 120 个 Key 均不存在且 30 个 slug 唯一。生成后验证每篇文章恰有四条记录、每条记录三语非空、每条记录恰有一个 Linked Articles 关联，并从 Articles.I18n Locale 反向确认每篇文章得到四条关联。
