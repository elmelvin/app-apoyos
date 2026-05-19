import { IonItem, IonLabel, IonSelect, IonSelectOption } from "@ionic/react";

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
};

export const SelectField = ({ label, value, onChange, options, error }: SelectFieldProps) => (
  <div className="form-field">
    <IonItem className={error ? "field-error" : ""}>
      <IonLabel>{label}</IonLabel>
      <IonSelect
        value={value}
        placeholder="Selecciona una opcion"
        interface="popover"
        onIonChange={(e) => onChange(e.detail.value || "")}
      >
        {options.map((option) => (
          <IonSelectOption key={option} value={option}>
            {option}
          </IonSelectOption>
        ))}
      </IonSelect>
    </IonItem>

    {error ? <p className="field-error-text">{error}</p> : null}
  </div>
);
