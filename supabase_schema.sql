-- DDL para CVC 2026

-- 1. Tabla de Registros
CREATE TABLE public.registros (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT now(),
  nombre      TEXT NOT NULL,
  email       TEXT NOT NULL,
  telefono    TEXT,
  pais        TEXT NOT NULL,
  ciudad      TEXT,
  genero      TEXT,
  organizacion TEXT NOT NULL,
  anos_cvc    TEXT NOT NULL,
  etnia       TEXT,
  rol         TEXT NOT NULL,
  descripcion TEXT,
  aporte      TEXT NOT NULL,
  comite      TEXT,
  sede        TEXT NOT NULL,
  intereses   TEXT[],
  necesidades TEXT[],
  notas       TEXT,
  estado      TEXT DEFAULT 'pending' CHECK (estado IN ('pending','confirmed','rejected'))
);

-- RLS para Registros
ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar su registro (es público para la landing)
CREATE POLICY "Anon insert" ON public.registros FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Auth insert" ON public.registros FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Todos pueden leer (necesitamos saber cuántos hay registrados y dónde para bloquear cupos)
CREATE POLICY "Anon select" ON public.registros FOR SELECT TO anon USING (true);
CREATE POLICY "Auth select" ON public.registros FOR SELECT TO authenticated USING (true);

-- Sólo los administradores pueden hacer update
CREATE POLICY "Auth update" ON public.registros FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);


-- 2. Tabla de Cupos por País
CREATE TABLE public.cupos_pais (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pais        TEXT NOT NULL UNIQUE,
  pasto       INT DEFAULT 0,
  cali        INT DEFAULT 0,
  medellin    INT DEFAULT 0
);

-- RLS para Cupos
ALTER TABLE public.cupos_pais ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer la tabla de cupos (necesario para el form de landing)
CREATE POLICY "Anon select cupos" ON public.cupos_pais FOR SELECT TO anon USING (true);
CREATE POLICY "Auth select cupos" ON public.cupos_pais FOR SELECT TO authenticated USING (true);

-- Sólo admins pueden insertar / actualizar / borrar cupos
CREATE POLICY "Auth insert cupos" ON public.cupos_pais FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update cupos" ON public.cupos_pais FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete cupos" ON public.cupos_pais FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Notificación Realtime de Registros (para la nav)
ALTER PUBLICATION supabase_realtime ADD TABLE public.registros;

-- Fin.
