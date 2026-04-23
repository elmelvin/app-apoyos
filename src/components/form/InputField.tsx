import { IonInput, IonItem, IonLabel, IonNote, IonText } from "@ionic/react";

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
}

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  helperText,
  error,
  inputmode,
}: InputFieldProps) => {
  return (
    <div className="form-field">
      <IonItem className={error ? "field-error" : ""}>
        <IonLabel position="floating">{label}</IonLabel>
        <IonInput
          type={type}
          value={value}
          inputmode={inputmode}
          onIonChange={(e) => onChange(e.detail.value || "")}
        />
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
