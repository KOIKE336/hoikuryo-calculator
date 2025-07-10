// =============== 型定義 ===============
export type IncomeInput =
  | { type: "taxableIncome"; amount: number } // 所得を直接入力（課税標準額）
  | { type: "salary"; amount: number; dependents: number }; // 年収 + 扶養人数（給与所得者用）

export interface FamilyInput {
  spouseA: IncomeInput;
  spouseB: IncomeInput;
  childOrder: 1 | 2 | 3 | number; // 第1子=1, 第2子=2, 第3子以降=3
  ageCategory: "under3" | "over3"; // 3歳未満=under3, 3歳以上=over3
}

// =============== 定数テーブル ===============
// 給与所得控除の簡易テーブル（※最低55万円、180万・360万・660万円境）
interface SalaryDeductionBracket {
  threshold: number; // 以上
  rate: number; // 控除率
  min: number | null; // 最低控除額（null の場合は rate 適用）
}

const SALARY_DEDUCTION_TABLE: SalaryDeductionBracket[] = [
  { threshold: 0,        rate: 0,   min: 550_000 },  // 〜1,799,999 → 55万円控除
  { threshold: 1_800_000, rate: 0.4, min: null },    // 1,800,000〜3,599,999 → 40%
  { threshold: 3_600_000, rate: 0.3, min: null },    // 3,600,000〜6,599,999 → 30%
  { threshold: 6_600_000, rate: 0.2, min: null }     // 6,600,000〜            → 20%
];

// 住民税関連
const BASIC_DEDUCTION = 430_000;          // 基礎控除（住民税）
const DEPENDENT_DEDUCTION = 330_000;      // 扶養控除（簡易モデル、年少・特定扶養差異は無視）
const MUNICIPAL_TAX_RATE = 0.06;          // 市町村民税所得割 6%
const ADJUSTMENT_RATE = 0.05;             // 調整控除率 5%
const ADJUSTMENT_CAP  = 2_500;            // 調整控除上限（課税標準200万円以下）

// 保育料階層表（抜粋サンプル）
interface FeeTier { min: number; max: number; fee: number; }

// 3歳未満児（第1子基準）
const FEE_TABLE_UNDER3: FeeTier[] = [
  { min: 0,       max: 0,      fee: 0 },     // 非課税世帯
  { min: 1,       max: 4_800,  fee: 5_500 },
  { min: 4_801,   max: 9_700,  fee: 11_500 },
  { min: 9_701,   max: 16_000, fee: 17_500 },
  { min: 16_001,  max: 27_000, fee: 20_500 },
  { min: 27_001,  max: 39_600, fee: 30_500 },
  { min: 39_601,  max: 66_000, fee: 48_000 },
  { min: 66_001,  max: 97_000, fee: 60_000 },
  { min: 97_001,  max: Infinity, fee: 63_000 }
];

// 3歳〜5歳児（第1子基準）※国の幼保無償化後は第1子も0円だが、原村の表を尊重
const FEE_TABLE_OVER3: FeeTier[] = [
  { min: 0,      max: 0,      fee: 0 },
  { min: 1,      max: 4_800,  fee: 0 },       // 3歳以上は低所得帯 0円
  { min: 4_801,  max: 16_000, fee: 5_000 },
  { min: 16_001, max: 27_000, fee: 9_000 },
  { min: 27_001, max: 39_600, fee: 14_000 },
  { min: 39_601, max: 66_000, fee: 26_000 },
  { min: 66_001, max: 97_000, fee: 38_000 },
  { min: 97_001, max: Infinity, fee: 45_000 }
];

// =============== ユーティリティ関数 ===============
function calcSalaryIncome(annualSalary: number): number {
  // 上から順に閾値判定（しきい値の高い行ほど後）
  for (let i = SALARY_DEDUCTION_TABLE.length - 1; i >= 0; i--) {
    const row = SALARY_DEDUCTION_TABLE[i];
    if (annualSalary >= row.threshold) {
      const deduction = row.min !== null ? Math.max(row.min, annualSalary * row.rate) : annualSalary * row.rate;
      return Math.max(annualSalary - deduction, 0);
    }
  }
  return 0; // 想定外
}

function calcMunicipalTax(input: IncomeInput): number {
  let taxableIncome: number;

  if (input.type === "taxableIncome") {
    taxableIncome = input.amount;
  } else {
    const salaryIncome = calcSalaryIncome(input.amount);
    taxableIncome = Math.max(
      salaryIncome - BASIC_DEDUCTION - input.dependents * DEPENDENT_DEDUCTION,
      0
    );
  }

  // 市町村民税所得割（6%）
  const rawTax = taxableIncome * MUNICIPAL_TAX_RATE;

  // 調整控除（簡易）
  const personalDiff = BASIC_DEDUCTION; // 個別人的控除差の概算
  const adjustment = taxableIncome <= 2_000_000
    ? Math.min(personalDiff * ADJUSTMENT_RATE, ADJUSTMENT_CAP)
    : personalDiff * ADJUSTMENT_RATE;

  return Math.max(rawTax - adjustment, 0);
}

function lookupFee(totalMunicipalTax: number, ageCategory: "under3" | "over3"): number {
  const table = ageCategory === "under3" ? FEE_TABLE_UNDER3 : FEE_TABLE_OVER3;
  const tier = table.find(t => totalMunicipalTax >= t.min && totalMunicipalTax <= t.max);
  return tier ? tier.fee : 0;
}

function applySiblingDiscount(baseFee: number, childOrder: number): number {
  if (childOrder >= 3) return 0;           // 第3子以降は無料
  if (childOrder === 2) return Math.round(baseFee / 2); // 第2子は半額（四捨五入）
  return baseFee;                          // 第1子はそのまま
}

// =============== メイン関数 ===============
export function calculateHoikuryo(input: FamilyInput): number {
  const taxA = calcMunicipalTax(input.spouseA);
  const taxB = calcMunicipalTax(input.spouseB);
  const totalTax = taxA + taxB;

  const baseFee = lookupFee(totalTax, input.ageCategory);
  return applySiblingDiscount(baseFee, input.childOrder);
}

// デバッグ用の詳細情報を返す関数
export function calculateHoikuryoWithDetails(input: FamilyInput) {
  const taxA = calcMunicipalTax(input.spouseA);
  const taxB = calcMunicipalTax(input.spouseB);
  const totalTax = taxA + taxB;

  const baseFee = lookupFee(totalTax, input.ageCategory);
  const finalFee = applySiblingDiscount(baseFee, input.childOrder);

  return {
    totalMunicipalTax: totalTax,
    baseFee,
    finalFee,
    childOrder: input.childOrder,
    ageCategory: input.ageCategory
  };
}