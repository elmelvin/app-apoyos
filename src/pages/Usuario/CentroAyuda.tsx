import {
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
import "./InfoUsuario.css";

const CentroAyuda: React.FC = () => {
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
                Aquí encontrarás canales de contacto y orientación básica para el
                proceso de apoyos.
              </p>
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
                    <span>Eso ayuda a revisar más rápido tu solicitud.</span>
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
                    <span>Acércate al DIF municipal o agrega aquí tu número oficial.</span>
                  </div>
                </div>

                <div className="info-usuario-item">
                  <div className="info-usuario-item__icon">
                    <IonIcon icon={mailOutline} />
                  </div>
                  <div>
                    <strong>Correo</strong>
                    <span>Agrega aquí el correo institucional de atención ciudadana.</span>
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
