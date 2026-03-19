import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from "@ionic/react";

const DashboardAdmin: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="success">
          <IonTitle>Panel Administrador</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Bienvenido Administrador</h2>
        <p>Aquí podrás gestionar solicitudes y apoyos.</p>
      </IonContent>
    </IonPage>
  );
};

export default DashboardAdmin;

