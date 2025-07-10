'use client';

interface SelectChildOrderProps {
  value: 1 | 2 | 3;
  onChange: (value: 1 | 2 | 3) => void;
  className?: string;
}

export default function SelectChildOrder({
  value,
  onChange,
  className = ""
}: SelectChildOrderProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">第何子</label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) as 1 | 2 | 3)}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
      >
        <option value={1}>第1子</option>
        <option value={2}>第2子</option>
        <option value={3}>第3子以降</option>
      </select>
    </div>
  );
}