import {
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonToggle,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { createOutline, trashOutline } from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import Card from "../../components/utilidades/Card";
import EmptyState from "../../components/utilidades/EmptyState";
import Loader from "../../components/utilidades/Loader";
import StatCard from "../../components/utilidades/StatCard";
import InputField from "../../components/form/InputField";
import {
  Apoyo,
  actualizarApoyo,
  cambiarEstadoApoyo,
  crearApoyo,
  eliminarApoyo,
  getAdminApoyos,
  getMunicipios,
  MunicipioOption,
} from "../../services/apoyosService";
import "./AdminApoyos.css";

type AdminApoyo = Apoyo & {
  municipio_nombre?: string | null;
};

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

const AdminApoyos = () => {
  const [apoyos, setApoyos] = useState<AdminApoyo[]>([]);
  const [municipios, setMunicipios] = useState<MunicipioOption[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const errores = useMemo(() => {
    const next: Record<string, string> = {};

    if (!form.nombre.trim()) {
      next.nombre = "Escribe el nombre del apoyo.";
    }

    if (!form.descripcion.trim()) {
      next.descripcion = "Agrega una descripcion breve.";
    }

    if (!form.requisitos.trim()) {
      next.requisitos = "Enumera los documentos o requisitos.";
    }

    return next;
  }, [form.descripcion, form.nombre, form.requisitos]);

  const formValido = Object.keys(errores).length === 0;

  const resumen = useMemo(() => {
    const total = apoyos.length;
    const generales = apoyos.filter((apoyo) => !apoyo.municipio_id).length;
    const municipales = total - generales;
    const activos = apoyos.filter((apoyo) => apoyo.activo !== false).length;

    return { total, generales, municipales, activos };
  }, [apoyos]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      const [apoyosData, municipiosData] = await Promise.all([
        getAdminApoyos(),
        getMunicipios(),
      ]);

      setApoyos(apoyosData);
      setMunicipios(municipiosData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudieron cargar los apoyos.";
      setError(message);
      setApoyos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useIonViewWillEnter(() => {
    cargarDatos();
  });

  const handleChange = <K extends keyof FormState>(campo: K, valor: FormState[K]) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  };

  const guardarApoyo = async () => {
    setFeedback("");
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

      if (editingId) {
        await actualizarApoyo(editingId, payload);
      } else {
        await crearApoyo(payload);
      }

      setForm(initialForm);
      setEditingId(null);
      setFeedback(
        editingId ? "Apoyo actualizado correctamente." : "Apoyo guardado correctamente."
      );
      await cargarDatos();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo guardar el apoyo.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const editarApoyo = (apoyo: AdminApoyo) => {
    setFeedback("");
    setError("");
    setEditingId(apoyo.id);
    setForm({
      nombre: apoyo.nombre || "",
      descripcion: apoyo.descripcion || "",
      requisitos: apoyo.requisitos || "",
      municipio_id: apoyo.municipio_id || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setForm(initialForm);
    setFeedback("");
    setError("");
  };

  const borrarApoyo = async (apoyo: AdminApoyo) => {
    const confirmado = window.confirm(
      `Se eliminara el apoyo "${apoyo.nombre}". Esta accion no se puede deshacer.`
    );

    if (!confirmado) return;

    try {
      setDeletingId(apoyo.id);
      setFeedback("");
      setError("");
      await eliminarApoyo(apoyo.id);
      setFeedback("Apoyo eliminado correctamente.");

      if (editingId === apoyo.id) {
        cancelarEdicion();
      }

      await cargarDatos();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo eliminar el apoyo.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleEstadoApoyo = async (apoyo: AdminApoyo, activo: boolean) => {
    try {
      setTogglingId(apoyo.id);
      setFeedback("");
      setError("");
      await cambiarEstadoApoyo(apoyo.id, activo);
      setFeedback(
        activo
          ? `El apoyo "${apoyo.nombre}" fue activado.`
          : `El apoyo "${apoyo.nombre}" fue desactivado.`
      );
      await cargarDatos();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo actualizar el estado del apoyo.";
      setError(message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Apoyos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <Loader message="Cargando apoyos..." />
        ) : (
          <div className="admin-apoyos-page">
            <AdminHeader
              title="Apoyos"
              subtitle="Crea apoyos generales o asignados a un municipio para que aparezcan en el portal ciudadano."
            />

            <div className="admin-apoyos-stats">
              <StatCard title="Total apoyos" value={resumen.total} />
              <StatCard title="Activos" value={resumen.activos} />
              <StatCard title="Generales" value={resumen.generales} />
              <StatCard title="Municipales" value={resumen.municipales} />
            </div>

            <div className="admin-apoyos-layout">
              <Card>
                <div className="admin-apoyos-form">
                  <div>
                    <p className="admin-apoyos__eyebrow">
                      {editingId ? "Edicion de apoyo" : "Nuevo apoyo"}
                    </p>
                    <h3>
                      {editingId ? "Actualizar apoyo existente" : "Agregar apoyo para municipio"}
                    </h3>
                    <p className="admin-apoyos__copy">
                      Si dejas el municipio en general, el apoyo se mostrara para todos.
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
                      Escribe un requisito por linea para que luego se muestre claro en cada tarjeta.
                    </p>
                    {errores.requisitos ? (
                      <p className="field-error-text">{errores.requisitos}</p>
                    ) : null}
                  </div>

                  <p className="admin-apoyos__selected-scope">
                    Alcance actual:{" "}
                    <strong>
                      {form.municipio_id
                        ? municipios.find((municipio) => municipio.id === form.municipio_id)
                            ?.nombre || "Municipio seleccionado"
                        : "General para todos"}
                    </strong>
                  </p>

                  {feedback ? <p className="admin-apoyos__success">{feedback}</p> : null}
                  {error ? <p className="form-warning">{error}</p> : null}

                  <div className="admin-apoyos-form__actions">
                    {editingId ? (
                      <IonButton fill="clear" color="medium" onClick={cancelarEdicion}>
                        Cancelar edicion
                      </IonButton>
                    ) : null}
                    <IonButton fill="outline" color="medium" onClick={cargarDatos}>
                      Actualizar lista
                    </IonButton>
                    <IonButton onClick={guardarApoyo} disabled={saving || !formValido}>
                      {saving
                        ? editingId
                          ? "Actualizando..."
                          : "Guardando..."
                        : editingId
                        ? "Actualizar apoyo"
                        : "Guardar apoyo"}
                    </IonButton>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="admin-apoyos-list">
                  <div className="admin-apoyos-list__header">
                    <div>
                      <p className="admin-apoyos__eyebrow">Catalogo actual</p>
                      <h3>Apoyos registrados</h3>
                    </div>
                  </div>

                  {apoyos.length === 0 ? (
                    <EmptyState message="Todavia no hay apoyos registrados." />
                  ) : (
                    <div className="admin-apoyos-list__items">
                      {apoyos.map((apoyo) => (
                        <article key={apoyo.id} className="admin-apoyo-item">
                          <div className="admin-apoyo-item__header">
                            <div>
                              <h4>{apoyo.nombre}</h4>
                              <p>{apoyo.descripcion || "Sin descripcion disponible."}</p>
                            </div>

                            <IonBadge
                              className={`admin-apoyo-item__badge ${
                                apoyo.activo === false
                                  ? "inactive"
                                  : apoyo.municipio_id
                                  ? "municipal"
                                  : "general"
                              }`}
                            >
                              {apoyo.activo === false
                                ? "Inactivo"
                                : apoyo.municipio_nombre || "General"}
                            </IonBadge>
                          </div>

                          <div className="admin-apoyo-item__requisitos">
                            <span>Requisitos</span>
                            <ul>
                              {normalizarRequisitos(apoyo.requisitos).map((requisito) => (
                                <li key={`${apoyo.id}-${requisito}`}>{requisito}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="admin-apoyo-item__status-row">
                            <div>
                              <strong>Visible en portal</strong>
                              <p>
                                {apoyo.activo === false
                                  ? "Actualmente oculto para los usuarios."
                                  : "Actualmente disponible para los usuarios."}
                              </p>
                            </div>

                            <IonToggle
                              checked={apoyo.activo !== false}
                              disabled={togglingId === apoyo.id}
                              onIonChange={(e) =>
                                toggleEstadoApoyo(apoyo, e.detail.checked)
                              }
                            />
                          </div>

                          <div className="admin-apoyo-item__actions">
                            <IonButton
                              fill="outline"
                              color="medium"
                              onClick={() => editarApoyo(apoyo)}
                            >
                              <IonIcon icon={createOutline} slot="start" />
                              Editar
                            </IonButton>
                            <IonButton
                              color="danger"
                              fill="outline"
                              disabled={deletingId === apoyo.id}
                              onClick={() => borrarApoyo(apoyo)}
                            >
                              <IonIcon icon={trashOutline} slot="start" />
                              {deletingId === apoyo.id ? "Eliminando..." : "Eliminar"}
                            </IonButton>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AdminApoyos;

const normalizarRequisitos = (requisitos?: string | null) =>
  (requisitos || "")
    .split(/\r?\n|,|;|•/)
    .map((item) => item.trim())
    .filter(Boolean);
