import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";

import Login from "./pages/Login";
import SessionEntry from "./pages/SessionEntry";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailConfirmed from "./pages/EmailConfirmed";
import DashboardAdmin from "./pages/Admin/DashboardAdmin";
import AdminSolicitudes from "./pages/Admin/AdminSolicitudes";
import AdminApoyos from "./pages/Admin/AdminApoyos";
import AdminApoyoEditor from "./pages/Admin/AdminApoyoEditor";
import AdminPerfil from "./pages/Admin/AdminPerfil";
import TabsUsuario from "./pages/Usuario/TabsUsuario";
import Register from "./pages/Registro/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import { useKeyboardViewport } from "./hooks/useKeyboardViewport";
import { usePushNotifications } from "./hooks/usePushNotifications";
import { useStartupPermissions } from "./hooks/useStartupPermissions";

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

import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => {
  useKeyboardViewport();
  usePushNotifications();
  useStartupPermissions();

  return (
    <IonApp>
      <IonReactRouter>

        <IonRouterOutlet>

       {/* ========================= */}
          {/* LOGIN Y REGISTRO */}
          {/* ========================= */}

          <Route path="/" component={SessionEntry} exact />
          <Route path="/login" component={Login} exact />
          <Route path="/forgot-password" component={ForgotPassword} exact />
          <Route path="/reset-password" component={ResetPassword} exact />
          <Route
            path="/email-confirmed"
            exact
            render={({ location }) =>
              location.search ? (
                <EmailConfirmed />
              ) : (
                <Redirect
                  to={{
                    pathname: "/email-confirmed",
                    search: "?source=auth",
                    hash: location.hash,
                  }}
                />
              )
            }
          />

          <Route path="/register" component={Register} exact />

          {/* ========================= */}
          {/* USUARIO */}
          {/* ========================= */}

          <ProtectedRoute
            path="/usuario"
            component={TabsUsuario}
            role="usuario"
          />

          {/* ========================= */}
          {/* ADMIN */}
          {/* ========================= */}

          <ProtectedRoute
            path="/admin/dashboard"
            component={DashboardAdmin}
            role="admin"
          />

          <ProtectedRoute
            path="/admin/solicitudes"
            component={AdminSolicitudes}
            role="admin"
          />

          <ProtectedRoute
            path="/admin/apoyos"
            component={AdminApoyos}
            role="admin"
            exact
          />

          <ProtectedRoute
            path="/admin/apoyos/nuevo"
            component={AdminApoyoEditor}
            role="admin"
            exact
          />

          <ProtectedRoute
            path="/admin/apoyos/editar/:apoyoId"
            component={AdminApoyoEditor}
            role="admin"
            exact
          />

          <ProtectedRoute
            path="/admin/perfil"
            component={AdminPerfil}
            role="admin"
          />

          {/* ========================= */}
          {/* REDIRECCION */}
          {/* ========================= */}

        </IonRouterOutlet>

      </IonReactRouter>
    </IonApp>
  );
};

export default App;
