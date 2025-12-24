-- ============================================================================
-- SpaceBook - PostgreSQL Initialization Script
-- ============================================================================
-- Este script se ejecuta automáticamente cuando se crea el contenedor
-- Solo se ejecuta si la base de datos está vacía
-- ============================================================================

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurar zona horaria por defecto
SET timezone = 'UTC';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'SpaceBook database initialized successfully!';
END $$;
