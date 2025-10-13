# Sistema de Registro de Incidencias - Universidad Católica de Trujillo (UCT)

## 📋 Descripción

Sistema web completo para el registro y gestión de incidencias en la Universidad Católica de Trujillo. Permite a los auxiliares y asistentes de soporte registrar incidencias de manera estructurada y a los administradores gestionar, analizar y exportar los datos.

## ✨ Características Principales

### 🎯 Formulario Público
- **Validación de horario**: Solo disponible de 7:00 AM a 10:00 PM (hora Perú)
- **Lógica condicional**: Campos dinámicos según el tipo de actividad seleccionado
- **Selección de usuario**: Lista desplegable con los 5 trabajadores autorizados
- **Diseño responsive**: Optimizado para dispositivos móviles y escritorio

### 🔐 Panel de Administración
- **Autenticación segura**: Login con Supabase Auth
- **Dashboard completo**: Estadísticas y métricas en tiempo real
- **Gestión de reportes**: Tablas, filtros y búsqueda avanzada
- **Configuración flexible**: Edición de todas las opciones del formulario
- **Gestión de usuarios**: CRUD completo de usuarios de soporte
- **Control de horarios**: Configuración de disponibilidad del formulario

### 📊 Reportes y Análisis
- **Exportación a Excel**: Múltiples formatos y hojas de trabajo
- **Exportación a CSV**: Para análisis en herramientas externas
- **Estadísticas detalladas**: Gráficos y métricas por sede, tipo, tiempo
- **Filtros avanzados**: Por fecha, sede, usuario, tipo de actividad

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Estilos**: Tailwind CSS
- **Gráficos**: Recharts (preparado para implementación)
- **Exportación**: xlsx, date-fns-tz
- **Iconos**: Lucide React

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd form-soporte
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear archivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```
   
   **Importante**: Debes obtener estos valores de tu dashboard de Supabase en Settings > API.

4. **Configurar la base de datos**
   Las migraciones ya están aplicadas en Supabase. Las tablas incluyen:
   - `usuarios_soporte`: Lista de trabajadores autorizados
   - `incidencias`: Registro de todas las incidencias
   - `configuracion_sistema`: Configuraciones del sistema

5. **Ejecutar el proyecto**
   ```bash
   npm run dev
   ```

6. **Acceder a la aplicación**
   - Formulario público: `http://localhost:6001`
   - Panel admin: `http://localhost:6001/admin/login`

## 📁 Estructura del Proyecto

```
├── app/
│   ├── page.tsx                    # Página principal del formulario
│   ├── layout.tsx                  # Layout principal
│   ├── admin/                      # Panel de administración
│   │   ├── page.tsx               # Dashboard principal
│   │   ├── login/page.tsx         # Login de administradores
│   │   ├── reportes/page.tsx      # Módulo de reportes
│   │   ├── configuracion/page.tsx # Configuración del formulario
│   │   ├── horarios/page.tsx      # Gestión de horarios
│   │   ├── usuarios/page.tsx      # Gestión de usuarios
│   │   └── exportacion/page.tsx   # Exportación de datos
├── components/
│   ├── FormularioIncidencias.tsx  # Componente principal del formulario
│   ├── Paso1_SeleccionUsuario.tsx # Paso 1: Selección de usuario
│   └── Paso2_DetallesIncidencia.tsx # Paso 2: Detalles de incidencia
├── lib/
│   ├── supabase.ts                # Cliente y funciones de Supabase
│   ├── validarHorario.ts          # Validación de horarios
│   ├── exportarExcel.ts           # Funciones de exportación
│   └── utils.ts                   # Utilidades generales
├── types/
│   └── index.ts                   # Definiciones de tipos TypeScript
└── middleware.ts                  # Middleware de autenticación
```

## 🎨 Diseño y UX

### Colores Institucionales UCT
- **Azul principal**: `#1e1b4b` (azul marino)
- **Azul secundario**: `#3b82f6` (azul estándar)
- **Amarillo**: `#fbbf24` (para acentos)
- **Grises**: Para textos y fondos

### Características de UX
- **Responsive design**: Adaptable a todos los dispositivos
- **Feedback visual**: Estados de carga, confirmaciones, errores
- **Navegación intuitiva**: Breadcrumbs y indicadores de progreso
- **Accesibilidad**: Contraste adecuado y navegación por teclado

## 📊 Funcionalidades del Formulario

### Lógica Condicional Implementada

1. **Selección de Usuario**: Lista desplegable con los 5 trabajadores
2. **Tipo de Actividad**: 
   - Si es "Mudanza", "Visita técnica/campo" o "Soporte evento" → Salta directamente al tiempo aproximado
   - Si es "Incidencia" → Muestra campos adicionales
