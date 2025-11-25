import React, { Fragment } from 'react';
import { CheckIcon } from 'lucide-react';
interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}
export function StepIndicator({
  steps,
  currentStep
}: StepIndicatorProps) {
  return <div className="w-full mb-12">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => <Fragment key={index}>
            {/* Step circle */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${index < currentStep ? 'bg-gradient-to-r from-green-500 to-emerald-600 glow-green' : index === currentStep ? 'bg-gradient-to-r from-cyan-500 to-blue-600 glow-blue animate-pulse' : 'bg-gray-700 border-2 border-gray-600'}`}>
                {index < currentStep ? <CheckIcon className="w-6 h-6 text-white" /> : <span className={index === currentStep ? 'text-white' : 'text-gray-400'}>
                    {index + 1}
                  </span>}
              </div>
              <div className={`mt-2 text-xs sm:text-sm font-medium text-center ${index === currentStep ? 'text-cyan-400' : 'text-gray-400'}`}>
                {step}
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && <div className="flex-1 h-1 mx-2 relative" style={{
          maxWidth: '100px'
        }}>
                <div className="absolute inset-0 bg-gray-700 rounded"></div>
                <div className={`absolute inset-0 rounded transition-all duration-500 ${index < currentStep ? 'bg-gradient-to-r from-green-500 to-emerald-600 w-full' : 'w-0'}`}></div>
              </div>}
          </Fragment>)}
      </div>
    </div>;
}