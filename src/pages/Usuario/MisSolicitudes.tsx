import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge
} from "@ionic/react";

const MisSolicitudes: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Mis Solicitudes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Apoyo Alimentario</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            Estado: <IonBadge color="warning">Pendiente</IonBadge>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Apoyo Discapacidad</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            Estado: <IonBadge color="success">Aprobado</IonBadge>
          </IonCardContent>
        </IonCard>

      </IonContent>
    </IonPage>
  );
};

export default MisSolicitudes;