import { IonRouterOutlet } from "@ionic/react";
import { Redirect, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import {
  AdminApoyoEditor,
  AdminApoyos,
  AdminPerfil,
  AdminSolicitudes,
  DashboardAdmin,
  EmailConfirmed,
  ForgotPassword,
  Login,
  Register,
  ResetPassword,
  SessionEntry,
  TabsUsuario,
} from "../pages";

const AppRoutes = () => (
  <IonRouterOutlet>
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

    <ProtectedRoute path="/usuario" component={TabsUsuario} role="usuario" />

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
    <ProtectedRoute path="/admin/perfil" component={AdminPerfil} role="admin" />
  </IonRouterOutlet>
);

export default AppRoutes;
