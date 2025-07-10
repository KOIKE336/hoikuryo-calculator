'use client';

import { useHoikuryo } from '@/lib/hooks/useHoikuryo';
import IncomeField from './IncomeField';
import SelectChildOrder from './SelectChildOrder';
import SelectTimeType from './SelectTimeType';
import SelectAgeCategory from './SelectAgeCategory';
import FeeResultCard from './FeeResultCard';

export default function HoikuryoCalculator() {
  const {
    calculationMethod,
    spouseAAmount,
    spouseBAmount,
    spouseADependents,
    spouseBDependents,
    childOrder,
    ageCategory,
    timeType,
    result,
    errors,
    isLoading,
    setCalculationMethod,
    setSpouseAAmount,
    setSpouseBAmount,
    setSpouseADependents,
    setSpouseBDependents,
    setChildOrder,
    setAgeCategory,
    setTimeType,
    calculate,
    reset,
    copyResult
  } = useHoikuryo();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        原村保育料自動計算ツール
      </h1>

      <div className="space-y-6">
        {/* 計算方式選択 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">計算方式を選択</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="calculation-method"
                value="salary"
                checked={calculationMethod === 'salary'}
                onChange={(e) => setCalculationMethod(e.target.value as 'salary')}
                className="mr-2"
              />
              <span>年収＋扶養人数で計算</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="calculation-method"
                value="taxableIncome"
                checked={calculationMethod === 'taxableIncome'}
                onChange={(e) => setCalculationMethod(e.target.value as 'taxableIncome')}
                className="mr-2"
              />
              <span>所得を直接入力</span>
            </label>
          </div>
        </div>

        {/* 世帯情報入力 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IncomeField
            label="配偶者A"
            calculationMethod={calculationMethod}
            amount={spouseAAmount}
            dependents={spouseADependents}
            onAmountChange={setSpouseAAmount}
            onDependentsChange={setSpouseADependents}
            placeholder="例: 400"
            className="bg-blue-50"
          />
          <IncomeField
            label="配偶者B"
            calculationMethod={calculationMethod}
            amount={spouseBAmount}
            dependents={spouseBDependents}
            onAmountChange={setSpouseBAmount}
            onDependentsChange={setSpouseBDependents}
            placeholder="例: 280"
            className="bg-green-50"
          />
        </div>

        {/* 子供情報 */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">お子様情報</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectChildOrder
              value={childOrder}
              onChange={setChildOrder}
            />
            <SelectAgeCategory
              value={ageCategory}
              onChange={setAgeCategory}
            />
            <SelectTimeType
              value={timeType}
              onChange={setTimeType}
            />
          </div>
        </div>

        {/* ボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={calculate}
            disabled={isLoading}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              isLoading 
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? '計算中...' : '保育料を計算する'}
          </button>
          <button
            onClick={reset}
            disabled={isLoading}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              isLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            リセット
          </button>
        </div>

        {/* エラー表示 */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">入力エラー</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 結果表示 */}
        {result && (
          <FeeResultCard
            result={result}
            childOrder={childOrder}
            timeType={timeType}
            onCopyResult={copyResult}
          />
        )}

        {/* 注意事項 */}
        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
          <h4 className="font-semibold text-red-800 mb-2">ご注意</h4>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• この計算結果は概算であり、実際の保育料と異なる場合があります</li>
            <li>• 各種控除の詳細は考慮されていません</li>
          </ul>
        </div>
      </div>
    </div>
  );
}