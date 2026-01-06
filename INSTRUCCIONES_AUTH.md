# Configuración de Autenticación y Reseteo de Contraseña

Para que el flujo de reseteo de contraseña funcione correctamente, necesitas configurar Supabase tanto para desarrollo como para producción:

## 1. Configuración de URLs en Supabase

1. Ve a tu proyecto en **Supabase Dashboard**.
2. Navega a **Authentication** -> **URL Configuration**.
3. En **Site URL**, usa tu URL de producción:
   - `https://form-soporte-7zmpfcgl9-codecraftteam.vercel.app`
4. En **Redirect URLs**, añade AMBAS URLs (la de desarrollo para probar y la de producción):
   - `http://localhost:6001/auth/callback`
   - `https://form-soporte-7zmpfcgl9-codecraftteam.vercel.app/auth/callback`
   
   *(Es importante añadir ambas para que funcione tanto cuando pruebas localmente como cuando esté desplegado)*

## 2. Configuración de Plantilla de Correo

1. Navega a **Authentication** -> **Email Templates**.
2. Selecciona **Reset Password**.
3. Asegúrate de que el enlace en el cuerpo del correo use la variable `{{ .ConfirmationURL }}`.
   - Ejemplo: `<a href="{{ .ConfirmationURL }}">Reset Password</a>`

Esto asegurará que cuando el usuario haga clic en el correo, sea dirigido a tu ruta de callback, la cual iniciará sesión automáticamente y lo redirigirá a la página de actualización de contraseña.

## 3. Configuración en Vercel (Variables de Entorno)

En tu proyecto de Vercel, asegúrate de tener configuradas las variables de entorno de Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

El código de la aplicación usa `window.location.origin` para detectar automáticamente si está en localhost o en Vercel, por lo que **no necesitas cambiar nada en el código**.

## Flujo Implementado

1. **Solicitud**: El usuario ingresa su email en `/admin/login/forgot-password`.
2. **Correo**: Supabase envía un correo con un enlace mágico.
3. **Callback**: Al hacer clic, el usuario llega a `/auth/callback` (ya sea en localhost o en vercel, dependiendo de dónde se solicitó).
   - Esta ruta intercambia el código por una sesión válida.
   - Redirige al usuario a `/admin/update-password`.
4. **Actualización**: El usuario ingresa su nueva contraseña en `/admin/update-password` (ya autenticado).
5. **Finalización**: Se actualiza la contraseña y se redirige al login.
