import HoikuryoCalculator from '@/components/HoikuryoCalculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <HoikuryoCalculator />
      </div>
      <footer className="mt-8 text-center text-gray-600 text-sm">
        <p>© 2024 原村保育料自動計算ツール</p>
        <p className="mt-2">正確な保育料については原村役場にお問い合わせください</p>
      </footer>
    </div>
  );
}
