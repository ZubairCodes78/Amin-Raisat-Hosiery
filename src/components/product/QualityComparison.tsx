'use client';

import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { QualityType } from '@/types';

interface QualityComparisonProps {
  selectedQuality: QualityType;
  onSelectQuality: (quality: QualityType) => void;
}

export const QualityComparison: React.FC<QualityComparisonProps> = ({
  selectedQuality,
  onSelectQuality,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-gray-950">
          Construction Quality Comparison
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Both options use 100% fine combed cotton. Compare their collar and seam construction below.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* High Quality Card */}
        <div
          onClick={() => onSelectQuality('High Quality')}
          className={`cursor-pointer rounded-xl p-4 sm:p-5 border-2 transition-all flex flex-col justify-between ${
            selectedQuality === 'High Quality'
              ? 'border-gray-950 bg-gray-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-950 text-sm">High Quality (Taped Seams)</h4>
              <span className="text-[10px] font-semibold bg-gray-900 text-white px-2 py-0.5 rounded">
                Anti-Sag
              </span>
            </div>

            <div className="relative h-28 w-full bg-gray-100 rounded-lg overflow-hidden mb-3 border border-gray-200">
              <Image
                src="/images/products/sleevless high.jpeg"
                alt="High Quality Neck Taping & Finish"
                fill
                className="object-cover"
              />
            </div>

            <ul className="space-y-1.5 text-xs text-gray-700">
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Neckline:</strong> Reinforced woven tape around neck prevents stretching.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Shoulders:</strong> Taped seams for lasting shape retention.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Stitching:</strong> 4-thread precision industrial interlock.
                </span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
              selectedQuality === 'High Quality'
                ? 'bg-gray-950 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {selectedQuality === 'High Quality' ? '✓ Selected High Quality' : 'Select High Quality'}
          </button>
        </div>

        {/* Standard Quality Card */}
        <div
          onClick={() => onSelectQuality('Standard Quality')}
          className={`cursor-pointer rounded-xl p-4 sm:p-5 border-2 transition-all flex flex-col justify-between ${
            selectedQuality === 'Standard Quality'
              ? 'border-gray-950 bg-gray-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-950 text-sm">Standard Quality (Folded Seams)</h4>
              <span className="text-[10px] font-semibold bg-gray-200 text-gray-800 px-2 py-0.5 rounded">
                Everyday
              </span>
            </div>

            <div className="relative h-28 w-full bg-gray-100 rounded-lg overflow-hidden mb-3 border border-gray-200">
              <Image
                src="/images/products/sleevless low.jpeg"
                alt="Low Quality Pure Cotton Finish"
                fill
                className="object-cover"
              />
            </div>

            <ul className="space-y-1.5 text-xs text-gray-700">
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-gray-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Neckline:</strong> Folded &amp; machine-stitched seam (no tape).
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-gray-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Shoulders:</strong> Clean double-needle stitched finish.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-gray-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Stitching:</strong> Durable lockstitch everyday seam.
                </span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
              selectedQuality === 'Standard Quality'
                ? 'bg-gray-950 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {selectedQuality === 'Standard Quality' ? '✓ Selected Standard' : 'Select Standard'}
          </button>
        </div>
      </div>
    </div>
  );
};
