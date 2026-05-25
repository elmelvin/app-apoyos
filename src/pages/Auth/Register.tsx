import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonPage,
  IonSpinner,
  IonText,
} from "@ionic/react";
import {
  arrowBackOutline,
  callOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
} from "ionicons/icons";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import {
  getAuthRedirectTo,
  getFriendlyAuthErrorMessage,
  getPasswordValidationMessage,
  isPasswordValid,
  passwordRules,
} from "../../utils/auth";
import "./Register.css";

const Register: React.FC = () => {
  const history = useHistory();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const nombreLimpio = nombre.trim();
    const telefonoLimpio = telefono.replace(/\D/g, "");
    const emailLimpio = email.trim();
    const passwordLimpio = password.trim();
    const confirmPasswordLimpio = confirmPassword.trim();

    if (
      !nombreLimpio ||
      !telefonoLimpio ||
      !emailLimpio ||
      !passwordLimpio ||
      !confirmPasswordLimpio
    ) {
      setErrorMsg("Todos los campos son obligatorios");
      return false;
    }

    if (telefonoLimpio.length < 10) {
      setErrorMsg("El telefono debe tener al menos 10 digitos");
      return false;
    }

    if (!emailLimpio.includes("@")) {
      setErrorMsg("Correo invalido");
      return false;
    }

    if (!isPasswordValid(passwordLimpio)) {
      setErrorMsg(getPasswordValidationMessage(passwordLimpio));
      return false;
    }

    if (passwordLimpio !== confirmPasswordLimpio) {
      setErrorMsg("Las contrasenas no coinciden");
      return false;
    }

    return true;
  };

  const registrar = async () => {
    setErrorMsg("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: getAuthRedirectTo("/email-confirmed?source=auth"),
          data: {
            nombre: nombre.trim(),
            telefono: telefono.replace(/\D/g, ""),
          },
        },
      });

      if (error) throw error;

      history.push("/login");
    } catch (error: any) {
      setErrorMsg(
        getFriendlyAuthErrorMessage(
          error,
          "No se pudo crear la cuenta. Revisa tus datos e intenta de nuevo."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="register-content">
        <div className="register-container">
          <div className="register-card fade-scale">
            <IonButton
              fill="clear"
              className="auth-back-link"
              onClick={() => history.push("/")}
            >
              <IonIcon icon={arrowBackOutline} slot="start" />
              Informacion
            </IonButton>

            <div className="register-header">
              <img
                src="/Logodiff.png"
                alt="Logo DIF"
                className="register-logo"
              />

              <h1 className="register-title">Crear Cuenta</h1>

              <p className="register-subtitle">Registro al sistema de apoyos</p>
            </div>

            <IonItem lines="none" className="input-item">
              <IonIcon icon={personOutline} slot="start" />
              <IonInput
                placeholder="Nombre completo"
                value={nombre}
                onIonInput={(e) => setNombre(e.detail.value || "")}
              />
            </IonItem>

            <IonItem lines="none" className="input-item">
              <IonIcon icon={mailOutline} slot="start" />
              <IonInput
                type="email"
                placeholder="Correo electronico"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value || "")}
              />
            </IonItem>

            <IonItem lines="none" className="input-item">
              <IonIcon icon={callOutline} slot="start" />
              <IonInput
                type="tel"
                inputmode="tel"
                placeholder="Numero de telefono"
                value={telefono}
                onIonInput={(e) => setTelefono(e.detail.value || "")}
              />
            </IonItem>

            <IonItem lines="none" className="input-item">
              <IonIcon icon={lockClosedOutline} slot="start" />
              <IonInput
                type="password"
                placeholder="Contrasena nueva"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value || "")}
              />
            </IonItem>

            <div className="password-helper">
              <p className="password-helper__intro">
                crea una contrasena nueva para tu cuenta.
              </p>
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

            {errorMsg ? (
              <IonText color="danger">
                <p className="error-text">{errorMsg}</p>
              </IonText>
            ) : null}

            <IonButton
              expand="block"
              className="register-button"
              onClick={registrar}
              disabled={loading}
            >
              {loading ? <IonSpinner name="crescent" /> : "Crear cuenta"}
            </IonButton>

            <IonButton
              fill="clear"
              className="login-link"
              onClick={() => history.push("/login")}
            >
              Ya tengo cuenta
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
