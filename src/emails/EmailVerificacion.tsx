import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties } from "react";
import type { ColoresEmail } from "@/emails/EmailTurno";

type PropsEmailVerificacion = {
  nombre: string;
  urlVerificacion: string;
  barberiaNombre: string;
  colores: ColoresEmail;
};

export function EmailVerificacion({
  nombre,
  urlVerificacion,
  barberiaNombre,
  colores,
}: PropsEmailVerificacion) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Activá tu cuenta en {barberiaNombre}</Preview>
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
                Activá tu cuenta
              </Heading>
              <Text
                style={{
                  ...estiloMensaje,
                  color: colores.textoPrimario,
                  opacity: 0.85,
                }}
              >
                Estás a un clic de formar parte del club.
              </Text>
            </Section>

            <Section style={estiloContenido}>
              <Text style={estiloSubtitulo}>
                Hola {nombre}, ¡gracias por registrarte!
              </Text>
              <Text style={estiloParrafo}>
                Para comenzar a reservar tus turnos, confirmá que este correo
                te pertenece haciendo clic en el botón. La activación es
                inmediata.
              </Text>

              <Section style={estiloAccion}>
                <Button href={urlVerificacion} style={estiloBoton}>
                  Activar mi cuenta
                </Button>
              </Section>

              <Text style={estiloParrafo}>
                Si el botón no funciona, copiá y pegá este enlace en tu
                navegador:
              </Text>
              <Text style={estiloEnlace}>{urlVerificacion}</Text>

              <Hr style={estiloSeparador} />
              <Text style={estiloPie}>
                Este enlace no vence. Si no creaste una cuenta, podés ignorar
                este correo.
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

const estiloSubtitulo: CSSProperties = {
  fontSize: "16px",
  color: "#18181b",
  fontWeight: 700,
  margin: "0 0 8px",
};

const estiloParrafo: CSSProperties = {
  fontSize: "14px",
  color: "#52525b",
  lineHeight: 1.6,
  margin: "0 0 16px",
};

const estiloAccion: CSSProperties = {
  textAlign: "center",
  margin: "24px 0",
};

const estiloBoton: CSSProperties = {
  backgroundColor: "#d97706",
  borderRadius: "12px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  padding: "14px 28px",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const estiloEnlace: CSSProperties = {
  fontSize: "12px",
  color: "#71717a",
  wordBreak: "break-all",
  lineHeight: 1.5,
  margin: "0 0 16px",
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
