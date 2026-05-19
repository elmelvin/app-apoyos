import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { registerPushNotificationsForCurrentUser } from "./usePushNotifications";

const STARTUP_PERMISSIONS_KEY = "app-apoyos-startup-permissions-requested";

export const useStartupPermissions = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;

    const requestInitialPermissions = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) return;

      const permissionKey = `${STARTUP_PERMISSIONS_KEY}:${user.id}`;
      const alreadyRequested = window.localStorage.getItem(permissionKey) === "true";

      if (alreadyRequested) {
        await registerPushNotificationsForCurrentUser({ requestPermission: false });
        return;
      }

      await registerPushNotificationsForCurrentUser({ requestPermission: true });

      window.localStorage.setItem(permissionKey, "true");
    };

    requestInitialPermissions().catch((error) => console.log(error));

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        requestInitialPermissions().catch((error) => console.log(error));
      }
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);
};
