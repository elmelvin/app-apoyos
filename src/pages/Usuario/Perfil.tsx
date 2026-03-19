import {
  IonPage,
  IonContent,
  IonButton,
  IonText
} from "@ionic/react";

import { supabase } from "../../services/supabaseClient";
import { useHistory } from "react-router-dom";

const PerfilUsuario: React.FC = () => {

  const history = useHistory();

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    history.push("/login");
  };

  return (
    <IonPage>

      <IonContent className="ion-padding">

        <div style={{ textAlign: "center", marginTop: "40px" }}>

          <img
            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
            width="120"
          />

          <h2>Mi Perfil</h2>

          <IonText color="medium">
            Información de tu cuenta
          </IonText>

          <br /><br />

          <IonButton
            color="danger"
            expand="block"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </IonButton>

        </div>

      </IonContent>

    </IonPage>
  );
};

export default PerfilUsuario;