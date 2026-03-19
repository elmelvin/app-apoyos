import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton
} from "@ionic/react";

import {
  accessibility,
  medical,
  heart,
  walk
} from "ionicons/icons";

import { useHistory } from "react-router-dom";

import "./ListaApoyos.css";

const ListaApoyos: React.FC = () => {

  const history = useHistory();

  const apoyos = [
    {
      id: 1,
      nombre: "Silla de ruedas",
      descripcion: "Apoyo para personas con dificultad de movilidad.",
      icono: walk
    },
    {
      id: 2,
      nombre: "Muletas",
      descripcion: "Apoyo temporal para movilidad.",
      icono: accessibility
    },
    {
      id: 3,
      nombre: "Bastón",
      descripcion: "Apoyo para adultos mayores.",
      icono: medical
    },
    {
      id: 4,
      nombre: "Apoyo médico",
      descripcion: "Apoyo para tratamientos médicos.",
      icono: heart
    }
  ];

  const solicitarApoyo = (id: number) => {
    history.push(`/usuario/solicitud/${id}`);
  };

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Apoyos disponibles</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="apoyos-bg">

        <IonGrid>

          <IonRow>

            {apoyos.map((apoyo) => (

              <IonCol size="12" key={apoyo.id}>

                <IonCard className="card-apoyo">

                  <IonCardHeader>

                    <IonCardTitle className="titulo-apoyo">

                      <IonIcon
                        icon={apoyo.icono}
                        className="icono-apoyo"
                      />

                      {apoyo.nombre}

                    </IonCardTitle>

                  </IonCardHeader>

                  <IonCardContent>

                    <p>{apoyo.descripcion}</p>

                  <IonButton
                    expand="block"
                    onClick={() => history.push("/usuario/formulario-Solicitud")}
                    >
                    Solicitar
                    </IonButton>

                  </IonCardContent>

                </IonCard>

              </IonCol>

            ))}

          </IonRow>

        </IonGrid>

      </IonContent>

    </IonPage>
  );
};

export default ListaApoyos;