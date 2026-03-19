import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";

import Login from "./pages/Login";
import DashboardAdmin from "./pages/Admin/DashboardAdmin";
import TabsUsuario from "./pages/Usuario/TabsUsuario";
import ListaApoyos from "./pages/Usuario/ListaApoyos";
import Register from "./pages/Registro/Register";

import ProtectedRoute from "./components/ProtectedRoute";

/* CSS */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import "@ionic/react/css/palettes/dark.system.css";

import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>

        <IonRouterOutlet>

          {/* LOGIN */}
          <Route path="/login" component={Login} exact />
          <Route path="/register" component={Register} exact />

          {/* USUARIO */}
          <ProtectedRoute
            path="/usuario"
            component={TabsUsuario}
            role="usuario"
          />

          <ProtectedRoute
            path="/usuario/apoyos"
            component={ListaApoyos}
            role="usuario"
          />

          {/* ADMIN */}
          <ProtectedRoute
            path="/admin/dashboard"
            component={DashboardAdmin}
            role="admin"
          />

          {/* REDIRECCION */}
          <Redirect exact from="/" to="/login" />

        </IonRouterOutlet>

      </IonReactRouter>
    </IonApp>
  );
};

export default App;