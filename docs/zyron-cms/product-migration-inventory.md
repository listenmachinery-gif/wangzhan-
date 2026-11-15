# 产品详情页迁移对照表

更新时间：2026-11-15

## 口径与状态

- 盘点范围：`data/products.ts` 中 8 个分类、53 个产品；旧路由和新路由必须完全一致。
- 原文案、图片和参数的权威来源是 `data/products.ts` 与对应的 `data/*-page.ts`；表中的数量用于发现迁移丢失，不替代逐字段审阅。
- SEO 基线来自产品路由的 metadata，已发布的数据库 SEO 记录只按同一路径覆盖；不得改变 canonical。
- 数据库已发布产品由 `StandardProductPage` 渲染，并按 Hero、产品优势、应用场景、产品图集、型号参数、技术特性、选型指南、FAQ、询盘 CTA 九区块组织。
- 旧组件仍作为显式兼容回退保留。只有逐页完成 URL、文案、图片、参数、Metadata、桌面端、移动端和询盘入口核验并经人工视觉确认后，状态才可改为“已验收”，旧组件才可删除。
- 当前 dry-run：53 个产品映射为 1,272 个模块；470 个嵌套字段被记录为待核内容，0 个歧义、0 个跳过。待核不等于丢失，迁移器会保留报告且不编造内容。

## 迁移清单

“文案”是源字符串盘点数，“图片”是去重后的本地媒体引用数，“参数”是基础规格项数加技术参数行数。

