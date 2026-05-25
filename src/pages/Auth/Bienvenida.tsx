import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";
import {
  accessibilityOutline,
  documentTextOutline,
  heartOutline,
  medkitOutline,
  peopleOutline,
  personAddOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./Bienvenida.css";

const tiposApoyo = [
  {
    icon: heartOutline,
    title: "Alimentacion",
    text: "Orientacion para solicitar despensas u otros apoyos basicos disponibles.",
  },
  {
    icon: medkitOutline,
    title: "Salud",
    text: "Registro de solicitudes relacionadas con necesidades medicas o tratamientos.",
  },
  {
    icon: accessibilityOutline,
    title: "Movilidad",
    text: "Apoyos como bastones, sillas de ruedas, andaderas u otros auxiliares.",
  },
];

const pasos = [
  "Crea tu cuenta o inicia sesion.",
  "Elige el apoyo que necesitas.",
  "Sube tus documentos y revisa tu solicitud.",
];

const Bienvenida: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent fullscreen className="bienvenida-content">
        <main className="bienvenida-page">
          <section className="bienvenida-hero">
            <div className="bienvenida-hero__content">
              <img src="/Logodiff.png" alt="Logo DIF" className="bienvenida-logo" />
              <p className="bienvenida-kicker">Sistema DIF Municipal</p>
              <h1>Solicitud de apoyos en linea</h1>
              <p className="bienvenida-copy">
                Consulta los apoyos disponibles, registra tu solicitud y da seguimiento
                desde tu telefono de una forma clara y sencilla.
              </p>

              <div className="bienvenida-actions" aria-label="Accesos principales">
                <IonButton
                  className="bienvenida-primary"
                  size="large"
                  onClick={() => history.push("/login")}
                >
                  <IonIcon icon={shieldCheckmarkOutline} slot="start" />
                  Iniciar sesion
                </IonButton>
                <IonButton
                  className="bienvenida-secondary"
                  fill="outline"
                  size="large"
                  onClick={() => history.push("/register")}
                >
                  <IonIcon icon={personAddOutline} slot="start" />
                  Crear cuenta
                </IonButton>
              </div>
            </div>
          </section>

          <section className="bienvenida-section">
            <div className="bienvenida-section__heading">
              <IonIcon icon={peopleOutline} />
              <div>
                <p>Para la comunidad</p>
                <h2>Que puedes hacer en la app</h2>
              </div>
            </div>

            <div className="bienvenida-benefits">
              <div>
                <strong>Solicitudes guiadas</strong>
                <span>La app te acompaña paso a paso para capturar tus datos.</span>
              </div>
              <div>
                <strong>Documentos organizados</strong>
                <span>Te muestra que archivos necesitas para cada apoyo.</span>
              </div>
              <div>
                <strong>Seguimiento</strong>
                <span>Podras revisar el estado de tus solicitudes desde tu perfil.</span>
              </div>
            </div>
          </section>

          <section className="bienvenida-section">
            <div className="bienvenida-section__heading">
              <IonIcon icon={documentTextOutline} />
              <div>
                <p>Apoyos disponibles</p>
                <h2>Tipos de ayuda que puedes encontrar</h2>
              </div>
            </div>

            <div className="bienvenida-support-grid">
              {tiposApoyo.map((apoyo) => (
                <article className="bienvenida-support" key={apoyo.title}>
                  <IonIcon icon={apoyo.icon} />
                  <h3>{apoyo.title}</h3>
                  <p>{apoyo.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="bienvenida-steps">
            <h2>Como empezar</h2>
            <ol>
              {pasos.map((paso) => (
                <li key={paso}>{paso}</li>
              ))}
            </ol>
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Bienvenida;
