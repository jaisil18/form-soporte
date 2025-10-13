# 📋 Formulario de Registro de Incidencias - UCT

Sistema completo de gestión de incidencias tecnológicas para la Universidad César Vallejo, desarrollado con Next.js y Supabase.

## ✨ Características

### 🎯 Formulario Público
- **Multi-paso** con lógica condicional
- **Validación de horarios** (7:00 AM - 10:00 PM)
- **Selección de usuarios** sin autenticación
- **Lógica especial** para sedes (Mansiche/Colón sin pabellones)

### 🔐 Panel de Administración
- **Dashboard completo** con estadísticas
- **Gestión de usuarios** y administradores
- **Configuración del sistema** (sedes, pabellones, equipos)
- **Control de horarios** y validaciones
- **Reportes y exportación** (Excel, CSV, gráficos)
- **Autenticación segura** con Supabase Auth

### 📊 Funcionalidades Avanzadas
- **Exportación a Excel** con múltiples hojas
- **Gráficos interactivos** tipo Power BI
- **Filtros avanzados** por fecha, sede, tipo
- **Gestión de administradores** con roles
- **Políticas RLS** para seguridad

## 🚀 Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI**: Tailwind CSS, Lucide React
- **Exportación**: SheetJS (XLSX)
- **Gráficos**: Recharts
- **Despliegue**: Vercel

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/jaisil18/form-soporte.git
cd form-soporte

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

## 🔧 Configuración

### Variables de Entorno
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Base de Datos
1. Crear proyecto en Supabase
2. Ejecutar el script `supabase-setup.sql`
3. Configurar políticas RLS
4. Crear usuario administrador

## 📱 Uso

### Para Trabajadores
1. Acceder a la URL pública
2. Seleccionar nombre del dropdown
3. Completar formulario multi-paso
4. Enviar incidencia

### Para Administradores
1. Ir a `/admin/login`
2. Usar credenciales: `admin@soporte.com` / `password123`
3. Acceder al dashboard completo
4. Gestionar usuarios, configuraciones y reportes

## 🎨 Estructura del Proyecto

```
form-soporte/
├── app/                    # App Router de Next.js
│   ├── admin/             # Panel de administración
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── FormularioIncidencias.tsx
│   └── Paso2_DetallesIncidencia.tsx
├── lib/                   # Utilidades y configuración
│   ├── supabase.ts        # Cliente Supabase
│   ├── exportarExcel.ts   # Exportación Excel
│   └── validarHorario.ts  # Validación de horarios
├── types/                 # Tipos TypeScript
└── middleware.ts          # Middleware de autenticación
```

## 🔒 Seguridad

- **Autenticación**: Supabase Auth
- **Políticas RLS**: Row Level Security
- **Middleware**: Protección de rutas admin
- **Validación**: Cliente y servidor
- **CORS**: Configurado para producción

## 📈 Despliegue

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones completas de despliegue en Vercel.

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

- **Desarrollador**: Jaisil Azabache Calderón
- **Email**: jaisil.azabache@uct.edu.pe
- **Institución**: Universidad César Vallejo

## 🏆 Características Destacadas

- ✅ **Responsive Design** - Funciona en móviles y desktop
- ✅ **Tiempo Real** - Actualizaciones instantáneas
- ✅ **Exportación Avanzada** - Excel con múltiples hojas
- ✅ **Gráficos Dinámicos** - Visualizaciones tipo Power BI
- ✅ **Gestión Completa** - CRUD de usuarios y configuraciones
- ✅ **Seguridad Robusta** - Autenticación y autorización
- ✅ **Despliegue Automático** - CI/CD con Vercel