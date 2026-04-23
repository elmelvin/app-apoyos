import { IonButton, IonIcon } from "@ionic/react";
import { logOutOutline } from "ionicons/icons";
import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import "./AdminHeader.css";

interface AdminHeaderProps {
  title: string;
  subtitle: string;
}

const AdminHeader = ({ title, subtitle }: AdminHeaderProps) => {
  const history = useHistory();
  const location = useLocation();
  const [closingSession, setClosingSession] = useState(false);

  const acciones = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Solicitudes", path: "/admin/solicitudes" },
    { label: "Apoyos", path: "/admin/apoyos" },
  ];

  const cerrarSesion = async () => {
    setClosingSession(true);
    await supabase.auth.signOut();
    history.replace("/login");
  };

  return (
    <div className="admin-header">
      <div>
        <p className="admin-header__eyebrow">Panel administrativo</p>
        <h1>{title}</h1>
        <p className="admin-header__subtitle">{subtitle}</p>
      </div>

      <div className="admin-header__toolbar">
        <div className="admin-header__actions">
          {acciones.map((accion) => {
            const activa = location.pathname === accion.path;

            return (
              <IonButton
                key={accion.path}
                fill={activa ? "solid" : "outline"}
                color={activa ? "success" : "medium"}
                onClick={() => history.push(accion.path)}
              >
                {accion.label}
              </IonButton>
            );
          })}
        </div>

        <IonButton
          className="admin-header__logout"
          fill="outline"
          color="light"
          disabled={closingSession}
          onClick={cerrarSesion}
        >
          <IonIcon icon={logOutOutline} slot="start" />
          {closingSession ? "Cerrando..." : "Cerrar sesion"}
        </IonButton>
      </div>
    </div>
  );
};

export default AdminHeader;
