import { useState } from "react";
import "./App.css";
import CalendarPicker from "./CalendarPicker";

const CAPACIDAD_TOTAL = 36;


function App() {
  const [reservaAbierta, setReservaAbierta] = useState(false);
  const [error, setError] = useState("");

  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    personas: "",
    entrada: "",
    salida: "",
  });

  // Por ahora está vacío.
  // Más adelante estos datos vendrán de la base de datos.
  const personasReservadas = 0;

  const capacidadDisponible =
    CAPACIDAD_TOTAL - personasReservadas;

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
    setReservaAbierta(true);
  }

  function cerrarReserva() {
    setReservaAbierta(false);
    setError("");
  }

  function enviarReserva(e) {
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
      setError("Seleccioná la fecha de entrada y salida.");
      return;
    }

    if (formulario.salida <= formulario.entrada) {
      setError(
        "La fecha de salida debe ser posterior a la fecha de entrada."
      );
      return;
    }

    if (personas > capacidadDisponible) {
      setError(
        "Capacidad de personas excedida. No hay capacidad disponible para la cantidad de personas seleccionada."
      );
      return;
    }

    // Todavía no enviamos la reserva al servidor.
    // Eso lo conectaremos con la base de datos en el próximo paso.

    alert(
      "Solicitud de reserva preparada correctamente. En el próximo paso la conectaremos con el servidor del hotel."
    );

    cerrarReserva();
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

        <section id="inicio" className="hero">
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

      <section className="gallery-section">
        <div className="section-title">
          <p className="eyebrow">CONOCÉ NUESTRO HOTEL</p>

          <p>
            Conocé algunos espacios de Hotel Portal del Sol.
          </p>
        </div>

        <div className="gallery">
          <img src="/imagen1.jpg" alt="Hotel Portal del Sol - Imagen 1" />
          <img src="/imagen2.jpg" alt="Hotel Portal del Sol - Imagen 2" />
          <img src="/imagen3.jpg" alt="Hotel Portal del Sol - Imagen 3" />
          <img src="/imagen4.jpg" alt="Hotel Portal del Sol - Imagen 4" />
          <img src="/imagen5.jpg" alt="Hotel Portal del Sol - Imagen 5" />
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


            <div className="capacity-box">

              <span>
                Capacidad disponible
              </span>

              <strong>
                {capacidadDisponible} personas
              </strong>

            </div>


            <form onSubmit={enviarReserva}>

              <label>
                Nombre

                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={actualizarFormulario}
                  placeholder="Tu nombre"
                  autoComplete="name"
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
                  max="36"
                  placeholder="Cantidad de personas"
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
              >
                Enviar solicitud
              </button>

            </form>
          </div>

        </div>

      )}

    </div>
  );
}

export default App;