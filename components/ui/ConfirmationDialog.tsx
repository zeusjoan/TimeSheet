
import React from 'react';
import Button from './Button';
import Card, { CardContent, CardHeader, CardTitle } from './Card';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={onClose}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Usuń
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmationDialog;