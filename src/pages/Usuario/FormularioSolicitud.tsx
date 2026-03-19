import {
  IonPage,
  IonIcon,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonTextarea,
  IonProgressBar
} from "@ionic/react";


import { supabase } from "../../services/supabaseClient";

import "./FormularioSolicitud.css";
import { useState } from "react";

const FormularioSolicitud: React.FC = () => {

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [ine, setIne] = useState<File | null>(null);
  const [curp, setCurp] = useState<File | null>(null);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [foto, setFoto] = useState<File | null>(null);

  const [paso, setPaso] = useState(1);

  const progreso = paso / 4;


  // =============================
  // Subir archivo a Supabase
  // =============================

  const subirArchivo = async (file: File, carpeta: string) => {

  const nombreArchivo = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("documentos")
    .upload(`${carpeta}/${nombreArchivo}`, file);

  if (error) {
    console.log(error);
    return null;
  }

  const { data } = supabase.storage
    .from("documentos")
    .getPublicUrl(`${carpeta}/${nombreArchivo}`);

  return data.publicUrl;
};

  // =============================
  // ENVIAR SOLICITUD
  // =============================

  const enviarSolicitud = async () => {

    try {

      if (!ine || !curp || !comprobante || !foto) {
        alert("Debes subir todos los documentos");
        return;
      }

      alert("Creando solicitud...");

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Usuario no autenticado");
        return;
      }

      // Crear solicitud

      const { data: solicitud, error } = await supabase
        .from("solicitudes")
        .insert({
          usuario_id: user.id,
          nombre,
          telefono,
          direccion,
          mensaje
        })
        .select()
        .single();

          if (error) {
          console.log("ERROR REAL:", error);
          alert(error.message);
          return;
        }

      const [loading, setLoading] = useState(false);

     
      // Subir archivos

    const ine_url = await subirArchivo(ine!, "ine");
    const curp_url = await subirArchivo(curp!, "curp");
    const comprobante_url = await subirArchivo(comprobante!, "comprobante");
    const foto_url = await subirArchivo(foto!, "foto");

      // Guardar documentos

      await supabase.from("documentos").insert([
        {
          solicitud_id: solicitud.id,
          url: ine_url,
          tipo_documento: "ine"
        },
        {
          solicitud_id: solicitud.id,
          url: curp_url,
          tipo_documento: "curp"
        },
        {
          solicitud_id: solicitud.id,
          url: comprobante_url,
          tipo_documento: "comprobante"
        },
        {
          solicitud_id: solicitud.id,
          url: foto_url,
          tipo_documento: "foto"
        }
      ]);

      alert("Solicitud enviada correctamente");

      // Reiniciar formulario

      setPaso(1);
      setNombre("");
      setTelefono("");
      setDireccion("");
      setMensaje("");
      setIne(null);
      setCurp(null);
      setComprobante(null);
      setFoto(null);

    } catch (error) {

      console.log(error);
      alert("Error al enviar solicitud");

    }
  };

  // =============================
  // VALIDACIONES
  // =============================
  const validarPDF = (file: File) => {
  if (!file) return false;

  // Validar tipo MIME
  if (file.type !== "application/pdf") {
    alert("Solo se permiten archivos PDF");
    return false;
  }

  // Validar tamaño (ej: máximo 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("El archivo es demasiado grande (máx 5MB)");
    return false;
  }

  return true;
};

  const validarPaso1 = () => {
    if (!nombre || !telefono || !direccion) {
      alert("Completa todos los campos");
      return;
    }
    setPaso(2);
  };

  const validarPaso2 = () => {
    if (!mensaje) {
      alert("Debes explicar tu situación.");
      return;
    }
    setPaso(3);
  };

  const validarPaso3 = () => {
    if (!ine || !curp || !comprobante || !foto) {
  alert("Debes subir todos los documentos");
  return;
}

if (
  !validarPDF(ine) ||
  !validarPDF(curp) ||
  !validarPDF(comprobante) ||
  !validarPDF(foto)
    ) {
  return;  
   }
    setPaso(4);
  };




