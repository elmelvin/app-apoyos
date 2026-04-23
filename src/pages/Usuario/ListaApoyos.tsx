import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  accessibility,
  bagHandleOutline,
  heart,
  medical,
  walk,
} from "ionicons/icons";
import EmptyState from "../../components/utilidades/EmptyState";
import Loader from "../../components/utilidades/Loader";
import {
  Apoyo,
  ApoyoSeleccionadoPayload,
  getApoyos,
} from "../../services/apoyosService";
import { supabase } from "../../services/supabaseClient";
import "./ListaApoyos.css";

const ListaApoyos: React.FC = () => {
  const history = useHistory();
  const [apoyos, setApoyos] = useState<Apoyo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [municipioNombre, setMunicipioNombre] = useState("");

  useEffect(() => {
    cargarApoyos();
  }, []);

  const cargarApoyos = async () => {
    try {
      setLoading(true);
      setError("");

      const ubicacion = await obtenerMunicipioUsuario();
      setMunicipioNombre(ubicacion.nombre);

      const data = await getApoyos(ubicacion.id);
      setApoyos(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudieron cargar los apoyos.";
      setError(message);
      setApoyos([]);
    } finally {
      setLoading(false);
    }
  };

  const apoyosConIcono = useMemo(
    () =>
      apoyos.map((apoyo) => ({
        ...apoyo,
        iconoRender: resolverIcono(apoyo),
      })),
    [apoyos]
  );

  const irAFormulario = (apoyo: Apoyo) => {
    const apoyoSeleccionado: ApoyoSeleccionadoPayload = {
      id: apoyo.id,
      nombre: apoyo.nombre,
      descripcion: apoyo.descripcion,
      requisitos: obtenerRequisitos(apoyo.requisitos),
    };

    history.push("/usuario/formulario-Solicitud", {
      apoyoSeleccionado,
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Apoyos disponibles</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="apoyos-bg">
        <div className="apoyos-layout">
          <section className="apoyos-hero">
            <div>
              <p className="apoyos-hero__eyebrow">Catalogo dinamico</p>
              <h1>Apoyos disponibles</h1>
              <p className="apoyos-hero__text">
                Esta lista se alimenta desde la base de datos y muestra apoyos
                globales junto con los asignados a tu municipio
                {municipioNombre ? `: ${municipioNombre}.` : "."}
              </p>
            </div>

            <div className="apoyos-hero__stats">
              <div className="apoyos-stat">
                <span>Total visibles</span>
                <strong>{apoyos.length}</strong>
              </div>
              <IonButton fill="outline" color="light" onClick={cargarApoyos}>
                Actualizar lista
              </IonButton>
            </div>
          </section>

          {loading ? (
            <Loader message="Cargando apoyos..." />
          ) : error ? (
            <div className="apoyos-feedback">
              <EmptyState message={error} />
              <IonButton onClick={cargarApoyos}>Reintentar</IonButton>
            </div>
          ) : apoyosConIcono.length === 0 ? (
            <EmptyState message="No hay apoyos activos disponibles para tu municipio en este momento." />
          ) : (
            <IonGrid className="apoyos-grid">
              <IonRow>
                {apoyosConIcono.map((apoyo) => {
                  const requisitos = obtenerRequisitos(apoyo.requisitos);

                  return (
                    <IonCol size="12" sizeMd="6" key={apoyo.id}>
                      <IonCard className="card-apoyo">
                        <IonCardHeader>
                          <IonBadge className="card-apoyo__badge">
                            {apoyo.municipio_id ? "Municipal" : "General"}
                          </IonBadge>
                          <IonCardTitle className="titulo-apoyo">
                            <div className="icono-apoyo__wrap">
                              <IonIcon icon={apoyo.iconoRender} className="icono-apoyo" />
                            </div>
                            <div>
                              <span className="titulo-apoyo__eyebrow">Apoyo disponible</span>
                              <strong>{apoyo.nombre}</strong>
                            </div>
                          </IonCardTitle>
                        </IonCardHeader>

                        <IonCardContent>
                          <p className="card-apoyo__descripcion">
                            {apoyo.descripcion || "Sin descripcion disponible por el momento."}
                          </p>

                          <div className="card-apoyo__requisitos">
                            <span className="card-apoyo__requisitos-titulo">
                              Documentos necesarios
                            </span>
                            {requisitos.length > 0 ? (
                              <ul className="card-apoyo__requisitos-lista">
                                {requisitos.map((requisito) => (
                                  <li key={`${apoyo.id}-${requisito}`}>{requisito}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="card-apoyo__requisitos-vacio">
                                Se mostraran dentro del formulario cuando esten disponibles.
                              </p>
                            )}
                          </div>

                          <IonButton
                            expand="block"
                            onClick={() => irAFormulario(apoyo)}
                          >
                            Solicitar
                          </IonButton>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  );
                })}
              </IonRow>
            </IonGrid>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ListaApoyos;

const obtenerMunicipioUsuario = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { id: null, nombre: "" };
  }

  const { data } = await supabase
    .from("perfiles")
    .select("municipio_id, municipios(nombre)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    return { id: null, nombre: "" };
  }

  const relacion = data.municipios as { nombre?: string | null } | { nombre?: string | null }[] | null;
  const nombre = Array.isArray(relacion) ? relacion[0]?.nombre || "" : relacion?.nombre || "";

  return {
    id: data.municipio_id || null,
    nombre,
  };
};

const resolverIcono = (apoyo: Apoyo) => {
  const base = `${apoyo.nombre} ${apoyo.descripcion || ""}`.toLowerCase();

  if (
    base.includes("rueda") ||
    base.includes("movilidad") ||
    base.includes("silla")
  ) {
    return walk;
  }

  if (base.includes("muleta") || base.includes("discap") || base.includes("acceso")) {
    return accessibility;
  }

  if (base.includes("medic") || base.includes("tratamiento") || base.includes("salud")) {
    return heart;
  }

  if (base.includes("baston") || base.includes("bastón") || base.includes("adulto")) {
    return medical;
  }

  return bagHandleOutline;
};

const obtenerRequisitos = (requisitos?: string | null) =>
  (requisitos || "")
    .split(/\r?\n|,|;|•/)
    .map((item) => item.trim())
    .filter(Boolean);
