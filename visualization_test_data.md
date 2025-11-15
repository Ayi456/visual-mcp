# 可视化图表测试数据集

本文档包含多种类型的测试数据，用于测试各种可视化图表的多样性和性能。

---

## 1. 时间序列数据 (折线图、面积图)

### 1.1 月度销售数据 (2年)

```json
{
  "title": "月度销售数据",
  "data": [
    { "date": "2023-01", "revenue": 35000, "orders": 250, "users": 980, "avgOrder": 140 },
    { "date": "2023-02", "revenue": 38000, "orders": 270, "users": 1050, "avgOrder": 141 },
    { "date": "2023-03", "revenue": 42000, "orders": 295, "users": 1120, "avgOrder": 142 },
    { "date": "2023-04", "revenue": 39000, "orders": 280, "users": 1080, "avgOrder": 139 },
    { "date": "2023-05", "revenue": 44000, "orders": 310, "users": 1180, "avgOrder": 142 },
    { "date": "2023-06", "revenue": 48000, "orders": 335, "users": 1260, "avgOrder": 143 },
    { "date": "2023-07", "revenue": 51000, "orders": 360, "users": 1340, "avgOrder": 142 },
    { "date": "2023-08", "revenue": 49000, "orders": 345, "users": 1300, "avgOrder": 142 },
    { "date": "2023-09", "revenue": 53000, "orders": 375, "users": 1420, "avgOrder": 141 },
    { "date": "2023-10", "revenue": 57000, "orders": 400, "users": 1520, "avgOrder": 143 },
    { "date": "2023-11", "revenue": 61000, "orders": 430, "users": 1640, "avgOrder": 142 },
    { "date": "2023-12", "revenue": 68000, "orders": 480, "users": 1820, "avgOrder": 142 },
    { "date": "2024-01", "revenue": 45000, "orders": 320, "users": 1200, "avgOrder": 141 },
    { "date": "2024-02", "revenue": 52000, "orders": 380, "users": 1350, "avgOrder": 137 },
    { "date": "2024-03", "revenue": 48000, "orders": 340, "users": 1280, "avgOrder": 141 },
    { "date": "2024-04", "revenue": 61000, "orders": 425, "users": 1580, "avgOrder": 144 },
    { "date": "2024-05", "revenue": 58000, "orders": 410, "users": 1520, "avgOrder": 141 },
    { "date": "2024-06", "revenue": 72000, "orders": 510, "users": 1820, "avgOrder": 141 },
    { "date": "2024-07", "revenue": 78000, "orders": 560, "users": 1950, "avgOrder": 139 },
    { "date": "2024-08", "revenue": 75000, "orders": 535, "users": 1880, "avgOrder": 140 },
    { "date": "2024-09", "revenue": 82000, "orders": 590, "users": 2100, "avgOrder": 139 },
    { "date": "2024-10", "revenue": 89000, "orders": 640, "users": 2280, "avgOrder": 139 },
    { "date": "2024-11", "revenue": 95000, "orders": 680, "users": 2450, "avgOrder": 140 },
    { "date": "2024-12", "revenue": 108000, "orders": 780, "users": 2750, "avgOrder": 138 }
  ]
}
```

### 1.2 每日访问量数据 (60天)

```json
{
  "title": "每日网站访问量",
  "data": [
    { "date": "2024-10-01", "pv": 12500, "uv": 8200, "newUsers": 2100, "bounceRate": 42.5 },
    { "date": "2024-10-02", "pv": 13200, "uv": 8600, "newUsers": 2200, "bounceRate": 41.8 },
    { "date": "2024-10-03", "pv": 14100, "uv": 9100, "newUsers": 2350, "bounceRate": 40.5 },
    { "date": "2024-10-04", "pv": 13800, "uv": 8900, "newUsers": 2280, "bounceRate": 41.2 },
    { "date": "2024-10-05", "pv": 11200, "uv": 7800, "newUsers": 1950, "bounceRate": 43.8 },
    { "date": "2024-10-06", "pv": 10500, "uv": 7200, "newUsers": 1820, "bounceRate": 44.5 },
    { "date": "2024-10-07", "pv": 12800, "uv": 8400, "newUsers": 2150, "bounceRate": 42.1 },
    { "date": "2024-10-08", "pv": 13500, "uv": 8800, "newUsers": 2280, "bounceRate": 41.3 },
    { "date": "2024-10-09", "pv": 14300, "uv": 9300, "newUsers": 2420, "bounceRate": 40.2 },
    { "date": "2024-10-10", "pv": 15100, "uv": 9800, "newUsers": 2580, "bounceRate": 39.5 },
    { "date": "2024-10-11", "pv": 14800, "uv": 9600, "newUsers": 2500, "bounceRate": 39.8 },
    { "date": "2024-10-12", "pv": 11800, "uv": 8100, "newUsers": 2050, "bounceRate": 43.2 },
    { "date": "2024-10-13", "pv": 10800, "uv": 7500, "newUsers": 1900, "bounceRate": 44.1 },
    { "date": "2024-10-14", "pv": 13200, "uv": 8700, "newUsers": 2250, "bounceRate": 41.8 },
    { "date": "2024-10-15", "pv": 14000, "uv": 9100, "newUsers": 2380, "bounceRate": 40.8 },
    { "date": "2024-10-16", "pv": 14800, "uv": 9500, "newUsers": 2480, "bounceRate": 40.1 },
    { "date": "2024-10-17", "pv": 15500, "uv": 10100, "newUsers": 2650, "bounceRate": 39.2 },
    { "date": "2024-10-18", "pv": 15200, "uv": 9900, "newUsers": 2580, "bounceRate": 39.6 },
    { "date": "2024-10-19", "pv": 12100, "uv": 8300, "newUsers": 2100, "bounceRate": 42.9 },
    { "date": "2024-10-20", "pv": 11200, "uv": 7700, "newUsers": 1950, "bounceRate": 43.8 },
    { "date": "2024-10-21", "pv": 13600, "uv": 8900, "newUsers": 2320, "bounceRate": 41.5 },
    { "date": "2024-10-22", "pv": 14500, "uv": 9400, "newUsers": 2450, "bounceRate": 40.3 },
    { "date": "2024-10-23", "pv": 15300, "uv": 9900, "newUsers": 2600, "bounceRate": 39.4 },
    { "date": "2024-10-24", "pv": 16100, "uv": 10400, "newUsers": 2750, "bounceRate": 38.8 },
    { "date": "2024-10-25", "pv": 15800, "uv": 10200, "newUsers": 2680, "bounceRate": 39.1 },
    { "date": "2024-10-26", "pv": 12500, "uv": 8600, "newUsers": 2180, "bounceRate": 42.5 },
    { "date": "2024-10-27", "pv": 11500, "uv": 7900, "newUsers": 2000, "bounceRate": 43.5 },
    { "date": "2024-10-28", "pv": 14100, "uv": 9200, "newUsers": 2400, "bounceRate": 40.9 },
    { "date": "2024-10-29", "pv": 15000, "uv": 9700, "newUsers": 2550, "bounceRate": 39.8 },
    { "date": "2024-10-30", "pv": 15800, "uv": 10200, "newUsers": 2680, "bounceRate": 39.1 },
    { "date": "2024-10-31", "pv": 16500, "uv": 10700, "newUsers": 2820, "bounceRate": 38.5 },
    { "date": "2024-11-01", "pv": 16200, "uv": 10500, "newUsers": 2750, "bounceRate": 38.8 },
    { "date": "2024-11-02", "pv": 12800, "uv": 8800, "newUsers": 2230, "bounceRate": 42.2 },
    { "date": "2024-11-03", "pv": 11800, "uv": 8100, "newUsers": 2050, "bounceRate": 43.2 },
    { "date": "2024-11-04", "pv": 14500, "uv": 9400, "newUsers": 2450, "bounceRate": 40.5 },
    { "date": "2024-11-05", "pv": 15300, "uv": 9900, "newUsers": 2600, "bounceRate": 39.6 },
    { "date": "2024-11-06", "pv": 16200, "uv": 10500, "newUsers": 2750, "bounceRate": 38.9 },
    { "date": "2024-11-07", "pv": 17000, "uv": 11000, "newUsers": 2900, "bounceRate": 38.2 },
    { "date": "2024-11-08", "pv": 16700, "uv": 10800, "newUsers": 2850, "bounceRate": 38.5 },
    { "date": "2024-11-09", "pv": 13200, "uv": 9100, "newUsers": 2300, "bounceRate": 41.8 },
    { "date": "2024-11-10", "pv": 12200, "uv": 8400, "newUsers": 2120, "bounceRate": 42.8 },
    { "date": "2024-11-11", "pv": 22500, "uv": 14500, "newUsers": 3850, "bounceRate": 35.2 },
    { "date": "2024-11-12", "pv": 19800, "uv": 12800, "newUsers": 3350, "bounceRate": 36.8 },
    { "date": "2024-11-13", "pv": 17500, "uv": 11300, "newUsers": 2980, "bounceRate": 37.9 },
    { "date": "2024-11-14", "pv": 16800, "uv": 10900, "newUsers": 2870, "bounceRate": 38.4 },
    { "date": "2024-11-15", "pv": 17200, "uv": 11100, "newUsers": 2920, "bounceRate": 38.1 },
    { "date": "2024-11-16", "pv": 13500, "uv": 9300, "newUsers": 2350, "bounceRate": 41.5 },
    { "date": "2024-11-17", "pv": 12500, "uv": 8600, "newUsers": 2180, "bounceRate": 42.5 },
    { "date": "2024-11-18", "pv": 15200, "uv": 9900, "newUsers": 2580, "bounceRate": 39.8 },
    { "date": "2024-11-19", "pv": 16100, "uv": 10400, "newUsers": 2730, "bounceRate": 38.9 },
    { "date": "2024-11-20", "pv": 16900, "uv": 10900, "newUsers": 2870, "bounceRate": 38.3 },
    { "date": "2024-11-21", "pv": 17800, "uv": 11500, "newUsers": 3020, "bounceRate": 37.6 },
    { "date": "2024-11-22", "pv": 17500, "uv": 11300, "newUsers": 2980, "bounceRate": 37.9 },
    { "date": "2024-11-23", "pv": 13800, "uv": 9500, "newUsers": 2400, "bounceRate": 41.2 },
    { "date": "2024-11-24", "pv": 12800, "uv": 8800, "newUsers": 2230, "bounceRate": 42.2 },
    { "date": "2024-11-25", "pv": 15800, "uv": 10200, "newUsers": 2680, "bounceRate": 39.2 },
    { "date": "2024-11-26", "pv": 16700, "uv": 10800, "newUsers": 2840, "bounceRate": 38.5 },
    { "date": "2024-11-27", "pv": 17600, "uv": 11400, "newUsers": 3000, "bounceRate": 37.8 },
    { "date": "2024-11-28", "pv": 18500, "uv": 12000, "newUsers": 3150, "bounceRate": 37.1 },
    { "date": "2024-11-29", "pv": 18200, "uv": 11800, "newUsers": 3100, "bounceRate": 37.4 }
  ]
}
```

