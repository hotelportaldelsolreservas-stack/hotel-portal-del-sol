import { useEffect, useState } from "react";
import "./App.css";
import CalendarPicker from "./CalendarPicker";
import { supabase } from "./supabase";

const CAPACIDAD_TOTAL = 36;

function App() {
  const [reservaAbierta, setReservaAbierta] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [capacidadDisponible, setCapacidadDisponible] =
    useState(null);

  const [consultandoCapacidad, setConsultandoCapacidad] =
    useState(false);

  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    personas: "",
    entrada: "",
    salida: "",
  });

  async function consultarCapacidad(entrada, salida) {
    if (!entrada || !salida || salida <= entrada) {
      setCapacidadDisponible(null);
      return;
    }

    setConsultandoCapacidad(true);
    setCapacidadDisponible(null);

    const { data, error: errorSupabase } =
      await supabase.rpc("capacidad_disponible", {
        p_fecha_ingreso: entrada,
        p_fecha_salida: salida,
      });

    setConsultandoCapacidad(false);

    if (errorSupabase) {
      console.error(
        "Error consultando capacidad:",
        errorSupabase
      );

      setError(
        "No pudimos consultar la capacidad disponible."
      );

      setCapacidadDisponible(null);

      return;
    }

    setCapacidadDisponible(Number(data));
  }

  useEffect(() => {
    consultarCapacidad(
      formulario.entrada,
      formulario.salida
    );
  }, [formulario.entrada, formulario.salida]);

  function actualizarFormulario(e) {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setError("");
  }

  function abrirReserva() {
    setError("");
    setCapacidadDisponible(null);
    setReservaAbierta(true);
  }

  function cerrarReserva() {
    setReservaAbierta(false);
    setError("");
    setCapacidadDisponible(null);
  }

  async function enviarReserva(e) {
    e.preventDefault();

    const personas = Number(formulario.personas);

    if (!formulario.nombre.trim()) {
      setError("Por favor, ingresá tu nombre.");
      return;
    }

    if (!formulario.email.trim()) {
      setError("Por favor, ingresá tu email.");
      return;
    }

    if (!personas || personas < 1) {
      setError("Ingresá una cantidad válida de personas.");
      return;
    }

    if (!formulario.entrada || !formulario.salida) {
      setError(
        "Seleccioná la fecha de entrada y salida."
      );
      return;
    }

    if (formulario.salida <= formulario.entrada) {
      setError(
        "La fecha de salida debe ser posterior a la fecha de entrada."
      );
      return;
    }

    if (capacidadDisponible === null) {
      setError(
        "Esperá a que se consulte la capacidad disponible."
      );
      return;
    }

    if (capacidadDisponible <= 0) {
      setError(
        "No hay capacidad disponible para esas fechas."
      );
      return;
    }

    if (personas > capacidadDisponible) {
      setError(
        `Para esas fechas quedan ${capacidadDisponible} personas disponibles.`
      );
      return;
    }

    setEnviando(true);
    setError("");

    try {
      const { error: errorSupabase } =
        await supabase.rpc("crear_reserva", {
          p_nombre_completo:
            formulario.nombre.trim(),

          p_email:
            formulario.email.trim(),

          p_cantidad_huespedes:
            personas,

          p_fecha_ingreso:
            formulario.entrada,

          p_fecha_salida:
            formulario.salida,
        });

      if (errorSupabase) {
        console.error(
          "Error de Supabase:",
          errorSupabase
        );

        const mensaje =
          errorSupabase.message || "";

        if (
          mensaje.includes(
            "No hay capacidad suficiente"
          )
        ) {
          setError(mensaje);
        } else {
          setError(
            "No pudimos enviar la reserva. Por favor, intentá nuevamente."
          );
        }

        return;
      }

      alert(
        "¡Solicitud de reserva enviada correctamente! El hotel recibió tus datos."
      );

      setFormulario({
        nombre: "",
        email: "",
        personas: "",
        entrada: "",
        salida: "",
      });

      setCapacidadDisponible(null);

      cerrarReserva();

    } catch (error) {
      console.error(
        "Error inesperado:",
        error
      );

      setError(
        "Ocurrió un error al enviar la reserva. Por favor, intentá nuevamente."
      );

    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div className="logo">

          <img
            src="/logo.png"
            alt="Hotel Portal del Sol"
          />

        </div>

      </header>


      {/* CONTENIDO */}

      <main>

        {/* HERO */}

        <section
          id="inicio"
          className="hero"
        >

          <div className="hero-content">

            <p className="eyebrow">
              HOTEL PORTAL DEL SOL
            </p>

            <h2>
              Descansá y disfrutá
              <br />
              de tu estadía
            </h2>

            <p>
              Realizá tu solicitud de reserva de manera
              rápida y sencilla.
            </p>

            <button
              className="primary-button"
              onClick={abrirReserva}
            >
              Solicitar reserva
            </button>

          </div>

        </section>


        {/* HABITACIONES */}

        <section
          id="habitaciones"
          className="rooms-section"
        >

          <div className="section-title">

            <p className="eyebrow">
              ALOJAMIENTO
            </p>

            <h2>
              Nuestras habitaciones
            </h2>

            <p>
              El hotel asignará la habitación al momento
              de la llegada del pasajero.
            </p>

          </div>


          <div className="rooms">

            <article className="room-card">

              <div className="room-info">

                <h3>
                  Habitaciones cómodas
                </h3>

                <p>
                  Contamos con diferentes habitaciones
                  adaptadas a las necesidades de nuestros
                  huéspedes.
                </p>

                <div className="room-details">

                  <span>
                    Capacidad total del hotel: 36 personas
                  </span>

                </div>

                <button
                  className="reserve-button"
                  onClick={abrirReserva}
                >
                  Solicitar reserva
                </button>

              </div>

            </article>

          </div>

        </section>


        {/* HOTEL */}

        <section
          id="hotel"
          className="hotel-section"
        >

          <div>

            <p className="eyebrow">
              CONOCÉ EL HOTEL
            </p>

            <h2>
              Hotel Portal del Sol
            </h2>

            <p>
              Un lugar pensado para que puedas disfrutar
              de una estadía cómoda y tranquila.
            </p>

            <p>
              Realizá tu solicitud de reserva desde nuestra
              página y nuestro equipo se encargará de
              gestionarla.
            </p>

          </div>

        </section>

      </main>


      {/* GALERÍA */}

      <section className="gallery-section">

        <div className="section-title">

          <p className="eyebrow">
            CONOCÉ NUESTRO HOTEL
          </p>

          <p>
            Conocé algunos espacios de Hotel Portal del Sol.
          </p>

        </div>

        <div className="gallery">

          <img
            src="/imagen1.jpg"
            alt="Hotel Portal del Sol - Imagen 1"
          />

          <img
            src="/imagen2.jpg"
            alt="Hotel Portal del Sol - Imagen 2"
          />

          <img
            src="/imagen3.jpg"
            alt="Hotel Portal del Sol - Imagen 3"
          />

          <img
            src="/imagen4.jpg"
            alt="Hotel Portal del Sol - Imagen 4"
          />

          <img
            src="/imagen5.jpg"
            alt="Hotel Portal del Sol - Imagen 5"
          />

        </div>

      </section>


      {/* FOOTER */}

      <footer id="contacto">

        <h3>
          Hotel Portal del Sol
        </h3>

        <p>
          Gracias por elegirnos.
        </p>

      </footer>


      {/* MODAL DE RESERVA */}

      {reservaAbierta && (

        <div className="modal-overlay">

          <div className="reservation-modal">

            <button
              className="close-button"
              onClick={cerrarReserva}
              disabled={enviando}
            >
              ×
            </button>


            <img
              className="modal-logo"
              src="/logo.png"
              alt="Hotel Portal del Sol"
            />


            <h2>
              Solicitar reserva
            </h2>


            <p className="modal-description">
              Completá los siguientes datos para enviar
              tu solicitud al hotel.
            </p>

            <p>
              📍 Av. Pellegrini 127 - Frías - Santiago del Estero - Argentina
            </p>


            {/* CAPACIDAD */}

            <div className="capacity-box">

              <span>
                {capacidadDisponible === null
                  ? "Capacidad disponible"
                  : "Capacidad disponible para estas fechas"}
              </span>

              <strong>

                {consultandoCapacidad
                  ? "Consultando..."
                  : capacidadDisponible === null
                    ? "Seleccioná las fechas"
                    : `${capacidadDisponible} ${
                        capacidadDisponible === 1
                          ? "persona"
                          : "personas"
                      }`}

              </strong>

            </div>


            <form
              onSubmit={enviarReserva}
            >

              <label>

                Nombre

                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={actualizarFormulario}
                  placeholder="Tu nombre"
                  autoComplete="name"
                  disabled={enviando}
                />

              </label>


              <label>

                Email

                <input
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={actualizarFormulario}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  disabled={enviando}
                />

              </label>


              <label>

                ¿Cuántas personas?

                <input
                  type="number"
                  name="personas"
                  value={formulario.personas}
                  onChange={actualizarFormulario}
                  min="1"
                  max={
                    capacidadDisponible !== null &&
                    capacidadDisponible > 0
                      ? capacidadDisponible
                      : 36
                  }
                  placeholder="Cantidad de personas"
                  disabled={
                    enviando ||
                    capacidadDisponible === 0
                  }
                />

              </label>


              <div className="date-fields">

                <CalendarPicker
                  label="Fecha de entrada"
                  value={formulario.entrada}
                  onChange={(fecha) => {

                    setFormulario((anterior) => ({
                      ...anterior,
                      entrada: fecha,
                      salida:
                        anterior.salida &&
                        anterior.salida < fecha
                          ? ""
                          : anterior.salida,
                    }));

                    setError("");

                  }}
                />


                <CalendarPicker
                  label="Fecha de salida"
                  value={formulario.salida}
                  minDate={formulario.entrada}
                  onChange={(fecha) => {

                    setFormulario((anterior) => ({
                      ...anterior,
                      salida: fecha,
                    }));

                    setError("");

                  }}
                />

              </div>


              {capacidadDisponible === 0 && (
                <div className="reservation-error">
                  ⚠️ No hay capacidad disponible para esas fechas.
                  Seleccioná otras fechas.
                </div>
              )}


              {error && (
                <div className="reservation-error">
                  ⚠️ {error}
                </div>
              )}


              <button
                type="submit"
                className="submit-reservation"
                disabled={
                  enviando ||
                  consultandoCapacidad ||
                  capacidadDisponible === 0
                }
              >

                {enviando
                  ? "Enviando reserva..."
                  : "Enviar solicitud"}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;