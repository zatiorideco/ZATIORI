import * as React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { estilos as s, C, pesos, fechaLarga } from "./estilos";

export type DatosPedidoPDF = {
  numero: string;
  fecha: Date;
  estado: string;
  cliente: {
    nombre: string;
    telefono: string | null;
    email: string | null;
    ciudad: string | null;
  };
  items: Array<{
    descripcion: string;
    medidas: string | null;
    madera: string | null;
    patina: string | null;
    tallado: string | null;
    extras: string[];
    cantidad: number;
    precioUnitario: number;
  }>;
  subtotal: number;
  descuento: number;
  total: number;
  sena: number;
  saldo: number;
  fechaEstimada: Date | null;
  notas: string | null;
  negocio: {
    whatsapp: string;
    instagram: string;
    email: string | null;
    direccion: string | null;
  };
};

export function PedidoPDF({ datos }: { datos: DatosPedidoPDF }) {
  return (
    <Document title={`Pedido ${datos.numero} — Zatiori`}>
      <Page size="A4" style={s.pagina}>
        <View style={s.encabezado}>
          <View>
            <Text style={s.logo}>ZATIORI</Text>
            <Text style={s.subLogo}>
              Almacén de espejos · Bahía Blanca, Argentina
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.titulo}>Pedido {datos.numero}</Text>
            <Text style={{ color: C.muted, marginTop: 2 }}>
              {fechaLarga(datos.fecha)}
            </Text>
            <Text style={[s.chip, { marginTop: 4 }]}>{datos.estado}</Text>
          </View>
        </View>

        <View style={s.seccion}>
          <Text style={s.seccionTitulo}>Cliente</Text>
          <View style={s.fila}>
            <Text style={s.etiqueta}>Nombre</Text>
            <Text style={s.valor}>{datos.cliente.nombre}</Text>
          </View>
          {datos.cliente.telefono && (
            <View style={s.fila}>
              <Text style={s.etiqueta}>Teléfono</Text>
              <Text style={s.valor}>{datos.cliente.telefono}</Text>
            </View>
          )}
          {datos.cliente.email && (
            <View style={s.fila}>
              <Text style={s.etiqueta}>Email</Text>
              <Text style={s.valor}>{datos.cliente.email}</Text>
            </View>
          )}
          {datos.cliente.ciudad && (
            <View style={s.fila}>
              <Text style={s.etiqueta}>Ciudad</Text>
              <Text style={s.valor}>{datos.cliente.ciudad}</Text>
            </View>
          )}
        </View>

        <View style={s.seccion}>
          <Text style={s.seccionTitulo}>Detalle</Text>
          <View style={s.tabla}>
            <View style={s.tablaHeader}>
              <Text style={{ flex: 3 }}>Espejo</Text>
              <Text style={{ flex: 2 }}>Especificaciones</Text>
              <Text style={{ width: 30, textAlign: "center" }}>Cant.</Text>
              <Text style={{ width: 70, textAlign: "right" }}>Precio</Text>
            </View>
            {datos.items.map((item, i) => (
              <View key={i} style={s.tablaFila} wrap={false}>
                <View style={{ flex: 3, paddingRight: 6 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>
                    {item.descripcion}
                  </Text>
                  {item.medidas && (
                    <Text style={{ color: C.muted, marginTop: 2 }}>
                      Medidas: {item.medidas}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 2 }}>
                  {item.madera && <Text>Madera: {item.madera}</Text>}
                  {item.patina && <Text>Pátina: {item.patina}</Text>}
                  {item.tallado && <Text>Tallado: {item.tallado}</Text>}
                  {item.extras.map((e) => (
                    <Text key={e}>+ {e}</Text>
                  ))}
                </View>
                <Text style={{ width: 30, textAlign: "center" }}>
                  {item.cantidad}
                </Text>
                <Text style={{ width: 70, textAlign: "right" }}>
                  {pesos(item.precioUnitario * item.cantidad)}
                </Text>
              </View>
            ))}
          </View>

          <View style={s.totales}>
            <View style={s.totalFila}>
              <Text style={{ color: C.muted }}>Subtotal</Text>
              <Text>{pesos(datos.subtotal)}</Text>
            </View>
            {datos.descuento > 0 && (
              <View style={s.totalFila}>
                <Text style={{ color: C.muted }}>Descuento</Text>
                <Text>- {pesos(datos.descuento)}</Text>
              </View>
            )}
            <View style={s.totalDestacado}>
              <Text>Total</Text>
              <Text>{pesos(datos.total)}</Text>
            </View>
            <View style={s.totalFila}>
              <Text style={{ color: C.muted }}>Seña</Text>
              <Text>{pesos(datos.sena)}</Text>
            </View>
            <View style={s.totalFila}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Saldo</Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>
                {pesos(datos.saldo)}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.seccion}>
          <Text style={s.seccionTitulo}>Entrega estimada</Text>
          <Text>{fechaLarga(datos.fechaEstimada)}</Text>
        </View>

        {datos.notas && (
          <View style={s.seccion}>
            <Text style={s.seccionTitulo}>Notas</Text>
            <Text>{datos.notas}</Text>
          </View>
        )}

        <Text style={s.pie}>
          Zatiori — Almacén de espejos · WhatsApp +{datos.negocio.whatsapp} ·
          Instagram @{datos.negocio.instagram}
          {datos.negocio.email ? ` · ${datos.negocio.email}` : ""}
          {"\n"}Cada espejo es una pieza única hecha a mano: los tonos de madera
          y pátina pueden variar levemente.
        </Text>
      </Page>
    </Document>
  );
}