---

## 2. 分类数据 (柱状图、饼图)

### 2.1 产品类别销售分布

```json
{
  "title": "产品类别销售分布",
  "data": [
    { "category": "电子产品", "sales": 2850000, "quantity": 12500, "percentage": 28.5, "growth": 15.3 },
    { "category": "服装鞋帽", "sales": 1980000, "quantity": 32000, "percentage": 19.8, "growth": 8.7 },
    { "category": "家居用品", "sales": 1560000, "quantity": 21000, "percentage": 15.6, "growth": 12.4 },
    { "category": "食品饮料", "sales": 1420000, "quantity": 58000, "percentage": 14.2, "growth": 6.2 },
    { "category": "图书文具", "sales": 890000, "quantity": 45000, "percentage": 8.9, "growth": 3.8 },
    { "category": "运动户外", "sales": 750000, "quantity": 8900, "percentage": 7.5, "growth": 18.9 },
    { "category": "美妆个护", "sales": 550000, "quantity": 18500, "percentage": 5.5, "growth": 22.1 }
  ]
}
```

### 2.2 地区销售排名 (Top 20)

```json
{
  "title": "地区销售排名",
  "data": [
    { "region": "广东省", "sales": 4850000, "stores": 128, "customers": 285000 },
    { "region": "浙江省", "sales": 3920000, "stores": 96, "customers": 218000 },
    { "region": "江苏省", "sales": 3780000, "stores": 102, "customers": 205000 },
    { "region": "上海市", "sales": 3560000, "stores": 75, "customers": 198000 },
    { "region": "北京市", "sales": 3420000, "stores": 68, "customers": 185000 },
    { "region": "山东省", "sales": 2890000, "stores": 89, "customers": 162000 },
    { "region": "四川省", "sales": 2650000, "stores": 78, "customers": 148000 },
    { "region": "河南省", "sales": 2420000, "stores": 85, "customers": 135000 },
    { "region": "湖北省", "sales": 2180000, "stores": 62, "customers": 122000 },
    { "region": "福建省", "sales": 2050000, "stores": 58, "customers": 115000 },
    { "region": "湖南省", "sales": 1920000, "stores": 64, "customers": 108000 },
    { "region": "安徽省", "sales": 1780000, "stores": 56, "customers": 98000 },
    { "region": "河北省", "sales": 1650000, "stores": 52, "customers": 92000 },
    { "region": "陕西省", "sales": 1520000, "stores": 48, "customers": 85000 },
    { "region": "重庆市", "sales": 1450000, "stores": 42, "customers": 81000 },
    { "region": "江西省", "sales": 1320000, "stores": 45, "customers": 74000 },
    { "region": "辽宁省", "sales": 1280000, "stores": 38, "customers": 71000 },
    { "region": "广西省", "sales": 1150000, "stores": 41, "customers": 65000 },
    { "region": "云南省", "sales": 1080000, "stores": 36, "customers": 60000 },
    { "region": "山西省", "sales": 980000, "stores": 32, "customers": 55000 }
  ]
}
```

---

## 3. 散点数据 (散点图、气泡图)

### 3.1 客户行为分析 (100个样本)

