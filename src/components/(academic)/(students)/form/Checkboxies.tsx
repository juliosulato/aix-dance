"use client";
import { Checkbox, Textarea } from "@mantine/core";
import { useState, memo, useCallback, useMemo } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { CreateStudentFormData } from "@/schemas/academic/student.schema";
import { UpdateStudentInput } from "@/schemas/academic/student.schema";

type Props = {
    control: Control<CreateStudentFormData | UpdateStudentInput>;
    errors: FieldErrors<CreateStudentFormData | UpdateStudentInput>;
};

// Componente de checkbox individual otimizado
const OptimizedCheckboxField = memo(({ 
  label, 
  name, 
  id, 
  onToggle 
}: { 
  label: string; 
  name: string; 
  id: string; 
  onToggle: (checked: boolean) => void; 
}) => {
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(event.currentTarget.checked);
  }, [onToggle]);

  return (
    <Checkbox
      label={label}
      name={name}
      id={id}
      onChange={handleChange}
    />
  );
});

OptimizedCheckboxField.displayName = 'OptimizedCheckboxField';

// Componente de textarea condicional otimizado
const ConditionalTextarea = memo(({ 
  show, 
  field, 
  error, 
  label, 
  colSpan = "md:col-span-2 lg:col-span-3 3xl:col-span-4" 
}: { 
  show: boolean; 
  field: any; 
  error?: string; 
  label: string; 
  colSpan?: string; 
}) => {
  const textareaStyle = useMemo(() => ({
    display: show ? 'block' : 'none'
  }), [show]);

  if (!show) return null;

  return (
    <Textarea
      label={label}
      {...field}
      defaultValue=""
      error={error}
      className={colSpan}
      style={textareaStyle}
    />
  );
});

ConditionalTextarea.displayName = 'ConditionalTextarea';

// Componente de checkbox controlado otimizado
const ControlledCheckbox = memo(({ 
  field, 
  label, 
  onChange 
}: { 
  field: any; 
  label: string; 
  onChange?: (checked: boolean) => void; 
}) => {
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.currentTarget.checked;
    field.onChange(checked);
    onChange?.(checked);
  }, [field, onChange]);

  return (
    <Checkbox
      label={label}
      checked={Boolean(field.value)}
      onChange={handleChange}
    />
  );
});

ControlledCheckbox.displayName = 'ControlledCheckbox';

// Componente principal otimizado
function Checkboxies({ control, errors }: Props) {
  
  // Estado otimizado com objeto único
  const [showFields, setShowFields] = useState({
    healthProblems: false,
    medicalAdvice: false,
    painOrDiscomfort: false,
  });

  // Handlers otimizados com useCallback
  const handleHealthProblemsToggle = useCallback((checked: boolean) => {
    setShowFields(prev => ({ ...prev, healthProblems: checked }));
  }, []);

  const handleMedicalAdviceToggle = useCallback((checked: boolean) => {
    setShowFields(prev => ({ ...prev, medicalAdvice: checked }));
  }, []);

  const handlePainOrDiscomfortToggle = useCallback((checked: boolean) => {
    setShowFields(prev => ({ ...prev, painOrDiscomfort: checked }));
  }, []);

  // Handler para checkbox do guardian otimizado
  const handleGuardianChange = useCallback((checked: boolean, onChange: (value: any) => void) => {
    if (checked) {
      onChange([{ 
        firstName: "", 
        lastName: "", 
        relationship: "", 
        cellPhoneNumber: "", 
        phoneNumber: "", 
        email: "", 
        documentOfIdentity: "" 
      }]);
    } else {
      onChange([]);
    }
  }, []);

  // Memoizar labels para evitar re-renders
  const labels = useMemo(() => ({
    healthProblems: "Problemas de saúde",
    medicalAdvice: "Possui orientação médica?",
    painOrDiscomfort: "Dores ou desconfortos",
    textarea: "Descreva com detalhes",
    canLeaveAlone: "Pode ficar desacompanhado",
    haveGuardian: "Possui responsável/legal",
  }), []);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
      {/* Health Problems Checkbox */}
      <OptimizedCheckboxField
        label={labels.healthProblems}
        name="healthProblemsCheckbox"
        id="healthProblemsCheckbox"
        onToggle={handleHealthProblemsToggle}
      />

      {/* Health Problems Textarea */}
      <Controller
        name="healthProblems"
        control={control}
        render={({ field }) => (
          <ConditionalTextarea
            show={showFields.healthProblems}
            field={field}
            error={errors.healthProblems?.message}
            label={labels.textarea}
          />
        )}
      />

      {/* Medical Advice Checkbox */}
      <OptimizedCheckboxField
        label={labels.medicalAdvice}
        name="medicalAdviceCheckbox"
        id="medicalAdviceCheckbox"
        onToggle={handleMedicalAdviceToggle}
      />

      {/* Medical Advice Textarea */}
      <Controller
        name="medicalAdvice"
        control={control}
        render={({ field }) => (
          <ConditionalTextarea
            show={showFields.medicalAdvice}
            field={field}
            error={errors.medicalAdvice?.message}
            label={labels.textarea}
          />
        )}
      />

      {/* Pain or Discomfort Checkbox */}
      <OptimizedCheckboxField
        label={labels.painOrDiscomfort}
        name="painOrDiscomfortCheckbox"
        id="painOrDiscomfortCheckbox"
        onToggle={handlePainOrDiscomfortToggle}
      />

      {/* Pain or Discomfort Textarea */}
      <Controller
        name="painOrDiscomfort"
        control={control}
        render={({ field }) => (
          <ConditionalTextarea
            show={showFields.painOrDiscomfort}
            field={field}
            error={errors.painOrDiscomfort?.message}
            label={labels.textarea}
          />
        )}
      />

      {/* Can Leave Alone Checkbox */}
      <Controller
        name="canLeaveAlone"
        control={control}
        render={({ field }) => (
          <ControlledCheckbox
            field={field}
            label={labels.canLeaveAlone}
          />
        )}
      />

      {/* Have Guardian Checkbox */}
      <Controller
        name="guardian"
        control={control}
        render={({ field }) => (
          <Checkbox
            label={labels.haveGuardian}
            checked={Array.isArray(field.value) && field.value.length > 0}
            onChange={(event) => {
              const checked = event.currentTarget.checked;
              handleGuardianChange(checked, field.onChange);
            }}
          />
        )}
      />
    </div>
  );
}

export default memo(Checkboxies);