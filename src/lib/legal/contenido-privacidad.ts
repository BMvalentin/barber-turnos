import type { DocumentoLegal } from "@/lib/legal/tipos";

/* Borrador redactado a partir del funcionamiento real de la aplicación.
   NO está validado jurídicamente: requiere revisión profesional. */

export const DOCUMENTO_PRIVACIDAD: DocumentoLegal = {
  clave: "privacidad",
  slug: "privacidad",
  titulo: "Política de Privacidad y Tratamiento de Datos Personales",
  descripcion:
    "Qué datos personales se recopilan, con qué finalidad y cómo ejercer los derechos sobre ellos.",
  version: "1.0.0",
  vigenteDesde: "2026-10-16",
  requiereAceptacion: true,
  pendientes: [
    "Identificación y datos de contacto del responsable del tratamiento (razón social o nombre, CUIT, domicilio y correo): PENDIENTE DE DEFINICIÓN.",
    "Consentimiento y condiciones de la inscripción de las bases de datos ante la autoridad de aplicación, si correspondiera: PENDIENTE DE DEFINICIÓN.",
    "Plazos concretos de conservación de los datos: PENDIENTE DE DEFINICIÓN.",
    "Detalle de transferencias internacionales de datos derivadas del alojamiento y los proveedores utilizados: PENDIENTE DE DEFINICIÓN / REQUIERE VALIDACIÓN JURÍDICA.",
    "Procedimiento formal y plazos para atender solicitudes de acceso, rectificación, actualización o supresión: PENDIENTE DE DEFINICIÓN.",
    "Tratamiento de datos de menores de edad y edad mínima: PENDIENTE DE DEFINICIÓN.",
  ],
  secciones: [
    {
      titulo: "1. Alcance",
      parrafos: [
        "Esta Política describe cómo se tratan los datos personales de las personas que usan el sitio y el sistema de reserva de turnos de la barbería.",
        "El responsable del tratamiento es el titular del sitio, cuyos datos de contacto se indican al inicio de esta página cuando están disponibles. Los datos que no estén confirmados figuran expresamente como PENDIENTE DE DEFINICIÓN.",
      ],
    },
    {
      titulo: "2. Datos que se recopilan",
      parrafos: [
        "Datos de la cuenta: nombre y correo electrónico; contraseña almacenada de forma cifrada (no se guarda en texto plano) cuando la cuenta se crea con correo y contraseña.",
        "Datos de contacto y perfil: número de teléfono y, si se inicia sesión con Google, la imagen de perfil y el correo asociados a esa cuenta.",
        "Datos de reservas: historial de turnos y los datos de contacto que el usuario ingresa al reservar para sí mismo o para terceros (por ejemplo, nombre, apellido, teléfono y correo del cliente del turno).",
        "Datos de pago: referencias e identificadores de las operaciones procesadas a través de Mercado Pago y los datos de transferencias registradas. La aplicación no almacena los datos completos de tarjetas, que son gestionados por el proveedor de pagos.",
        "Datos técnicos mínimos necesarios para el funcionamiento y la seguridad de la sesión, según se detalla en la Política de Cookies.",
      ],
    },
    {
      titulo: "3. Finalidades del tratamiento",
      parrafos: [
        "Crear y gestionar la cuenta y permitir el inicio de sesión.",
        "Gestionar la reserva, confirmación, reprogramación y cancelación de turnos.",
        "Procesar señas, pagos y transferencias, y comunicar el estado de las operaciones.",
        "Enviar correos operativos necesarios para el Servicio (por ejemplo, verificación de correo, recuperación de contraseña y recordatorios de turnos).",
        "Mantener la seguridad del Servicio y prevenir usos indebidos.",
      ],
    },
    {
      titulo: "4. Datos obligatorios y opcionales",
      parrafos: [
        "El nombre y el correo electrónico son necesarios para crear la cuenta. La contraseña es necesaria cuando la cuenta se crea con correo y contraseña.",
        "El teléfono es necesario para reservar turnos como cliente. La imagen de perfil solo se incorpora si se inicia sesión con Google.",
        "El usuario puede decidir no iniciar sesión con Google y crear una cuenta con correo y contraseña.",
      ],
    },
    {
      titulo: "5. Proveedores externos",
      parrafos: [
        "El Servicio se apoya en proveedores que pueden tratar datos por cuenta de la barbería: Google (inicio de sesión con Google y visualización de mapas embebidos), Resend (envío de correos), Cloudinary (alojamiento de imágenes) y Mercado Pago (procesamiento de pagos).",
        "El alojamiento de la aplicación puede estar ubicado fuera del país, lo que podría implicar transferencia internacional de datos. El detalle y su tratamiento figuran como PENDIENTE DE DEFINICIÓN / REQUIERE VALIDACIÓN JURÍDICA.",
        "Cada proveedor aplica sus propias condiciones y políticas, que el usuario puede consultar en sus sitios.",
      ],
    },
    {
      titulo: "6. Conservación de los datos",
      parrafos: [
        "Los datos se conservan mientras la cuenta esté activa y durante el tiempo necesario para cumplir con las finalidades descritas y con eventuales obligaciones legales.",
        "Los plazos concretos de conservación figuran como PENDIENTE DE DEFINICIÓN.",
      ],
    },
    {
      titulo: "7. Derechos de las personas titulares de los datos",
      parrafos: [
        "La persona titular de los datos puede solicitar el acceso, la rectificación, la actualización y la supresión de sus datos personales, en los términos de la normativa aplicable.",
        "Para ejercer estos derechos, podés utilizar los datos de contacto del responsable indicados al inicio de esta página. Si ese contacto no estuviera disponible, se encuentra PENDIENTE DE DEFINICIÓN.",
      ],
    },
    {
      titulo: "8. Seguridad",
      parrafos: [
        "Se aplican medidas técnicas y organizativas razonables para proteger los datos, incluido el almacenamiento cifrado de las contraseñas y controles de acceso. Ninguna medida garantiza una seguridad absoluta.",
      ],
    },
    {
      titulo: "9. Cookies y tecnologías similares",
      parrafos: [
        "El uso de cookies se describe en la Política de Cookies, que forma parte de esta Política.",
      ],
    },
    {
      titulo: "10. Menores de edad",
      parrafos: [
        "La edad mínima para crear una cuenta y las condiciones aplicables al tratamiento de datos de menores figuran como PENDIENTE DE DEFINICIÓN.",
      ],
    },
    {
      titulo: "11. Cambios a esta Política",
      parrafos: [
        "Esta Política puede actualizarse. Cada versión se identifica con un número y una fecha de vigencia, y su historial se conserva.",
      ],
    },
  ],
};
