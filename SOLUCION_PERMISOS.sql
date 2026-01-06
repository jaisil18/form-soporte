-- Políticas de seguridad (RLS) para la tabla usuarios_soporte

-- 1. Habilitar RLS en la tabla (si no está habilitado)
ALTER TABLE usuarios_soporte ENABLE ROW LEVEL SECURITY;

-- 2. Permitir lectura a usuarios autenticados y anónimos (para el formulario público)
CREATE POLICY "Permitir lectura publica de usuarios soporte activos" 
ON usuarios_soporte FOR SELECT 
USING (true);

-- 3. Permitir inserción solo a usuarios autenticados
CREATE POLICY "Permitir insercion a autenticados" 
ON usuarios_soporte FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 4. Permitir actualización solo a usuarios autenticados
CREATE POLICY "Permitir actualizacion a autenticados" 
ON usuarios_soporte FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 5. Permitir eliminación solo a usuarios autenticados
CREATE POLICY "Permitir eliminacion a autenticados" 
ON usuarios_soporte FOR DELETE 
TO authenticated 
USING (true);
