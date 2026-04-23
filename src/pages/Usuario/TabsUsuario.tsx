import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from "@ionic/react";

import { Route, Redirect } from "react-router-dom";

import { home, person } from "ionicons/icons";

import HomeUsuario from "./HomeUsuario";
import PerfilUsuario from "./Perfil";
import ListaApoyos from "./ListaApoyos";
import FormularioSolicitud from "./FormularioSolicitud";
import MisSolicitudes from "./MisSolicitudes";
import CentroAyuda from "./CentroAyuda";
import AvisoPrivacidad from "./AvisoPrivacidad";

const TabsUsuario: React.FC = () => {
  return (
    <IonTabs>

      <IonRouterOutlet>

        <Route path="/usuario/home" component={HomeUsuario} exact />
        <Route path="/usuario/perfil" component={PerfilUsuario} exact />
        <Route path="/usuario/formulario-Solicitud" component={FormularioSolicitud} exact/>

        {/* NUEVA RUTA */}
        <Route path="/usuario/apoyos" component={ListaApoyos} exact />
        <Route path="/usuario/solicitudes" component={MisSolicitudes} exact />
        <Route path="/usuario/ayuda" component={CentroAyuda} exact />
        <Route path="/usuario/privacidad" component={AvisoPrivacidad} exact />

        <Redirect exact from="/usuario" to="/usuario/home" />

      </IonRouterOutlet>

      <IonTabBar slot="bottom">

        <IonTabButton tab="home" href="/usuario/home">
          <IonIcon icon={home} />
          <IonLabel>Inicio</IonLabel>
        </IonTabButton>

        <IonTabButton tab="perfil" href="/usuario/perfil">
          <IonIcon icon={person} />
          <IonLabel>Perfil</IonLabel>
        </IonTabButton>

      </IonTabBar>

    </IonTabs>
  );
};

export default TabsUsuario;
