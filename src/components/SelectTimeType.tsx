'use client';

interface SelectTimeTypeProps {
  value: 'standard' | 'short';
  onChange: (value: 'standard' | 'short') => void;
  className?: string;
}

export default function SelectTimeType({
  value,
  onChange,
  className = ""
}: SelectTimeTypeProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">保育時間区分</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as 'standard' | 'short')}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
      >
        <option value="standard">保育標準時間</option>
        <option value="short">保育短時間</option>
      </select>
    </div>
  );
}