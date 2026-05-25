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
import { lockClosedOutline } from "ionicons/icons";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { updateRecoveredPassword } from "../../services/authService";
import {
  getFriendlyAuthErrorMessage,
  getPasswordValidationMessage,
  isPasswordValid,
  passwordRules,
} from "../../utils/auth";
import "./Login.css";

const ResetPassword: React.FC = () => {
  const history = useHistory();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const helperMessage = useMemo(() => {
    if (!password) return "Esta sera tu nueva contrasena de acceso.";
    return getPasswordValidationMessage(password) || "La contrasena cumple con los requisitos.";
  }, [password]);

  const handleSubmit = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!password || !confirmPassword) {
      setErrorMsg("Completa y confirma la nueva contrasena.");
      return;
    }

    if (!isPasswordValid(password)) {
      setErrorMsg(getPasswordValidationMessage(password));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contrasenas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      await updateRecoveredPassword(password);
      setSuccessMsg("Tu contrasena se actualizo correctamente. Ya puedes iniciar sesion.");
      setTimeout(() => history.replace("/login"), 1200);
    } catch (error: any) {
      setErrorMsg(
        getFriendlyAuthErrorMessage(
          error,
          "No se pudo actualizar la contrasena. Solicita un nuevo enlace e intenta de nuevo."
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
              <h1 className="login-title">Nueva contrasena</h1>
              <p className="login-subtitle">
                Elige una contrasena segura para recuperar el acceso a tu cuenta.
              </p>
            </div>

            <IonItem lines="none" className="input-item">
              <IonIcon icon={lockClosedOutline} slot="start" />
              <IonInput
                type="password"
                placeholder="Nueva contrasena"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value || "")}
              />
            </IonItem>

            <div className="password-helper">
              <p className="password-helper__intro">{helperMessage}</p>
              <ul className="password-helper__list">
                {passwordRules.map((rule) => (
                  <li
                    key={rule.id}
                    className={rule.test(password) ? "is-valid" : ""}
                  >
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>

            <IonItem lines="none" className="input-item">
              <IonIcon icon={lockClosedOutline} slot="start" />
              <IonInput
                type="password"
                placeholder="Confirmar contrasena"
                value={confirmPassword}
                onIonInput={(e) => setConfirmPassword(e.detail.value || "")}
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
              {loading ? <IonSpinner name="crescent" /> : "Guardar contrasena"}
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

export default ResetPassword;
