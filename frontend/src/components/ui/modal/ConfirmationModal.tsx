import React from "react";
import { Modal } from "./index";
import Button from "../button/Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Hapus",
  cancelText = "Batal",
  variant = "danger",
  isLoading = false,
}) => {
  const getVariantColor = () => {
    switch (variant) {
      case "danger":
        return "text-error-500 bg-error-50 dark:bg-error-500/10";
      case "warning":
        return "text-warning-500 bg-warning-50 dark:bg-warning-500/10";
      default:
        return "text-brand-500 bg-brand-50 dark:bg-brand-500/10";
    }
  };

  const getButtonVariant = () => {
    return variant === "danger" ? "error" : "primary";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showBlur={false} className="max-w-[400px] p-6">
      <div className="flex flex-col items-center text-center">
        {/* Icon Area */}
        <div className={`flex h-14 w-14 items-center justify-center rounded-full mb-4 ${getVariantColor()}`}>
          {variant === "danger" ? (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>

        {/* Content Area */}
        <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
          {title}
        </h3>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex w-full gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 transition-transform hover:scale-105 active:scale-95"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={getButtonVariant() as any}
            onClick={onConfirm}
            className="flex-1 transition-transform hover:scale-105 active:scale-95"
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
