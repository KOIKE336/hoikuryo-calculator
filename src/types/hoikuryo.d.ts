// 基本的な型定義
export type IncomeInput =
  | { type: "taxableIncome"; amount: number } // 所得を直接入力（課税標準額）
  | { type: "salary"; amount: number; dependents: number }; // 年収 + 扶養人数（給与所得者用）

export interface FamilyInput {
  spouseA: IncomeInput;
  spouseB: IncomeInput;
  childOrder: 1 | 2 | 3 | number; // 第1子=1, 第2子=2, 第3子以降=3
  ageCategory: "under3"; // 3歳未満のみ対応
  timeType: "standard" | "short"; // 保育標準時間／短時間
}

// 給与所得控除テーブル
export interface SalaryDeductionBracket {
  threshold: number; // 以上
  rate: number; // 控除率
  min: number | null; // 最低控除額（null の場合は rate 適用）
}

// 保育料階層テーブル
export interface FeeTier {
  min: number;
  max: number;
  fee_first: number;  // 第1子基準額
  fee_second: number; // 第2子額（多子軽減後）
  fee_third: number;  // 第3子以降額（通常0）
}

// 計算結果
export interface HoikuryoResult {
  totalMunicipalTax: number;
  baseFee: number;
  finalFee: number;
  childOrder: number;
  ageCategory: string;
  timeType?: string;
}

// JSONファイル形式
export interface FeeTierJson {
  min: number;
  max: number;
  fee_first: number;
  fee_second: number;
  fee_third: number;
}

// バリデーションエラー
export interface ValidationError {
  field: string;
  message: string;
}

// フォーム状態
export interface FormState {
  calculationMethod: 'salary' | 'taxableIncome';
  spouseA: {
    amount: string;
    dependents: string;
  };
  spouseB: {
    amount: string;
    dependents: string;
  };
  childOrder: 1 | 2 | 3;
  ageCategory: 'under3';
  timeType: 'standard' | 'short';
}