/**
 * 数値をカンマ区切りでフォーマット
 * @param value 数値
 * @returns カンマ区切りの文字列
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('ja-JP');
}

/**
 * 通貨フォーマット（円）
 * @param value 数値
 * @returns "1,000円" 形式の文字列
 */
export function formatCurrency(value: number): string {
  return `${formatNumber(value)}円`;
}

/**
 * 万円単位でフォーマット
 * @param value 数値（円）
 * @returns "100万円" 形式の文字列
 */
export function formatManEn(value: number): string {
  const manEn = Math.floor(value / 10000);
  return `${formatNumber(manEn)}万円`;
}

/**
 * 税額をフォーマット
 * @param value 税額（円）
 * @returns "12,345円" 形式の文字列
 */
export function formatTax(value: number): string {
  return formatCurrency(Math.floor(value));
}

/**
 * パーセント表示
 * @param value 小数（0.5 = 50%）
 * @returns "50%" 形式の文字列
 */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * 第n子の表示
 * @param childOrder 子の順序
 * @returns "第1子" 形式の文字列
 */
export function formatChildOrder(childOrder: number): string {
  if (childOrder >= 3) return '第3子以降';
  return `第${childOrder}子`;
}

/**
 * 年齢カテゴリーの表示
 * @param ageCategory 年齢カテゴリー
 * @returns "3歳未満" 形式の文字列
 */
export function formatAgeCategory(ageCategory: 'under3' | 'over3'): string {
  return ageCategory === 'under3' ? '3歳未満' : '3歳以上';
}

/**
 * 保育時間タイプの表示
 * @param timeType 保育時間タイプ
 * @returns "標準時間" 形式の文字列
 */
export function formatTimeType(timeType: 'standard' | 'short'): string {
  return timeType === 'standard' ? '標準時間' : '短時間';
}

/**
 * 計算方式の表示
 * @param method 計算方式
 * @returns "年収入力" 形式の文字列
 */
export function formatCalculationMethod(method: 'salary' | 'taxableIncome'): string {
  return method === 'salary' ? '年収入力' : '所得入力';
}

/**
 * 入力値の検証とフォーマット
 * @param value 入力値
 * @param defaultValue デフォルト値
 * @returns 数値または空文字
 */
export function formatInputValue(value: string | number, defaultValue: number = 0): string {
  if (typeof value === 'number') {
    return value.toString();
  }
  const num = parseInt(value);
  return isNaN(num) ? defaultValue.toString() : num.toString();
}