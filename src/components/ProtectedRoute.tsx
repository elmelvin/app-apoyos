import { Redirect, Route } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useEffect, useState } from "react";

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
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
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
      .eq("user_id", data.user.id) // ✅ CORRECTO
      .maybeSingle();              // ✅ EVITA ERROR

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

  if (authorized === null) return null;

  return authorized ? (
    <Route {...rest} render={(props) => <Component {...props} />} />
  ) : (
    <Redirect to="/login" />
  );
};

export default ProtectedRoute;