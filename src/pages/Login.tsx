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
import { arrowBackOutline, lockClosedOutline, mailOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  getActiveSessionHomeRoute,
  getHomeRouteByRole,
  getProfile,
  loginUser,
} from "../services/authService";
import { getFriendlyAuthErrorMessage } from "../utils/authErrorMessages";
import "./Login.css";

const Login: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const redirectActiveSession = async () => {
      try {
        const homeRoute = await getActiveSessionHomeRoute();

        if (active && homeRoute) {
          history.replace(homeRoute);
        }
      } catch (error) {
        console.log("No se pudo restaurar la sesion activa.", error);
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    };

    redirectActiveSession();

    return () => {
      active = false;
    };
  }, [history]);

  const validateForm = () => {
    const emailLimpio = email.trim();
    const passwordLimpio = password.trim();

    if (!emailLimpio || !passwordLimpio) {
      setErrorMsg("Todos los campos son obligatorios");
      return false;
    }

    if (!emailLimpio.includes("@")) {
      setErrorMsg("Correo invalido");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    setErrorMsg("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      const user = await loginUser(email.trim(), password.trim());
      const profile = await getProfile(user.id);
      history.replace(getHomeRouteByRole(profile.rol));
    } catch (error: any) {
      setErrorMsg(
        getFriendlyAuthErrorMessage(
          error,
          "No pudimos iniciar sesion. Revisa tus datos e intenta de nuevo."
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
            <IonButton
              fill="clear"
              className="auth-back-link"
              onClick={() => history.push("/")}
            >
              <IonIcon icon={arrowBackOutline} slot="start" />
              Informacion
            </IonButton>

            {checkingSession ? (
              <div className="login-session-check">
                <IonSpinner name="crescent" />
                <span>Restaurando sesion...</span>
              </div>
            ) : null}

            <div className="login-header">
              <img
                src="/Logodiff.png"
                alt="Logo DIF"
                className="login-logo"
              />
              <h1 className="login-title">Sistema DIF Municipal</h1>
              <p className="login-subtitle">Plataforma de Gestion de Apoyos</p>
            </div>

            <IonItem lines="none" className="input-item">
              <IonIcon icon={mailOutline} slot="start" />
              <IonInput
                type="email"
                placeholder="Correo Electronico"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value || "")}
              />
            </IonItem>

            <IonItem lines="none" className="input-item">
              <IonIcon icon={lockClosedOutline} slot="start" />
              <IonInput
                type="password"
                placeholder="Contrasena"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value || "")}
              />
            </IonItem>

            {errorMsg ? (
              <IonText color="danger">
                <p className="error-text">{errorMsg}</p>
              </IonText>
            ) : null}

            <IonButton
              expand="block"
              className="login-button"
              onClick={handleLogin}
              disabled={loading || checkingSession}
            >
              {loading ? <IonSpinner name="crescent" /> : "Iniciar sesion"}
            </IonButton>

            <IonButton
              fill="clear"
              className="login-secondary-link"
              onClick={() => history.push("/forgot-password")}
            >
              Olvide mi contrasena
            </IonButton>

            <IonButton
              fill="clear"
              className="login-secondary-link"
              onClick={() => history.push("/register")}
            >
              Crear cuenta
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
