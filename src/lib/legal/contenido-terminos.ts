import type { DocumentoLegal } from "@/lib/legal/tipos";

/* Borrador redactado a partir del funcionamiento real de la aplicación.
   NO está validado jurídicamente: requiere revisión profesional. */

export const DOCUMENTO_TERMINOS: DocumentoLegal = {
  clave: "terminos",
  slug: "terminos",
  titulo: "Términos y Condiciones de Uso",
  descripcion:
    "Reglas aplicables al uso del sitio y del sistema de reserva de turnos de la barbería.",
  version: "1.0.0",
  vigenteDesde: "2026-10-16",
  requiereAceptacion: true,
  pendientes: [
    "Identificación completa del titular o responsable del sitio (razón social o nombre, CUIT y domicilio): PENDIENTE DE DEFINICIÓN.",
    "Ley aplicable y jurisdicción competente: PENDIENTE DE DEFINICIÓN.",
    "Procedimiento, aviso previo y plazos para modificar los Términos: PENDIENTE DE DEFINICIÓN.",
    "Edad mínima para crear una cuenta: PENDIENTE DE DEFINICIÓN.",
  ],
  secciones: [
    {
      titulo: "1. Objeto y aceptación",
      parrafos: [
        "Estos Términos y Condiciones de Uso (los «Términos») regulan el acceso y uso del sitio y del sistema de reserva de turnos de la barbería (el «Servicio»).",
        "El uso del Servicio requiere aceptar estos Términos y la Política de Privacidad. La aceptación se solicita de forma expresa al crear una cuenta con correo electrónico y contraseña o al iniciar el registro con una cuenta de Google, y se registra junto con la versión aceptada y la fecha y hora.",
        "Si no aceptás estos documentos, no es posible crear una cuenta ni utilizar las funciones que requieren una cuenta.",
      ],
    },
    {
      titulo: "2. Descripción del Servicio",
      parrafos: [
        "El Servicio permite crear una cuenta, consultar los servicios y la disponibilidad de los barberos, reservar turnos y gestionar las reservas propias.",
        "También ofrece herramientas de administración de turnos, servicios, barberos y horarios, disponibles únicamente para los perfiles autorizados según su rol.",
      ],
    },
    {
      titulo: "3. Cuenta de usuario",
      parrafos: [
        "Para reservar turnos se requiere una cuenta, creada con nombre, correo electrónico y contraseña o mediante el inicio de sesión con Google.",
        "El usuario debe brindar datos veraces y mantenerlos actualizados, y es responsable del uso que se haga con su cuenta.",
        "Las credenciales de acceso son personales e intransferibles. El usuario es responsable de su custodia y de las consecuencias de su uso por terceros.",
        "La cuenta creada con correo y contraseña requiere verificar el correo electrónico antes de poder iniciar sesión.",
      ],
    },
    {
      titulo: "4. Uso aceptable",
      parrafos: [
        "El usuario se compromete a utilizar el Servicio de forma lícita, conforme a la normativa aplicable y a estos Términos.",
        "No está permitido interferir con el funcionamiento del Servicio, intentar acceder a cuentas ajenas, ni usar el Servicio para fines fraudulentos o que perjudiquen a la barbería o a terceros.",
      ],
    },
    {
      titulo: "5. Reservas, señas y pagos",
      parrafos: [
        "Las condiciones aplicables a las reservas, las señas, los medios de pago y las cancelaciones se describen en las Condiciones de pagos, señas y cancelaciones, que complementan estos Términos.",
      ],
    },
    {
      titulo: "6. Disponibilidad del Servicio",
      parrafos: [
        "La barbería no garantiza la disponibilidad continua e ininterrumpida del Servicio ni la ausencia de errores. El Servicio puede suspenderse por tareas de mantenimiento, actualizaciones o causas ajenas a su control.",
      ],
    },
    {
      titulo: "7. Responsabilidad",
      parrafos: [
        "El Servicio se ofrece «tal cual» y según disponibilidad. En la medida permitida por la normativa aplicable, la barbería no será responsable por daños derivados de la imposibilidad de uso, de interrupciones o de datos ingresados de forma incorrecta por el usuario.",
        "El usuario es responsable de verificar la exactitud de los datos que ingresa al reservar un turno.",
      ],
    },
    {
      titulo: "8. Modificaciones y versionado",
      parrafos: [
        "Estos Términos pueden actualizarse. Cada versión se identifica con un número y una fecha de vigencia, y su historial se conserva.",
        "Cuando una modificación lo justifique, podrá solicitarse una nueva aceptación de la versión vigente antes de continuar utilizando determinadas funciones.",
      ],
    },
    {
      titulo: "9. Contacto",
      parrafos: [
        "Para consultas sobre estos Términos, utilizá los datos de contacto del responsable indicados al inicio de esta página.",
      ],
    },
  ],
};
