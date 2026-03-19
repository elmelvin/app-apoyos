import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
  IonSpinner
} from "@ionic/react";
import { mailOutline, lockClosedOutline } from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import { useState } from "react";
import { loginUser, getProfile } from "../services/authService";
import { useHistory } from "react-router-dom";
import "./Login.css";

const Login: React.FC = () => {
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email || !password) {
      setErrorMsg("Todos los campos son obligatorios");
      return false;
    }

    if (!email.includes("@")) {
      setErrorMsg("Correo inválido");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    setErrorMsg("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      const user = await loginUser(email, password);
      const profile = await getProfile(user.id);

      if (profile.rol === "admin") {
        history.push("/admin/dashboard");
      } else {
        history.push("/usuario/home");
      }

    } catch (error: any) {
      setErrorMsg(error.message || "Credenciales incorrectas");
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
                <img
                  src="./logodif.jpg"
                  alt="Logo DIF"
                  className="login-logo"
                />
                <h1 className="login-title">Sistema DIF Municipal</h1>
                <p className="login-subtitle">
                  Plataforma de Gestión de Apoyos
                </p>
              </div>

              <IonItem lines="none" className="input-item">
                <IonIcon icon={mailOutline} slot="start" />
                <IonInput
                  type="email"
                  placeholder="Correo institucional"
                  value={email}
                  onIonChange={(e) => setEmail(e.detail.value!)}
                />
              </IonItem>

              <IonItem lines="none" className="input-item">
                <IonIcon icon={lockClosedOutline} slot="start" />
                <IonInput
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onIonChange={(e) => setPassword(e.detail.value!)}
                />
              </IonItem>

              {errorMsg && (
                <IonText color="danger">
                  <p className="error-text">{errorMsg}</p>
                </IonText>
              )}

              <IonButton
                expand="block"
                className="login-button"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? <IonSpinner name="crescent" /> : "Iniciar sesión"}
              </IonButton>
              <IonButton
                fill="clear"
                onClick={()=>history.push("/register")}
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