| 产品名称 | 旧路由 | 新路由 | 原文案 | 原图片 | 参数表 | SEO Metadata | 当前渲染组件 | 迁移状态 |
|---|---|---|---:|---:|---:|---|---|---|
| Foot Shear | `/products/foot-shear` | 同旧路由 | 200 段 | 15 张/引用 | 4 项 + 3 行 | 路由 metadata + 发布覆盖 | FootShearSolutionPage → StandardProductPage | 已映射；35 项待核；视觉待确认 |
| Reel Shear Beading Machine | `/products/reel-shear-beading-machine` | 同旧路由 | 145 段 | 1 张/引用 | 4 项 + 1 行 | 路由 metadata + 发布覆盖 | ReelShearBeadingSolutionPage → StandardProductPage | 已映射；14 项待核；视觉待确认 |
| Compact Electric Shearing Machine | `/products/compact-electric-shearing-machine` | 同旧路由 | 345 段 | 58 张/引用 | 4 项 + 8 行 | 路由 metadata + 发布覆盖 | SmallElectricShearSolutionPage → StandardProductPage | 已映射；46 项待核；视觉待确认 |
| Energy-Saving Electric Shearing Machine | `/products/energy-saving-electric-shearing-machine` | 同旧路由 | 254 段 | 1 张/引用 | 4 项 + 14 行 | 路由 metadata + 发布覆盖 | EnergySavingElectricShearSolutionPage → StandardProductPage | 已映射；29 项待核；视觉待确认 |
| Hydraulic Swing Beam Shear | `/products/hydraulic-swing-beam-shear` | 同旧路由 | 235 段 | 1 张/引用 | 4 项 + 40 行 | 路由 metadata + 发布覆盖 | HydraulicSwingBeamShearSolutionPage → StandardProductPage | 已映射；29 项待核；视觉待确认 |
| Hydraulic Guillotine Shear | `/products/hydraulic-guillotine-shear` | 同旧路由 | 168 段 | 1 张/引用 | 4 项 + 37 行 | 路由 metadata + 发布覆盖 | HydraulicGuillotineShearSolutionPage → StandardProductPage | 已映射；26 项待核；视觉待确认 |
| Manual Sheet Metal Folding Machine | `/products/manual-sheet-metal-folding-machine` | 同旧路由 | 151 段 | 9 张/引用 | 4 项 + 4 行 | 路由 metadata + 发布覆盖 | ManualFoldingMachineSolutionPage → StandardProductPage | 已映射；11 项待核；视觉待确认 |
| Pneumatic Sheet Metal Folding Machine | `/products/pneumatic-sheet-metal-folding-machine` | 同旧路由 | 172 段 | 9 张/引用 | 4 项 + 5 行 | 路由 metadata + 发布覆盖 | PneumaticFoldingMachineSolutionPage → StandardProductPage | 已映射；12 项待核；视觉待确认 |
| Electric Sheet Metal Folding Machine | `/products/electric-sheet-metal-folding-machine` | 同旧路由 | 160 段 | 9 张/引用 | 4 项 + 4 行 | 路由 metadata + 发布覆盖 | ElectricFoldingMachineSolutionPage → StandardProductPage | 已映射；13 项待核；视觉待确认 |
| Hydraulic Sheet Metal Folding Machine | `/products/hydraulic-sheet-metal-folding-machine` | 同旧路由 | 189 段 | 9 张/引用 | 4 项 + 7 行 | 路由 metadata + 发布覆盖 | HydraulicFoldingMachineSolutionPage → StandardProductPage | 已映射；16 项待核；视觉待确认 |
| NC Hydraulic Press Brake | `/products/nc-hydraulic-press-brake` | 同旧路由 | 183 段 | 9 张/引用 | 4 项 + 37 行 | 路由 metadata + 发布覆盖 | NcHydraulicPressBrakeSolutionPage → StandardProductPage | 已映射；31 项待核；视觉待确认 |
| Torsion Bar CNC Press Brake | `/products/torsion-bar-cnc-press-brake` | 同旧路由 | 207 段 | 9 张/引用 | 4 项 + 37 行 | 路由 metadata + 发布覆盖 | TorsionBarCncPressBrakeSolutionPage → StandardProductPage | 已映射；35 项待核；视觉待确认 |
| Electro-Hydraulic Servo CNC Press Brake | `/products/electro-hydraulic-servo-cnc-press-brake` | 同旧路由 | 240 段 | 10 张/引用 | 4 项 + 26 行 | 路由 metadata + 发布覆盖 | ElectroHydraulicServoCncPressBrakeSolutionPage → StandardProductPage | 已映射；29 项待核；视觉待确认 |
| Single-Table Fiber Laser Cutting Machine | `/products/single-table-fiber-laser-cutting-machine` | 同旧路由 | 207 段 | 10 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | SingleTableFiberLaserCuttingMachineSolutionPage → StandardProductPage | 已映射；21 项待核；视觉待确认 |
| Exchange-Table Fiber Laser Cutting Machine | `/products/exchange-table-fiber-laser-cutting-machine` | 同旧路由 | 162 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ExchangeTableFiberLaserCuttingMachineSolutionPage → StandardProductPage | 已映射；15 项待核；视觉待确认 |
| Sheet and Tube Fiber Laser Cutting Machine | `/products/sheet-and-tube-fiber-laser-cutting-machine` | 同旧路由 | 226 段 | 12 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | SheetAndTubeFiberLaserCuttingMachineSolutionPage → StandardProductPage | 已映射；26 项待核；视觉待确认 |
| Fiber Tube Laser Cutting Machine | `/products/fiber-tube-laser-cutting-machine` | 同旧路由 | 193 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | FiberTubeLaserCuttingMachineSolutionPage → StandardProductPage | 已映射；15 项待核；视觉待确认 |
| Electric Two-Roll Plate Rolling Machine | `/products/electric-two-roll-plate-rolling-machine` | 同旧路由 | 196 段 | 11 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ElectricTwoRollPlateRollingMachineSolutionPage → StandardProductPage | 已映射；17 项待核；视觉待确认 |
| Semi-Automatic Three-Roll Plate Rolling Machine | `/products/semi-automatic-three-roll-plate-rolling-machine` | 同旧路由 | 134 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | SemiAutomaticThreeRollPlateRollingMachineSolutionPage → StandardProductPage | 已映射；15 项待核；视觉待确认 |
| Fully Automatic Three-Roll Plate Rolling Machine | `/products/fully-automatic-three-roll-plate-rolling-machine` | 同旧路由 | 210 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | FullyAutomaticThreeRollPlateRollingMachineSolutionPage → StandardProductPage | 已映射；17 项待核；视觉待确认 |
| Hydraulic Four-Roll Plate Rolling Machine | `/products/hydraulic-four-roll-plate-rolling-machine` | 同旧路由 | 211 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | HydraulicFourRollPlateRollingMachineSolutionPage → StandardProductPage | 已映射；18 项待核；视觉待确认 |
| Mechanical Punch Press | `/products/mechanical-punch-press` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Pneumatic Punch Press | `/products/pneumatic-punch-press` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Four-Column Hydraulic Press | `/products/four-column-hydraulic-press` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Five-Line Beading Machine | `/products/five-line-beading-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Multi-Function Lock Forming Machine | `/products/multi-function-lock-forming-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| TDF Flange Forming Machine | `/products/tdf-flange-forming-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Electric Duct Seam Closing Machine | `/products/electric-duct-seam-closing-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Pneumatic Duct Seam Closing Machine | `/products/pneumatic-duct-seam-closing-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Hydraulic Duct Seam Closing Machine | `/products/hydraulic-duct-seam-closing-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Hydraulic Riveting Machine | `/products/hydraulic-riveting-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| TDF Corner Inserting Machine | `/products/tdf-corner-inserting-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Foot-Operated Notching Machine | `/products/foot-operated-notching-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Pneumatic Notching Machine | `/products/pneumatic-notching-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Hydraulic Notching Machine | `/products/hydraulic-notching-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| CNC Plasma Cutting Machine | `/products/cnc-plasma-cutting-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Auto Duct Production Line 2 | `/products/auto-duct-production-line-2` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Auto Duct Production Line 3 | `/products/auto-duct-production-line-3` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| U-Shaped Auto Duct Production Line 5 | `/products/u-shaped-auto-duct-production-line-5` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Angle Steel Flange Production Line | `/products/angle-steel-flange-production-line` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Asymmetric Three-Roll Plate Rolling Machine | `/products/asymmetric-three-roll-plate-rolling-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Electric Round Duct Elbow Making Machine | `/products/electric-round-duct-elbow-making-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Hydraulic Round Duct Elbow Making Machine | `/products/hydraulic-round-duct-elbow-making-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Manual Duct Beading Machine | `/products/manual-duct-beading-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Electric Duct Beading Machine | `/products/electric-duct-beading-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Electric Angle Iron Flange Rolling Machine | `/products/electric-angle-iron-flange-rolling-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Vertical Hydraulic Angle Iron Flange Rolling Machine | `/products/vertical-hydraulic-angle-iron-flange-rolling-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Horizontal Hydraulic Angle Iron Flange Rolling Machine | `/products/horizontal-hydraulic-angle-iron-flange-rolling-machine` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Steel-Strip Spiral Duct Production Line | `/products/steel-strip-spiral-duct-production-line` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Mold-Type Spiral Duct Production Line | `/products/mold-type-spiral-duct-production-line` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Industrial Granulator | `/products/industrial-granulator` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Single Shaft Shredder | `/products/single-shaft-shredder` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |
| Dual Shaft Shredder | `/products/dual-shaft-shredder` | 同旧路由 | 13 段 | 1 张/引用 | 4 项 + 0 行 | 路由 metadata + 发布覆盖 | ProductSolutionPage → StandardProductPage | 已映射；0 项待核；视觉待确认 |

## 每个产品的验收记录

逐页评审时，为每个产品记录以下八项证据：旧/新 URL 响应与 canonical、文案差异、图片 URL 集合差异、参数行差异、Metadata 差异、桌面截图、移动截图、询盘提交与 CRM 入库结果。任何一项未核实都保持“视觉待确认”，不得删除对应旧组件。
