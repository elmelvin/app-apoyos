import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonPage,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { IonIcon } from "@ionic/react";
import { lockClosedOutline, mailOutline } from "ionicons/icons";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { requestPasswordReset } from "../../services/authService";
import { getFriendlyAuthErrorMessage } from "../../utils/auth";
import "./Login.css";

const ForgotPassword: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("Escribe tu correo para recuperar la contrasena.");
      return;
    }

    if (!email.trim().includes("@")) {
      setErrorMsg("Escribe un correo valido.");
      return;
    }

    try {
      setLoading(true);
      await requestPasswordReset(email.trim());
      setSuccessMsg(
        "Te enviamos un enlace de recuperacion. Revisa tu correo y sigue las instrucciones."
      );
    } catch (error: any) {
      setErrorMsg(
        getFriendlyAuthErrorMessage(
          error,
          "No se pudo enviar el correo de recuperacion. Intenta de nuevo en unos momentos."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <div className="login-container">
          <div className="login-card fade-scale">
            <div className="login-header">
              <IonIcon icon={lockClosedOutline} style={{ fontSize: "42px", color: "#2c3e50" }} />
              <h1 className="login-title">Recuperar contrasena</h1>
              <p className="login-subtitle">
                Te enviaremos un enlace seguro para registrar una contrasena nueva.
              </p>
            </div>

            <IonItem lines="none" className="input-item">
              <IonIcon icon={mailOutline} slot="start" />
              <IonInput
                type="email"
                placeholder="Correo electronico"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value || "")}
              />
            </IonItem>

            {successMsg ? (
              <IonText color="success">
                <p className="error-text">{successMsg}</p>
              </IonText>
            ) : null}

            {errorMsg ? (
              <IonText color="danger">
                <p className="error-text">{errorMsg}</p>
              </IonText>
            ) : null}

            <IonButton
              expand="block"
              className="login-button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <IonSpinner name="crescent" /> : "Enviar enlace"}
            </IonButton>

            <IonButton
              fill="clear"
              className="login-secondary-link"
              onClick={() => history.push("/login")}
            >
              Volver a iniciar sesion
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ForgotPassword;
