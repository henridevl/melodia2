// components/form/FormHeader.tsx
import React from 'react';
import { ArrowLeft, Save, Pencil, Trash } from 'lucide-react';
import Button from '../ui/Button';

interface FormHeaderProps {
  isEditMode: boolean;
  onClose: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
  isExisting?: boolean;
}

const FormHeader: React.FC<FormHeaderProps> = ({
  isEditMode,
  onClose,
  onSubmit,
  onEdit,
  onDelete,
  loading = false,
  isExisting = false
}) => {
  if (isEditMode) {
    return (
      <div className="flex justify-between items-center mb-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} onClick={onSubmit}>
            <Save className="h-4 w-4 mr-2" />
            {isExisting ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center mb-6">
      <Button variant="secondary" onClick={onClose}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex space-x-2">
        {onEdit && (
          <Button onClick={onEdit}>
            <Pencil className="h-5 w-5 " />
            
          </Button>
        )}
        {onDelete && (
          <Button
            onClick={onDelete}
            color="red"
          >
            <Trash className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default FormHeader;
