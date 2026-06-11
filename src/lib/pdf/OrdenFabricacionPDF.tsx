import * as React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { estilos as s, C, fechaLarga } from "./estilos";

export type DatosOrdenPDF = {
  id: string;
  pedidoNumero: string | null;
  descripcion: string;
  estado: string;
  prioridad: string;
  cliente: string | null;
  responsable: string | null;
  medidas: string | null;
  madera: string | null;
  patina: string | null;
  tallado: string | null;
  extras: string[];
  fechaCreacion: Date;
  fechaEstimada: Date | null;
  notasProduccion: string | null;
  notasPedido: string | null;
};

const CHECKLIST = [
  "Corte de madera según medidas",
  "Armado y encolado del marco",
  "Lijado y preparación de superficie",
  "Tallado (si corresponde)",
  "Aplicación de pátina / terminación",
  "Corte y colocación del espejo",
  "Herrajes y sistema de colgado",
  "Control de calidad y limpieza final",
  "Foto del espejo terminado",
];

export function OrdenFabricacionPDF({ datos }: { datos: DatosOrdenPDF }) {
  return (
    <Document title={`Orden de fabricación — ${datos.pedidoNumero ?? "Stock"}`}>
      <Page size="A4" style={s.pagina}>
        <View style={s.encabezado}>
          <View>
            <Text style={s.logo}>ZATIORI</Text>
            <Text style={s.subLogo}>Orden de fabricación interna</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.titulo}>
              {datos.pedidoNumero ?? "Espejo para stock"}
            </Text>
            <Text style={{ color: C.muted, marginTop: 2 }}>
              Emitida: {fechaLarga(datos.fechaCreacion)}
            </Text>
            <Text
              style={[
                s.chip,
                {
                  marginTop: 4,
                  backgroundColor:
                    datos.prioridad === "ALTA" ? "#F3D9CF" : C.crema,
                },
              ]}
            >
              Prioridad {datos.prioridad}
            </Text>
          </View>
        </View>

        <View style={s.seccion}>
          <Text style={s.seccionTitulo}>Pieza</Text>
          <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold" }}>
            {datos.descripcion}
          </Text>
        </View>

        <View style={[s.seccion, { flexDirection: "row", gap: 30 }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.seccionTitulo}>Especificaciones técnicas</Text>
            {datos.medidas && (
              <View style={s.fila}>
                <Text style={s.etiqueta}>Medidas</Text>
                <Text style={[s.valor, { fontFamily: "Helvetica-Bold" }]}>
                  {datos.medidas}
                </Text>
              </View>
            )}
            {datos.madera && (
              <View style={s.fila}>
                <Text style={s.etiqueta}>Madera</Text>
                <Text style={s.valor}>{datos.madera}</Text>
              </View>
            )}
            {datos.patina && (
              <View style={s.fila}>
                <Text style={s.etiqueta}>Pátina</Text>
                <Text style={s.valor}>{datos.patina}</Text>
              </View>
            )}
            {datos.tallado && (
              <View style={s.fila}>
                <Text style={s.etiqueta}>Tallado</Text>
                <Text style={s.valor}>{datos.tallado}</Text>
              </View>
            )}
            {datos.extras.map((e) => (
              <View key={e} style={s.fila}>
                <Text style={s.etiqueta}>Extra</Text>
                <Text style={s.valor}>{e}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.seccionTitulo}>Datos de la orden</Text>
            <View style={s.fila}>
              <Text style={s.etiqueta}>Destino</Text>
              <Text style={s.valor}>
                {datos.cliente ? `Cliente: ${datos.cliente}` : "Stock del local"}
              </Text>
            </View>
            <View style={s.fila}>
              <Text style={s.etiqueta}>Responsable</Text>
              <Text style={s.valor}>{datos.responsable ?? "Sin asignar"}</Text>
            </View>
            <View style={s.fila}>
              <Text style={s.etiqueta}>Entrega estimada</Text>
              <Text style={s.valor}>{fechaLarga(datos.fechaEstimada)}</Text>
            </View>
          </View>
        </View>

        {(datos.notasProduccion || datos.notasPedido) && (
          <View style={s.seccion}>
            <Text style={s.seccionTitulo}>Notas</Text>
            {datos.notasProduccion && <Text>{datos.notasProduccion}</Text>}
            {datos.notasPedido && (
              <Text style={{ color: C.muted, marginTop: 2 }}>
                Del pedido: {datos.notasPedido}
              </Text>
            )}
          </View>
        )}

        <View style={s.seccion}>
          <Text style={s.seccionTitulo}>Checklist de taller</Text>
          <View style={[s.tabla, { padding: 4 }]}>
            {CHECKLIST.map((paso) => (
              <View
                key={paso}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 5,
                  paddingHorizontal: 4,
                  borderBottomWidth: 1,
                  borderBottomColor: C.line,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderWidth: 1,
                    borderColor: C.espresso,
                    borderRadius: 2,
                    marginRight: 8,
                  }}
                />
                <Text>{paso}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={s.pie}>
          Uso interno del taller — Zatiori · Orden {datos.id.slice(-8)}
        </Text>
      </Page>
    </Document>
  );
}
