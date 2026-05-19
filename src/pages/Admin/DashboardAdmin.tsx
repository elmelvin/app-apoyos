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
    solicitudes,
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
    const solicitudesSemana = timeline.reduce((acc, punto) => acc + punto.total, 0);

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
      {
        label: "Semana",
        value: `${solicitudesSemana}`,
        hint: "Solicitudes en los ultimos 7 dias",
      },
    ];
  }, [aprobados, rechazados, timeline, total]);

  const analitica = useMemo(() => {
    const pendientesLista = solicitudes.filter(
      (solicitud) => (solicitud.estado || "pendiente") === "pendiente"
    );
    const resueltas = aprobados + rechazados;
    const promedioPendiente = pendientesLista.length
      ? Math.round(
          pendientesLista.reduce(
            (acc, solicitud) => acc + diasDesde(solicitud.created_at),
            0
          ) / pendientesLista.length
        )
      : 0;

    return {
      resueltas,
      promedioPendiente,
      topApoyos: obtenerTop(
        solicitudes.map((solicitud) => solicitud.apoyo_nombre || "Sin apoyo especificado")
      ),
      topMunicipios: obtenerTop(
        solicitudes.map((solicitud) => solicitud.municipio || "Sin municipio")
      ),
      pendientesCriticos: [...pendientesLista]
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        .slice(0, 5),
    };
  }, [aprobados, rechazados, solicitudes]);

  return (
    <IonPage>
      <IonContent className="ion-padding">
        {loading ? (
          <Loader message="Cargando dashboard..." />
        ) : (
          <div className="admin-dashboard">
            <AdminHeader
              title="Dashboard"
              subtitle="Supervisa el flujo de solicitudes y las revisiones pendientes."
            />

            <div className="stats-grid">
              <StatCard title="Total solicitudes" value={total} />
              <StatCard title="Pendientes" value={pendientes} />
              <StatCard title="Aprobados" value={aprobados} />
              <StatCard title="Rechazados" value={rechazados} />
            </div>

            <div className="dashboard-panels">
              <Card>
                <div className="dashboard-command">
                  <div>
                    <p className="dashboard-summary__eyebrow">Resumen general</p>
                    <h3>Estado operativo</h3>
                    <p className="dashboard-summary__text">
                      {pendientes > 0
                        ? `Hay ${pendientes} solicitudes esperando revisión.`
                        : "No hay solicitudes pendientes en este momento."}
                    </p>
                  </div>

                  <div className="dashboard-command__metrics">
                    <div>
                      <span>Resueltas</span>
                      <strong>{analitica.resueltas}</strong>
                    </div>
                    <div>
                      <span>Espera promedio</span>
                      <strong>{analitica.promedioPendiente} dias</strong>
                    </div>
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
                    <p className="dashboard-summary__eyebrow">Pendientes criticos</p>
                    <h3>Mas tiempo en espera</h3>
                  </div>

                  {analitica.pendientesCriticos.length === 0 ? (
                    <p className="dashboard-priority__empty">
                      No hay pendientes urgentes en las solicitudes recientes.
                    </p>
                  ) : (
                    <div className="dashboard-priority__list">
                      {analitica.pendientesCriticos.map((solicitud) => (
                        <button
                          key={solicitud.id}
                          className="dashboard-priority__item"
                          onClick={() => history.push("/admin/solicitudes")}
                        >
                          <div>
                            <strong>{solicitud.nombre}</strong>
                            <p>{solicitud.apoyo_nombre || "Apoyo no especificado"}</p>
                          </div>
                          <span>{diasDesde(solicitud.created_at)} dias</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="dashboard-insights-grid">
              <Card>
                <DashboardRanking
                  eyebrow="Demanda"
                  title="Apoyos mas solicitados"
                  items={analitica.topApoyos}
                />
              </Card>

              <Card>
                <DashboardRanking
                  eyebrow="Territorio"
                  title="Municipios con mas registros"
                  items={analitica.topMunicipios}
                />
              </Card>
            </div>

          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default DashboardAdmin;

type RankingItem = {
  label: string;
  count: number;
  percentage: number;
};

const DashboardRanking = ({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: RankingItem[];
}) => (
  <div className="dashboard-ranking">
    <div>
      <p className="dashboard-summary__eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
    </div>

    {items.length === 0 ? (
      <p className="dashboard-priority__empty">Aun no hay datos suficientes.</p>
    ) : (
      <div className="dashboard-ranking__list">
        {items.map((item) => (
          <div key={item.label} className="dashboard-ranking__item">
            <div className="dashboard-ranking__row">
              <strong>{item.label}</strong>
              <span>{item.count}</span>
            </div>
            <div className="dashboard-ranking__bar">
              <div style={{ width: `${item.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const obtenerTop = (valores: string[]): RankingItem[] => {
  const conteo = valores.reduce<Record<string, number>>((acc, valor) => {
    acc[valor] = (acc[valor] || 0) + 1;
    return acc;
  }, {});
  const maximo = Math.max(...Object.values(conteo), 0);

  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({
      label,
      count,
      percentage: maximo ? Math.round((count / maximo) * 100) : 0,
    }));
};

const diasDesde = (fecha: string) => {
  const inicio = new Date(fecha).getTime();

  if (Number.isNaN(inicio)) {
    return 0;
  }

  const diferencia = Date.now() - inicio;
  return Math.max(0, Math.floor(diferencia / 86400000));
};
