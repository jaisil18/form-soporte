-- ========================================
-- SCRIPT DE CONFIGURACIÓN COMPLETA PARA SUPABASE
-- Formulario de Registro de Incidencias
-- ========================================

-- 1. CREAR TABLA DE USUARIOS DE SOPORTE
-- ========================================
CREATE TABLE IF NOT EXISTS usuarios_soporte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREAR TABLA DE INCIDENCIAS
-- ========================================
CREATE TABLE IF NOT EXISTS incidencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios_soporte(id),
  usuario_nombre TEXT,
  usuario_email TEXT,
  sede TEXT NOT NULL,
  pabellon TEXT,
  tipo_actividad TEXT NOT NULL,
  ambiente_incidencia TEXT,
  tipo_incidencia TEXT,
  equipo_afectado TEXT,
  tiempo_aproximado TEXT NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  prioridad TEXT DEFAULT 'media',
  fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREAR TABLA DE CONFIGURACIÓN DEL SISTEMA
-- ========================================
CREATE TABLE IF NOT EXISTS configuracion_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT UNIQUE NOT NULL,
  valor JSONB NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREAR TABLA DE USUARIOS ADMINISTRADORES
-- ========================================
CREATE TABLE IF NOT EXISTS usuarios_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nombre_completo TEXT NOT NULL,
  rol TEXT DEFAULT 'admin',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INSERTAR CONFIGURACIONES INICIALES
-- ========================================
INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
  ('sedes', '["Moche", "Mansiche", "Colón"]', 'Lista de sedes disponibles'),
  ('pabellones', '{"Moche": ["P. Principal", "P. Santo Toribio", "P. San Francisco", "Explanada"]}', 'Pabellones por sede (solo Moche tiene pabellones)'),
  ('tipos_actividad', '["Incidencia", "Mudanza", "Visita técnica/campo", "Soporte evento"]', 'Tipos de actividad disponibles'),
  ('ambientes', '{"P. Principal": ["Sala de Reuniones", "Administrativo"], "P. Santo Toribio": ["Aula/Laboratorio", "Administrativo"], "P. San Francisco": ["Aula/Laboratorio", "Administrativo"], "Explanada": ["Aula/Laboratorio", "Administrativo"]}', 'Ambientes por pabellón'),
  ('tipos_incidencia', '["Hardware", "Software", "Red / Conectividad", "Acceso / Seguridad", "Impresión / Escaneo", "Infraestructura"]', 'Tipos de incidencia disponibles'),
  ('equipos', '{"Hardware": ["Proyector", "Monitor", "PC", "Laptop", "Impresora", "Mouse", "Teclado", "Cámara", "Audífonos", "Pizarra"], "Software": ["Office", "Programa", "Plataforma (ERP/Blackboard)", "Licencia de cuenta"], "Red / Conectividad": ["Conectividad", "Internet", "Wifi", "Antena Wifi"], "Acceso / Seguridad": ["Plataforma (ERP/Blackboard)", "Licencia de cuenta"], "Impresión / Escaneo": ["Impresora", "Supresor", "Extensión"], "Infraestructura": ["Pizarra", "Plumones", "Extensión", "Supresor"]}', 'Equipos por tipo de incidencia'),
  ('tiempos_aproximados', '["5 minutos", "10 minutos", "15 minutos", "20 minutos", "Mayor a 20 minutos"]', 'Tiempos aproximados disponibles'),
  ('horario_formulario', '{"habilitado": true, "hora_inicio": 7, "minuto_inicio": 0, "hora_fin": 22, "minuto_fin": 0}', 'Configuración de horario permitido para el formulario público')
ON CONFLICT (clave) DO UPDATE SET 
  valor = EXCLUDED.valor, 
  descripcion = EXCLUDED.descripcion, 
  updated_at = NOW();

-- 6. INSERTAR USUARIOS DE SOPORTE DE EJEMPLO
-- ========================================
INSERT INTO usuarios_soporte (nombre_completo, email) VALUES
  ('JAISIL AZABACHE CALDERON', 'jaisil.azabache@uct.edu.pe'),
  ('JHONNATHAN MANUEL FLORES LEYVA', 'jhonnathan.flores@uct.edu.pe'),
  ('YOSVIN EDILSON PAREDES VALVERDE', 'yosvin.paredes@uct.edu.pe'),
  ('GIANELA JOVANNA OLAYA TANTALEAN', 'gianela.olaya@uct.edu.pe'),
  ('LUIS DONALD SANCHEZ ALAS', 'luis.sanchez@uct.edu.pe')
ON CONFLICT (email) DO NOTHING;

