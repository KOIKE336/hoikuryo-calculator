'use client';

interface FeeResultCardProps {
  result: {
    totalMunicipalTax: number;
    baseFee: number;
    finalFee: number;
    childOrder: number;
    ageCategory: string;
    timeType?: string;
  };
  childOrder: number;
  timeType: 'standard' | 'short';
  onCopyResult: () => void;
}

export default function FeeResultCard({
  result,
  childOrder,
  timeType,
  onCopyResult
}: FeeResultCardProps) {
  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
      <h3 className="text-xl font-semibold mb-4 text-center">計算結果</h3>
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {result.finalFee.toLocaleString()}円
        </div>
        <div className="text-lg text-gray-600 mb-4">月額保育料</div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <div>第{childOrder}子 / 3歳未満 / {timeType === 'standard' ? '保育標準時間' : '保育短時間'}</div>
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
          onClick={onCopyResult}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          結果をコピー
        </button>
      </div>
    </div>
  );
}