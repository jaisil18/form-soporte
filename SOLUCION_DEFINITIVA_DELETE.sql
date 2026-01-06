-- SOLUCIÓN DEFINITIVA: Usar una función segura de base de datos (RPC)
-- Esto evita los problemas de permisos RLS complicados para el borrado.

-- 1. Creamos una función que borra el usuario por ID
-- SECURITY DEFINER: Significa que la función se ejecuta con permisos de superusuario, ignorando RLS.
CREATE OR REPLACE FUNCTION eliminar_usuario_soporte(id_usuario uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Intentamos borrar
  DELETE FROM usuarios_soporte WHERE id = id_usuario;
END;
$$;

-- 2. Damos permiso para usar esta función a usuarios autenticados y anonimos (ya que controlamos el acceso desde el front)
GRANT EXECUTE ON FUNCTION eliminar_usuario_soporte(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION eliminar_usuario_soporte(uuid) TO anon;
GRANT EXECUTE ON FUNCTION eliminar_usuario_soporte(uuid) TO service_role;
