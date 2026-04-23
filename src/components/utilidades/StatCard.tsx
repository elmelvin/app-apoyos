import "./StatCard.css";

interface Props {
  title: string;
  value: number;
}

const StatCard = ({ title, value }: Props) => {

  return (
    <div className="stat-card">

      <h4 className="stat-title">{title}</h4>

      <h1 className="stat-value">{value}</h1>

    </div>
  );
};

export default StatCard;
