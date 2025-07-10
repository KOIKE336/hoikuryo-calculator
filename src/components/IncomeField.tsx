'use client';

interface IncomeFieldProps {
  label: string;
  calculationMethod: 'salary' | 'taxableIncome';
  amount: string;
  dependents: string;
  onAmountChange: (amount: string) => void;
  onDependentsChange: (dependents: string) => void;
  placeholder?: string;
  className?: string;
}

export default function IncomeField({
  label,
  calculationMethod,
  amount,
  dependents,
  onAmountChange,
  onDependentsChange,
  placeholder = "例: 400",
  className = ""
}: IncomeFieldProps) {
  return (
    <div className={`p-4 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold mb-3">{label}</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            {calculationMethod === 'salary' ? '年収（万円）' : '所得（万円）'}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
          />
        </div>
        {calculationMethod === 'salary' && (
          <div>
            <label className="block text-sm font-medium mb-1">扶養人数</label>
            <select
              value={dependents}
              onChange={(e) => onDependentsChange(e.target.value)}
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
  );
}