```json
{
  "title": "客户行为分析",
  "data": [
    { "customerId": 1, "age": 25, "spending": 3200, "visits": 12, "satisfaction": 4.2, "segment": "年轻用户" },
    { "customerId": 2, "age": 34, "spending": 5800, "visits": 24, "satisfaction": 4.5, "segment": "中年用户" },
    { "customerId": 3, "age": 28, "spending": 2100, "visits": 8, "satisfaction": 3.8, "segment": "年轻用户" },
    { "customerId": 4, "age": 42, "spending": 8900, "visits": 36, "satisfaction": 4.8, "segment": "中年用户" },
    { "customerId": 5, "age": 31, "spending": 4500, "visits": 18, "satisfaction": 4.1, "segment": "中年用户" },
    { "customerId": 6, "age": 55, "spending": 12000, "visits": 48, "satisfaction": 4.9, "segment": "高龄用户" },
    { "customerId": 7, "age": 22, "spending": 1800, "visits": 6, "satisfaction": 3.5, "segment": "年轻用户" },
    { "customerId": 8, "age": 38, "spending": 6700, "visits": 28, "satisfaction": 4.4, "segment": "中年用户" },
    { "customerId": 9, "age": 45, "spending": 9500, "visits": 42, "satisfaction": 4.7, "segment": "中年用户" },
    { "customerId": 10, "age": 29, "spending": 3800, "visits": 15, "satisfaction": 4.0, "segment": "年轻用户" },
    { "customerId": 11, "age": 52, "spending": 11200, "visits": 45, "satisfaction": 4.8, "segment": "高龄用户" },
    { "customerId": 12, "age": 26, "spending": 2900, "visits": 11, "satisfaction": 3.9, "segment": "年轻用户" },
    { "customerId": 13, "age": 48, "spending": 10500, "visits": 40, "satisfaction": 4.6, "segment": "中年用户" },
    { "customerId": 14, "age": 33, "spending": 5200, "visits": 22, "satisfaction": 4.3, "segment": "中年用户" },
    { "customerId": 15, "age": 61, "spending": 13500, "visits": 52, "satisfaction": 5.0, "segment": "高龄用户" },
    { "customerId": 16, "age": 24, "spending": 2600, "visits": 9, "satisfaction": 3.7, "segment": "年轻用户" },
    { "customerId": 17, "age": 36, "spending": 6200, "visits": 26, "satisfaction": 4.4, "segment": "中年用户" },
    { "customerId": 18, "age": 41, "spending": 8200, "visits": 34, "satisfaction": 4.6, "segment": "中年用户" },
    { "customerId": 19, "age": 27, "spending": 3500, "visits": 14, "satisfaction": 4.0, "segment": "年轻用户" },
    { "customerId": 20, "age": 50, "spending": 10800, "visits": 44, "satisfaction": 4.7, "segment": "高龄用户" },
    { "customerId": 21, "age": 23, "spending": 2200, "visits": 7, "satisfaction": 3.6, "segment": "年轻用户" },
    { "customerId": 22, "age": 39, "spending": 7100, "visits": 30, "satisfaction": 4.5, "segment": "中年用户" },
    { "customerId": 23, "age": 46, "spending": 9800, "visits": 38, "satisfaction": 4.7, "segment": "中年用户" },
    { "customerId": 24, "age": 30, "spending": 4200, "visits": 17, "satisfaction": 4.1, "segment": "中年用户" },
    { "customerId": 25, "age": 58, "spending": 12800, "visits": 50, "satisfaction": 4.9, "segment": "高龄用户" },
    { "customerId": 26, "age": 25, "spending": 2800, "visits": 10, "satisfaction": 3.8, "segment": "年轻用户" },
    { "customerId": 27, "age": 35, "spending": 5900, "visits": 25, "satisfaction": 4.3, "segment": "中年用户" },
    { "customerId": 28, "age": 43, "spending": 8600, "visits": 35, "satisfaction": 4.6, "segment": "中年用户" },
    { "customerId": 29, "age": 28, "spending": 3700, "visits": 14, "satisfaction": 4.0, "segment": "年轻用户" },
    { "customerId": 30, "age": 54, "spending": 11600, "visits": 46, "satisfaction": 4.8, "segment": "高龄用户" },
    { "customerId": 31, "age": 26, "spending": 3100, "visits": 12, "satisfaction": 3.9, "segment": "年轻用户" },
    { "customerId": 32, "age": 37, "spending": 6500, "visits": 27, "satisfaction": 4.4, "segment": "中年用户" },
    { "customerId": 33, "age": 44, "spending": 9200, "visits": 37, "satisfaction": 4.7, "segment": "中年用户" },
    { "customerId": 34, "age": 29, "spending": 4000, "visits": 16, "satisfaction": 4.1, "segment": "年轻用户" },
    { "customerId": 35, "age": 56, "spending": 12400, "visits": 49, "satisfaction": 4.9, "segment": "高龄用户" },
    { "customerId": 36, "age": 24, "spending": 2500, "visits": 8, "satisfaction": 3.7, "segment": "年轻用户" },
    { "customerId": 37, "age": 40, "spending": 7800, "visits": 32, "satisfaction": 4.5, "segment": "中年用户" },
    { "customerId": 38, "age": 47, "spending": 10200, "visits": 41, "satisfaction": 4.7, "segment": "中年用户" },
    { "customerId": 39, "age": 31, "spending": 4600, "visits": 19, "satisfaction": 4.2, "segment": "中年用户" },
    { "customerId": 40, "age": 59, "spending": 13200, "visits": 51, "satisfaction": 4.9, "segment": "高龄用户" },
    { "customerId": 41, "age": 27, "spending": 3300, "visits": 13, "satisfaction": 3.9, "segment": "年轻用户" },
    { "customerId": 42, "age": 38, "spending": 6900, "visits": 29, "satisfaction": 4.4, "segment": "中年用户" },
    { "customerId": 43, "age": 45, "spending": 9600, "visits": 39, "satisfaction": 4.7, "segment": "中年用户" },
    { "customerId": 44, "age": 32, "spending": 4800, "visits": 20, "satisfaction": 4.2, "segment": "中年用户" },
    { "customerId": 45, "age": 57, "spending": 12600, "visits": 47, "satisfaction": 4.8, "segment": "高龄用户" },
    { "customerId": 46, "age": 23, "spending": 2400, "visits": 9, "satisfaction": 3.6, "segment": "年轻用户" },
    { "customerId": 47, "age": 36, "spending": 6300, "visits": 26, "satisfaction": 4.3, "segment": "中年用户" },
    { "customerId": 48, "age": 42, "spending": 8800, "visits": 36, "satisfaction": 4.6, "segment": "中年用户" },
    { "customerId": 49, "age": 30, "spending": 4300, "visits": 17, "satisfaction": 4.1, "segment": "中年用户" },
    { "customerId": 50, "age": 60, "spending": 13800, "visits": 53, "satisfaction": 5.0, "segment": "高龄用户" },
    { "customerId": 51, "age": 25, "spending": 3000, "visits": 11, "satisfaction": 3.8, "segment": "年轻用户" },
    { "customerId": 52, "age": 39, "spending": 7300, "visits": 31, "satisfaction": 4.5, "segment": "中年用户" },
    { "customerId": 53, "age": 46, "spending": 9900, "visits": 40, "satisfaction": 4.7, "segment": "中年用户" },
    { "customerId": 54, "age": 33, "spending": 5100, "visits": 21, "satisfaction": 4.2, "segment": "中年用户" },
    { "customerId": 55, "age": 53, "spending": 11400, "visits": 45, "satisfaction": 4.8, "segment": "高龄用户" },
    { "customerId": 56, "age": 26, "spending": 2700, "visits": 10, "satisfaction": 3.7, "segment": "年轻用户" },
    { "customerId": 57, "age": 41, "spending": 8100, "visits": 33, "satisfaction": 4.6, "segment": "中年用户" },
    { "customerId": 58, "age": 48, "spending": 10400, "visits": 42, "satisfaction": 4.7, "segment": "中年用户" },
    { "customerId": 59, "age": 28, "spending": 3600, "visits": 14, "satisfaction": 4.0, "segment": "年轻用户" },
    { "customerId": 60, "age": 55, "spending": 12100, "visits": 48, "satisfaction": 4.9, "segment": "高龄用户" },
    { "customerId": 61, "age": 24, "spending": 2300, "visits": 8, "satisfaction": 3.6, "segment": "年轻用户" },
    { "customerId": 62, "age": 37, "spending": 6600, "visits": 28, "satisfaction": 4.4, "segment": "中年用户" },
    { "customerId": 63, "age": 44, "spending": 9100, "visits": 37, "satisfaction": 4.6, "segment": "中年用户" },
    { "customerId": 64, "age": 31, "spending": 4400, "visits": 18, "satisfaction": 4.1, "segment": "中年用户" },
    { "customerId": 65, "age": 58, "spending": 12900, "visits": 50, "satisfaction": 4.9, "segment": "高龄用户" },
    { "customerId": 66, "age": 27, "spending": 3400, "visits": 13, "satisfaction": 3.9, "segment": "年轻用户" },
    { "customerId": 67, "age": 40, "spending": 7600, "visits": 31, "satisfaction": 4.5, "segment": "中年用户" },
    { "customerId": 68, "age": 47, "spending": 10100, "visits": 41, "satisfaction": 4.7, "segment": "中年用户" },
    { "customerId": 69, "age": 29, "spending": 3900, "visits": 15, "satisfaction": 4.0, "segment": "年轻用户" },
    { "customerId": 70, "age": 56, "spending": 12300, "visits": 49, "satisfaction": 4.8, "segment": "高龄用户" },
    { "customerId": 71, "age": 22, "spending": 2000, "visits": 7, "satisfaction": 3.5, "segment": "年轻用户" },
    { "customerId": 72, "age": 35, "spending": 6000, "visits": 25, "satisfaction": 4.3, "segment": "中年用户" },
    { "customerId": 73, "age": 43, "spending": 8700, "visits": 35, "satisfaction": 4.6, "segment": "中年用户" },
    { "customerId": 74, "age": 32, "spending": 4900, "visits": 20, "satisfaction": 4.2, "segment": "中年用户" },
    { "customerId": 75, "age": 54, "spending": 11700, "visits": 46, "satisfaction": 4.8, "segment": "高龄用户" },
    { "customerId": 76, "age": 26, "spending": 3200, "visits": 12, "satisfaction": 3.9, "segment": "年轻用户" },
    { "customerId": 77, "age": 38, "spending": 7000, "visits": 29, "satisfaction": 4.4, "segment": "中年用户" },
    { "customerId": 78, "age": 45, "spending": 9400, "visits": 38, "satisfaction": 4.7, "segment": "中年用户" },
    { "customerId": 79, "age": 30, "spending": 4100, "visits": 16, "satisfaction": 4.1, "segment": "中年用户" },
    { "customerId": 80, "age": 59, "spending": 13100, "visits": 51, "satisfaction": 4.9, "segment": "高龄用户" },
    { "customerId": 81, "age": 23, "spending": 2500, "visits": 9, "satisfaction": 3.7, "segment": "年轻用户" },
    { "customerId": 82, "age": 36, "spending": 6400, "visits": 27, "satisfaction": 4.3, "segment": "中年用户" },
    { "customerId": 83, "age": 41, "spending": 8300, "visits": 34, "satisfaction": 4.6, "segment": "中年用户" },
    { "customerId": 84, "age": 28, "spending": 3800, "visits": 15, "satisfaction": 4.0, "segment": "年轻用户" },
    { "customerId": 85, "age": 52, "spending": 11300, "visits": 45, "satisfaction": 4.8, "segment": "高龄用户" },
    { "customerId": 86, "age": 25, "spending": 2900, "visits": 11, "satisfaction": 3.8, "segment": "年轻用户" },
    { "customerId": 87, "age": 39, "spending": 7200, "visits": 30, "satisfaction": 4.5, "segment": "中年用户" },
    { "customerId": 88, "age": 46, "spending": 9700, "visits": 39, "satisfaction": 4.7, "segment": "中年用户" },
    { "customerId": 89, "age": 33, "spending": 5000, "visits": 21, "satisfaction": 4.2, "segment": "中年用户" },
    { "customerId": 90, "age": 57, "spending": 12700, "visits": 50, "satisfaction": 4.9, "segment": "高龄用户" },
    { "customerId": 91, "age": 24, "spending": 2600, "visits": 10, "satisfaction": 3.7, "segment": "年轻用户" },
    { "customerId": 92, "age": 37, "spending": 6800, "visits": 28, "satisfaction": 4.4, "segment": "中年用户" },
    { "customerId": 93, "age": 44, "spending": 9300, "visits": 37, "satisfaction": 4.7, "segment": "中年用户" },
    { "customerId": 94, "age": 31, "spending": 4700, "visits": 19, "satisfaction": 4.2, "segment": "中年用户" },
    { "customerId": 95, "age": 60, "spending": 13600, "visits": 52, "satisfaction": 5.0, "segment": "高龄用户" },
    { "customerId": 96, "age": 27, "spending": 3500, "visits": 14, "satisfaction": 3.9, "segment": "年轻用户" },
    { "customerId": 97, "age": 40, "spending": 7900, "visits": 32, "satisfaction": 4.5, "segment": "中年用户" },
    { "customerId": 98, "age": 48, "spending": 10600, "visits": 43, "satisfaction": 4.7, "segment": "中年用户" },
    { "customerId": 99, "age": 29, "spending": 4200, "visits": 17, "satisfaction": 4.1, "segment": "年轻用户" },
    { "customerId": 100, "age": 61, "spending": 14000, "visits": 54, "satisfaction": 5.0, "segment": "高龄用户" }
  ]
}
```

---

## 4. 热力图数据

### 4.1 每小时访问量热力图 (全天 x 7天)

