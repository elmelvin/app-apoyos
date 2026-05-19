import { IonButton, IonIcon } from "@ionic/react";
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  closeOutline,
  informationCircleOutline,
  warningOutline,
} from "ionicons/icons";
import { useEffect } from "react";
import "./AppFeedback.css";

export type AppFeedbackType = "success" | "error" | "warning" | "info";

export type AppFeedbackState = {
  type: AppFeedbackType;
  title: string;
  message: string;
};

type AppFeedbackProps = {
  feedback: AppFeedbackState | null;
  onClose: () => void;
  duration?: number;
};

const iconByType = {
  success: checkmarkCircleOutline,
  error: alertCircleOutline,
  warning: warningOutline,
  info: informationCircleOutline,
};

const AppFeedback = ({ feedback, onClose, duration = 4200 }: AppFeedbackProps) => {
  useEffect(() => {
    if (!feedback || duration <= 0) return;

    const timeout = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timeout);
  }, [duration, feedback, onClose]);

  if (!feedback) return null;

  return (
    <div className={`app-feedback app-feedback--${feedback.type}`} role="status">
      <div className="app-feedback__icon">
        <IonIcon icon={iconByType[feedback.type]} />
      </div>

      <div className="app-feedback__content">
        <strong>{feedback.title}</strong>
        <p>{feedback.message}</p>
      </div>

      <IonButton
        fill="clear"
        className="app-feedback__close"
        onClick={onClose}
        aria-label="Cerrar aviso"
      >
        <IonIcon icon={closeOutline} />
      </IonButton>
    </div>
  );
};

export default AppFeedback;
