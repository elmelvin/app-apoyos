import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonText,
  IonIcon,
  IonSpinner
} from "@ionic/react";

import {
  mailOutline,
  lockClosedOutline,
  personOutline
} from "ionicons/icons";

import { useState } from "react";
import { useHistory } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";

import "./Register.css";

const Register: React.FC = () => {

  const history = useHistory();

  const [nombre,setNombre] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const [errorMsg,setErrorMsg] = useState("");
  const [loading,setLoading] = useState(false);

  const validateForm = () => {

    if(!nombre || !email || !password){
      setErrorMsg("Todos los campos son obligatorios");
      return false;
    }

    if(!email.includes("@")){
      setErrorMsg("Correo inválido");
      return false;
    }

    if(password.length < 6){
      setErrorMsg("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    return true;
  };

 const registrar = async () => {

  setErrorMsg("");

  if(!validateForm()) return;

  try{

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options:{
        data:{
          nombre: nombre
        }
      }
    });

    if(error) throw error;

    // ❌ ELIMINAMOS ESTO (ya lo hace el trigger)
    // await supabase.from("perfiles").insert({...})

    history.push("/login");

  }catch(error:any){

    setErrorMsg(error.message);

  }finally{
    setLoading(false);
  }

};

  return (
    <IonPage>

      <IonContent fullscreen className="register-content">

        <div className="register-container">

          <div className="register-card fade-scale">

            <div className="register-header">

              <img
                src="/logodif.jpg"
                alt="Logo DIF"
                className="register-logo"
              />

              <h1 className="register-title">
                Crear Cuenta
              </h1>

              <p className="register-subtitle">
                Registro al sistema de apoyos
              </p>

            </div>

            <IonItem lines="none" className="input-item">
              <IonIcon icon={personOutline} slot="start"/>
              <IonInput
                placeholder="Nombre completo"
                value={nombre}
                onIonChange={e=>setNombre(e.detail.value!)}
              />
            </IonItem>

            <IonItem lines="none" className="input-item">
              <IonIcon icon={mailOutline} slot="start"/>
              <IonInput
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onIonChange={e=>setEmail(e.detail.value!)}
              />
            </IonItem>

            <IonItem lines="none" className="input-item">
              <IonIcon icon={lockClosedOutline} slot="start"/>
              <IonInput
                type="password"
                placeholder="Contraseña"
                value={password}
                onIonChange={e=>setPassword(e.detail.value!)}
              />
            </IonItem>

            {errorMsg && (
              <IonText color="danger">
                <p className="error-text">{errorMsg}</p>
              </IonText>
            )}

            <IonButton
              expand="block"
              className="register-button"
              onClick={registrar}
              disabled={loading}
            >
              {loading ? <IonSpinner name="crescent"/> : "Crear cuenta"}
            </IonButton>

            <IonButton
              fill="clear"
              className="login-link"
              onClick={()=>history.push("/login")}
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