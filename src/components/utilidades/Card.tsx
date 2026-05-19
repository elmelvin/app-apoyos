import "./Card.css";

interface CardProps {
  children: React.ReactNode;
}

const Card = ({ children }: CardProps) => {
  return <div className="app-card">{children}</div>;
};

export default Card;
