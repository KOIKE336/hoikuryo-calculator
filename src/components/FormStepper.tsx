'use client';

interface FormStepperProps {
  currentStep: number;
  stepLabels: string[];
  className?: string;
}

export default function FormStepper({
  currentStep,
  stepLabels,
  className = ""
}: FormStepperProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex justify-between items-center">
        {stepLabels.map((label, index) => (
          <div
            key={index}
            className={`flex items-center ${
              index < stepLabels.length - 1 ? 'flex-1' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentStep
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`ml-2 text-sm ${
                index <= currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              {label}
            </span>
            {index < stepLabels.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}