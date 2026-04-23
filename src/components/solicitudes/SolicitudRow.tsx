interface Props {
  solicitud: any;
  onClick: () => void;
}

const SolicitudRow = ({ solicitud, onClick }: Props) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px",
        borderBottom: "1px solid #ddd",
        cursor: "pointer"
      }}
    >
      <strong>{solicitud.nombre}</strong>

      <p>{solicitud.telefono}</p>

      <p>Estado: {solicitud.estado}</p>
    </div>
  );
};

export default SolicitudRow;