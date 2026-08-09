export type MatrizAsientos = number[][];

export function inicializarSala(): MatrizAsientos {
  const filas = 8;
  const columnas = 10;
  const sala: MatrizAsientos = [];

  for (let filaActual = 0; filaActual < filas; filaActual += 1) {
    const fila: number[] = [];

    for (let columnaActual = 0; columnaActual < columnas; columnaActual += 1) {
      fila.push(0);
    }

    sala.push(fila);
  }

  return sala;
}

export function mostrarSala(sala: MatrizAsientos): void {
  if (sala.length === 0) {
    console.log("   (sala vacia)");
    return;
  }

  const totalColumnas = sala[0].length;
  let encabezado = "   ";

  for (let columna = 0; columna < totalColumnas; columna += 1) {
    encabezado += `${columna.toString().padStart(2, " ")} `;
  }

  console.log(encabezado);

  for (let fila = 0; fila < sala.length; fila += 1) {
    let linea = `${fila.toString().padStart(2, " ")} `;

    for (let columna = 0; columna < totalColumnas; columna += 1) {
      const estado = sala[fila][columna] === 0 ? "L" : "X";
      linea += ` ${estado} `;
    }

    console.log(linea);
  }
}

export function reservarAsiento(
  sala: MatrizAsientos,
  fila: number,
  columna: number,
): string {
  const filaExiste = fila >= 0 && fila < sala.length;
  if (!filaExiste) {
    return `Error: la fila ${fila} no es valida.`;
  }

  const columnaExiste = columna >= 0 && columna < sala[fila].length;
  if (!columnaExiste) {
    return `Error: la columna ${columna} no es valida.`;
  }

  if (sala[fila][columna] === 1) {
    return `Error: el asiento (${fila}, ${columna}) ya esta ocupado.`;
  }

  sala[fila][columna] = 1;
  return `Reserva exitosa: asiento (${fila}, ${columna}) reservado.`;
}

export function contarAsientos(sala: MatrizAsientos): string {
  let libres = 0;
  let ocupados = 0;

  for (let fila = 0; fila < sala.length; fila += 1) {
    for (let columna = 0; columna < sala[fila].length; columna += 1) {
      if (sala[fila][columna] === 0) {
        libres += 1;
      } else if (sala[fila][columna] === 1) {
        ocupados += 1;
      }
    }
  }

  return `Asientos libres: ${libres}. Asientos ocupados: ${ocupados}.`;
}

export function buscarAsientosContiguos(sala: MatrizAsientos): string {
  for (let fila = 0; fila < sala.length; fila += 1) {
    for (let columna = 0; columna < sala[fila].length - 1; columna += 1) {
      const actual = sala[fila][columna];
      const siguiente = sala[fila][columna + 1];

      if (actual === 0 && siguiente === 0) {
        return `Par disponible encontrado en fila ${fila}, columnas ${columna} y ${columna + 1}.`;
      }
    }
  }

  return "No hay asientos contiguos disponibles.";
}

export function registrarReservaJSON(
  historialJSON: string,
  fila: number,
  columna: number,
): string {
  const historial = JSON.parse(historialJSON) as number[][];
  historial.push([fila, columna, Date.now()]);
  return JSON.stringify(historial, null, 2);
}

if (typeof document !== "undefined") {
  const sala = inicializarSala();
  const mapaSala = document.querySelector<HTMLDivElement>("#mapa-sala");
  const resumen = document.querySelector<HTMLParagraphElement>("#resumen");
  const sugerencia = document.querySelector<HTMLParagraphElement>("#sugerencia");
  const mensaje = document.querySelector<HTMLParagraphElement>("#mensaje");

  if (!mapaSala || !resumen || !sugerencia || !mensaje) {
    throw new Error("No se encontraron los elementos necesarios en el HTML.");
  }

  let historialReservasJSON = "[]";

  const renderizarSalaWeb = (): void => {
    mapaSala.innerHTML = "";

    const cuadricula = document.createElement("div");
    cuadricula.className = "grid gap-2";
    cuadricula.style.gridTemplateColumns = `repeat(${sala[0].length + 1}, minmax(0, 2.25rem))`;

    const esquina = document.createElement("span");
    esquina.className = "h-9";
    cuadricula.appendChild(esquina);

    for (let columna = 0; columna < sala[0].length; columna += 1) {
      const etiquetaColumna = document.createElement("span");
      etiquetaColumna.className = "flex h-9 items-center justify-center text-xs font-bold text-slate-300";
      etiquetaColumna.textContent = String(columna);
      cuadricula.appendChild(etiquetaColumna);
    }

    for (let fila = 0; fila < sala.length; fila += 1) {
      const etiquetaFila = document.createElement("span");
      etiquetaFila.className = "flex h-9 items-center justify-center text-xs font-bold text-slate-300";
      etiquetaFila.textContent = String(fila);
      cuadricula.appendChild(etiquetaFila);

      for (let columna = 0; columna < sala[fila].length; columna += 1) {
        const asiento = document.createElement("button");
        asiento.type = "button";
        asiento.setAttribute("data-fila", String(fila));
        asiento.setAttribute("data-columna", String(columna));
        asiento.className =
          "h-9 w-9 rounded-md text-xs font-black transition-transform duration-150 hover:scale-105";

        if (sala[fila][columna] === 0) {
          asiento.textContent = "L";
          asiento.className += " bg-emerald-500 text-emerald-950 hover:bg-emerald-400";
          asiento.disabled = false;
        } else {
          asiento.textContent = "X";
          asiento.className += " cursor-not-allowed bg-rose-500 text-rose-950 opacity-95";
          asiento.disabled = true;
        }

        cuadricula.appendChild(asiento);
      }
    }

    mapaSala.appendChild(cuadricula);
    resumen.textContent = contarAsientos(sala);
    sugerencia.textContent = buscarAsientosContiguos(sala);
  };

  mapaSala.addEventListener("click", (evento: Event) => {
    const objetivo = evento.target;
    if (!(objetivo instanceof HTMLButtonElement)) {
      return;
    }

    const filaTexto = objetivo.getAttribute("data-fila");
    const columnaTexto = objetivo.getAttribute("data-columna");

    if (filaTexto === null || columnaTexto === null) {
      return;
    }

    const fila = Number.parseInt(filaTexto, 10);
    const columna = Number.parseInt(columnaTexto, 10);
    const resultado = reservarAsiento(sala, fila, columna);
    mensaje.textContent = resultado;

    if (resultado.startsWith("Reserva exitosa")) {
      historialReservasJSON = registrarReservaJSON(historialReservasJSON, fila, columna);
      console.log("Historial de reservas (JSON):", historialReservasJSON);
    }

    renderizarSalaWeb();
  });

  renderizarSalaWeb();
}

export {};
