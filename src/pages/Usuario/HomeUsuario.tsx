import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  useIonViewWillEnter,
} from "@ionic/react";
import { documentText, helpCircle, personCircle } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import UsuarioTopBar from "../../components/usuario/UsuarioTopBar";
import AppFeedback, { AppFeedbackState } from "../../components/utilidades/AppFeedback";
import { supabase } from "../../services/supabaseClient";
import "./HomeUsuario.css";

interface Municipio {
  id: string;
  nombre: string;
}

interface Comunidad {
  id: string;
  nombre: string;
  municipio_id: string;
  tipo: string;
}

const HomeUsuario: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ editarUbicacion?: boolean }>();
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [municipioId, setMunicipioId] = useState<string>("");
  const [tipo, setTipo] = useState<string>("");
  const [comunidadId, setComunidadId] = useState<string>("");
  const [perfilCompleto, setPerfilCompleto] = useState<boolean>(false);
  const [cargandoUbicacion, setCargandoUbicacion] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<AppFeedbackState | null>(null);
  const modoEdicion = location.state?.editarUbicacion === true;

  useEffect(() => {
    iniciar();
    // iniciar solo se necesita al montar la vista
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useIonViewWillEnter(() => {
    iniciar();
  });

  const iniciar = async () => {
    setCargandoUbicacion(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCargandoUbicacion(false);
      return;
    }

    await Promise.all([cargarMunicipios(), verificarPerfil(user.id)]);
  };

  const verificarPerfil = async (userId: string) => {
    const { data } = await supabase
      .from("perfiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setMunicipioId(data.municipio_id || "");
      setComunidadId(data.comunidad_id || "");

      if (data.municipio_id) {
        await cargarTipos(data.municipio_id);
      }

      if (data.comunidad_id) {
        const { data: comunidadActual } = await supabase
          .from("comunidades")
          .select("tipo")
          .eq("id", data.comunidad_id)
          .maybeSingle();

        if (comunidadActual?.tipo) {
          setTipo(comunidadActual.tipo);

          if (data.municipio_id) {
            await cargarComunidades(data.municipio_id, comunidadActual.tipo);
          }
        }
      }

      if (data.municipio_id && data.comunidad_id) {
        setPerfilCompleto(true);
      }
    }

    setCargandoUbicacion(false);
  };

  const cargarMunicipios = async () => {
    const { data, error } = await supabase.from("municipios").select("*");

    if (error) {
      console.log(error);
      return;
    }

    setMunicipios(data as Municipio[]);
  };

  const cargarTipos = async (municipio_id: string) => {
    const { data } = await supabase
      .from("comunidades")
      .select("tipo")
      .eq("municipio_id", municipio_id);

    const tiposUnicos = [...new Set(data?.map((c: { tipo: string }) => c.tipo))];
    setTipos(tiposUnicos as string[]);
  };

  const cargarComunidades = async (municipio_id: string, tipoSeleccionado: string) => {
    const { data } = await supabase
      .from("comunidades")
      .select("*")
      .eq("municipio_id", municipio_id)
      .eq("tipo", tipoSeleccionado);

    setComunidades(data as Comunidad[]);
  };

  const guardarPerfil = async () => {
    if (!municipioId || !comunidadId) {
      setFeedback({
        type: "warning",
        title: "Ubicacion incompleta",
        message: "Selecciona tu municipio y comunidad para continuar.",
      });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFeedback({
        type: "error",
        title: "Sesion no disponible",
        message: "Inicia sesion nuevamente para guardar tu ubicacion.",
      });
      return;
    }

    const { error } = await supabase
      .from("perfiles")
      .update({
        municipio_id: municipioId,
        comunidad_id: comunidadId,
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.log(error);
      setFeedback({
        type: "error",
        title: "No se pudo guardar",
        message: "Revisa tu conexion e intenta guardar la ubicacion otra vez.",
      });
      return;
    }

    setPerfilCompleto(true);
    setFeedback({
      type: "success",
      title: modoEdicion ? "Ubicacion actualizada" : "Perfil listo",
      message: modoEdicion
        ? "Tus datos de ubicacion se actualizaron correctamente."
        : "Guardamos tu ubicacion. Ya puedes consultar los apoyos disponibles.",
    });

    if (modoEdicion) {
      window.setTimeout(() => history.replace("/usuario/perfil"), 700);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="home-bg">
        <div className="home-layout">
          <section className="home-hero">
            <div className="home-hero__topbar">
              <UsuarioTopBar variant="hero" />
            </div>

            <div className="home-hero__content">
              <p className="home-hero__eyebrow">Portal ciudadano</p>
              <div className="home-hero__title">
                <IonIcon icon={personCircle} />
                <h1>Portal de apoyos</h1>
              </div>
              <p className="home-hero__text">Gestiona apoyos y consulta tus solicitudes.</p>

              <div className="home-hero__chips">
                <span>{perfilCompleto ? "Perfil listo" : "Falta completar perfil"}</span>
                <span>{modoEdicion ? "Editando ubicacion" : "Accesos rapidos"}</span>
              </div>
            </div>
          </section>

          {(!perfilCompleto || modoEdicion) && !cargandoUbicacion && (
            <IonCard className="home-card home-card--location">
              <IonCardHeader>
                <p className="home-card__eyebrow">Ubicacion</p>
                <IonCardTitle>
                  {modoEdicion ? "Edita tu ubicacion" : "Selecciona tu ubicacion"}
                </IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <p className="home-location__hint">
                  Esta informacion nos ayuda a mostrarte apoyos y seguimiento segun tu
                  comunidad.
                </p>

                <div className="home-location__fields">
                  <IonItem className="home-select-item">
                    <IonLabel>Municipio</IonLabel>
                    <IonSelect
                      placeholder="Selecciona municipio"
                      value={municipioId}
                      onIonChange={(e) => {
                        const id = e.detail.value;
                        setMunicipioId(id);
                        setTipo("");
                        setComunidadId("");
                        setComunidades([]);
                        cargarTipos(id);
                      }}
                    >
                      {municipios.map((municipio) => (
                        <IonSelectOption key={municipio.id} value={municipio.id}>
                          {municipio.nombre}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  {tipos.length > 0 ? (
                    <IonItem className="home-select-item">
                      <IonLabel>Tipo de localidad</IonLabel>
                      <IonSelect
                        placeholder="Selecciona tipo"
                        value={tipo}
                        onIonChange={(e) => {
                          const tipoSeleccionado = e.detail.value;
                          setTipo(tipoSeleccionado);
                          setComunidadId("");
                          cargarComunidades(municipioId, tipoSeleccionado);
                        }}
                      >
                        {tipos.map((tipoItem) => (
                          <IonSelectOption key={tipoItem} value={tipoItem}>
                            {tipoItem}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                  ) : null}

                  {comunidades.length > 0 ? (
                    <IonItem className="home-select-item">
                      <IonLabel>Comunidad</IonLabel>
                      <IonSelect
                        placeholder="Selecciona comunidad"
                        value={comunidadId}
                        onIonChange={(e) => setComunidadId(e.detail.value)}
                      >
                        {comunidades.map((comunidad) => (
                          <IonSelectOption key={comunidad.id} value={comunidad.id}>
                            {comunidad.nombre}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                  ) : null}
                </div>

                <div className="home-location__actions">
                  <IonButton expand="block" onClick={guardarPerfil}>
                    {modoEdicion ? "Actualizar ubicacion" : "Guardar ubicacion"}
                  </IonButton>

                  {modoEdicion ? (
                    <IonButton
                      expand="block"
                      fill="clear"
                      onClick={() => history.replace("/usuario/perfil")}
                    >
                      Cancelar
                    </IonButton>
                  ) : null}
                </div>
              </IonCardContent>
            </IonCard>
          )}

          {perfilCompleto && !modoEdicion ? (
            <section className="home-actions">
              <IonCard className="home-card home-card--primary">
                <IonCardHeader>
                  <p className="home-card__eyebrow">Acceso principal</p>
                  <IonCardTitle>
                    <IonIcon icon={documentText} /> Lista de apoyos
                  </IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <p className="home-card__text">
                    Revisa los apoyos disponibles y comienza una nueva solicitud cuando
                    lo necesites.
                  </p>

                  <div className="home-card__actions">
                    <IonButton
                      expand="block"
                      routerLink="/usuario/apoyos"
                      routerDirection="forward"
                    >
                      Solicitar apoyo
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>

              <IonCard className="home-card home-card--secondary">
                <IonCardHeader>
                  <p className="home-card__eyebrow">Seguimiento</p>
                  <IonCardTitle>
                    <IonIcon icon={helpCircle} /> Mis solicitudes
                  </IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <p className="home-card__text">
                    Consulta el estado de tus solicitudes y mantente al tanto de las
                    actualizaciones.
                  </p>

                  <div className="home-card__actions">
                    <IonButton
                      expand="block"
                      fill="outline"
                      routerLink="/usuario/solicitudes"
                      routerDirection="forward"
                    >
                      Ver mis solicitudes
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </section>
          ) : null}
        </div>

        <AppFeedback feedback={feedback} onClose={() => setFeedback(null)} />
      </IonContent>
    </IonPage>
  );
};

export default HomeUsuario;
