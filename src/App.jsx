
import { useEffect, useState } from "react";
import "./App.css";
import CalendarPicker from "./CalendarPicker";
import { supabase } from "./supabase";

const CAPACIDAD_TOTAL = 36;

// Completá con el número del hotel en formato internacional.
// Ejemplo: 549385XXXXXXX
const WHATSAPP_NUMERO = "";

const DIRECCION_HOTEL =
  "Av. Pellegrini 127 - Frías - Santiago del Estero - Argentina";

const MAPS_URL =
  "https://www.google.com/maps/place/Hotel+Portal+del+Sol/@-28.628912,-65.1342087,17z/data=!3m1!4b1!4m10!3m9!1s0x9425a84fa17b9011:0x3071ce42bb005e4d!5m3!1s2026-11-24!4m1!1i2!8m2!3d-28.628912!4d-65.1316338!16s%2Fg%2F1tdksx5c?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D" +
  encodeURIComponent(DIRECCION_HOTEL);

function App() {
  const [reservaAbierta, setReservaAbierta] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // La capacidad se utiliza internamente.
  // Nunca se muestra su valor al huésped.
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
        "No pudimos verificar la disponibilidad. Intentá nuevamente."
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

    if (personas > CAPACIDAD_TOTAL) {
      setError("Ingresá una cantidad válida de personas.");
      return;
    }

    if (!formulario.entrada || !formulario.salida) {
      setError("Seleccioná la fecha de entrada y salida.");
      return;
    }

    if (formulario.salida <= formulario.entrada) {
      setError(
        "La fecha de salida debe ser posterior a la fecha de entrada."
      );
      return;
    }

    if (consultandoCapacidad) {
      setError("Esperá un momento e intentá nuevamente.");
      return;
    }

    if (capacidadDisponible === null) {
      setError(
        "No pudimos verificar la disponibilidad. Volvé a seleccionar las fechas."
      );
      return;
    }

    if (capacidadDisponible <= 0) {
      setError(
        "No hay disponibilidad para las fechas seleccionadas. Elegí otras fechas."
      );
      return;
    }

    if (personas > capacidadDisponible) {
      setError(
        "No hay disponibilidad suficiente para la cantidad de huéspedes seleccionada."
      );
      return;
    }

    setEnviando(true);
    setError("");

    try {
      const { error: errorSupabase } =
        await supabase.rpc("crear_reserva", {
          p_nombre_completo: formulario.nombre.trim(),
          p_email: formulario.email.trim(),
          p_cantidad_huespedes: personas,
          p_fecha_ingreso: formulario.entrada,
          p_fecha_salida: formulario.salida,
        });

      if (errorSupabase) {
        console.error(
          "Error de Supabase:",
          errorSupabase
        );

        const mensaje = errorSupabase.message || "";

        if (
          mensaje.includes("No hay capacidad suficiente")
        ) {
          setError(
            "No hay disponibilidad suficiente para las fechas seleccionadas."
          );
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
      console.error("Error inesperado:", error);

      setError(
        "Ocurrió un error al enviar la reserva. Por favor, intentá nuevamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  const whatsappUrl = WHATSAPP_NUMERO
    ? `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
        "Hola, quisiera realizar una consulta sobre el Hotel Portal del Sol."
      )}`
    : "";

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <a className="logo" href="#inicio">
          <img
            src="/logo.png"
            alt="Hotel Portal del Sol"
          />
        </a>

        <nav className="main-nav">
          <a href="#inicio">Inicio</a>
          <a href="#habitaciones">Habitaciones</a>
          <a href="#hotel">El hotel</a>
          <a href="#galeria">Galería</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <button
          className="header-reserve"
          onClick={abrirReserva}
        >
          Reservar
        </button>

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

      <section
        id="galeria"
        className="gallery-section"
      >

        <div className="section-title">

          <p className="eyebrow">
            CONOCÉ NUESTRO HOTEL
          </p>

          <h2>
            Nuestros espacios
          </h2>

          <p>
            Conocé algunos espacios de Hotel Portal del Sol.
          </p>

        </div>

        <div className="gallery">

          <img
            src="/imagen1.jpg"
            alt="Hotel Portal del Sol - Imagen 1"
            loading="lazy"
          />

          <img
            src="/imagen2.jpg"
            alt="Hotel Portal del Sol - Imagen 2"
            loading="lazy"
          />

          <img
            src="/imagen3.jpg"
            alt="Hotel Portal del Sol - Imagen 3"
            loading="lazy"
          />

          <img
            src="/imagen4.jpg"
            alt="Hotel Portal del Sol - Imagen 4"
            loading="lazy"
          />

          <img
            src="/imagen5.jpg"
            alt="Hotel Portal del Sol - Imagen 5"
            loading="lazy"
          />

        </div>

      </section>

      {/* CONTACTO */}

      <section className="contact-section">

        <div className="contact-inner">

          <div className="contact-heading">

            <p className="eyebrow">
              ESTAMOS PARA AYUDARTE
            </p>

            <h2>
              Contactate con nosotros
            </h2>

            <p>
              Estamos a disposición para ayudarte con tu estadía.
            </p>

          </div>

          <div className="contact-cards">

            <article className="contact-card">

              <span className="contact-icon">⌖</span>

              <h3>
                Visitá el hotel
              </h3>

              <p>
                {DIRECCION_HOTEL}
              </p>

              <a
                href={MAPS_URL}
                target="_blank"
                rel="noreferrer"
              >
                Cómo llegar ↗
              </a>

            </article>

            {whatsappUrl && (

              <article className="contact-card">

                <span className="contact-icon">✆</span>

                <h3>
                  WhatsApp
                </h3>

                <p>
                  Escribinos directamente para realizar tu consulta.
                </p>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Contactar por WhatsApp ↗
                </a>

              </article>

            )}

            <article className="contact-card">

              <span className="contact-icon">▣</span>

              <h3>
                Reservas
              </h3>

              <p>
                Enviá tu solicitud desde nuestra página.
              </p>

              <button
                type="button"
                onClick={abrirReserva}
              >
                Solicitar reserva →
              </button>

            </article>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer
        id="contacto"
        className="footer"
      >

        <div className="footer-main">

          <div className="footer-brand">

            <img
              src="/logo.png"
              alt="Hotel Portal del Sol"
            />

            <p>
              Gracias por elegirnos.
            </p>

          </div>

          <div className="footer-location">

            <h3>
              Ubicación
            </h3>

            <p>
              {DIRECCION_HOTEL}
            </p>

            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
            >
              Ver en Google Maps ↗
            </a>

          </div>

          <div className="footer-links">

            <h3>
              Enlaces rápidos
            </h3>

            <a href="#inicio">Inicio</a>
            <a href="#habitaciones">Habitaciones</a>
            <a href="#galeria">Galería</a>
            <a href="#contacto">Contacto</a>

          </div>

        </div>

        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} Hotel Portal del Sol.
            Todos los derechos reservados.
          </p>

        </div>

      </footer>

      {/* BOTÓN FLOTANTE DE WHATSAPP */}

      {whatsappUrl && (

        <a
          className="whatsapp-float"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Contactar por WhatsApp"
          title="Contactar por WhatsApp"
        >
          ✆
        </a>

      )}

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

            <p className="modal-address">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noreferrer"
              >
                {DIRECCION_HOTEL} · Ver mapa
              </a>
            </p>

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
                  max={CAPACIDAD_TOTAL}
                  placeholder="Cantidad de personas"
                  disabled={enviando}
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
                  consultandoCapacidad
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