```json
{
  "title": "每小时访问量热力图",
  "xAxis": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
  "yAxis": ["0时", "1时", "2时", "3时", "4时", "5时", "6时", "7时", "8时", "9时", "10时", "11时", "12时", "13时", "14时", "15时", "16时", "17时", "18时", "19时", "20时", "21时", "22时", "23时"],
  "data": [
    [0, 0, 120], [0, 1, 85], [0, 2, 65], [0, 3, 45], [0, 4, 38], [0, 5, 52], [0, 6, 95], [0, 7, 180], [0, 8, 285], [0, 9, 320], [0, 10, 340], [0, 11, 365], [0, 12, 380], [0, 13, 355], [0, 14, 335], [0, 15, 360], [0, 16, 385], [0, 17, 410], [0, 18, 450], [0, 19, 425], [0, 20, 380], [0, 21, 320], [0, 22, 245], [0, 23, 165],
    [1, 0, 110], [1, 1, 90], [1, 2, 68], [1, 3, 48], [1, 4, 42], [1, 5, 58], [1, 6, 100], [1, 7, 190], [1, 8, 295], [1, 9, 340], [1, 10, 360], [1, 11, 385], [1, 12, 400], [1, 13, 375], [1, 14, 355], [1, 15, 380], [1, 16, 405], [1, 17, 430], [1, 18, 480], [1, 19, 445], [1, 20, 400], [1, 21, 340], [1, 22, 260], [1, 23, 175],
    [2, 0, 115], [2, 1, 88], [2, 2, 70], [2, 3, 50], [2, 4, 40], [2, 5, 55], [2, 6, 98], [2, 7, 185], [2, 8, 290], [2, 9, 335], [2, 10, 355], [2, 11, 380], [2, 12, 390], [2, 13, 370], [2, 14, 345], [2, 15, 370], [2, 16, 395], [2, 17, 420], [2, 18, 470], [2, 19, 440], [2, 20, 390], [2, 21, 335], [2, 22, 255], [2, 23, 170],
    [3, 0, 125], [3, 1, 92], [3, 2, 72], [3, 3, 52], [3, 4, 45], [3, 5, 60], [3, 6, 105], [3, 7, 195], [3, 8, 305], [3, 9, 350], [3, 10, 370], [3, 11, 395], [3, 12, 410], [3, 13, 385], [3, 14, 365], [3, 15, 390], [3, 16, 415], [3, 17, 440], [3, 18, 490], [3, 19, 460], [3, 20, 410], [3, 21, 350], [3, 22, 270], [3, 23, 180],
    [4, 0, 130], [4, 1, 95], [4, 2, 75], [4, 3, 55], [4, 4, 48], [4, 5, 65], [4, 6, 110], [4, 7, 200], [4, 8, 315], [4, 9, 360], [4, 10, 380], [4, 11, 405], [4, 12, 420], [4, 13, 395], [4, 14, 375], [4, 15, 400], [4, 16, 425], [4, 17, 450], [4, 18, 500], [4, 19, 470], [4, 20, 420], [4, 21, 360], [4, 22, 280], [4, 23, 190],
    [5, 0, 180], [5, 1, 140], [5, 2, 105], [5, 3, 80], [5, 4, 72], [5, 5, 95], [5, 6, 160], [5, 7, 270], [5, 8, 400], [5, 9, 480], [5, 10, 510], [5, 11, 545], [5, 12, 560], [5, 13, 530], [5, 14, 505], [5, 15, 535], [5, 16, 565], [5, 17, 595], [5, 18, 650], [5, 19, 610], [5, 20, 560], [5, 21, 490], [5, 22, 385], [5, 23, 265],
    [6, 0, 170], [6, 1, 130], [6, 2, 100], [6, 3, 75], [6, 4, 68], [6, 5, 90], [6, 6, 150], [6, 7, 260], [6, 8, 385], [6, 9, 465], [6, 10, 495], [6, 11, 530], [6, 12, 545], [6, 13, 515], [6, 14, 490], [6, 15, 520], [6, 16, 550], [6, 17, 580], [6, 18, 630], [6, 19, 590], [6, 20, 545], [6, 21, 475], [6, 22, 370], [6, 23, 250]
  ]
}
```

---

## 5. 网络关系数据 (力导向图)

### 5.1 社交网络关系图 (30个节点)

```json
{
  "title": "社交网络关系",
  "nodes": [
    { "id": "1", "name": "张三", "category": "核心用户", "value": 100, "influence": 95 },
    { "id": "2", "name": "李四", "category": "活跃用户", "value": 80, "influence": 75 },
    { "id": "3", "name": "王五", "category": "活跃用户", "value": 85, "influence": 78 },
    { "id": "4", "name": "赵六", "category": "普通用户", "value": 50, "influence": 42 },
    { "id": "5", "name": "孙七", "category": "核心用户", "value": 95, "influence": 92 },
    { "id": "6", "name": "周八", "category": "普通用户", "value": 45, "influence": 38 },
    { "id": "7", "name": "吴九", "category": "活跃用户", "value": 70, "influence": 65 },
    { "id": "8", "name": "郑十", "category": "普通用户", "value": 55, "influence": 48 },
    { "id": "9", "name": "钱一", "category": "核心用户", "value": 92, "influence": 88 },
    { "id": "10", "name": "陈二", "category": "活跃用户", "value": 75, "influence": 70 },
    { "id": "11", "name": "林三", "category": "普通用户", "value": 52, "influence": 45 },
    { "id": "12", "name": "黄四", "category": "活跃用户", "value": 78, "influence": 72 },
    { "id": "13", "name": "梁五", "category": "普通用户", "value": 48, "influence": 40 },
    { "id": "14", "name": "何六", "category": "核心用户", "value": 90, "influence": 85 },
    { "id": "15", "name": "高七", "category": "活跃用户", "value": 72, "influence": 68 },
    { "id": "16", "name": "马八", "category": "普通用户", "value": 50, "influence": 43 },
    { "id": "17", "name": "徐九", "category": "活跃用户", "value": 76, "influence": 71 },
    { "id": "18", "name": "朱十", "category": "普通用户", "value": 46, "influence": 39 },
    { "id": "19", "name": "胡一", "category": "核心用户", "value": 88, "influence": 82 },
    { "id": "20", "name": "郭二", "category": "活跃用户", "value": 74, "influence": 69 },
    { "id": "21", "name": "罗三", "category": "普通用户", "value": 51, "influence": 44 },
    { "id": "22", "name": "宋四", "category": "活跃用户", "value": 79, "influence": 73 },
    { "id": "23", "name": "谢五", "category": "普通用户", "value": 49, "influence": 41 },
    { "id": "24", "name": "唐六", "category": "核心用户", "value": 93, "influence": 89 },
    { "id": "25", "name": "韩七", "category": "活跃用户", "value": 73, "influence": 67 },
    { "id": "26", "name": "冯八", "category": "普通用户", "value": 47, "influence": 40 },
    { "id": "27", "name": "邓九", "category": "活跃用户", "value": 77, "influence": 72 },
    { "id": "28", "name": "曹十", "category": "普通用户", "value": 53, "influence": 46 },
    { "id": "29", "name": "彭一", "category": "核心用户", "value": 91, "influence": 87 },
    { "id": "30", "name": "曾二", "category": "活跃用户", "value": 71, "influence": 66 }
  ],
  "links": [
    { "source": "1", "target": "2", "value": 10, "type": "强关系" },
    { "source": "1", "target": "3", "value": 8, "type": "强关系" },
    { "source": "1", "target": "5", "value": 12, "type": "强关系" },
    { "source": "1", "target": "9", "value": 11, "type": "强关系" },
    { "source": "2", "target": "3", "value": 6, "type": "中等关系" },
    { "source": "2", "target": "4", "value": 4, "type": "弱关系" },
    { "source": "2", "target": "7", "value": 7, "type": "中等关系" },
    { "source": "3", "target": "5", "value": 7, "type": "中等关系" },
    { "source": "3", "target": "7", "value": 5, "type": "中等关系" },
    { "source": "3", "target": "10", "value": 6, "type": "中等关系" },
    { "source": "4", "target": "6", "value": 3, "type": "弱关系" },
    { "source": "4", "target": "8", "value": 4, "type": "弱关系" },
    { "source": "5", "target": "7", "value": 9, "type": "强关系" },
    { "source": "5", "target": "9", "value": 10, "type": "强关系" },
    { "source": "5", "target": "14", "value": 11, "type": "强关系" },
    { "source": "6", "target": "8", "value": 2, "type": "弱关系" },
    { "source": "6", "target": "11", "value": 3, "type": "弱关系" },
    { "source": "7", "target": "8", "value": 4, "type": "弱关系" },
    { "source": "7", "target": "10", "value": 6, "type": "中等关系" },
    { "source": "7", "target": "12", "value": 7, "type": "中等关系" },
    { "source": "9", "target": "14", "value": 10, "type": "强关系" },
    { "source": "9", "target": "19", "value": 9, "type": "强关系" },
    { "source": "10", "target": "12", "value": 6, "type": "中等关系" },
    { "source": "10", "target": "15", "value": 5, "type": "中等关系" },
    { "source": "11", "target": "13", "value": 3, "type": "弱关系" },
    { "source": "11", "target": "16", "value": 4, "type": "弱关系" },
    { "source": "12", "target": "15", "value": 7, "type": "中等关系" },
    { "source": "12", "target": "17", "value": 6, "type": "中等关系" },
    { "source": "13", "target": "16", "value": 3, "type": "弱关系" },
    { "source": "13", "target": "18", "value": 2, "type": "弱关系" },
    { "source": "14", "target": "19", "value": 11, "type": "强关系" },
    { "source": "14", "target": "24", "value": 10, "type": "强关系" },
    { "source": "15", "target": "17", "value": 6, "type": "中等关系" },
    { "source": "15", "target": "20", "value": 5, "type": "中等关系" },
    { "source": "16", "target": "18", "value": 3, "type": "弱关系" },
    { "source": "16", "target": "21", "value": 4, "type": "弱关系" },
    { "source": "17", "target": "20", "value": 7, "type": "中等关系" },
    { "source": "17", "target": "22", "value": 6, "type": "中等关系" },
    { "source": "18", "target": "21", "value": 3, "type": "弱关系" },
    { "source": "18", "target": "23", "value": 2, "type": "弱关系" },
    { "source": "19", "target": "24", "value": 10, "type": "强关系" },
    { "source": "19", "target": "29", "value": 9, "type": "强关系" },
    { "source": "20", "target": "22", "value": 6, "type": "中等关系" },
    { "source": "20", "target": "25", "value": 5, "type": "中等关系" },
    { "source": "21", "target": "23", "value": 3, "type": "弱关系" },
    { "source": "21", "target": "26", "value": 4, "type": "弱关系" },
    { "source": "22", "target": "25", "value": 7, "type": "中等关系" },
    { "source": "22", "target": "27", "value": 6, "type": "中等关系" },
    { "source": "23", "target": "26", "value": 3, "type": "弱关系" },
    { "source": "23", "target": "28", "value": 2, "type": "弱关系" },
    { "source": "24", "target": "29", "value": 11, "type": "强关系" },
    { "source": "25", "target": "27", "value": 6, "type": "中等关系" },
    { "source": "25", "target": "30", "value": 5, "type": "中等关系" },
    { "source": "26", "target": "28", "value": 3, "type": "弱关系" },
    { "source": "27", "target": "30", "value": 7, "type": "中等关系" }
  ]
}
```

