import { IonButton, IonContent, IonPage } from "@ionic/react";
import { useMemo } from "react";
import { useHistory } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminTrendChart from "../../components/admin/AdminTrendChart";
import StatCard from "../../components/utilidades/StatCard";
import Card from "../../components/utilidades/Card";
import Loader from "../../components/utilidades/Loader";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import "./Dashboard.css";

const DashboardAdmin = () => {
  const history = useHistory();
  const {
    total,
    pendientes,
    aprobados,
    rechazados,
    recientes,
    timeline,
    loading,
  } = useDashboardStats();

  const metricas = useMemo(() => {
    const porcentajePendientes = total ? Math.round((pendientes / total) * 100) : 0;
    const porcentajeAprobadas = total ? Math.round((aprobados / total) * 100) : 0;
    const porcentajeRechazadas = total ? Math.round((rechazados / total) * 100) : 0;

    return [
      {
        label: "Pendientes",
        value: pendientes,
        percentage: porcentajePendientes,
        accentClass: "pending",
      },
      {
        label: "Aprobadas",
        value: aprobados,
        percentage: porcentajeAprobadas,
        accentClass: "approved",
      },
      {
        label: "Rechazadas",
        value: rechazados,
        percentage: porcentajeRechazadas,
        accentClass: "rejected",
      },
    ];
  }, [aprobados, pendientes, rechazados, total]);

  const indicadores = useMemo(() => {
    const tasaResolucion = total
      ? Math.round(((aprobados + rechazados) / total) * 100)
      : 0;
    const tasaAprobacion = total ? Math.round((aprobados / total) * 100) : 0;
    const solicitudesHoy = timeline[timeline.length - 1]?.total || 0;

    return [
      {
        label: "Resolucion",
        value: `${tasaResolucion}%`,
        hint: "Solicitudes ya dictaminadas",
      },
      {
        label: "Aprobacion",
        value: `${tasaAprobacion}%`,
        hint: "Sobre el total recibido",
      },
      {
        label: "Ingresos hoy",
        value: `${solicitudesHoy}`,
        hint: "Registros del dia actual",
      },
    ];
  }, [aprobados, rechazados, timeline, total]);

  const prioridades = useMemo(
    () =>
      recientes
        .filter((solicitud) => (solicitud.estado || "pendiente") === "pendiente")
        .slice(0, 3),
    [recientes]
  );

  return (
    <IonPage>
      <IonContent className="ion-padding">
        {loading ? (
          <Loader message="Cargando dashboard..." />
        ) : (
          <div className="admin-dashboard">
            <AdminHeader
              title="Dashboard"
              subtitle="Supervisa el flujo de solicitudes, detecta cuellos de botella y entra rápido a las revisiones pendientes."
            />

            <div className="stats-grid">
              <StatCard title="Total solicitudes" value={total} />
              <StatCard title="Pendientes" value={pendientes} />
              <StatCard title="Aprobados" value={aprobados} />
              <StatCard title="Rechazados" value={rechazados} />
            </div>

            <div className="dashboard-panels">
              <Card>
                <div className="dashboard-summary">
                  <div>
                    <p className="dashboard-summary__eyebrow">Resumen general</p>
                    <h3>Estado del proceso</h3>
                    <p className="dashboard-summary__text">
                      {pendientes > 0
                        ? `Hay ${pendientes} solicitudes esperando revisión.`
                        : "No hay solicitudes pendientes en este momento."}
                    </p>
                  </div>

                  <div className="dashboard-summary__actions">
                    <IonButton
                      color="success"
                      onClick={() => history.push("/admin/solicitudes")}
                    >
                      Revisar solicitudes
                    </IonButton>
                    <IonButton
                      fill="outline"
                      color="medium"
                      onClick={() => history.push("/admin/apoyos")}
                    >
                      Administrar apoyos
                    </IonButton>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="dashboard-distribution">
                  <div>
                    <p className="dashboard-summary__eyebrow">Distribucion</p>
                    <h3>Como se reparten las solicitudes</h3>
                  </div>

                  <div className="dashboard-bars">
                    {metricas.map((metrica) => (
                      <div key={metrica.label} className="dashboard-bar-group">
                        <div className="dashboard-bar-group__header">
                          <span>{metrica.label}</span>
                          <strong>
                            {metrica.value} ({metrica.percentage}%)
                          </strong>
                        </div>
                        <div className="dashboard-bar">
                          <div
                            className={`dashboard-bar__fill ${metrica.accentClass}`}
                            style={{ width: `${metrica.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div className="dashboard-secondary-grid">
              <Card>
                <div className="dashboard-trend">
                  <div className="dashboard-trend__header">
                    <div>
                      <p className="dashboard-summary__eyebrow">Actividad reciente</p>
                      <h3>Flujo de solicitudes en los ultimos 7 dias</h3>
                    </div>
                  </div>

                  <AdminTrendChart data={timeline} />

                  <div className="dashboard-kpis">
                    {indicadores.map((indicador) => (
                      <div key={indicador.label} className="dashboard-kpi">
                        <span>{indicador.label}</span>
                        <strong>{indicador.value}</strong>
                        <p>{indicador.hint}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="dashboard-priority">
                  <div>
                    <p className="dashboard-summary__eyebrow">Atencion inmediata</p>
                    <h3>Casos por revisar primero</h3>
                  </div>

                  {prioridades.length === 0 ? (
                    <p className="dashboard-priority__empty">
                      No hay pendientes urgentes en las solicitudes recientes.
                    </p>
                  ) : (
                    <div className="dashboard-priority__list">
                      {prioridades.map((solicitud) => (
                        <button
                          key={solicitud.id}
                          className="dashboard-priority__item"
                          onClick={() => history.push("/admin/solicitudes")}
                        >
                          <div>
                            <strong>{solicitud.nombre}</strong>
                            <p>{solicitud.telefono || "Sin telefono registrado"}</p>
                          </div>
                          <span>Pendiente</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default DashboardAdmin;
