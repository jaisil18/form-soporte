# 🚀 Guía de Despliegue - Formulario de Soporte

## 📋 Pasos para Desplegar en Vercel

### 1. Conectar GitHub con Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en **"New Project"**
4. Importa el repositorio: `jaisil18/form-soporte`

### 2. Configurar Variables de Entorno

En el dashboard de Vercel, ve a **Settings > Environment Variables** y agrega:

```
NEXT_PUBLIC_SUPABASE_URL = https://flmudobluiyzllvgrwhs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbXVkb2JsdWl5emxsdmdyd2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjEzMzcsImV4cCI6MjA3NTkzNzMzN30.UnoJlCpU4xZgFFCTmvEYHhf9AmIZ2WwgaoemWVjpT4o
```

**⚠️ IMPORTANTE**: 
- Marca ambas variables para **Production**, **Preview** y **Development**
- Sin estas variables, el build fallará con el error "supabaseUrl is required"
- El proyecto ya incluye valores por defecto como respaldo

### 3. Configuración de Build

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Desplegar

1. Haz clic en **"Deploy"**
2. Vercel construirá y desplegará automáticamente
3. Obtendrás una URL como: `https://form-soporte-xxx.vercel.app`

## 🔧 Configuración de Supabase

### Base de Datos
Ejecuta el script SQL en Supabase Dashboard:
```sql
-- Ver archivo supabase-setup.sql
```

### Credenciales de Administrador
- **Email**: admin@soporte.com
- **Contraseña**: password123

## 📱 URLs del Sistema

### Público
- **Formulario**: `https://tu-dominio.vercel.app/`
- **Horario**: 7:00 AM - 10:00 PM (Perú)

### Administración
- **Login**: `https://tu-dominio.vercel.app/admin/login`
- **Dashboard**: `https://tu-dominio.vercel.app/admin`

## 🔄 Despliegue Automático

Cada vez que hagas push a la rama `main`, Vercel desplegará automáticamente los cambios.

## 🛠️ Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Verificar build
npm run start
```

## 📞 Soporte

Para problemas de despliegue, verifica:
1. Variables de entorno configuradas
2. Build exitoso en Vercel
3. Base de datos Supabase configurada
4. Credenciales de administrador creadas
