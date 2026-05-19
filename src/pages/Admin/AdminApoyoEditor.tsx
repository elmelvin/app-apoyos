import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from "@ionic/react";
import { arrowBackOutline, saveOutline } from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import InputField from "../../components/form/InputField";
import Card from "../../components/utilidades/Card";
import Loader from "../../components/utilidades/Loader";
import {
  actualizarApoyo,
  crearApoyo,
  getAdminApoyos,
  getMunicipios,
  MunicipioOption,
} from "../../services/apoyosService";
import "./AdminApoyoEditor.css";

type FormState = {
  nombre: string;
  descripcion: string;
  requisitos: string;
  municipio_id: string;
};

const initialForm: FormState = {
  nombre: "",
  descripcion: "",
  requisitos: "",
  municipio_id: "",
};

const AdminApoyoEditor = () => {
  const history = useHistory();
  const { apoyoId } = useParams<{ apoyoId?: string }>();
  const [municipios, setMunicipios] = useState<MunicipioOption[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const editing = Boolean(apoyoId);

  const errores = useMemo(() => {
    const next: Record<string, string> = {};

    if (!form.nombre.trim()) next.nombre = "Escribe el nombre del apoyo.";
    if (!form.descripcion.trim()) next.descripcion = "Agrega una descripcion breve.";
    if (!form.requisitos.trim()) next.requisitos = "Enumera los documentos o requisitos.";

    return next;
  }, [form.descripcion, form.nombre, form.requisitos]);

  const formValido = Object.keys(errores).length === 0;

  useEffect(() => {
    cargarDatos();
    // carga inicial de la vista
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apoyoId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      const municipiosData = await getMunicipios();
      setMunicipios(municipiosData);

      if (!apoyoId) {
        setForm(initialForm);
        return;
      }

      const apoyos = await getAdminApoyos();
      const apoyo = apoyos.find((item) => item.id === apoyoId);

      if (!apoyo) {
        setError("No se encontro el apoyo que intentas editar.");
        return;
      }

      setForm({
        nombre: apoyo.nombre || "",
        descripcion: apoyo.descripcion || "",
        requisitos: apoyo.requisitos || "",
        municipio_id: apoyo.municipio_id || "",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo preparar el formulario del apoyo.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = <K extends keyof FormState>(campo: K, valor: FormState[K]) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  };

  const guardarApoyo = async () => {
    setError("");

    if (!formValido) {
      setError("Completa nombre, descripcion y requisitos antes de guardar.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        requisitos: form.requisitos.trim(),
        municipio_id: form.municipio_id || null,
      };

      if (editing && apoyoId) {
        await actualizarApoyo(apoyoId, payload);
      } else {
        await crearApoyo(payload);
      }

      history.replace("/admin/apoyos", {
        feedback: editing
          ? "Apoyo actualizado correctamente."
          : "Apoyo creado correctamente.",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo guardar el apoyo.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        {loading ? (
          <Loader message={editing ? "Cargando apoyo..." : "Preparando formulario..."} />
        ) : (
          <div className="admin-apoyo-editor-page">
            <AdminHeader
              title={editing ? "Editar apoyo" : "Crear apoyo"}
              subtitle={
                editing
                  ? "Actualiza la informacion del apoyo y su alcance para el portal ciudadano."
                  : "Registra un nuevo apoyo con sus requisitos y el municipio donde estara disponible."
              }
            />

            <Card>
              <div className="admin-apoyo-editor">
                <div className="admin-apoyo-editor__intro">
                  <p className="admin-apoyo-editor__eyebrow">
                    {editing ? "Edicion guiada" : "Nuevo registro"}
                  </p>
                  <h3>
                    {editing ? "Actualiza los datos del apoyo" : "Completa los datos del nuevo apoyo"}
                  </h3>
                  <p>
                    Si dejas el municipio en general, el apoyo se mostrara para todos los usuarios.
                  </p>
                </div>

                <InputField
                  label="Nombre del apoyo"
                  value={form.nombre}
                  onChange={(value) => handleChange("nombre", value)}
                  helperText="Ejemplo: Apoyo para lentes o silla de ruedas."
                  error={errores.nombre}
                />

                <div className="form-field">
                  <IonItem className={errores.descripcion ? "field-error" : ""}>
                    <IonLabel position="stacked">Descripcion</IonLabel>
                    <IonTextarea
                      value={form.descripcion}
                      autoGrow
                      rows={4}
                      onIonChange={(e) => handleChange("descripcion", e.detail.value || "")}
                    />
                  </IonItem>
                  {errores.descripcion ? (
                    <p className="field-error-text">{errores.descripcion}</p>
                  ) : null}
                </div>

                <div className="form-field">
                  <IonItem>
                    <IonLabel>Municipio</IonLabel>
                    <IonSelect
                      interface="popover"
                      value={form.municipio_id}
                      placeholder="Selecciona municipio"
                      onIonChange={(e) => handleChange("municipio_id", e.detail.value || "")}
                    >
                      <IonSelectOption value="">General para todos</IonSelectOption>
                      {municipios.map((municipio) => (
                        <IonSelectOption key={municipio.id} value={municipio.id}>
                          {municipio.nombre}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </div>

                <div className="form-field">
                  <IonItem className={errores.requisitos ? "field-error" : ""}>
                    <IonLabel position="stacked">Requisitos</IonLabel>
                    <IonTextarea
                      value={form.requisitos}
                      autoGrow
                      rows={5}
                      placeholder={"INE\nCURP\nComprobante de domicilio"}
                      onIonChange={(e) => handleChange("requisitos", e.detail.value || "")}
                    />
                  </IonItem>
                  <p className="field-helper">
                    Escribe un requisito por linea para mostrarlo claro en el portal.
                  </p>
                  {errores.requisitos ? (
                    <p className="field-error-text">{errores.requisitos}</p>
                  ) : null}
                </div>

                <p className="admin-apoyo-editor__scope">
                  Alcance actual:{" "}
                  <strong>
                    {form.municipio_id
                      ? municipios.find((municipio) => municipio.id === form.municipio_id)
                          ?.nombre || "Municipio seleccionado"
                      : "General para todos"}
                  </strong>
                </p>

                {error ? <p className="form-warning">{error}</p> : null}

                <div className="admin-apoyo-editor__actions">
                  <IonButton fill="clear" color="medium" onClick={() => history.push("/admin/apoyos")}>
                    <IonIcon icon={arrowBackOutline} slot="start" />
                    Volver a apoyos
                  </IonButton>
                  <IonButton onClick={guardarApoyo} disabled={saving || !formValido}>
                    <IonIcon icon={saveOutline} slot="start" />
                    {saving
                      ? editing
                        ? "Actualizando..."
                        : "Guardando..."
                      : editing
                      ? "Actualizar apoyo"
                      : "Guardar apoyo"}
                  </IonButton>
                </div>
              </div>
            </Card>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AdminApoyoEditor;
