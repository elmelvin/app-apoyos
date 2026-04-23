interface Props {
  message: string;
}

const EmptyState = ({ message }: Props) => {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;