return(
<IonPage>

<IonHeader>
<IonToolbar color="primary">
<IonTitle>Solicitud de Apoyo</IonTitle>
</IonToolbar>
</IonHeader>

<IonContent className="ion-padding">

<h4>Progreso de solicitud</h4>
<IonProgressBar value={progreso}></IonProgressBar>

<p className="pasos-texto">
Paso {paso} de 4
</p>

{/* PASO 1 */}

{paso === 1 && (

<>

<h3>Datos personales</h3>

<IonItem>
<IonLabel position="floating">Nombre completo *</IonLabel>
<IonInput value={nombre} onIonChange={(e)=>setNombre(e.detail.value!)} />
</IonItem>

<IonItem>
<IonLabel position="floating">Teléfono *</IonLabel>
<IonInput value={telefono} onIonChange={(e)=>setTelefono(e.detail.value!)} />
</IonItem>

<IonItem>
<IonLabel position="floating">Dirección *</IonLabel>
<IonInput value={direccion} onIonChange={(e)=>setDireccion(e.detail.value!)} />
</IonItem>

<IonButton expand="block" onClick={validarPaso1}>
Siguiente
</IonButton>

</>

)}

{/* PASO 2 */}

{paso === 2 && (

<>

<h3>Situación</h3>

<IonItem>
<IonLabel position="floating">Explica tu situación *</IonLabel>
<IonTextarea value={mensaje} onIonChange={(e)=>setMensaje(e.detail.value!)} />
</IonItem>

<IonButton expand="block" onClick={()=>setPaso(1)}>
Atrás
</IonButton>

<IonButton expand="block" onClick={validarPaso2}>
Siguiente
</IonButton>

</>

)}

{/* PASO 3 */}

{paso === 3 && (

<>

<h3>Subir documentos</h3>

<div className="doc-card">
  <p>INE (PDF) *</p>

  <label className="upload-box">
    <input
      type="file"
      accept="application/pdf"
      onChange={(e) => setIne(e.target.files?.[0] || null)}
      hidden
    />
    <div className="upload-content">
      <span>📄</span>
      <p>Seleccionar archivo</p>
    </div>
  </label>

  {ine && <p className="file-name">✔ {ine.name}</p>}
</div>

<div className="doc-card">
  <p>CURP (PDF) *</p>

  <label className="upload-box">
    <input
      type="file"
      accept="application/pdf"
      onChange={(e) => setCurp(e.target.files?.[0] || null)}
      hidden
    />
    <div className="upload-content">
      <span>📄</span>
      <p>Seleccionar archivo</p>
    </div>
  </label>

  {curp && <p className="file-name">✔ {curp.name}</p>}
</div>

<div className="doc-card">
  <p>Comprobante de domicilio (PDF) *</p>

  <label className="upload-box">
    <input
      type="file"
      accept="application/pdf"
      onChange={(e) => setComprobante(e.target.files?.[0] || null)}
      hidden
    />
    <div className="upload-content">
      <span>📄</span>
      <p>Seleccionar archivo</p>
    </div>
  </label>

  {comprobante && <p className="file-name">✔ {comprobante.name}</p>}
</div>

<div className="doc-card">
  <p>Foto del solicitante (PDF) *</p>

  <label className="upload-box">
    <input
      type="file"
      accept="application/pdf"
      onChange={(e) => setFoto(e.target.files?.[0] || null)}
      hidden
    />
    <div className="upload-content">
      <span>📄</span>
      <p>Seleccionar archivo</p>
    </div>
  </label>

  {foto && <p className="file-name">✔ {foto.name}</p>}
</div>

{/* repetir igual para curp, comprobante y foto */}

<IonButton expand="block" onClick={()=>setPaso(2)}>
Atrás
</IonButton>

<IonButton expand="block" onClick={validarPaso3}>
Siguiente
</IonButton>

</>

)}

{/* PASO 4 */}

{paso === 4 && (

<>

<h3>Confirmar solicitud</h3>

<p>Verifica que todos los datos sean correctos antes de enviar.</p>

<IonButton expand="block" onClick={()=>setPaso(3)}>
Atrás
</IonButton>

<IonButton expand="block" color="success" onClick={enviarSolicitud}>
Enviar solicitud
</IonButton>

</>

)}

</IonContent>

</IonPage>
);
  
};


export default FormularioSolicitud;