-- 7. INSERTAR USUARIO ADMINISTRADOR PRINCIPAL
-- ========================================
-- NOTA: Esta es una implementación básica. En producción, usa Supabase Auth
INSERT INTO usuarios_admin (email, password_hash, nombre_completo, rol) VALUES
  ('admin@soporte.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador del Sistema', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 8. INSERTAR ALGUNAS INCIDENCIAS DE EJEMPLO
-- ========================================
INSERT INTO incidencias (
  usuario_id,
  usuario_nombre,
  usuario_email,
  sede,
  pabellon,
  tipo_actividad,
  ambiente_incidencia,
  tipo_incidencia,
  equipo_afectado,
  tiempo_aproximado,
  fecha_hora,
  estado,
  prioridad
) VALUES
  (
    (SELECT id FROM usuarios_soporte WHERE email = 'jaisil.azabache@uct.edu.pe' LIMIT 1),
    'JAISIL AZABACHE CALDERON',
    'jaisil.azabache@uct.edu.pe',
    'Moche',
    'P. Principal',
    'Incidencia',
    'Sala de Reuniones',
    'Hardware',
    'Proyector',
    '15 minutos',
    NOW(),
    'pendiente',
    'media'
  ),
  (
    (SELECT id FROM usuarios_soporte WHERE email = 'jhonnathan.flores@uct.edu.pe' LIMIT 1),
    'JHONNATHAN MANUEL FLORES LEYVA',
    'jhonnathan.flores@uct.edu.pe',
    'Mansiche',
    NULL,
    'Mudanza',
    NULL,
    NULL,
    NULL,
    '30 minutos',
    NOW() - INTERVAL '1 hour',
    'en progreso',
    'alta'
  )
ON CONFLICT DO NOTHING;

-- 9. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================
CREATE INDEX IF NOT EXISTS idx_incidencias_usuario_id ON incidencias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_incidencias_sede ON incidencias(sede);
CREATE INDEX IF NOT EXISTS idx_incidencias_tipo_actividad ON incidencias(tipo_actividad);
CREATE INDEX IF NOT EXISTS idx_incidencias_estado ON incidencias(estado);
CREATE INDEX IF NOT EXISTS idx_incidencias_fecha_hora ON incidencias(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_usuarios_soporte_email ON usuarios_soporte(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_email ON usuarios_admin(email);

-- 10. CREAR FUNCIÓN PARA ACTUALIZAR TIMESTAMP
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. CREAR TRIGGERS PARA ACTUALIZAR TIMESTAMP
-- ========================================
CREATE TRIGGER update_incidencias_updated_at 
  BEFORE UPDATE ON incidencias 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_admin_updated_at 
  BEFORE UPDATE ON usuarios_admin 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. CREAR POLÍTICAS RLS (Row Level Security)
-- ========================================
-- Habilitar RLS en las tablas
ALTER TABLE usuarios_soporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_admin ENABLE ROW LEVEL SECURITY;

-- Política para usuarios_soporte (lectura pública)
CREATE POLICY "usuarios_soporte_select" ON usuarios_soporte
  FOR SELECT USING (activo = true);

-- Política para incidencias (lectura pública, inserción pública)
CREATE POLICY "incidencias_select" ON incidencias
  FOR SELECT USING (true);

CREATE POLICY "incidencias_insert" ON incidencias
  FOR INSERT WITH CHECK (true);

-- Política para configuracion_sistema (lectura pública)
CREATE POLICY "configuracion_sistema_select" ON configuracion_sistema
  FOR SELECT USING (true);

-- Política para usuarios_admin (solo administradores)
CREATE POLICY "usuarios_admin_all" ON usuarios_admin
  FOR ALL USING (email = current_setting('app.current_user_email', true));

-- 13. CREAR VISTA PARA REPORTES
-- ========================================
CREATE OR REPLACE VIEW vista_incidencias_completas AS
SELECT 
  i.id,
  i.usuario_nombre,
  i.usuario_email,
  i.sede,
  i.pabellon,
  i.tipo_actividad,
  i.ambiente_incidencia,
  i.tipo_incidencia,
  i.equipo_afectado,
  i.tiempo_aproximado,
  i.estado,
  i.prioridad,
  i.fecha_hora,
  i.created_at,
  i.updated_at,
  us.nombre_completo as usuario_soporte_nombre,
  us.email as usuario_soporte_email
FROM incidencias i
LEFT JOIN usuarios_soporte us ON i.usuario_id = us.id;

-- 14. INSERTAR DATOS DE CONFIGURACIÓN ADICIONALES
-- ========================================
INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
  ('version_sistema', '"1.0.0"', 'Versión actual del sistema'),
  ('mantenimiento', 'false', 'Indica si el sistema está en mantenimiento'),
  ('notificaciones_email', 'true', 'Habilitar notificaciones por email'),
  ('backup_automatico', 'true', 'Habilitar backup automático de la base de datos')
ON CONFLICT (clave) DO UPDATE SET 
  valor = EXCLUDED.valor, 
  descripcion = EXCLUDED.descripcion, 
  updated_at = NOW();

-- ========================================
-- SCRIPT COMPLETADO
-- ========================================
-- 
-- CREDENCIALES DE ADMINISTRADOR:
-- Email: 
admin@soporte.com
-- Contraseña: 
password123
-- 
-- NOTA: En producción, usa Supabase Auth en lugar de esta tabla
-- ========================================