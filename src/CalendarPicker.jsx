import React, { useEffect, useState } from "react";
import "./CalendarPicker.css";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const DIAS_SEMANA = [
  "DO",
  "LU",
  "MA",
  "MI",
  "JU",
  "VI",
  "SA",
];

function obtenerHoy() {
  const ahora = new Date();

  return new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate()
  );
}

function convertirStringAFecha(valor) {
  if (!valor) {
    return null;
  }

  const partes = valor.split("-");

  if (partes.length !== 3) {
    return null;
  }

  const anio = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const dia = parseInt(partes[2], 10);

  const fecha = new Date(anio, mes, dia);

  if (isNaN(fecha.getTime())) {
    return null;
  }

  return new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate()
  );
}

function convertirFechaAString(fecha) {
  const anio = fecha.getFullYear();

  const mes = String(
    fecha.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    fecha.getDate()
  ).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function mostrarFecha(fecha) {
  if (!fecha) {
    return "Seleccionar fecha";
  }

  return fecha.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function mismoDia(fecha1, fecha2) {
  if (!fecha1 || !fecha2) {
    return false;
  }

  return (
    fecha1.getFullYear() === fecha2.getFullYear() &&
    fecha1.getMonth() === fecha2.getMonth() &&
    fecha1.getDate() === fecha2.getDate()
  );
}

export default function CalendarPicker({
  label,
  value,
  onChange,
  minDate = null,
}) {
  const hoy = obtenerHoy();

  const fechaSeleccionada =
    convertirStringAFecha(value);

  /*
   * Si estamos seleccionando ENTRADA:
   * el mínimo es HOY.
   *
   * Si estamos seleccionando SALIDA:
   * minDate será la fecha de entrada.
   */
  const fechaLimite = minDate
    ? convertirStringAFecha(minDate)
    : hoy;

  /*
   * Fecha que se está mostrando actualmente
   * en el calendario.
   */
  const [fechaVista, setFechaVista] =
    useState(
      fechaSeleccionada ||
      fechaLimite ||
      hoy
    );

  const [abierto, setAbierto] =
    useState(false);

  /*
   * Cuando cambia la fecha seleccionada
   * actualizamos el mes mostrado.
   */
  useEffect(() => {
    if (fechaSeleccionada) {
      setFechaVista(fechaSeleccionada);
    }
  }, [value]);

  /*
   * Si cambia la fecha mínima (por ejemplo,
   * cuando elegimos una nueva fecha de entrada),
   * comprobamos que el calendario siga en un
   * mes válido.
   */
  useEffect(() => {
    if (!fechaLimite) {
      return;
    }

    const primerDiaVista = new Date(
      fechaVista.getFullYear(),
      fechaVista.getMonth(),
      1
    );

    const primerMesPermitido = new Date(
      fechaLimite.getFullYear(),
      fechaLimite.getMonth(),
      1
    );

    if (
      primerDiaVista < primerMesPermitido
    ) {
      setFechaVista(fechaLimite);
    }
  }, [minDate]);

  /*
   * Cerrar el calendario cuando se hace clic
   * fuera de él.
   */
  useEffect(() => {
    function cerrarAlHacerClickAfuera(evento) {
      if (
        !evento.target.closest(
          ".calendar-picker"
        )
      ) {
        setAbierto(false);
      }
    }

    document.addEventListener(
      "mousedown",
      cerrarAlHacerClickAfuera
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        cerrarAlHacerClickAfuera
      );
    };
  }, []);

  /*
   * MES ANTERIOR
   */
  function irAlMesAnterior() {
    const nuevoMes = new Date(
      fechaVista.getFullYear(),
      fechaVista.getMonth() - 1,
      1
    );

    /*
     * No permitimos ir a un mes completamente
     * anterior al límite.
     */
    const primerMesPermitido =
      new Date(
        fechaLimite.getFullYear(),
        fechaLimite.getMonth(),
        1
      );

    if (
      nuevoMes < primerMesPermitido
    ) {
      return;
    }

    setFechaVista(nuevoMes);
  }

  /*
   * MES SIGUIENTE
   */
  function irAlMesSiguiente() {
    const nuevoMes = new Date(
      fechaVista.getFullYear(),
      fechaVista.getMonth() + 1,
      1
    );

    setFechaVista(nuevoMes);
  }

  /*
   * SELECCIONAR DÍA
   */
  function seleccionarFecha(dia) {
    const fechaElegida = new Date(
      fechaVista.getFullYear(),
      fechaVista.getMonth(),
      dia
    );

    /*
     * No permitir fechas anteriores al límite.
     */
    if (
      fechaElegida < fechaLimite
    ) {
      return;
    }

    const valor =
      convertirFechaAString(
        fechaElegida
      );

    onChange(valor);

    setAbierto(false);
  }

  /*
   * Primer día del mes actual.
   */
  const primerDiaMes = new Date(
    fechaVista.getFullYear(),
    fechaVista.getMonth(),
    1
  );

  /*
   * Cantidad de días del mes actual.
   */
  const cantidadDiasMes =
    new Date(
      fechaVista.getFullYear(),
      fechaVista.getMonth() + 1,
      0
    ).getDate();

  /*
   * Día de la semana en que comienza
   * el mes.
   *
   * Domingo = 0
   */
  const primerDiaSemana =
    primerDiaMes.getDay();

  /*
   * Cantidad de días del mes anterior
   * que aparecen en la grilla.
   */
  const cantidadDiasMesAnterior =
    new Date(
      fechaVista.getFullYear(),
      fechaVista.getMonth(),
      0
    ).getDate();

  const diasCalendario = [];

  /*
   * DÍAS DEL MES ANTERIOR
   */
  for (
    let i = primerDiaSemana - 1;
    i >= 0;
    i--
  ) {
    diasCalendario.push({
      dia:
        cantidadDiasMesAnterior - i,
      perteneceAlMes: false,
    });
  }

  /*
   * DÍAS DEL MES ACTUAL
   */
  for (
    let dia = 1;
    dia <= cantidadDiasMes;
    dia++
  ) {
    diasCalendario.push({
      dia,
      perteneceAlMes: true,
    });
  }

  /*
   * DÍAS DEL MES SIGUIENTE
   *
   * Completamos hasta 42 casillas.
   */
  let siguienteDia = 1;

  while (
    diasCalendario.length < 42
  ) {
    diasCalendario.push({
      dia: siguienteDia,
      perteneceAlMes: false,
    });

    siguienteDia++;
  }

  return (
    <div className="calendar-picker">

      {/* LABEL */}

      <label className="calendar-label">
        {label}
      </label>


      {/* BOTÓN */}

      <button
        type="button"
        className={
          abierto
            ? "calendar-input calendar-input-active"
            : "calendar-input"
        }
        onClick={() =>
          setAbierto(!abierto)
        }
      >

        <span className="calendar-icon">
          📅
        </span>

        <span
          className={
            fechaSeleccionada
              ? "calendar-value"
              : "calendar-placeholder"
          }
        >
          {mostrarFecha(
            fechaSeleccionada
          )}
        </span>

        <span className="calendar-arrow">
          {abierto ? "⌃" : "⌄"}
        </span>

      </button>


      {/* CALENDARIO */}

      {abierto && (
        <div className="calendar-dropdown">

          {/* FECHA GRANDE */}

          <div className="calendar-current-date">

            {fechaSeleccionada
              ? fechaSeleccionada.toLocaleDateString(
                  "es-AR",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }
                )
              : "Seleccioná una fecha"}

          </div>


          {/* CABECERA */}

          <div className="calendar-header">

            <strong>
              {MESES[
                fechaVista.getMonth()
              ]}{" "}
              de{" "}
              {fechaVista.getFullYear()}
            </strong>


            <div className="calendar-navigation">

              <button
                type="button"
                onClick={
                  irAlMesAnterior
                }
              >
                ‹
              </button>

              <button
                type="button"
                onClick={
                  irAlMesSiguiente
                }
              >
                ›
              </button>

            </div>

          </div>


          {/* DÍAS DE SEMANA */}

          <div className="calendar-weekdays">

            {DIAS_SEMANA.map(
              (dia) => (
                <div key={dia}>
                  {dia}
                </div>
              )
            )}

          </div>


          {/* GRILLA */}

          <div className="calendar-days">

            {diasCalendario.map(
              (item, indice) => {

                /*
                 * Los días de meses vecinos
                 * son solamente visuales.
                 */
                if (
                  !item.perteneceAlMes
                ) {
                  return (
                    <button
                      key={indice}
                      type="button"
                      className="calendar-day other-month"
                      disabled
                    >
                      {item.dia}
                    </button>
                  );
                }


                const fecha =
                  new Date(
                    fechaVista.getFullYear(),
                    fechaVista.getMonth(),
                    item.dia
                  );


                /*
                 * ¿Es hoy?
                 */
                const esHoy =
                  mismoDia(
                    fecha,
                    hoy
                  );


                /*
                 * ¿Está seleccionada?
                 */
                const estaSeleccionada =
                  mismoDia(
                    fecha,
                    fechaSeleccionada
                  );


                /*
                 * ¿Está bloqueada?
                 */
                const estaBloqueada =
                  fecha < fechaLimite;


                let clases =
                  "calendar-day";


                if (esHoy) {
                  clases += " today";
                }

                if (
                  estaSeleccionada
                ) {
                  clases += " selected";
                }

                if (
                  estaBloqueada
                ) {
                  clases += " disabled";
                }


                return (
                  <button
                    key={indice}
                    type="button"
                    className={clases}
                    disabled={
                      estaBloqueada
                    }
                    onClick={() =>
                      seleccionarFecha(
                        item.dia
                      )
                    }
                  >
                    {item.dia}
                  </button>
                );
              }
            )}

          </div>

        </div>
      )}

    </div>
  );
}