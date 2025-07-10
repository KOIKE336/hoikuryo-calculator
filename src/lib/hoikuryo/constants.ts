// 住民税関連定数
export const BASIC_DEDUCTION = 430_000;          // 基礎控除（住民税）
export const DEPENDENT_DEDUCTION = 330_000;      // 扶養控除（簡易モデル、年少・特定扶養差異は無視）
export const MUNICIPAL_TAX_RATE = 0.06;          // 市町村民税所得割 6%
export const ADJUSTMENT_RATE = 0.05;             // 調整控除率 5%
export const ADJUSTMENT_CAP = 2_500;             // 調整控除上限（課税標準200万円以下）

// 多子軽減の設定
export const SECOND_CHILD_DISCOUNT_RATE = 0.5;   // 第2子は半額
export const THIRD_CHILD_FEE = 0;                // 第3子以降は無料

// バリデーション設定
export const MAX_INCOME_AMOUNT = 10_000;         // 最大収入額（万円）
export const MAX_DEPENDENTS = 10;               // 最大扶養人数
export const MIN_INCOME_AMOUNT = 0;              // 最小収入額
export const MIN_DEPENDENTS = 0;                // 最小扶養人数