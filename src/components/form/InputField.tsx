import { IonInput, IonItem, IonNote, IonText, IonTextarea } from "@ionic/react";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?:
    | "date"
    | "email"
    | "number"
    | "password"
    | "search"
    | "tel"
    | "text"
    | "url";
  helperText?: string;
  error?: string;
  inputmode?: "text" | "tel" | "email" | "numeric" | "decimal" | "search" | "url";
  multiline?: boolean;
  rows?: number;
}

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  helperText,
  error,
  inputmode,
  multiline = false,
  rows = 4,
}: InputFieldProps) => {
  return (
    <div className="form-field">
      <IonItem
        className={`form-input-item ${multiline ? "form-input-item--textarea" : ""} ${
          error ? "field-error" : ""
        }`}
      >
        {multiline ? (
          <IonTextarea
            label={label}
            labelPlacement="stacked"
            value={value}
            rows={rows}
            autoGrow
            inputmode={inputmode}
            onIonInput={(e) => onChange(e.detail.value || "")}
          />
        ) : (
          <IonInput
            label={label}
            labelPlacement="stacked"
            type={type}
            value={value}
            inputmode={inputmode}
            onIonChange={(e) => onChange(e.detail.value || "")}
          />
        )}
      </IonItem>

      {helperText ? <IonNote className="field-helper">{helperText}</IonNote> : null}
      {error ? (
        <IonText color="danger">
          <p className="field-error-text">{error}</p>
        </IonText>
      ) : null}
    </div>
  );
};

export default InputField;
