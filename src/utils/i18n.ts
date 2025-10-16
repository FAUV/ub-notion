
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
const resources = { es: { translation: {
  app: { title:'ub-notion', dashboard:'Panel', projects:'Proyectos', tasks:'Tareas', sprints:'Sprints', studies:'Estudios', content:'Contenido', calendar:'Calendario', search:'Buscar...' },
  views: { list:'Lista', board:'Tablero', timeline:'Cronograma', calendar:'Calendario', gallery:'Galería', rice:'RICE' }
}}}
i18n.use(initReactI18next).init({ resources, lng:'es', fallbackLng:'es', interpolation:{ escapeValue:false } })
export default i18n
