'use client';

interface SelectAgeCategoryProps {
  value: 'under3';
  onChange: (value: 'under3') => void;
  className?: string;
}

export default function SelectAgeCategory({
  value,
  onChange,
  className = ""
}: SelectAgeCategoryProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">年齢区分</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as 'under3')}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        disabled
      >
        <option value="under3">3歳未満</option>
      </select>
    </div>
  );
}