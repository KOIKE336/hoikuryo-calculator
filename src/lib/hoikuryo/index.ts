import { IncomeInput, FamilyInput, HoikuryoResult, FeeTierJson } from '@/types/hoikuryo';
import { calcSalaryIncome } from './salaryDeduction';
import { 
  BASIC_DEDUCTION, 
  DEPENDENT_DEDUCTION, 
  MUNICIPAL_TAX_RATE, 
  ADJUSTMENT_RATE, 
  ADJUSTMENT_CAP 
} from './constants';

// JSON料金テーブルの動的読み込み
async function loadFeeTable(ageCategory: 'under3', timeType: 'standard' | 'short'): Promise<FeeTierJson[]> {
  const tableName = `${ageCategory}_${timeType}`;
  try {
    const response = await import(`./tables/${tableName}.json`);
    return response.default;
  } catch (error) {
    console.error(`Failed to load fee table: ${tableName}`, error);
    return [];
  }
}

/**
 * 市町村民税所得割額の計算
 * @param input 収入情報
 * @returns 市町村民税所得割額（円）
 */
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

/**
 * 料金テーブルから保育料を検索
 * @param totalMunicipalTax 世帯の市町村民税所得割額合計
 * @param feeTable 料金テーブル
 * @param childOrder 第何子か
 * @returns 保育料（円）
 */
function lookupFeeFromTable(totalMunicipalTax: number, feeTable: FeeTierJson[], childOrder: number): number {
  const tier = feeTable.find(t => totalMunicipalTax >= t.min && totalMunicipalTax <= t.max);
  if (!tier) return 0;

  // 第何子かに応じて料金を選択
  if (childOrder >= 3) return tier.fee_third;
  if (childOrder === 2) return tier.fee_second;
  return tier.fee_first;
}

/**
 * 保育料計算（同期版 - 従来のロジック）
 * @param input 世帯情報
 * @returns 月額保育料（円）
 */
export function calculateHoikuryo(input: FamilyInput): number {
  const taxA = calcMunicipalTax(input.spouseA);
  const taxB = calcMunicipalTax(input.spouseB);
  const totalTax = taxA + taxB;

  // 従来のロジック（静的テーブル）
  const baseFee = lookupFeeStatic(totalTax);
  return applySiblingDiscount(baseFee, input.childOrder);
}

/**
 * 保育料計算（詳細結果付き・同期版）
 * @param input 世帯情報
 * @returns 計算結果詳細
 */
export function calculateHoikuryoWithDetails(input: FamilyInput): HoikuryoResult {
  const taxA = calcMunicipalTax(input.spouseA);
  const taxB = calcMunicipalTax(input.spouseB);
  const totalTax = taxA + taxB;

  const baseFee = lookupFeeStatic(totalTax);
  const finalFee = applySiblingDiscount(baseFee, input.childOrder);

  return {
    totalMunicipalTax: totalTax,
    baseFee,
    finalFee,
    childOrder: input.childOrder,
    ageCategory: input.ageCategory,
    timeType: input.timeType
  };
}

/**
 * 保育料計算（非同期版 - 新しいJSONテーブル使用）
 * @param input 世帯情報
 * @returns 計算結果詳細
 */
export async function calculateHoikuryoAsync(input: FamilyInput): Promise<HoikuryoResult> {
  const taxA = calcMunicipalTax(input.spouseA);
  const taxB = calcMunicipalTax(input.spouseB);
  const totalTax = taxA + taxB;

  const feeTable = await loadFeeTable(input.ageCategory, input.timeType);
  const finalFee = lookupFeeFromTable(totalTax, feeTable, input.childOrder);
  
  // 基準額（第1子）を取得
  const baseFee = lookupFeeFromTable(totalTax, feeTable, 1);

  return {
    totalMunicipalTax: totalTax,
    baseFee,
    finalFee,
    childOrder: input.childOrder,
    ageCategory: input.ageCategory,
    timeType: input.timeType
  };
}

// 従来のロジック（後方互換性のため保持）
function lookupFeeStatic(totalMunicipalTax: number): number {
  const table = FEE_TABLE_UNDER3; // 3歳未満のみ対応
  const tier = table.find(t => totalMunicipalTax >= t.min && totalMunicipalTax <= t.max);
  return tier ? tier.fee : 0;
}

function applySiblingDiscount(baseFee: number, childOrder: number): number {
  if (childOrder >= 3) return 0;           // 第3子以降は無料
  if (childOrder === 2) return Math.round(baseFee / 2); // 第2子は半額（四捨五入）
  return baseFee;                          // 第1子はそのまま
}

// 従来のテーブル（後方互換性のため保持）
const FEE_TABLE_UNDER3 = [
  { min: 0,       max: 0,      fee: 0 },
  { min: 1,       max: 4_800,  fee: 5_500 },
  { min: 4_801,   max: 9_700,  fee: 11_500 },
  { min: 9_701,   max: 16_000, fee: 17_500 },
  { min: 16_001,  max: 27_000, fee: 20_500 },
  { min: 27_001,  max: 39_600, fee: 30_500 },
  { min: 39_601,  max: 66_000, fee: 48_000 },
  { min: 66_001,  max: 97_000, fee: 60_000 },
  { min: 97_001,  max: Infinity, fee: 63_000 }
];