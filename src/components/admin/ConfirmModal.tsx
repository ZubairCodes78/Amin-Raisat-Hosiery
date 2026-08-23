'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#101114]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#17191D] border border-[#30343A] rounded-2xl p-6 max-w-md w-full shadow-elevation space-y-4 text-[#F1F0EC]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isDestructive
                  ? 'bg-[#D96B6B]/10 border-[#D96B6B]/30 text-[#D96B6B]'
                  : 'bg-[#C9A96A]/10 border-[#C9A96A]/30 text-[#C9A96A]'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F1F0EC]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-[#85888E] hover:text-[#F1F0EC] p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#B4B5BA] leading-relaxed pl-1">{message}</p>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-[#30343A]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#202329] hover:bg-[#272A2F] border border-[#30343A] text-[#B4B5BA] hover:text-[#F1F0EC] text-xs font-semibold rounded-xl transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
              isDestructive
                ? 'bg-[#D96B6B] hover:bg-[#E07A7A] text-white shadow-xs'
                : 'bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] shadow-xs'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
