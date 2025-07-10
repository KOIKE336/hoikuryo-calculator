import { SalaryDeductionBracket } from '@/types/hoikuryo';

// 給与所得控除の簡易テーブル（※最低55万円、180万・360万・660万円境）
export const SALARY_DEDUCTION_TABLE: SalaryDeductionBracket[] = [
  { threshold: 0,        rate: 0,   min: 550_000 },  // 〜1,799,999 → 55万円控除
  { threshold: 1_800_000, rate: 0.4, min: null },    // 1,800,000〜3,599,999 → 40%
  { threshold: 3_600_000, rate: 0.3, min: null },    // 3,600,000〜6,599,999 → 30%
  { threshold: 6_600_000, rate: 0.2, min: null }     // 6,600,000〜            → 20%
];

/**
 * 給与所得の計算
 * @param annualSalary 年間給与（円）
 * @returns 給与所得（円）
 */
export function calcSalaryIncome(annualSalary: number): number {
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