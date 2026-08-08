import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";
import type { DatosEmailTurno, TipoEstadoEmail } from "@/lib/turno-datos-email";

export type ColoresEmail = {
  primario: string;
  textoPrimario: string;
  secundario: string;
  tintaSecundario: string;
  primarioSuave: string;
};

type PropsEmailTurno = {
  datos: DatosEmailTurno;
  colores: ColoresEmail;
  barberiaNombre: string;
  moneda: string;
};

const INFO_POR_ESTADO: Record<
  TipoEstadoEmail,
  { titulo: string; mensaje: string }
> = {
  CREADO: {
    titulo: "Turno Confirmado",
    mensaje: "Tu turno fue agendado con éxito. ¡Te esperamos!",
  },
  ACTUALIZADO: {
    titulo: "Turno Modificado",
    mensaje: "Los detalles de tu turno fueron actualizados.",
  },
  CANCELADO: {
    titulo: "Turno Cancelado",
    mensaje: "Tu turno fue cancelado. Podés agendar uno nuevo cuando quieras.",
  },
};

function formatearMonto(monto: number, moneda: string): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: moneda,
  }).format(monto);
}

function filaDetalle(etiqueta: string, valor: string): ReactNode {
  return (
    <Column style={columnaDetalle}>
      <Text style={estiloEtiqueta}>{etiqueta}</Text>
      <Text style={estiloValor}>{valor}</Text>
    </Column>
  );
}

function filaPago(
  etiqueta: string,
  valor: string,
  destacar: boolean,
): ReactNode {
  return (
    <Row style={{ marginBottom: "10px" }}>
      <Column>
        <Text style={{ ...estiloEtiqueta, fontSize: "13px" }}>{etiqueta}</Text>
      </Column>
      <Column align="right">
        <Text
          style={{
            fontSize: "15px",
            color: "#09090b",
            fontWeight: destacar ? 700 : 500,
          }}
        >
          {valor}
        </Text>
      </Column>
    </Row>
  );
}

export function EmailTurno({
  datos,
  colores,
  barberiaNombre,
  moneda,
}: PropsEmailTurno) {
  const info = INFO_POR_ESTADO[datos.estado];

  return (
    <Html lang="es">
      <Head />
      <Preview>{info.titulo}</Preview>
      <Body style={estiloBody}>
        <Container style={estiloContenedor}>
          <Section style={estiloTarjeta}>
            <Section
              style={{
                ...estiloCabecera,
                backgroundColor: colores.primario,
              }}
            >
              <Text style={{ ...estiloKicker, color: colores.textoPrimario }}>
                {barberiaNombre}
              </Text>
              <Heading style={{ ...estiloTitulo, color: colores.textoPrimario }}>
                {info.titulo}
              </Heading>
              <Text
                style={{
                  ...estiloMensaje,
                  color: colores.textoPrimario,
                  opacity: 0.85,
                }}
              >
                {info.mensaje}
              </Text>
            </Section>

            <Section style={estiloContenido}>
              <Section style={estiloDetalle}>
                <Row>
                  {filaDetalle("Día", datos.fechaSemana)}
                  {filaDetalle("Horario", datos.fechaHora)}
                </Row>
                <Row style={{ marginTop: "16px" }}>
                  {filaDetalle("Barbero", datos.barberoNombre)}
                  {filaDetalle("Servicio", datos.servicioNombre)}
                </Row>
              </Section>

              <Section
                style={{
                  ...estiloPago,
                  backgroundColor: colores.primarioSuave,
                }}
              >
                <Text
                  style={{
                    ...estiloEtiqueta,
                    color: colores.tintaSecundario,
                    marginBottom: "14px",
                  }}
                >
                  Resumen de pago
                </Text>
                {filaPago(
                  "Total del servicio",
                  formatearMonto(datos.precioTotal, moneda),
                  false,
                )}
                {filaPago(
                  "Seña pagada",
                  datos.señaPagada > 0
                    ? formatearMonto(datos.señaPagada, moneda)
                    : "Sin seña aún",
                  datos.señaPagada > 0,
                )}
                {filaPago(
                  "Saldo pendiente",
                  datos.saldoPendiente > 0
                    ? formatearMonto(datos.saldoPendiente, moneda)
                    : "Pago completo",
                  datos.saldoPendiente > 0,
                )}
              </Section>

              <Section style={{ marginTop: "24px" }}>
                <Text style={estiloSubtitulo}>Tus datos</Text>
                <Row>
                  {filaDetalle("Nombre y apellido", datos.clienteNombre)}
                </Row>
                {datos.clienteTelefono ? (
                  <Row style={{ marginTop: "16px" }}>
                    {filaDetalle("Teléfono", datos.clienteTelefono)}
                  </Row>
                ) : null}
              </Section>

              <Hr style={estiloSeparador} />
              <Text style={estiloPie}>
                Gracias por elegirnos. Si tenés dudas, ingresá a tu perfil o
                contactanos.
              </Text>
            </Section>

            <Section style={estiloFooter}>
              <Text style={estiloFooterTexto}>
                Atentamente, <strong>{barberiaNombre}</strong>
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const estiloBody: CSSProperties = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "32px 16px",
};

const estiloContenedor: CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
};

const estiloTarjeta: CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e4e4e7",
  borderRadius: "16px",
  overflow: "hidden",
};

const estiloCabecera: CSSProperties = {
  padding: "32px 32px 28px",
  textAlign: "center",
};

const estiloKicker: CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "2px",
  textTransform: "uppercase",
  margin: "0 0 8px",
};

const estiloTitulo: CSSProperties = {
  fontSize: "26px",
  fontWeight: 700,
  margin: "0 0 8px",
};

const estiloMensaje: CSSProperties = {
  fontSize: "15px",
  margin: 0,
  lineHeight: 1.5,
};

const estiloContenido: CSSProperties = {
  padding: "28px 32px",
};

const estiloDetalle: CSSProperties = {
  backgroundColor: "#fafafa",
  borderRadius: "12px",
  padding: "20px 24px",
};

const columnaDetalle: CSSProperties = {
  paddingRight: "16px",
};

const estiloEtiqueta: CSSProperties = {
  fontSize: "11px",
  color: "#71717a",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  margin: "0 0 4px",
};

const estiloValor: CSSProperties = {
  fontSize: "15px",
  color: "#09090b",
  fontWeight: 600,
  margin: 0,
  textTransform: "capitalize",
};

const estiloPago: CSSProperties = {
  borderRadius: "12px",
  padding: "18px 24px",
  marginTop: "20px",
};

const estiloSubtitulo: CSSProperties = {
  fontSize: "14px",
  color: "#18181b",
  fontWeight: 700,
  margin: "0 0 4px",
};

const estiloSeparador: CSSProperties = {
  borderColor: "#e4e4e7",
  margin: "24px 0 16px",
};

const estiloPie: CSSProperties = {
  fontSize: "13px",
  color: "#71717a",
  lineHeight: 1.5,
  margin: 0,
};

const estiloFooter: CSSProperties = {
  backgroundColor: "#fafafa",
  borderTop: "1px solid #e4e4e7",
  padding: "20px 32px",
  textAlign: "center",
};

const estiloFooterTexto: CSSProperties = {
  fontSize: "13px",
  color: "#71717a",
  margin: 0,
};
