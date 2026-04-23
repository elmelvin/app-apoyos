import { IonSpinner } from "@ionic/react";

interface LoaderProps {
  message?: string;
}

const Loader = ({ message = "Cargando..." }: LoaderProps) => {
  return (
    <div
      style={{
        minHeight: "180px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        color: "#5f6b7a",
      }}
    >
      <IonSpinner name="crescent" />
      <p style={{ margin: 0 }}>{message}</p>
    </div>
  );
};

export default Loader;
