export interface Line {
  codLinea: number;
  nombreLinea: string;
  cabeceraIda: string | undefined;
  cabeceraVuelta: string | undefined;
  // Join codLinea and nombreLinea
  label: string | undefined;
}

export interface Stop {
  codParada: number;
  nombreParada: string;
  direccion: string;
  lat: number;
  lon: number;
  label: string | undefined;
}

export interface Location {
  codBus: number;
  codLinea: number;
  sentido: number;
  lat: number;
  lon: number;
}

export interface Schedule {
  codLinea: number;
  codParada: number;
  tiempoLlegada: string;
  secParada: number;
}

// Previous to this interface, it´s all necesary stops
export interface InfoStop {
  stopName: string;
  arrivalLines: {
    lineCode: number;
    lineName: string;
  }[];
  nextArrivals?: {
    lineCode: number;
    estimatedTime: number;
  }[];
}
