import { useHistory } from "react-router-dom";
import { DashboardSolicitudReciente } from "../../hooks/useDashboardStats";
import "./SolicitudesRecientes.css";

interface Props {
  solicitudes: DashboardSolicitudReciente[];
}

const SolicitudesRecientes = ({ solicitudes }: Props) => {

  const history = useHistory();

  return (
    <div className="recent-card">

      <h3>Solicitudes recientes</h3>

      {solicitudes.map((s) => (

        <div
          key={s.id}
          className="recent-row"
          onClick={() => history.push("/admin/solicitudes")}
        >
          <strong>{s.nombre}</strong>

          <p>{s.telefono}</p>

          <span className="estado">{s.estado || "pendiente"}</span>

        </div>
      ))}

      <button
        className="ver-todas"
        onClick={() => history.push("/admin/solicitudes")}
      >
        Ver todas las solicitudes
      </button>

    </div>
  );
};

export default SolicitudesRecientes;
