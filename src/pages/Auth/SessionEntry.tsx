import { IonContent, IonPage } from "@ionic/react";
import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import Loader from "../../components/utilidades/Loader";
import { getActiveSessionHomeRoute } from "../../services/authService";
import Bienvenida from "./Bienvenida";

const SessionEntry: React.FC = () => {
  const [homeRoute, setHomeRoute] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const route = await getActiveSessionHomeRoute();

        if (active) {
          setHomeRoute(route);
        }
      } catch (error) {
        console.log("No se pudo restaurar la sesion activa.", error);
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  if (checkingSession) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <Loader message="Restaurando sesion..." />
        </IonContent>
      </IonPage>
    );
  }

  return homeRoute ? <Redirect to={homeRoute} /> : <Bienvenida />;
};

export default SessionEntry;
