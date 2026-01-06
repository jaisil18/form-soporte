-- PASO 1: Corregir Permisos (RLS) - Esto soluciona el error "El usuario no existe o no tienes permisos"
-- Habilitamos o re-habilitamos RLS
ALTER TABLE usuarios_soporte ENABLE ROW LEVEL SECURITY;

-- Borramos la política anterior si existe para evitar conflictos
DROP POLICY IF EXISTS "Permitir eliminacion a autenticados" ON usuarios_soporte;

-- Creamos la política que permite borrar a cualquier usuario autenticado
CREATE POLICY "Permitir eliminacion a autenticados" 
ON usuarios_soporte FOR DELETE 
TO authenticated 
USING (true);


-- PASO 2: Corregir problema de "Enlace a otras tablas" (Foreign Keys)
-- Hacemos que si borras un usuario, sus incidencias se mantengan pero con usuario_id = NULL
-- (Para preservar el historial de incidencias)

-- Intentamos eliminar la restricción actual (el nombre suele ser incidencias_usuario_id_fkey)
ALTER TABLE incidencias 
DROP CONSTRAINT IF EXISTS incidencias_usuario_id_fkey;

-- Nos aseguramos de que la columna acepte valores nulos
ALTER TABLE incidencias 
ALTER COLUMN usuario_id DROP NOT NULL;

-- Volvemos a crear la relación pero con la regla "ON DELETE SET NULL"
ALTER TABLE incidencias
ADD CONSTRAINT incidencias_usuario_id_fkey
FOREIGN KEY (usuario_id)
REFERENCES usuarios_soporte(id)
ON DELETE SET NULL;
