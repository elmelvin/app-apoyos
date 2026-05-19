import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";
import {
  documentTextOutline,
  lockClosedOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./InfoUsuario.css";

const AvisoPrivacidad: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent className="info-usuario-page ion-padding">
        <div className="info-usuario-layout">
          <section className="info-usuario-hero">
            <div className="info-usuario-hero__icon">
              <IonIcon icon={shieldCheckmarkOutline} />
            </div>

            <div>
              <p className="info-usuario-hero__eyebrow">Privacidad</p>
              <h1>Aviso de privacidad</h1>
              <p className="info-usuario-hero__text">
                Tu informacion se utiliza unicamente para gestionar solicitudes de
                apoyo y dar seguimiento al proceso.
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
              <p className="info-usuario-card__eyebrow">Uso de datos</p>
              <h2>Como se protege tu informacion</h2>

              <div className="info-usuario-list">
                <div className="info-usuario-item">
                  <div className="info-usuario-item__icon">
                    <IonIcon icon={documentTextOutline} />
                  </div>
                  <div>
                    <strong>Datos para tu solicitud</strong>
                    <span>Se usan para validar identidad, ubicacion y documentos.</span>
                  </div>
                </div>

                <div className="info-usuario-item">
                  <div className="info-usuario-item__icon">
                    <IonIcon icon={lockClosedOutline} />
                  </div>
                  <div>
                    <strong>Acceso controlado</strong>
                    <span>Solo personal autorizado debe consultar esta informacion.</span>
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          <IonCard className="info-usuario-card">
            <IonCardContent>
              <p className="info-usuario-card__eyebrow">Nota</p>
              <h2>Personaliza este contenido</h2>
              <p className="info-usuario-copy">
                Puedes reemplazar este texto por el aviso oficial de privacidad de tu
                institucion cuando lo tengas listo.
              </p>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AvisoPrivacidad;
