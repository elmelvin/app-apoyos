import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonPage,
  IonSpinner,
  IonText,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  atOutline,
  businessOutline,
  chevronForwardOutline,
  helpCircleOutline,
  homeOutline,
  personOutline,
  pinOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import "./Perfil.css";

interface RelacionNombre {
  nombre?: string | null;
  tipo?: string | null;
}

interface PerfilData {
  nombre: string | null;
  municipios?: RelacionNombre | RelacionNombre[] | null;
  comunidades?: RelacionNombre | RelacionNombre[] | null;
}

interface CuentaResumen {
  nombre: string;
  email: string;
  municipio: string;
  comunidad: string;
  tipo: string;
}

const PerfilUsuario: React.FC = () => {
  const history = useHistory();
  const [perfil, setPerfil] = useState<CuentaResumen | null>(null);
  const [loading, setLoading] = useState(true);

  const inicial = useMemo(() => {
    if (!perfil?.nombre) return "U";
    return perfil.nombre.trim().charAt(0).toUpperCase();
  }, [perfil?.nombre]);

  const cargarPerfil = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("perfiles")
        .select(`
          nombre,
          municipios(nombre),
          comunidades(nombre, tipo)
        `)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      const perfilData = data as PerfilData;
      const comunidad = obtenerRelacion(perfilData.comunidades);
      const municipio = obtenerRelacion(perfilData.municipios);

      setPerfil({
        nombre: perfilData.nombre || user.user_metadata?.nombre || "Usuario",
        email: user.email || "No disponible",
        municipio: municipio?.nombre || "No seleccionado",
        comunidad: comunidad?.nombre || "No seleccionada",
        tipo: comunidad?.tipo || "No seleccionado",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  useIonViewWillEnter(() => {
    cargarPerfil();
  });

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    history.push("/login");
  };

  return (
    <IonPage>
      <IonContent className="perfil-page ion-padding">
        {loading ? (
          <div className="perfil-loading">
            <IonSpinner />
            <p>Cargando perfil...</p>
          </div>
        ) : (
          <div className="perfil-layout">
            <section className="perfil-hero">
              <div className="perfil-avatar">{inicial}</div>

              <div className="perfil-hero__content">
                <p className="perfil-hero__eyebrow">Mi cuenta</p>
                <h1>{perfil?.nombre || "Usuario"}</h1>
                <IonText color="medium">
                  <p>{perfil?.email || "No disponible"}</p>
                </IonText>
              </div>

              <div className="perfil-hero__badge">
                <span>{perfil?.tipo || "Sin tipo"}</span>
              </div>
            </section>

            <IonCard className="perfil-card perfil-card--compact">
              <IonCardContent>
                <div className="perfil-card__header">
                  <div>
                    <p className="perfil-card__eyebrow">Mis datos</p>
                    <h2>Resumen de cuenta</h2>
                  </div>
                  <span className="perfil-status-pill">Activa</span>
                </div>

                <div className="perfil-list">
                  <div className="perfil-list__item">
                    <div className="perfil-list__icon">
                      <IonIcon icon={personOutline} />
                    </div>
                    <div className="perfil-list__content">
                      <span>Nombre</span>
                      <strong>{perfil?.nombre || "No registrado"}</strong>
                    </div>
                  </div>

                  <div className="perfil-list__item">
                    <div className="perfil-list__icon">
                      <IonIcon icon={atOutline} />
                    </div>
                    <div className="perfil-list__content">
                      <span>Correo</span>
                      <strong>{perfil?.email || "No disponible"}</strong>
                    </div>
                  </div>

                  <div className="perfil-list__item">
                    <div className="perfil-list__icon">
                      <IonIcon icon={businessOutline} />
                    </div>
                    <div className="perfil-list__content">
                      <span>Municipio</span>
                      <strong>{perfil?.municipio || "No seleccionado"}</strong>
                    </div>
                  </div>

                  <div className="perfil-list__item">
                    <div className="perfil-list__icon">
                      <IonIcon icon={homeOutline} />
                    </div>
                    <div className="perfil-list__content">
                      <span>Comunidad</span>
                      <strong>{perfil?.comunidad || "No seleccionada"}</strong>
                    </div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>

            <IonCard className="perfil-card perfil-card--options">
              <IonCardContent>
                <p className="perfil-card__eyebrow">Mas opciones</p>
                <h2>Configuracion y ayuda</h2>

                <div className="perfil-options">
                  <button
                    className="perfil-option"
                    onClick={() =>
                      history.push("/usuario/home", { editarUbicacion: true })
                    }
                  >
                    <div className="perfil-option__main">
                      <div className="perfil-option__icon">
                        <IonIcon icon={pinOutline} />
                      </div>
                      <div>
                        <strong>Editar ubicacion</strong>
                        <span>Actualiza municipio y comunidad</span>
                      </div>
                    </div>
                    <IonIcon icon={chevronForwardOutline} />
                  </button>

                  <button
                    className="perfil-option"
                    onClick={() => history.push("/usuario/ayuda")}
                  >
                    <div className="perfil-option__main">
                      <div className="perfil-option__icon">
                        <IonIcon icon={helpCircleOutline} />
                      </div>
                      <div>
                        <strong>Centro de ayuda</strong>
                        <span>Consulta orientación y canales de atención</span>
                      </div>
                    </div>
                    <IonIcon icon={chevronForwardOutline} />
                  </button>

                  <button
                    className="perfil-option"
                    onClick={() => history.push("/usuario/privacidad")}
                  >
                    <div className="perfil-option__main">
                      <div className="perfil-option__icon">
                        <IonIcon icon={shieldCheckmarkOutline} />
                      </div>
                      <div>
                        <strong>Aviso de privacidad</strong>
                        <span>Revisa cómo se utiliza tu información</span>
                      </div>
                    </div>
                    <IonIcon icon={chevronForwardOutline} />
                  </button>
                </div>

                <IonButton color="danger" expand="block" onClick={cerrarSesion}>
                  Cerrar sesion
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PerfilUsuario;

const obtenerRelacion = (
  relacion?: RelacionNombre | RelacionNombre[] | null
): RelacionNombre | null => {
  if (Array.isArray(relacion)) {
    return relacion[0] || null;
  }

  return relacion || null;
};