---

## 6. 层级数据 (树状图、旭日图)

### 6.1 组织架构销售业绩

```json
{
  "title": "组织架构销售业绩",
  "data": {
    "name": "公司总部",
    "value": 10000000,
    "children": [
      {
        "name": "华东区",
        "value": 4500000,
        "children": [
          {
            "name": "上海分部",
            "value": 2000000,
            "children": [
              { "name": "浦东团队", "value": 800000 },
              { "name": "徐汇团队", "value": 650000 },
              { "name": "静安团队", "value": 550000 }
            ]
          },
          {
            "name": "杭州分部",
            "value": 1500000,
            "children": [
              { "name": "西湖团队", "value": 600000 },
              { "name": "滨江团队", "value": 550000 },
              { "name": "余杭团队", "value": 350000 }
            ]
          },
          {
            "name": "南京分部",
            "value": 1000000,
            "children": [
              { "name": "鼓楼团队", "value": 450000 },
              { "name": "江宁团队", "value": 350000 },
              { "name": "建邺团队", "value": 200000 }
            ]
          }
        ]
      },
      {
        "name": "华北区",
        "value": 3500000,
        "children": [
          {
            "name": "北京分部",
            "value": 1800000,
            "children": [
              { "name": "海淀团队", "value": 750000 },
              { "name": "朝阳团队", "value": 650000 },
              { "name": "丰台团队", "value": 400000 }
            ]
          },
          {
            "name": "天津分部",
            "value": 1000000,
            "children": [
              { "name": "和平团队", "value": 450000 },
              { "name": "南开团队", "value": 350000 },
              { "name": "河西团队", "value": 200000 }
            ]
          },
          {
            "name": "石家庄分部",
            "value": 700000,
            "children": [
              { "name": "长安团队", "value": 350000 },
              { "name": "桥西团队", "value": 220000 },
              { "name": "新华团队", "value": 130000 }
            ]
          }
        ]
      },
      {
        "name": "华南区",
        "value": 2000000,
        "children": [
          {
            "name": "广州分部",
            "value": 1200000,
            "children": [
              { "name": "天河团队", "value": 550000 },
              { "name": "越秀团队", "value": 400000 },
              { "name": "海珠团队", "value": 250000 }
            ]
          },
          {
            "name": "深圳分部",
            "value": 800000,
            "children": [
              { "name": "南山团队", "value": 400000 },
              { "name": "福田团队", "value": 250000 },
              { "name": "宝安团队", "value": 150000 }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## 7. 漏斗数据 (漏斗图)

### 7.1 用户转化漏斗

```json
{
  "title": "用户转化漏斗",
  "data": [
    { "stage": "访问网站", "value": 100000, "percentage": 100, "conversionRate": 100 },
    { "stage": "注册账号", "value": 45000, "percentage": 45, "conversionRate": 45 },
    { "stage": "浏览产品", "value": 32000, "percentage": 32, "conversionRate": 71 },
    { "stage": "加入购物车", "value": 18500, "percentage": 18.5, "conversionRate": 58 },
    { "stage": "开始结账", "value": 12800, "percentage": 12.8, "conversionRate": 69 },
    { "stage": "完成支付", "value": 9600, "percentage": 9.6, "conversionRate": 75 }
  ]
}
```

### 7.2 销售流程漏斗

```json
{
  "title": "销售流程漏斗",
  "data": [
    { "stage": "潜在客户", "value": 50000, "percentage": 100, "count": 50000 },
    { "stage": "初次接触", "value": 28000, "percentage": 56, "count": 28000 },
    { "stage": "需求确认", "value": 16500, "percentage": 33, "count": 16500 },
    { "stage": "方案提交", "value": 9800, "percentage": 19.6, "count": 9800 },
    { "stage": "商务谈判", "value": 6200, "percentage": 12.4, "count": 6200 },
    { "stage": "签约成交", "value": 3800, "percentage": 7.6, "count": 3800 }
  ]
}
```

---

## 8. 雷达图数据

### 8.1 产品性能对比

```json
{
  "title": "产品性能对比",
  "indicators": [
    { "name": "性能", "max": 100 },
    { "name": "价格", "max": 100 },
    { "name": "易用性", "max": 100 },
    { "name": "稳定性", "max": 100 },
    { "name": "扩展性", "max": 100 },
    { "name": "安全性", "max": 100 },
    { "name": "文档质量", "max": 100 },
    { "name": "社区支持", "max": 100 }
  ],
  "data": [
    {
      "name": "产品A",
      "values": [85, 70, 90, 88, 75, 92, 80, 85]
    },
    {
      "name": "产品B",
      "values": [75, 85, 80, 82, 88, 85, 90, 92]
    },
    {
      "name": "产品C",
      "values": [92, 60, 75, 90, 70, 88, 65, 70]
    },
    {
      "name": "产品D",
      "values": [70, 90, 85, 75, 92, 80, 88, 86]
    }
  ]
}
```

---

## 9. 表格数据 (CSV格式)

### 9.1 区域产品季度销售数据

```csv
region,product,quarter,sales,profit,growth,customers,orders
华东,笔记本电脑,Q1,1250000,280000,12.5,5200,8500
华东,笔记本电脑,Q2,1380000,320000,10.4,5680,9200
华东,笔记本电脑,Q3,1450000,350000,5.1,5950,9650
华东,笔记本电脑,Q4,1620000,400000,11.7,6420,10500
华东,台式电脑,Q1,850000,180000,8.2,3200,4800
华东,台式电脑,Q2,920000,210000,8.2,3480,5200
华东,台式电脑,Q3,880000,190000,-4.3,3350,5050
华东,台式电脑,Q4,950000,230000,8.0,3620,5450
华东,平板电脑,Q1,620000,145000,15.8,2800,4200
华东,平板电脑,Q2,710000,172000,14.5,3180,4750
华东,平板电脑,Q3,780000,195000,9.9,3450,5100
华东,平板电脑,Q4,890000,228000,14.1,3850,5650
华北,笔记本电脑,Q1,980000,220000,15.3,4100,6800
华北,笔记本电脑,Q2,1120000,260000,14.3,4680,7750
华北,笔记本电脑,Q3,1180000,280000,5.4,4920,8150
华北,笔记本电脑,Q4,1350000,330000,14.4,5480,9050
华北,台式电脑,Q1,720000,150000,6.7,2650,3950
华北,台式电脑,Q2,780000,170000,8.3,2880,4250
华北,台式电脑,Q3,750000,160000,-3.8,2780,4150
华北,台式电脑,Q4,820000,190000,9.3,3020,4500
华北,平板电脑,Q1,520000,118000,18.5,2200,3400
华北,平板电脑,Q2,615000,145000,18.3,2580,3950
华北,平板电脑,Q3,685000,168000,11.4,2850,4350
华北,平板电脑,Q4,790000,198000,15.3,3180,4850
华南,笔记本电脑,Q1,880000,190000,18.2,3680,6100
华南,笔记本电脑,Q2,1020000,240000,15.9,4220,7050
华南,笔记本电脑,Q3,1080000,260000,5.9,4450,7400
华南,笔记本电脑,Q4,1220000,300000,13.0,4920,8200
华南,台式电脑,Q1,620000,130000,7.5,2280,3400
华南,台式电脑,Q2,680000,150000,9.7,2520,3750
华南,台式电脑,Q3,650000,140000,-4.4,2420,3600
华南,台式电脑,Q4,710000,170000,9.2,2650,3950
华南,平板电脑,Q1,480000,108000,22.5,1950,3050
华南,平板电脑,Q2,570000,138000,18.8,2320,3600
华南,平板电脑,Q3,640000,160000,12.3,2580,3950
华南,平板电脑,Q4,750000,192000,17.2,2920,4450
```

---

## 10. 混合数据集

### 10.1 完整业务仪表板数据

```json
{
  "title": "业务综合仪表板",
  "overview": {
    "totalRevenue": 18500000,
    "totalOrders": 125000,
    "totalCustomers": 85000,
    "avgOrderValue": 148,
    "growth": 15.8
  },
  "kpi": [
    { "metric": "日活跃用户", "value": 28500, "target": 30000, "completion": 95 },
    { "metric": "月新增用户", "value": 12800, "target": 12000, "completion": 107 },
    { "metric": "客户留存率", "value": 78.5, "target": 75, "completion": 105 },
    { "metric": "订单完成率", "value": 92.3, "target": 90, "completion": 103 },
    { "metric": "客户满意度", "value": 4.6, "target": 4.5, "completion": 102 }
  ],
  "topProducts": [
    { "name": "产品A", "sales": 3850000, "growth": 18.5 },
    { "name": "产品B", "sales": 2920000, "growth": 12.3 },
    { "name": "产品C", "sales": 2480000, "growth": 15.7 },
    { "name": "产品D", "sales": 1850000, "growth": 8.9 },
    { "name": "产品E", "sales": 1420000, "growth": 22.1 }
  ],
  "channelDistribution": [
    { "channel": "线上商城", "revenue": 8500000, "percentage": 45.9 },
    { "channel": "移动APP", "revenue": 6200000, "percentage": 33.5 },
    { "channel": "线下门店", "revenue": 2800000, "percentage": 15.1 },
    { "channel": "第三方平台", "revenue": 1000000, "percentage": 5.5 }
  ]
}
```

---

---

## 11. 桑基图数据 (流量流向)

### 11.1 用户来源到转化路径

```json
{
  "title": "用户流量流向分析",
  "nodes": [
    { "name": "搜索引擎" },
    { "name": "社交媒体" },
    { "name": "直接访问" },
    { "name": "广告投放" },
    { "name": "首页" },
    { "name": "产品页" },
    { "name": "分类页" },
    { "name": "购物车" },
    { "name": "结账" },
    { "name": "支付成功" },
    { "name": "离开" }
  ],
  "links": [
    { "source": "搜索引擎", "target": "首页", "value": 35000 },
    { "source": "搜索引擎", "target": "产品页", "value": 28000 },
    { "source": "社交媒体", "target": "首页", "value": 22000 },
    { "source": "社交媒体", "target": "产品页", "value": 15000 },
    { "source": "直接访问", "target": "首页", "value": 18000 },
    { "source": "广告投放", "target": "产品页", "value": 12000 },
    { "source": "首页", "target": "产品页", "value": 45000 },
    { "source": "首页", "target": "分类页", "value": 20000 },
    { "source": "首页", "target": "离开", "value": 10000 },
    { "source": "产品页", "target": "购物车", "value": 58000 },
    { "source": "产品页", "target": "离开", "value": 42000 },
    { "source": "分类页", "target": "产品页", "value": 12000 },
    { "source": "分类页", "target": "离开", "value": 8000 },
    { "source": "购物车", "target": "结账", "value": 38000 },
    { "source": "购物车", "target": "离开", "value": 20000 },
    { "source": "结账", "target": "支付成功", "value": 28500 },
    { "source": "结账", "target": "离开", "value": 9500 }
  ]
}
```

---

## 12. 地图数据 (地理可视化)

### 12.1 全国城市销售数据

```json
{
  "title": "全国主要城市销售分布",
  "data": [
    { "name": "北京", "value": 8520, "growth": 12.3, "lat": 39.9042, "lng": 116.4074 },
    { "name": "上海", "value": 9850, "growth": 15.7, "lat": 31.2304, "lng": 121.4737 },
    { "name": "广州", "value": 7320, "growth": 10.8, "lat": 23.1291, "lng": 113.2644 },
    { "name": "深圳", "value": 8960, "growth": 18.2, "lat": 22.5431, "lng": 114.0579 },
    { "name": "杭州", "value": 6850, "growth": 16.5, "lat": 30.2741, "lng": 120.1551 },
    { "name": "成都", "value": 5920, "growth": 14.2, "lat": 30.5728, "lng": 104.0668 },
    { "name": "重庆", "value": 5480, "growth": 11.9, "lat": 29.5630, "lng": 106.5516 },
    { "name": "武汉", "value": 5120, "growth": 13.4, "lat": 30.5928, "lng": 114.3055 },
    { "name": "西安", "value": 4650, "growth": 10.5, "lat": 34.3416, "lng": 108.9398 },
    { "name": "南京", "value": 4980, "growth": 12.8, "lat": 32.0603, "lng": 118.7969 },
    { "name": "天津", "value": 4520, "growth": 9.7, "lat": 39.3434, "lng": 117.3616 },
    { "name": "苏州", "value": 5280, "growth": 15.3, "lat": 31.2989, "lng": 120.5853 },
    { "name": "郑州", "value": 3850, "growth": 11.2, "lat": 34.7466, "lng": 113.6253 },
    { "name": "长沙", "value": 3620, "growth": 13.8, "lat": 28.2282, "lng": 112.9388 },
    { "name": "沈阳", "value": 3180, "growth": 8.5, "lat": 41.8057, "lng": 123.4328 },
    { "name": "青岛", "value": 3950, "growth": 12.1, "lat": 36.0671, "lng": 120.3826 },
    { "name": "大连", "value": 2980, "growth": 9.3, "lat": 38.9140, "lng": 121.6147 },
    { "name": "厦门", "value": 2750, "growth": 14.6, "lat": 24.4798, "lng": 118.0894 },
    { "name": "宁波", "value": 3420, "growth": 11.8, "lat": 29.8683, "lng": 121.5440 },
    { "name": "无锡", "value": 3180, "growth": 10.9, "lat": 31.4912, "lng": 120.3119 }
  ]
}
```

### 12.2 省份数据（热力图）

```json
{
  "title": "各省销售热力图",
  "data": [
    { "name": "广东", "value": 52800 },
    { "name": "江苏", "value": 48500 },
    { "name": "浙江", "value": 45200 },
    { "name": "山东", "value": 42800 },
    { "name": "河南", "value": 35600 },
    { "name": "四川", "value": 32400 },
    { "name": "湖北", "value": 29800 },
    { "name": "河北", "value": 28500 },
    { "name": "湖南", "value": 27200 },
    { "name": "福建", "value": 25800 },
    { "name": "上海", "value": 38900 },
    { "name": "北京", "value": 36500 },
    { "name": "安徽", "value": 24500 },
    { "name": "陕西", "value": 22800 },
    { "name": "江西", "value": 19500 },
    { "name": "重庆", "value": 21200 },
    { "name": "辽宁", "value": 20800 },
    { "name": "云南", "value": 18600 },
    { "name": "广西", "value": 17900 },
    { "name": "山西", "value": 16200 },
    { "name": "贵州", "value": 14500 },
    { "name": "吉林", "value": 13800 },
    { "name": "黑龙江", "value": 12500 },
    { "name": "天津", "value": 19800 },
    { "name": "甘肃", "value": 10200 },
    { "name": "新疆", "value": 9500 },
    { "name": "内蒙古", "value": 11200 },
    { "name": "海南", "value": 8800 },
    { "name": "宁夏", "value": 6500 },
    { "name": "青海", "value": 5200 },
    { "name": "西藏", "value": 3800 }
  ]
}
```

---

## 13. 仪表盘数据 (Gauge)

### 13.1 关键指标仪表盘

```json
{
  "title": "业务关键指标仪表盘",
  "metrics": [
    {
      "name": "销售完成率",
      "value": 87.5,
      "target": 100,
      "unit": "%",
      "ranges": [
        { "min": 0, "max": 60, "color": "#ff4757", "label": "差" },
        { "min": 60, "max": 80, "color": "#ffa502", "label": "中" },
        { "min": 80, "max": 100, "color": "#26de81", "label": "优" }
      ]
    },
    {
      "name": "客户满意度",
      "value": 4.6,
      "target": 5.0,
      "unit": "分",
      "ranges": [
        { "min": 0, "max": 3, "color": "#ff4757", "label": "差" },
        { "min": 3, "max": 4, "color": "#ffa502", "label": "中" },
        { "min": 4, "max": 5, "color": "#26de81", "label": "优" }
      ]
    },
    {
      "name": "系统负载",
      "value": 68.3,
      "target": 100,
      "unit": "%",
      "ranges": [
        { "min": 0, "max": 70, "color": "#26de81", "label": "正常" },
        { "min": 70, "max": 90, "color": "#ffa502", "label": "警告" },
        { "min": 90, "max": 100, "color": "#ff4757", "label": "危险" }
      ]
    },
    {
      "name": "库存周转率",
      "value": 6.8,
      "target": 8.0,
      "unit": "次/年",
      "ranges": [
        { "min": 0, "max": 4, "color": "#ff4757", "label": "慢" },
        { "min": 4, "max": 7, "color": "#ffa502", "label": "中" },
        { "min": 7, "max": 10, "color": "#26de81", "label": "快" }
      ]
    }
  ]
}
```

---

## 14. 词云数据 (Word Cloud)

### 14.1 用户评论关键词

```json
{
  "title": "用户评论关键词词云",
  "data": [
    { "name": "质量好", "value": 2850 },
    { "name": "物流快", "value": 2420 },
    { "name": "性价比高", "value": 2180 },
    { "name": "服务态度好", "value": 1980 },
    { "name": "包装精美", "value": 1650 },
    { "name": "正品", "value": 1520 },
    { "name": "值得购买", "value": 1420 },
    { "name": "超出期待", "value": 1280 },
    { "name": "推荐", "value": 1180 },
    { "name": "好用", "value": 1050 },
    { "name": "便宜", "value": 980 },
    { "name": "实惠", "value": 920 },
    { "name": "满意", "value": 880 },
    { "name": "快速发货", "value": 820 },
    { "name": "颜值高", "value": 750 },
    { "name": "做工精细", "value": 680 },
    { "name": "材质好", "value": 620 },
    { "name": "售后好", "value": 580 },
    { "name": "回购", "value": 520 },
    { "name": "耐用", "value": 480 },
    { "name": "功能强大", "value": 450 },
    { "name": "简单易用", "value": 420 },
    { "name": "设计合理", "value": 380 },
    { "name": "舒适", "value": 350 },
    { "name": "美观", "value": 320 },
    { "name": "静音", "value": 280 },
    { "name": "省电", "value": 250 },
    { "name": "环保", "value": 220 },
    { "name": "安全", "value": 180 },
    { "name": "智能", "value": 150 }
  ]
}
```

---

## 15. 箱线图数据 (Box Plot)

### 15.1 各地区销售额分布

```json
{
  "title": "各地区销售额分布统计",
  "data": [
    {
      "region": "华东",
      "min": 8500,
      "q1": 12800,
      "median": 15600,
      "q3": 19200,
      "max": 25800,
      "outliers": [7200, 28500, 32000]
    },
    {
      "region": "华北",
      "min": 7200,
      "q1": 10500,
      "median": 13800,
      "q3": 16900,
      "max": 22500,
      "outliers": [6500, 24800]
    },
    {
      "region": "华南",
      "min": 6800,
      "q1": 9800,
      "median": 12500,
      "q3": 15200,
      "max": 20800,
      "outliers": [5900, 23500]
    },
    {
      "region": "西南",
      "min": 5200,
      "q1": 7800,
      "median": 10200,
      "q3": 12800,
      "max": 16500,
      "outliers": [4500, 18200]
    },
    {
      "region": "西北",
      "min": 4500,
      "q1": 6500,
      "median": 8800,
      "q3": 11200,
      "max": 14800,
      "outliers": [3800, 16500]
    },
    {
      "region": "东北",
      "min": 4800,
      "q1": 7200,
      "median": 9500,
      "q3": 12000,
      "max": 15200,
      "outliers": [4200, 17800]
    }
  ]
}
```

---

## 16. K线图数据 (股票/金融)

### 16.1 股票价格数据 (60天)

```json
{
  "title": "股票K线数据",
  "data": [
    { "date": "2024-09-01", "open": 125.50, "close": 128.20, "high": 129.80, "low": 124.30, "volume": 8520000 },
    { "date": "2024-09-02", "open": 128.30, "close": 126.80, "high": 130.50, "low": 126.20, "volume": 9850000 },
    { "date": "2024-09-03", "open": 126.90, "close": 129.50, "high": 131.20, "low": 126.50, "volume": 10200000 },
    { "date": "2024-09-04", "open": 129.60, "close": 131.80, "high": 133.50, "low": 128.90, "volume": 11500000 },
    { "date": "2024-09-05", "open": 131.90, "close": 130.20, "high": 134.20, "low": 129.80, "volume": 9680000 },
    { "date": "2024-09-06", "open": 130.30, "close": 132.50, "high": 134.80, "low": 129.50, "volume": 10800000 },
    { "date": "2024-09-09", "open": 132.60, "close": 135.20, "high": 136.90, "low": 131.80, "volume": 12500000 },
    { "date": "2024-09-10", "open": 135.30, "close": 133.80, "high": 137.50, "low": 133.20, "volume": 11200000 },
    { "date": "2024-09-11", "open": 133.90, "close": 136.50, "high": 138.20, "low": 133.50, "volume": 10900000 },
    { "date": "2024-09-12", "open": 136.60, "close": 138.80, "high": 140.50, "low": 135.90, "volume": 13800000 },
    { "date": "2024-09-13", "open": 138.90, "close": 137.20, "high": 141.20, "low": 136.80, "volume": 12200000 },
    { "date": "2024-09-16", "open": 137.30, "close": 139.50, "high": 141.80, "low": 136.50, "volume": 11500000 },
    { "date": "2024-09-17", "open": 139.60, "close": 141.20, "high": 143.50, "low": 138.80, "volume": 14200000 },
    { "date": "2024-09-18", "open": 141.30, "close": 139.80, "high": 144.20, "low": 139.20, "volume": 13500000 },
    { "date": "2024-09-19", "open": 139.90, "close": 142.50, "high": 144.80, "low": 139.50, "volume": 12800000 },
    { "date": "2024-09-20", "open": 142.60, "close": 145.20, "high": 147.50, "low": 141.80, "volume": 15800000 },
    { "date": "2024-09-23", "open": 145.30, "close": 143.80, "high": 148.20, "low": 143.20, "volume": 14500000 },
    { "date": "2024-09-24", "open": 143.90, "close": 146.50, "high": 148.80, "low": 143.50, "volume": 13900000 },
    { "date": "2024-09-25", "open": 146.60, "close": 144.20, "high": 149.50, "low": 143.80, "volume": 12500000 },
    { "date": "2024-09-26", "open": 144.30, "close": 147.80, "high": 149.80, "low": 143.90, "volume": 14800000 },
    { "date": "2024-09-27", "open": 147.90, "close": 150.50, "high": 152.80, "low": 147.20, "volume": 16500000 },
    { "date": "2024-09-30", "open": 150.60, "close": 148.80, "high": 153.50, "low": 148.20, "volume": 15200000 },
    { "date": "2024-10-08", "open": 148.90, "close": 151.20, "high": 153.80, "low": 148.50, "volume": 14800000 },
    { "date": "2024-10-09", "open": 151.30, "close": 149.50, "high": 154.20, "low": 149.20, "volume": 13500000 },
    { "date": "2024-10-10", "open": 149.60, "close": 152.80, "high": 154.50, "low": 149.30, "volume": 14200000 },
    { "date": "2024-10-11", "open": 152.90, "close": 155.50, "high": 157.80, "low": 152.20, "volume": 17200000 },
    { "date": "2024-10-14", "open": 155.60, "close": 153.80, "high": 158.50, "low": 153.20, "volume": 16800000 },
    { "date": "2024-10-15", "open": 153.90, "close": 156.20, "high": 158.80, "low": 153.50, "volume": 15500000 },
    { "date": "2024-10-16", "open": 156.30, "close": 154.50, "high": 159.20, "low": 154.20, "volume": 14900000 },
    { "date": "2024-10-17", "open": 154.60, "close": 157.80, "high": 159.50, "low": 154.30, "volume": 16200000 }
  ]
}
```

---

## 17. 面积堆叠图数据

### 17.1 移动端与PC端流量对比

```json
{
  "title": "多渠道流量趋势",
  "data": [
    { "date": "2024-01", "mobile": 18500, "pc": 12800, "tablet": 3200, "other": 800 },
    { "date": "2024-02", "mobile": 19800, "pc": 12200, "tablet": 3400, "other": 850 },
    { "date": "2024-03", "mobile": 21200, "pc": 11800, "tablet": 3600, "other": 900 },
    { "date": "2024-04", "mobile": 22800, "pc": 11200, "tablet": 3850, "other": 920 },
    { "date": "2024-05", "mobile": 24500, "pc": 10800, "tablet": 4100, "other": 980 },
    { "date": "2024-06", "mobile": 26200, "pc": 10200, "tablet": 4350, "other": 1020 },
    { "date": "2024-07", "mobile": 28500, "pc": 9800, "tablet": 4600, "other": 1100 },
    { "date": "2024-08", "mobile": 29800, "pc": 9500, "tablet": 4850, "other": 1150 },
    { "date": "2024-09", "mobile": 31500, "pc": 9200, "tablet": 5100, "other": 1200 },
    { "date": "2024-10", "mobile": 33200, "pc": 8900, "tablet": 5350, "other": 1280 },
    { "date": "2024-11", "mobile": 35800, "pc": 8500, "tablet": 5600, "other": 1350 },
    { "date": "2024-12", "mobile": 38500, "pc": 8200, "tablet": 5900, "other": 1400 }
  ]
}
```

---

## 18. 日历热力图数据

### 18.1 全年每日提交数据

```json
{
  "title": "2024年每日活跃度",
  "data": [
    ["2024-01-01", 85], ["2024-01-02", 92], ["2024-01-03", 78], ["2024-01-04", 88], ["2024-01-05", 95],
    ["2024-01-06", 65], ["2024-01-07", 58], ["2024-01-08", 105], ["2024-01-09", 112], ["2024-01-10", 98],
    ["2024-01-11", 102], ["2024-01-12", 108], ["2024-01-13", 72], ["2024-01-14", 68], ["2024-01-15", 115],
    ["2024-01-16", 122], ["2024-01-17", 118], ["2024-01-18", 125], ["2024-01-19", 128], ["2024-01-20", 82],
    ["2024-01-21", 75], ["2024-01-22", 132], ["2024-01-23", 138], ["2024-01-24", 135], ["2024-01-25", 142],
    ["2024-01-26", 145], ["2024-01-27", 92], ["2024-01-28", 88], ["2024-01-29", 148], ["2024-01-30", 152],
    ["2024-01-31", 155]
  ]
}
```

---

## 19. 平行坐标系数据

### 19.1 多维度产品对比

```json
{
  "title": "产品多维度对比",
  "dimensions": ["价格", "销量", "评分", "库存", "利润率", "退货率"],
  "data": [
    { "name": "产品A", "values": [299, 8500, 4.8, 1200, 35, 2.5] },
    { "name": "产品B", "values": [199, 12800, 4.5, 2500, 28, 3.8] },
    { "name": "产品C", "values": [499, 3200, 4.9, 580, 45, 1.2] },
    { "name": "产品D", "values": [159, 15600, 4.2, 3800, 22, 5.2] },
    { "name": "产品E", "values": [399, 5800, 4.7, 980, 38, 2.8] },
    { "name": "产品F", "values": [599, 2100, 5.0, 320, 52, 0.8] },
    { "name": "产品G", "values": "129, 18500, 4.0, 5200, 18, 6.5] },
    { "name": "产品H", "values": [349, 6800, 4.6, 1450, 32, 3.2] },
    { "name": "产品I", "values": [799, 1580, 4.9, 180, 58, 1.5] },
    { "name": "产品J", "values": [259, 9800, 4.4, 2180, 30, 4.1] }
  ]
}
```

---

## 20. 矩形树图数据 (Treemap)

### 20.1 资产分配结构

```json
{
  "title": "投资组合分配",
  "data": [
    {
      "name": "股票",
      "value": 4500000,
      "children": [
        { "name": "科技股", "value": 1800000, "change": 15.2 },
        { "name": "金融股", "value": 1200000, "change": 8.5 },
        { "name": "消费股", "value": 950000, "change": 12.8 },
        { "name": "医药股", "value": 550000, "change": 18.3 }
      ]
    },
    {
      "name": "债券",
      "value": 2800000,
      "children": [
        { "name": "国债", "value": 1500000, "change": 3.2 },
        { "name": "企业债", "value": 850000, "change": 5.8 },
        { "name": "地方债", "value": 450000, "change": 4.1 }
      ]
    },
    {
      "name": "基金",
      "value": 1800000,
      "children": [
        { "name": "指数基金", "value": 800000, "change": 11.5 },
        { "name": "混合基金", "value": 650000, "change": 9.8 },
        { "name": "债券基金", "value": 350000, "change": 4.5 }
      ]
    },
    {
      "name": "现金及等价物",
      "value": 900000,
      "children": [
        { "name": "活期存款", "value": 500000, "change": 0.3 },
        { "name": "定期存款", "value": 300000, "change": 2.5 },
        { "name": "货币基金", "value": 100000, "change": 2.8 }
      ]
    }
  ]
}
```

---

## 21. 瀑布图数据 (Waterfall)

### 21.1 财务盈利分解

```json
{
  "title": "年度利润构成分析",
  "data": [
    { "name": "营业收入", "value": 85000000, "type": "total" },
    { "name": "产品成本", "value": -32000000, "type": "negative" },
    { "name": "运营费用", "value": -18500000, "type": "negative" },
    { "name": "营销费用", "value": -12800000, "type": "negative" },
    { "name": "研发费用", "value": -8200000, "type": "negative" },
    { "name": "毛利润", "value": 13500000, "type": "subtotal" },
    { "name": "其他收入", "value": 2800000, "type": "positive" },
    { "name": "税费", "value": -4200000, "type": "negative" },
    { "name": "净利润", "value": 12100000, "type": "total" }
  ]
}
```

---

## 22. 象形柱图数据 (Pictorial Bar)

### 22.1 水资源使用情况

```json
{
  "title": "各部门水资源使用",
  "data": [
    { "department": "生产部", "usage": 8500, "quota": 10000, "percentage": 85 },
    { "department": "研发部", "usage": 2800, "quota": 3500, "percentage": 80 },
    { "department": "行政部", "usage": 1200, "quota": 1500, "percentage": 80 },
    { "department": "销售部", "usage": 1800, "quota": 2000, "percentage": 90 },
    { "department": "后勤部", "usage": 3200, "quota": 4000, "percentage": 80 }
  ]
}
```

---

## 23. 业务场景数据集

### 23.1 电商场景 - 用户购买行为分析

```json
{
  "title": "电商用户购买行为",
  "userBehavior": [
    { "userId": 1001, "browseDuration": 1250, "pageViews": 25, "cartItems": 5, "purchaseAmount": 1280, "deviceType": "mobile" },
    { "userId": 1002, "browseDuration": 850, "pageViews": 18, "cartItems": 3, "purchaseAmount": 580, "deviceType": "pc" },
    { "userId": 1003, "browseDuration": 2100, "pageViews": 42, "cartItems": 8, "purchaseAmount": 2850, "deviceType": "mobile" },
    { "userId": 1004, "browseDuration": 680, "pageViews": 12, "cartItems": 2, "purchaseAmount": 320, "deviceType": "tablet" },
    { "userId": 1005, "browseDuration": 1580, "pageViews": 32, "cartItems": 6, "purchaseAmount": 1650, "deviceType": "pc" }
  ],
  "productPerformance": [
    { "productId": "P001", "views": 28500, "clicks": 8500, "addToCart": 3200, "purchases": 1850, "revenue": 555000 },
    { "productId": "P002", "views": 32000, "clicks": 9800, "addToCart": 4100, "purchases": 2450, "revenue": 490000 },
    { "productId": "P003", "views": 18500, "clicks": 5200, "addToCart": 2100, "purchases": 1280, "revenue": 640000 },
    { "productId": "P004", "views": 42000, "clicks": 12800, "addToCart": 5800, "purchases": 3500, "revenue": 350000 },
    { "productId": "P005", "views": 25000, "clicks": 7200, "addToCart": 2900, "purchases": 1680, "revenue": 672000 }
  ]
}
```

### 23.2 金融场景 - 交易数据分析

```json
{
  "title": "金融交易数据",
  "transactionStats": [
    { "hour": 9, "buyVolume": 125000000, "sellVolume": 98000000, "transactions": 8500 },
    { "hour": 10, "buyVolume": 185000000, "sellVolume": 165000000, "transactions": 12800 },
    { "hour": 11, "buyVolume": 158000000, "sellVolume": 142000000, "transactions": 10500 },
    { "hour": 13, "buyVolume": 142000000, "sellVolume": 138000000, "transactions": 9200 },
    { "hour": 14, "buyVolume": 168000000, "sellVolume": 152000000, "transactions": 11800 },
    { "hour": 15, "buyVolume": 195000000, "sellVolume": 188000000, "transactions": 15200 }
  ],
  "riskMetrics": [
    { "metric": "VaR (95%)", "value": 2850000, "threshold": 5000000, "status": "正常" },
    { "metric": "波动率", "value": 18.5, "threshold": 25.0, "status": "正常" },
    { "metric": "最大回撤", "value": 12.3, "threshold": 20.0, "status": "正常" },
    { "metric": "夏普比率", "value": 1.85, "threshold": 1.0, "status": "优秀" }
  ]
}
```

### 23.3 医疗场景 - 患者数据统计

```json
{
  "title": "医院患者数据统计",
  "departmentStats": [
    { "department": "内科", "outpatient": 1850, "inpatient": 320, "avgWaitTime": 45, "satisfaction": 4.2 },
    { "department": "外科", "outpatient": 980, "inpatient": 580, "avgWaitTime": 38, "satisfaction": 4.5 },
    { "department": "儿科", "outpatient": 2280, "inpatient": 185, "avgWaitTime": 52, "satisfaction": 4.3 },
    { "department": "妇产科", "outpatient": 1420, "inpatient": 420, "avgWaitTime": 42, "satisfaction": 4.6 },
    { "department": "急诊科", "outpatient": 3850, "inpatient": 280, "avgWaitTime": 25, "satisfaction": 4.1 },
    { "department": "骨科", "outpatient": 1150, "inpatient": 380, "avgWaitTime": 40, "satisfaction": 4.4 }
  ],
  "ageDistribution": [
    { "ageGroup": "0-10岁", "male": 1250, "female": 1180 },
    { "ageGroup": "11-20岁", "male": 850, "female": 920 },
    { "ageGroup": "21-30岁", "male": 1580, "female": 1820 },
    { "ageGroup": "31-40岁", "male": 1920, "female": 2150 },
    { "ageGroup": "41-50岁", "male": 2280, "female": 2450 },
    { "ageGroup": "51-60岁", "male": 2650, "female": 2820 },
    { "ageGroup": "61岁以上", "male": 3180, "female": 3520 }
  ]
}
```

### 23.4 教育场景 - 学生成绩分析

```json
{
  "title": "学生成绩分析",
  "scoreDistribution": [
    { "subject": "语文", "excellent": 128, "good": 285, "average": 180, "poor": 42 },
    { "subject": "数学", "excellent": 156, "good": 258, "average": 165, "poor": 56 },
    { "subject": "英语", "excellent": 142, "good": 272, "average": 175, "poor": 46 },
    { "subject": "物理", "excellent": 98, "good": 215, "average": 198, "poor": 124 },
    { "subject": "化学", "excellent": 105, "good": 225, "average": 190, "poor": 115 },
    { "subject": "生物", "excellent": 118, "good": 242, "average": 182, "poor": 93 }
  ],
  "classComparison": [
    { "class": "一班", "avgScore": 85.6, "maxScore": 98, "minScore": 52, "passRate": 92.5 },
    { "class": "二班", "avgScore": 82.3, "maxScore": 95, "minScore": 48, "passRate": 88.8 },
    { "class": "三班", "avgScore": 87.2, "maxScore": 99, "minScore": 55, "passRate": 94.2 },
    { "class": "四班", "avgScore": 83.8, "maxScore": 96, "minScore": 50, "passRate": 90.5 },
    { "class": "五班", "avgScore": 86.5, "maxScore": 97, "minScore": 53, "passRate": 93.8 }
  ]
}
```

### 23.5 物流场景 - 配送数据分析

```json
{
  "title": "物流配送数据",
  "deliveryStats": [
    { "region": "华东", "totalOrders": 28500, "onTimeDelivery": 26800, "delayed": 1520, "returned": 180, "avgTime": 28.5 },
    { "region": "华北", "totalOrders": 22800, "onTimeDelivery": 21200, "delayed": 1420, "returned": 180, "avgTime": 32.8 },
    { "region": "华南", "totalOrders": 25600, "onTimeDelivery": 24100, "delayed": 1320, "returned": 180, "avgTime": 26.2 },
    { "region": "西南", "totalOrders": 18200, "onTimeDelivery": 16500, "delayed": 1520, "returned": 180, "avgTime": 42.5 },
    { "region": "西北", "totalOrders": 12500, "onTimeDelivery": 11200, "delayed": 1150, "returned": 150, "avgTime": 48.8 },
    { "region": "东北", "totalOrders": 15800, "onTimeDelivery": 14500, "delayed": 1180, "returned": 120, "avgTime": 38.5 }
  ],
  "vehicleUtilization": [
    { "vehicleType": "小型货车", "count": 1250, "utilization": 85.6, "mileage": 285000 },
    { "vehicleType": "中型货车", "count": 850, "utilization": 88.2, "mileage": 520000 },
    { "vehicleType": "大型货车", "count": 420, "utilization": 92.5, "mileage": 680000 },
    { "vehicleType": "电动车", "count": 3200, "utilization": 78.5, "mileage": 128000 }
  ]
}
```

---

## 使用说明

### 图表类型分类

1. **时间序列类**: 折线图、面积图、K线图、日历热力图
2. **分类对比类**: 柱状图、条形图、饼图、环形图、雷达图
3. **关系分布类**: 散点图、气泡图、热力图、箱线图
4. **层级结构类**: 树状图、旭日图、矩形树图
5. **流程转化类**: 漏斗图、桑基图、瀑布图
6. **地理空间类**: 地图、热力地图
7. **网络关系类**: 力导向图、关系图
8. **特殊图表**: 仪表盘、词云、象形柱图、平行坐标系

### 业务场景覆盖

- **电商**: 用户行为、商品销售、流量转化
- **金融**: 股票行情、交易数据、风险指标
- **医疗**: 患者统计、科室数据、年龄分布
- **教育**: 成绩分析、班级对比、科目统计
- **物流**: 配送数据、车辆管理、区域分析
- **企业**: 销售业绩、组织架构、财务分析

### 数据特点

- 包含**正常分布、异常值、趋势变化**等多种数据模式
- 涵盖**多时间粒度**：年、季、月、周、日、时
- 提供**多维度指标**：数量、金额、比率、增长率等
- 支持**多种格式**：JSON、CSV
- 适用于**主流可视化库**：ECharts、D3.js、Chart.js、Highcharts、AntV

所有数据均为真实业务场景模拟，可直接用于可视化开发和测试。
