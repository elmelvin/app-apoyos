import { IonButton, IonContent, IonIcon, IonPage, IonSpinner } from "@ionic/react";
import { alertCircleOutline, checkmarkCircleOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { getFriendlyAuthErrorMessage } from "../utils/authErrorMessages";
import "./Login.css";

type ConfirmationStatus = "loading" | "success" | "error";

const EmailConfirmed: React.FC = () => {
  const history = useHistory();
  const [status, setStatus] = useState<ConfirmationStatus>("loading");
  const [message, setMessage] = useState("Estamos validando la confirmacion de tu correo.");

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const errorDescription =
          params.get("error_description") || hashParams.get("error_description");

        if (errorDescription) {
          throw new Error(errorDescription.replace(/\+/g, " "));
        }

        const code = params.get("code");
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        }

        setStatus("success");
        setMessage("Tu correo ha sido confirmado exitosamente. Ya puedes iniciar sesion.");
      } catch (error: any) {
        setStatus("error");
        setMessage(
          getFriendlyAuthErrorMessage(
            error,
            "No pudimos confirmar el correo desde este enlace. Intenta iniciar sesion o solicita un enlace nuevo."
          )
        );
      }
    };

    confirmEmail();
  }, []);

  const isSuccess = status === "success";

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <div className="login-container">
          <div className="login-card fade-scale">
            <div className="login-header">
              {status === "loading" ? (
                <IonSpinner name="crescent" className="confirmation-spinner" />
              ) : (
                <IonIcon
                  icon={isSuccess ? checkmarkCircleOutline : alertCircleOutline}
                  className={`confirmation-icon ${
                    isSuccess ? "confirmation-icon--success" : "confirmation-icon--error"
                  }`}
                />
              )}

              <h1 className="login-title">
                {status === "loading"
                  ? "Confirmando correo"
                  : isSuccess
                    ? "Correo confirmado"
                    : "Enlace no confirmado"}
              </h1>
              <p className="login-subtitle">{message}</p>
            </div>

            <IonButton
              expand="block"
              className="login-button"
              onClick={() => history.replace("/login")}
              disabled={status === "loading"}
            >
              Ir a iniciar sesion
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default EmailConfirmed;
