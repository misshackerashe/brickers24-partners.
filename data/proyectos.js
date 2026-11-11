// Contenido de los proyectos (editable; no quemado en el HTML).
// Reglas: solo unidades terminadas, sin precios inventados, sin promesas de
// rentabilidad, "constructoras" (CBS Developments es el nombre propio).

export const PROYECTOS = {
  "arrecifes-del-sol": {
    slug: "arrecifes-del-sol",
    nombre: "Arrecifes del Sol",
    portada: "/proyectos/arrecifes-del-sol.webp",
    constructora: "CBS Developments",
    ubicacion: "Km 16, marginal de la Autopista de Las Américas, Santo Domingo Este, RD.",
    chip: "Unidades listas · entrega inmediata",
    descripcion:
      "Complejo residencial familiar que une reserva natural, viviendas y zona comercial en un solo entorno. Está en el corredor de la Autopista de Las Américas, en la ruta entre el centro de Santo Domingo y el Aeropuerto Internacional de Las Américas.",
    cifras: [
      { k: "Producto", v: "Apartamentos" },
      { k: "Tipologías", v: "3" },
      { k: "Metraje", v: "58–82 m²" },
      { k: "Habitaciones", v: "3" },
    ],
    tipologias: [
      { tipo: "Tipo A", m2: "82 m²", hab: "3", banos: "2", parqueo: "1" },
      { tipo: "Tipo B", m2: "72 m²", hab: "3", banos: "1", parqueo: "1" },
      { tipo: "Tipo C", m2: "58 m²", hab: "3", banos: "1", parqueo: "1" },
    ],
    tipologiasNota:
      "Todas incluyen sala-comedor, cocina, área de lavado y balcón; algunas unidades de primer y último nivel tienen terraza.",
    amenidades: [
      "Casa club", "Piscina", "Sport lounge", "Canchas deportivas", "Gimnasio",
      "Guardería", "Área de juegos", "Gazebos", "Senderos", "Reserva natural",
      "Zona comercial integrada",
    ],
    amenidadesNota: null,
    distancias: [
      { a: "Autopista Las Américas", d: "Acceso directo" },
      { a: "Aeropuerto Internacional de Las Américas", d: "Mismo corredor" },
    ],
  },

  "velero-at-punta-cana-i": {
    slug: "velero-at-punta-cana-i",
    nombre: "Velero at Punta Cana I",
    portada: "/proyectos/velero-at-punta-cana-i.jpg",
    constructora: "CBS Developments",
    ubicacion: "Frente al Boulevard Turístico del Este, Punta Cana, La Altagracia, RD.",
    chip: "Unidades listas · entrega inmediata",
    descripcion:
      "Primera etapa de una comunidad planificada de 40 hectáreas. Ya está entregada y habitada, con plaza comercial en operación (supermercado y farmacia). Tu cliente compra en una comunidad que ya funciona, a 5 minutos del Aeropuerto Internacional de Punta Cana.",
    cifras: [
      { k: "Comunidad", v: "40 ha" },
      { k: "Edificios", v: "98" },
      { k: "Apartamentos", v: "+2,900" },
      { k: "Aeropuerto", v: "5 min" },
    ],
    tipologias: [],
    tipologiasTexto:
      "Apartamentos en edificios con piscina, gazebo y jardines por manzana. Villas de 3 y 4 habitaciones, patio, habitación de servicio con baño y 2 parqueos.",
    tipologiasNota:
      "Las tipologías y metrajes exactos llegan con el inventario de CBS. No se usan los modelos de la Etapa 2.",
    amenidades: [
      "Casa club", "Piscina y restaurante", "Gimnasio y spa", "Cancha de pádel",
      "Cancha de basketball", "Zona de golf", "Cigar lounge", "Anfiteatro",
      "Áreas de juegos", "Parque central", "Piscina y gazebo por manzana", "Plaza comercial",
    ],
    amenidadesNota:
      "Algunas amenidades pertenecen a otras etapas; confirmar con Brickers24 cuáles corresponden a cada unidad.",
    distancias: [
      { a: "Aeropuerto PUJ", d: "5 min" },
      { a: "Blue Mall", d: "5 min" },
      { a: "Puntacana Village", d: "5 min" },
      { a: "Playa Cabeza de Toro", d: "15 min" },
    ],
  },
};

export function getProyecto(slug) {
  return PROYECTOS[slug] || null;
}

export const CONTACTO = {
  email: "proyectos@brickers24.com",
  whatsapp: "+1 (829) 367-3126",
  whatsappLink: "https://wa.me/18293673126",
};
