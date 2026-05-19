import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";
import {
  callOutline,
  chatbubblesOutline,
  documentTextOutline,
  helpBuoyOutline,
  mailOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./InfoUsuario.css";

const CentroAyuda: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent className="info-usuario-page ion-padding">
        <div className="info-usuario-layout">
          <section className="info-usuario-hero">
            <div className="info-usuario-hero__icon">
              <IonIcon icon={helpBuoyOutline} />
            </div>

            <div>
              <p className="info-usuario-hero__eyebrow">Centro de ayuda</p>
              <h1>Estamos para orientarte</h1>
              <p className="info-usuario-hero__text">
                Aqui encontraras canales de contacto y orientacion basica para el
                proceso de apoyos.
              </p>
            </div>

            <div className="info-usuario-hero__actions">
              <IonButton
                fill="outline"
                color="light"
                onClick={() => history.push("/usuario/perfil")}
              >
                Regresar al perfil
              </IonButton>
            </div>
          </section>

          <IonCard className="info-usuario-card">
            <IonCardContent>
              <p className="info-usuario-card__eyebrow">Preguntas comunes</p>
              <h2>Antes de pedir ayuda</h2>

              <div className="info-usuario-list">
                <div className="info-usuario-item">
                  <div className="info-usuario-item__icon">
                    <IonIcon icon={documentTextOutline} />
                  </div>
                  <div>
                    <strong>Ten tus documentos listos</strong>
                    <span>INE, CURP, comprobante y foto clara si aplica.</span>
                  </div>
                </div>

                <div className="info-usuario-item">
                  <div className="info-usuario-item__icon">
                    <IonIcon icon={chatbubblesOutline} />
                  </div>
                  <div>
                    <strong>Describe tu necesidad con claridad</strong>
                    <span>Eso ayuda a revisar mas rapido tu solicitud.</span>
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          <IonCard className="info-usuario-card">
            <IonCardContent>
              <p className="info-usuario-card__eyebrow">Contacto</p>
              <h2>Canales de atencion</h2>

              <div className="info-usuario-list">
                <div className="info-usuario-item">
                  <div className="info-usuario-item__icon">
                    <IonIcon icon={callOutline} />
                  </div>
                  <div>
                    <strong>Telefono</strong>
                    <span>Acercate al DIF municipal o agrega aqui tu numero oficial.</span>
                  </div>
                </div>

                <div className="info-usuario-item">
                  <div className="info-usuario-item__icon">
                    <IonIcon icon={mailOutline} />
                  </div>
                  <div>
                    <strong>Correo</strong>
                    <span>Agrega aqui el correo institucional de atencion ciudadana.</span>
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CentroAyuda;
