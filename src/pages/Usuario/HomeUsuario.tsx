import {
IonPage,
IonContent,
IonHeader,
IonToolbar,
IonTitle,
IonGrid,
IonRow,
IonCol,
IonCard,
IonCardHeader,
IonCardTitle,
IonCardContent,
IonIcon,
IonButton,
IonItem,
IonLabel,
IonSelect,
IonSelectOption
} from "@ionic/react";

import {
personCircle,
documentText,
helpCircle
} from "ionicons/icons";

import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

import "./HomeUsuario.css";

interface Municipio {
id: string;
nombre: string;
}

interface Comunidad {
id: string;
nombre: string;
municipio_id: string;
tipo: string;
}

interface Perfil {
user_id: string;
municipio_id: string;
comunidad_id: string;
}

const HomeUsuario: React.FC = () => {

const history = useHistory();

const [usuario,setUsuario] = useState<any>(null);

const [municipios,setMunicipios] = useState<Municipio[]>([]);
const [tipos,setTipos] = useState<string[]>([]);
const [comunidades,setComunidades] = useState<Comunidad[]>([]);

const [municipioId,setMunicipioId] = useState<string>("");
const [tipo,setTipo] = useState<string>("");
const [comunidadId,setComunidadId] = useState<string>("");

const [perfilCompleto,setPerfilCompleto] = useState<boolean>(false);

useEffect(()=>{
iniciar();
},[]);

const iniciar = async () => {


const { data:{ user } } = await supabase.auth.getUser();

if(!user) return;

setUsuario(user);

verificarPerfil(user.id);

cargarMunicipios();


};

const verificarPerfil = async (userId:string) => {


const { data, error } = await supabase
.from("perfiles")
.select("*")
.eq("user_id", userId)
.maybeSingle();

if(data){
  setMunicipioId(data.municipio_id || "");
  setComunidadId(data.comunidad_id || "");

  if(data.municipio_id && data.comunidad_id){
    setPerfilCompleto(true);
  }
}

};

const cargarMunicipios = async () => {


const { data,error } = await supabase
  .from("municipios")
  .select("*");

if(error){
  console.log(error);
  return;
}

setMunicipios(data as Municipio[]);


};

const cargarTipos = async (municipio_id:string) => {


const { data } = await supabase
  .from("comunidades")
  .select("tipo")
  .eq("municipio_id", municipio_id);

const tiposUnicos = [...new Set(data?.map((c:any)=>c.tipo))];

setTipos(tiposUnicos as string[]);


};

const cargarComunidades = async (municipio_id:string,tipo:string) => {


const { data } = await supabase
  .from("comunidades")
  .select("*")
  .eq("municipio_id", municipio_id)
  .eq("tipo", tipo);

setComunidades(data as Comunidad[]);


};

const guardarPerfil = async () => {

  if(!municipioId || !comunidadId){
    alert("Debes seleccionar municipio y comunidad");
    return;
  }

  const { error } = await supabase
    .from("perfiles")
    .update({
      municipio_id: municipioId,
      comunidad_id: comunidadId
    })
    .eq("user_id", usuario.id); // 🔥 CLAVE

  if(error){
    console.log(error);
    alert("Error guardando perfil");
    return;
  }

  setPerfilCompleto(true);
};

return (
   <IonPage>
  <IonHeader>
    <IonToolbar color="primary">
      <IonTitle>Portal de Apoyos</IonTitle>
    </IonToolbar>
  </IonHeader>

  <IonContent fullscreen className="home-bg">

    <div className="perfil-box">
      <IonIcon icon={personCircle} className="perfil-icon"/>
      <h2>Bienvenido</h2>
      <p>Solicita y consulta tus apoyos</p>
    </div>

    {!perfilCompleto && (

      <IonCard>

        <IonCardHeader>
          <IonCardTitle>Selecciona tu ubicación</IonCardTitle>
        </IonCardHeader>

        <IonCardContent>

          <IonItem>
            <IonLabel>Municipio</IonLabel>

            <IonSelect
              placeholder="Selecciona municipio"
              value={municipioId}
              onIonChange={(e)=>{
                const id = e.detail.value;
                setMunicipioId(id);
                setTipo("");
                setComunidadId("");
                cargarTipos(id);
              }}
            >

              {municipios.map((m)=>(
                <IonSelectOption key={m.id} value={m.id}>
                  {m.nombre}
                </IonSelectOption>
              ))}

            </IonSelect>

          </IonItem>

          {tipos.length > 0 && (

          <IonItem>

            <IonLabel>Tipo de localidad</IonLabel>

            <IonSelect
              placeholder="Selecciona tipo"
              value={tipo}
              onIonChange={(e)=>{
                const tipoSeleccionado = e.detail.value;
                setTipo(tipoSeleccionado);
                setComunidadId("");
                cargarComunidades(municipioId,tipoSeleccionado);
              }}
            >

              {tipos.map((t)=>(
                <IonSelectOption key={t} value={t}>
                  {t}
                </IonSelectOption>
              ))}

            </IonSelect>

          </IonItem>

          )}

          {comunidades.length > 0 && (

          <IonItem>

            <IonLabel>Comunidad</IonLabel>

            <IonSelect
              placeholder="Selecciona comunidad"
              value={comunidadId}
              onIonChange={(e)=>setComunidadId(e.detail.value)}
            >

              {comunidades.map((c)=>(
                <IonSelectOption key={c.id} value={c.id}>
                  {c.nombre}
                </IonSelectOption>
              ))}

            </IonSelect>

          </IonItem>

          )}

          <IonButton expand="block" onClick={guardarPerfil}>
            Guardar ubicación
          </IonButton>

        </IonCardContent>

      </IonCard>

    )}

    {perfilCompleto && (

    <IonGrid>
      <IonRow>

        <IonCol size="12">
          <IonCard className="card-pro apoyo">

            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={documentText}/> Lista de apoyos
              </IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              Realiza una nueva solicitud de apoyo social.

              <IonButton
                expand="block"
                onClick={() => history.push("/usuario/apoyos")}
              >
                SOLICITAR
              </IonButton>

            </IonCardContent>

          </IonCard>
        </IonCol>

        <IonCol size="12">
          <IonCard className="card-pro solicitudes">

            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={helpCircle}/> Mis Solicitudes
              </IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              Consulta el estado de tus solicitudes.

              <IonButton
                expand="block"
                onClick={() => history.push("/usuario/mis-solicitudes")}
              >
                Ver solicitudes
              </IonButton>

            </IonCardContent>

          </IonCard>
        </IonCol>

      </IonRow>
    </IonGrid>

    )}

  </IonContent>
</IonPage>


);
};

export default HomeUsuario;