3. **Ambiente**: Opciones según el pabellón seleccionado
4. **Tipo de Incidencia**: Solo para actividades tipo "Incidencia"
5. **Equipo Afectado**: Opciones dinámicas según el tipo de incidencia
6. **Tiempo Aproximado**: Siempre visible, campo obligatorio

### Validaciones
- **Horario**: Solo disponible de 7:00 AM a 10:00 PM (configurable)
- **Campos obligatorios**: Validación en tiempo real
- **Formato de datos**: Validación de tipos y formatos

## 🔧 Configuración del Sistema

### Gestión de Usuarios
- **5 usuarios iniciales** predefinidos:
  - JAISIL AZABACHE CALDERON
  - JHONNATHAN MANUEL FLORES LEYVA
  - YOSVIN EDILSON PAREDES VALVERDE
  - GIANELA JOVANNA OLAYA TANTALEAN
  - LUIS DONALD SANCHEZ ALAS

### Configuraciones Editables
- **Sedes**: Moche, Mansiche, Colón
- **Pabellones**: Por sede
- **Tipos de Actividad**: Incidencia, Mudanza, Visita técnica/campo, Soporte evento
- **Ambientes**: Por pabellón
- **Tipos de Incidencia**: Hardware, Software, Red/Conectividad, etc.
- **Equipos**: Por tipo de incidencia
- **Tiempos Aproximados**: 5 min, 10 min, 15 min, 20 min, Mayor a 20 min

### Horarios
- **Configuración flexible**: Horario de inicio y fin personalizable
- **Zona horaria**: América/Lima (Perú)
- **Validación automática**: En cada acceso al formulario

## 📈 Reportes y Exportación

### Tipos de Exportación
1. **Excel con Incidencias**: Datos completos con filtros aplicables
2. **Excel con Estadísticas**: Gráficos y análisis para Power BI
3. **CSV**: Para análisis en herramientas externas

### Filtros Disponibles
- **Rango de fechas**: Desde/hasta
- **Sede**: Filtro por ubicación
- **Tipo de actividad**: Filtro por categoría
- **Usuario**: Filtro por trabajador

### Métricas Incluidas
- Total de incidencias
- Incidencias por sede
- Tipos de actividad más comunes
- Equipos más afectados
- Tiempo promedio por actividad
- Tendencia temporal (últimos 30 días)

## 🔐 Seguridad

### Autenticación
- **Panel admin**: Requiere login con Supabase Auth
- **Formulario público**: Sin autenticación (solo selección de usuario)
- **Middleware**: Protección de rutas administrativas

### Base de Datos
- **Row Level Security (RLS)**: Políticas de seguridad implementadas
- **Validación de datos**: Tipos y constraints en la base de datos
- **Backup automático**: Supabase maneja backups automáticamente

## 🚀 Despliegue

### Variables de Entorno para Producción
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_produccion
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_de_produccion
```

### Plataformas Recomendadas
- **Vercel**: Para despliegue de Next.js (recomendado)
- **Netlify**: Alternativa para hosting estático
- **Supabase**: Para base de datos y autenticación

## 📞 Soporte y Mantenimiento

### Logs y Monitoreo
- **Supabase Dashboard**: Monitoreo de base de datos
- **Console logs**: Para debugging en desarrollo
- **Error boundaries**: Manejo de errores en producción

### Actualizaciones
- **Configuración**: Editable desde el panel admin
- **Usuarios**: Gestión completa desde la interfaz
- **Horarios**: Modificables sin reiniciar el sistema

## 📝 Notas de Desarrollo

### Funcionalidades Implementadas ✅
- [x] Formulario público con lógica condicional
- [x] Validación de horarios (zona horaria Perú)
- [x] Panel de administración completo
- [x] Autenticación con Supabase
- [x] Gestión de usuarios de soporte
- [x] Configuración flexible del formulario
- [x] Exportación a Excel y CSV
- [x] Reportes con filtros avanzados
- [x] Diseño responsive
- [x] Middleware de autenticación

### Funcionalidades Futuras 🔮
- [ ] Gráficos interactivos con Recharts
- [ ] Notificaciones por email
- [ ] API REST para integraciones
- [ ] App móvil nativa
- [ ] Dashboard en tiempo real
- [ ] Sistema de tickets
- [ ] Integración con Power BI

## 📄 Licencia

Este proyecto fue desarrollado específicamente para la Universidad Católica de Trujillo. Todos los derechos reservados.

---

**Desarrollado para la Universidad Católica de Trujillo (UCT)**  
*Sistema de Registro de Incidencias - Versión 1.0*#   f o r m - s o p o r t e  
 