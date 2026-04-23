import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { documentText, helpCircle, personCircle } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
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
      alert("Selecciona municipio y comunidad");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Usuario no autenticado");
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
      alert("Error guardando perfil");
      return;
    }

    setPerfilCompleto(true);
    alert("Perfil guardado correctamente");

    if (modoEdicion) {
      history.replace("/usuario/perfil");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Portal de Apoyos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="home-bg">
        <div className="home-layout">
          <section className="home-hero">
            <div className="home-hero__icon">
              <IonIcon icon={personCircle} />
            </div>

            <div className="home-hero__content">
              <p className="home-hero__eyebrow">Portal ciudadano</p>
              <h1>Bienvenido</h1>
              <p className="home-hero__text">
                Gestiona tus apoyos y consulta tus solicitudes
              </p>

              <div className="home-hero__chips">
                <span>{perfilCompleto ? "Perfil listo" : "Falta completar perfil"}</span>
                <span>{modoEdicion ? "Editando ubicación" : "Accesos rápidos"}</span>
              </div>
            </div>
          </section>

          {(!perfilCompleto || modoEdicion) && !cargandoUbicacion && (
            <IonCard className="home-card home-card--location">
              <IonCardHeader>
                <p className="home-card__eyebrow">Ubicación</p>
                <IonCardTitle>
                  {modoEdicion ? "Edita tu ubicacion" : "Selecciona tu ubicacion"}
                </IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <p className="home-location__hint">
                  Esta información nos ayuda a mostrarte apoyos y seguimiento según tu
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

                  {tipos.length > 0 && (
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
                  )}

                  {comunidades.length > 0 && (
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
                  )}
                </div>

                <div className="home-location__actions">
                  <IonButton expand="block" onClick={guardarPerfil}>
                    {modoEdicion ? "Actualizar ubicacion" : "Guardar ubicacion"}
                  </IonButton>

                  {modoEdicion && (
                    <IonButton
                      expand="block"
                      fill="clear"
                      onClick={() => history.replace("/usuario/perfil")}
                    >
                      Cancelar
                    </IonButton>
                  )}
                </div>
              </IonCardContent>
            </IonCard>
          )}

          {perfilCompleto && !modoEdicion && (
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
                    Revisa los apoyos disponibles y comienza una nueva solicitud
                    cuando lo necesites.
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
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HomeUsuario;
