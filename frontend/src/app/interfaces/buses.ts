export interface Line {
    codLinea: number,
    nombreLinea: string,
    // Join codLinea and nombreLinea
    label: string | undefined
}

export interface Stop {
    codParada: number;
    nombreParada: string;
    direccion: string | undefined;
    lat: number | undefined;
    lon: number | undefined;
    label: string | undefined;
}