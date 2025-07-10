'use client';

import { useState } from 'react';
import { FamilyInput, IncomeInput, calculateHoikuryoWithDetails } from '@/lib/hoikuryo';

export default function HoikuryoCalculator() {
  const [calculationMethod, setCalculationMethod] = useState<'salary' | 'taxableIncome'>('salary');
  const [spouseAAmount, setSpouseAAmount] = useState<string>('');
  const [spouseBAmount, setSpouseBAmount] = useState<string>('');
  const [spouseADependents, setSpouseADependents] = useState<string>('0');
  const [spouseBDependents, setSpouseBDependents] = useState<string>('0');
  const [childOrder, setChildOrder] = useState<1 | 2 | 3>(1);
  const [ageCategory, setAgeCategory] = useState<'under3' | 'over3'>('under3');
  const [result, setResult] = useState<{
    totalMunicipalTax: number;
    baseFee: number;
    finalFee: number;
    childOrder: number;
    ageCategory: string;
  } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const validateInput = (): boolean => {
    const newErrors: string[] = [];

    // 配偶者Aの金額チェック
    if (!spouseAAmount || spouseAAmount.trim() === '') {
      newErrors.push('配偶者Aの金額を入力してください');
    } else {
      const amount = parseInt(spouseAAmount);
      if (isNaN(amount) || amount < 0) {
        newErrors.push('配偶者Aの金額は0以上の数値で入力してください');
      } else if (amount > 10000) {
        newErrors.push('配偶者Aの金額は10,000万円以下で入力してください');
      }
    }

    // 配偶者Bの金額チェック
    if (!spouseBAmount || spouseBAmount.trim() === '') {
      newErrors.push('配偶者Bの金額を入力してください');
    } else {
      const amount = parseInt(spouseBAmount);
      if (isNaN(amount) || amount < 0) {
        newErrors.push('配偶者Bの金額は0以上の数値で入力してください');
      } else if (amount > 10000) {
        newErrors.push('配偶者Bの金額は10,000万円以下で入力してください');
      }
    }

    // 扶養人数チェック（給与所得者モードのみ）
    if (calculationMethod === 'salary') {
      const dependentsA = parseInt(spouseADependents);
      const dependentsB = parseInt(spouseBDependents);
      
      if (isNaN(dependentsA) || dependentsA < 0 || dependentsA > 10) {
        newErrors.push('配偶者Aの扶養人数は0-10人の範囲で入力してください');
      }
      
      if (isNaN(dependentsB) || dependentsB < 0 || dependentsB > 10) {
        newErrors.push('配偶者Bの扶養人数は0-10人の範囲で入力してください');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleCalculate = () => {
    if (!validateInput()) {
      return;
    }

    try {
      const spouseA: IncomeInput = calculationMethod === 'salary' 
        ? { type: 'salary', amount: parseInt(spouseAAmount) * 10000, dependents: parseInt(spouseADependents) }
        : { type: 'taxableIncome', amount: parseInt(spouseAAmount) * 10000 };

      const spouseB: IncomeInput = calculationMethod === 'salary' 
        ? { type: 'salary', amount: parseInt(spouseBAmount) * 10000, dependents: parseInt(spouseBDependents) }
        : { type: 'taxableIncome', amount: parseInt(spouseBAmount) * 10000 };

      const input: FamilyInput = {
        spouseA,
        spouseB,
        childOrder,
        ageCategory
      };

      const calculationResult = calculateHoikuryoWithDetails(input);
      setResult(calculationResult);
      setErrors([]);
    } catch {
      setErrors(['計算中にエラーが発生しました。入力内容をご確認ください。']);
    }
  };

  const handleReset = () => {
    setSpouseAAmount('');
    setSpouseBAmount('');
    setSpouseADependents('0');
    setSpouseBDependents('0');
    setChildOrder(1);
    setAgeCategory('under3');
    setResult(null);
    setErrors([]);
  };

  const copyResult = () => {
    if (!result) return;
    const text = `原村保育料計算結果\n月額保育料: ${result.finalFee.toLocaleString()}円\n第${childOrder}子 / ${ageCategory === 'under3' ? '3歳未満' : '3歳以上'}\n世帯市町村民税所得割額: ${result.totalMunicipalTax.toLocaleString()}円`;
    navigator.clipboard.writeText(text);
    alert('結果をコピーしました');
  };

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
          {/* 配偶者A */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">配偶者A</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {calculationMethod === 'salary' ? '年収（万円）' : '所得（万円）'}
                </label>
                <input
                  type="number"
                  value={spouseAAmount}
                  onChange={(e) => setSpouseAAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 400"
                />
              </div>
              {calculationMethod === 'salary' && (
                <div>
                  <label className="block text-sm font-medium mb-1">扶養人数</label>
                  <select
                    value={spouseADependents}
                    onChange={(e) => setSpouseADependents(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    {[0, 1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}人</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 配偶者B */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">配偶者B</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {calculationMethod === 'salary' ? '年収（万円）' : '所得（万円）'}
                </label>
                <input
                  type="number"
                  value={spouseBAmount}
                  onChange={(e) => setSpouseBAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 280"
                />
              </div>
              {calculationMethod === 'salary' && (
                <div>
                  <label className="block text-sm font-medium mb-1">扶養人数</label>
                  <select
                    value={spouseBDependents}
                    onChange={(e) => setSpouseBDependents(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    {[0, 1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}人</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 子供情報 */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">お子様情報</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">第何子</label>
              <select
                value={childOrder}
                onChange={(e) => setChildOrder(parseInt(e.target.value) as 1 | 2 | 3)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>第1子</option>
                <option value={2}>第2子</option>
                <option value={3}>第3子以降</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">年齢区分</label>
              <select
                value={ageCategory}
                onChange={(e) => setAgeCategory(e.target.value as 'under3' | 'over3')}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="under3">3歳未満</option>
                <option value="over3">3歳以上</option>
              </select>
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleCalculate}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            保育料を計算する
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
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
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
            <h3 className="text-xl font-semibold mb-4 text-center">計算結果</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {result.finalFee.toLocaleString()}円
              </div>
              <div className="text-lg text-gray-600 mb-4">月額保育料</div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>第{childOrder}子 / {ageCategory === 'under3' ? '3歳未満' : '3歳以上'}</div>
                <div>世帯市町村民税所得割額: {result.totalMunicipalTax.toLocaleString()}円</div>
                {result.baseFee !== result.finalFee && (
                  <div>
                    基準額: {result.baseFee.toLocaleString()}円
                    {childOrder === 2 && ' (第2子半額適用)'}
                    {childOrder >= 3 && ' (第3子以降無料適用)'}
                  </div>
                )}
              </div>
              
              <button
                onClick={copyResult}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                結果をコピー
              </button>
            </div>
          </div>
        )}

        {/* 注意事項 */}
        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
          <h4 className="font-semibold text-red-800 mb-2">ご注意</h4>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• この計算結果は概算であり、実際の保育料と異なる場合があります</li>
            <li>• 各種控除の詳細は考慮されていません</li>
            <li>• 正確な保育料は原村役場にお問い合わせください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}