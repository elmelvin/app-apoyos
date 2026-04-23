import {
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { useMemo, useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import DocumentosModal from "../../components/solicitudes/DocumentosModal";
import Card from "../../components/utilidades/Card";
import EmptyState from "../../components/utilidades/EmptyState";
import Loader from "../../components/utilidades/Loader";
import StatCard from "../../components/utilidades/StatCard";
import {
  Documento,
  SolicitudAdmin,
  useAdminSolicitudes,
} from "../../hooks/useAdminSolicitudes";
import "./AdminSolicitudes.css";

const ESTADOS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "aprobado", label: "Aprobado" },
  { value: "rechazado", label: "Rechazado" },
];

const formatearFecha = (fecha: string) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(fecha));

const obtenerExtension = (url: string) => {
  const limpia = url.split("?")[0];
  const extension = limpia.split(".").pop();
  return extension || "bin";
};

const AdminSolicitudes = () => {
  const { solicitudes, loading, updatingId, actualizarEstado, cargarSolicitudes } =
    useAdminSolicitudes();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [municipioFiltro, setMunicipioFiltro] = useState("todos");
  const [comunidadFiltro, setComunidadFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const municipiosDisponibles = useMemo(
    () =>
      [...new Set(solicitudes.map((solicitud) => solicitud.municipio).filter(Boolean))]
        .sort((a, b) => (a || "").localeCompare(b || "", "es-MX")) as string[],
    [solicitudes]
  );

  const comunidadesDisponibles = useMemo(
    () =>
      [...new Set(solicitudes.map((solicitud) => solicitud.comunidad).filter(Boolean))]
        .sort((a, b) => (a || "").localeCompare(b || "", "es-MX")) as string[],
    [solicitudes]
  );

  const solicitudesFiltradas = useMemo(
    () =>
      [...solicitudes]
        .filter((solicitud) => {
          if (estadoFiltro === "todos") return true;
          return (solicitud.estado || "pendiente") === estadoFiltro;
        })
        .filter((solicitud) => {
          if (municipioFiltro === "todos") return true;
          return (solicitud.municipio || "") === municipioFiltro;
        })
        .filter((solicitud) => {
          if (comunidadFiltro === "todos") return true;
          return (solicitud.comunidad || "") === comunidadFiltro;
        })
        .filter((solicitud) => {
          const termino = busqueda.trim().toLowerCase();

          if (!termino) return true;

          return [
            solicitud.nombre,
            solicitud.apoyo_nombre || "",
            solicitud.telefono || "",
            solicitud.direccion || "",
            solicitud.mensaje || "",
            solicitud.municipio || "",
            solicitud.comunidad || "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(termino);
        })
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
    [busqueda, comunidadFiltro, estadoFiltro, municipioFiltro, solicitudes]
  );

  const resumen = useMemo(() => {
    const total = solicitudes.length;
    const pendientes = solicitudes.filter(
      (s) => (s.estado || "pendiente") === "pendiente"
    ).length;
    const aprobados = solicitudes.filter((s) => s.estado === "aprobado").length;
    const rechazados = solicitudes.filter((s) => s.estado === "rechazado").length;
    const conDocumentos = solicitudes.filter((s) => s.documentos.length > 0).length;

    return {
      total,
      pendientes,
      aprobados,
      rechazados,
      conDocumentos,
    };
  }, [solicitudes]);

  const pendientesFiltradas = solicitudesFiltradas.filter(
    (s) => (s.estado || "pendiente") === "pendiente"
  ).length;

  const textoResumen = useMemo(() => {
    if (!solicitudesFiltradas.length) {
      return "No hay resultados con los filtros actuales.";
    }

    if (pendientesFiltradas > 0) {
      return `${pendientesFiltradas} pendientes requieren atencion.`;
    }

    return "Todas las solicitudes filtradas ya tienen resolucion.";
  }, [pendientesFiltradas, solicitudesFiltradas.length]);

  const verDocumentos = (solicitud: SolicitudAdmin) => {
    setDocumentos(solicitud.documentos || []);
    setShowModal(true);
  };

  const descargarDocumentos = (solicitud: SolicitudAdmin) => {
    if (!solicitud.documentos.length) {
      alert("Esta solicitud no tiene documentos para descargar.");
      return;
    }

    solicitud.documentos.forEach((doc, index) => {
      const enlace = document.createElement("a");
      enlace.href = doc.url;
      enlace.download = `${solicitud.nombre}-${doc.tipo_documento}-${index + 1}.${obtenerExtension(
        doc.url
      )}`;
      enlace.target = "_blank";
      enlace.rel = "noreferrer";
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
    });
  };

  const cambiarEstado = async (solicitudId: string, estado: string) => {
    const resultado = await actualizarEstado(solicitudId, estado);

    if (!resultado.ok) {
      alert(
        `No se pudo actualizar el estado. ${
          resultado.error ||
          "Revisa la policy UPDATE de la tabla solicitudes en Supabase."
        }`
      );
    }
  };

  useIonViewWillEnter(() => {
    cargarSolicitudes();
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Todas las solicitudes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <Loader />
        ) : solicitudes.length === 0 ? (
          <>
            <AdminHeader
              title="Solicitudes"
              subtitle="Consulta, filtra y actualiza el estado de cada registro desde un solo lugar."
            />
            <EmptyState message="No hay solicitudes registradas." />
          </>
        ) : (
          <div className="admin-solicitudes-page">
            <AdminHeader
              title="Solicitudes"
              subtitle="Consulta, filtra y actualiza el estado de cada registro desde un solo lugar."
            />
            <section className="admin-overview">
              <div className="admin-resumen-grid">
                <StatCard title="Total" value={resumen.total} />
                <StatCard title="Pendientes" value={resumen.pendientes} />
                <StatCard title="Aprobadas" value={resumen.aprobados} />
                <StatCard title="Rechazadas" value={resumen.rechazados} />
                <StatCard title="Con documentos" value={resumen.conDocumentos} />
              </div>

              <Card>
                <div className="admin-filtros-card">
                  <div className="admin-filtros-card__header">
                    <div>
                      <p className="admin-filtros-card__eyebrow">Filtros</p>
                      <h3>Encuentra solicitudes por estado y ubicacion</h3>
                    </div>

                    <IonButton
                      fill="clear"
                      color="medium"
                      onClick={() => {
                        setBusqueda("");
                        setEstadoFiltro("todos");
                        setMunicipioFiltro("todos");
                        setComunidadFiltro("todos");
                      }}
                    >
                      Limpiar filtros
                    </IonButton>
                  </div>

                  <div className="admin-filtros">
                    <IonSearchbar
                      className="admin-searchbar"
                      value={busqueda}
                      placeholder="Buscar por nombre, municipio, telefono, direccion o mensaje"
                      onIonInput={(e) => setBusqueda(e.detail.value || "")}
                    />

                    <div className="admin-filtros__selects">
                      <IonItem className="admin-filtro-estado">
                        <IonLabel>Estado</IonLabel>
                        <IonSelect
                          interface="popover"
                          value={estadoFiltro}
                          onIonChange={(e) => setEstadoFiltro(e.detail.value)}
                        >
                          <IonSelectOption value="todos">Todos</IonSelectOption>
                          {ESTADOS.map((estado) => (
                            <IonSelectOption key={estado.value} value={estado.value}>
                              {estado.label}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>

                      <IonItem className="admin-filtro-estado">
                        <IonLabel>Municipio</IonLabel>
                        <IonSelect
                          interface="popover"
                          value={municipioFiltro}
                          onIonChange={(e) => setMunicipioFiltro(e.detail.value)}
                        >
                          <IonSelectOption value="todos">Todos</IonSelectOption>
                          {municipiosDisponibles.map((municipio) => (
                            <IonSelectOption key={municipio} value={municipio}>
                              {municipio}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>

                      <IonItem className="admin-filtro-estado">
                        <IonLabel>Comunidad</IonLabel>
                        <IonSelect
                          interface="popover"
                          value={comunidadFiltro}
                          onIonChange={(e) => setComunidadFiltro(e.detail.value)}
                        >
                          <IonSelectOption value="todos">Todas</IonSelectOption>
                          {comunidadesDisponibles.map((comunidad) => (
                            <IonSelectOption key={comunidad} value={comunidad}>
                              {comunidad}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            <div className="admin-toolbar">
              <div className="admin-toolbar__copy">
                <p>
                  Mostrando {solicitudesFiltradas.length} de {solicitudes.length}{" "}
                  solicitudes
                </p>
                <span>{textoResumen}</span>
              </div>

              <IonButton fill="outline" onClick={() => cargarSolicitudes({ force: true })}>
                Actualizar lista
              </IonButton>
            </div>

            {solicitudesFiltradas.length === 0 ? (
              <EmptyState message="No hay solicitudes que coincidan con los filtros." />
            ) : (
              <div className="admin-solicitudes-grid">
                {solicitudesFiltradas.map((solicitud) => (
                  <Card key={solicitud.id}>
                    <div className="admin-solicitud-card">
                      <div className="admin-solicitud-card__header">
                        <div>
                          <p className="admin-solicitud-card__eyebrow">
                            {formatearFecha(solicitud.created_at)}
                          </p>
                          <h3>{solicitud.nombre}</h3>
                        </div>

                        <IonBadge
                          className={`admin-status-badge ${obtenerClaseEstado(
                            solicitud.estado
                          )}`}
                        >
                          {obtenerEtiquetaEstado(solicitud.estado)}
                        </IonBadge>
                      </div>

                      <div className="admin-solicitud-meta">
                        <div className="admin-meta-item">
                          <span>Municipio</span>
                          <strong>{solicitud.municipio || "No disponible"}</strong>
                        </div>
                        <div className="admin-meta-item">
                          <span>Comunidad</span>
                          <strong>{solicitud.comunidad || "No disponible"}</strong>
                        </div>
                        <div className="admin-meta-item">
                          <span>Apoyo</span>
                          <strong>{solicitud.apoyo_nombre || "No especificado"}</strong>
                        </div>
                        <div className="admin-meta-item">
                          <span>Telefono</span>
                          <strong>{solicitud.telefono || "No disponible"}</strong>
                        </div>
                        <div className="admin-meta-item">
                          <span>Direccion</span>
                          <strong>{solicitud.direccion || "No disponible"}</strong>
                        </div>
                        <div className="admin-meta-item admin-meta-item--wide">
                          <span>Mensaje</span>
                          <p>{solicitud.mensaje || "Sin mensaje"}</p>
                        </div>
                        <div className="admin-meta-item">
                          <span>Documentos</span>
                          <strong>{solicitud.documentos.length}</strong>
                        </div>
                        <div className="admin-meta-item">
                          <span>Usuario</span>
                          <strong className="admin-user-id">{solicitud.usuario_id}</strong>
                        </div>
                      </div>

                      <div className="admin-solicitud-actions">
                        <div className="admin-estado-control">
                          <span className="admin-estado-control__label">
                            Cambiar estado
                          </span>
                          <IonItem className="admin-estado-select">
                            <IonSelect
                              interface="popover"
                              value={solicitud.estado || "pendiente"}
                              disabled={updatingId === solicitud.id}
                              onIonChange={(e) =>
                                cambiarEstado(solicitud.id, e.detail.value)
                              }
                            >
                              {ESTADOS.map((estado) => (
                                <IonSelectOption
                                  key={estado.value}
                                  value={estado.value}
                                >
                                  {estado.label}
                                </IonSelectOption>
                              ))}
                            </IonSelect>
                          </IonItem>
                        </div>

                        <div className="admin-action-buttons">
                          <IonButton
                            className="admin-action-button"
                            expand="block"
                            onClick={() => verDocumentos(solicitud)}
                          >
                            Ver documentos
                          </IonButton>
                          <IonButton
                            className="admin-action-button"
                            expand="block"
                            fill="outline"
                            onClick={() => descargarDocumentos(solicitud)}
                          >
                            Descargar docs
                          </IonButton>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        <DocumentosModal
          show={showModal}
          setShow={setShowModal}
          documentos={documentos}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminSolicitudes;

const obtenerEtiquetaEstado = (estado?: string | null) => {
  if (estado === "aprobado") return "Aprobado";
  if (estado === "rechazado") return "Rechazado";
  return "Pendiente";
};

const obtenerClaseEstado = (estado?: string | null) => {
  if (estado === "aprobado") return "approved";
  if (estado === "rechazado") return "rejected";
  return "pending";
};
