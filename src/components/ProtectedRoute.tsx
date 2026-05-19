import { IonContent, IonPage } from "@ionic/react";
import { Redirect, Route } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useEffect, useState } from "react";
import Loader from "./utilidades/Loader";

interface Props {
  component: any;
  path: string;
  exact?: boolean;
  role?: "admin" | "usuario";
}

const ProtectedRoute: React.FC<Props> = ({
  component: Component,
  role,
  ...rest
}) => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setAuthorized(false);
        return;
      }

      if (!role) {
        setAuthorized(true);
        return;
      }

      const { data: profile, error } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("user_id", session.user.id) 
      .maybeSingle();              

      if (error) {
        console.log(error);
        setAuthorized(false);
        return;
      }

      if (profile?.rol === role) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    };

    checkUser();
  }, [role]);

  if (authorized === null) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <Loader message="Validando acceso..." />
        </IonContent>
      </IonPage>
    );
  }

  return authorized ? (
    <Route {...rest} render={(props) => <Component {...props} />} />
  ) : (
    <Redirect to="/login" />
  );
};

export default ProtectedRoute;
