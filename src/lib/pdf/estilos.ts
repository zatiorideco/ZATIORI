import { StyleSheet } from "@react-pdf/renderer";

// Paleta Zatiori para PDFs
export const C = {
  marron: "#775A48",
  espresso: "#3E2F26",
  negro: "#1A1512",
  crema: "#F4EDE2",
  arena: "#E2D3BE",
  madera: "#B0875F",
  muted: "#8A7361",
  line: "#E0D4C3",
};

export const estilos = StyleSheet.create({
  pagina: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: C.negro,
    backgroundColor: "#FFFFFF",
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: C.espresso,
    paddingBottom: 12,
    marginBottom: 16,
  },
  logo: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: C.espresso,
    letterSpacing: 4,
  },
  subLogo: { fontSize: 8, color: C.muted, marginTop: 2 },
  titulo: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.marron,
    textTransform: "uppercase",
  },
  seccion: { marginBottom: 14 },
  seccionTitulo: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.madera,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  fila: { flexDirection: "row", marginBottom: 3 },
  etiqueta: { width: 110, color: C.muted },
  valor: { flex: 1 },
  tabla: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 4,
  },
  tablaHeader: {
    flexDirection: "row",
    backgroundColor: C.crema,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    padding: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    color: C.espresso,
  },
  tablaFila: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    padding: 6,
  },
  totales: {
    marginTop: 10,
    alignSelf: "flex-end",
    width: 220,
  },
  totalFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  totalDestacado: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.espresso,
    marginTop: 4,
    paddingTop: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  pie: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 8,
    fontSize: 8,
    color: C.muted,
    textAlign: "center",
  },
  chip: {
    backgroundColor: C.crema,
    color: C.espresso,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
  },
});

export function pesos(valor: number) {
  return `$ ${Math.round(valor).toLocaleString("es-AR")}`;
}

export function fechaLarga(fecha: Date | null | undefined) {
  if (!fecha) return "A confirmar";
  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}
