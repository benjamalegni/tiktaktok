# Configuración de Supabase

## Error: Variables de entorno no configuradas

Si ves el error `ERR_NAME_NOT_RESOLVED` o `Failed to fetch`, significa que las variables de entorno de Supabase no están configuradas.

## Pasos para configurar Supabase:

### 1. Crear un proyecto en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se complete la configuración

### 2. Obtener las credenciales
1. En el dashboard de tu proyecto, ve a **Settings** > **API**
2. Copia la **URL** del proyecto
3. Copia la **anon public** key

### 3. Crear archivo .env
Crea un archivo `.env` en la raíz del proyecto con:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 4. Crear la tabla 'match'
En el SQL Editor de Supabase, ejecuta:

```sql
CREATE TABLE match (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_x_name TEXT,
  player_o_name TEXT,
  board JSONB DEFAULT '[]'::jsonb,
  turn TEXT DEFAULT '×',
  winner TEXT,
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Reiniciar el servidor de desarrollo
```bash
npm run dev
```

## Verificación
Si todo está configurado correctamente, deberías ver en la consola:
- ✅ VITE_SUPABASE_URL: ✅
- ✅ VITE_SUPABASE_ANON_KEY: ✅

Y no deberías ver errores de conexión.
