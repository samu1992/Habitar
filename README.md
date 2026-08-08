# un.studio — Panel de Obra

App interna de gestión de proyectos para un.studio. Dos usuarios, tiempo real,
pensada para usarse con una mano en el medio de una obra.

Stack: Next.js 15 (App Router + Server Actions) · Tailwind · Supabase · Vercel.

---

## Puesta en marcha (30 minutos)

### 1. Supabase
1. Crear proyecto en [supabase.com](https://supabase.com) (región South America / São Paulo).
2. SQL Editor → New query → pegar todo `supabase/schema.sql` → Run.
3. Database → Replication → verificar que `projects`, `financials` y `logistics`
   estén en la publicación `supabase_realtime` (el script ya lo hace).
4. Project Settings → API → copiar **Project URL** y **anon public key**.

### 2. Local
```bash
npm install
cp .env.example .env.local   # pegar URL y anon key, elegir ACCESS_CODE
npm run dev
```

### 3. Vercel
1. Subir el repo a GitHub.
2. Vercel → Add New Project → importar el repo.
3. Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ACCESS_CODE`.
4. Deploy. Después, en cada teléfono: abrir la URL → Compartir → **Agregar a
   inicio**. Queda como app, sin barra del navegador.

---

## Cómo funciona el tiempo real

Cada mutación pasa por una Server Action que hace tres cosas:

1. Escribe en Supabase.
2. `revalidatePath()` — actualiza al teléfono que tocó.
3. Postgres emite el cambio por Realtime → `RealtimeRefresher` lo escucha en el
   otro teléfono y llama a `router.refresh()`.

En logística además hay `useOptimistic`: el tilde se pinta antes de que salga
el request, así el toque se siente instantáneo aunque la señal sea mala.

---

## Decisiones de diseño que conviene conocer

**No hay drag & drop.** Arrastrar tarjetas entre acordeones en una pantalla de
6" pide precisión y dos manos. El estado se cambia con el botón "Mover":
dos toques, áreas de 56 px. La Server Action ya está lista si más adelante
se quiere agregar el arrastre por encima.

**El checkbox de logística cicla tres estados** (Pendiente → En Curso/Comprado
→ Finalizado → Pendiente) en un solo control, porque en obra no hay dedo libre
para abrir un menú. Al pasar a Finalizado sin costo real cargado, copia el
estimado para que el termómetro de finanzas no quede corto.

**Avance en dos capas, nunca promediado.** La escalerita de 4 tramos es la
etapa del proceso; la línea fina es el presupuesto consumido. Un porcentaje
único que mezclara ambos no significaría nada.

**El acceso es un candado de estudio, no una bóveda.** Un código compartido en
cookie + RLS abierta al rol `anon`. Antes de cargar datos reales de clientes,
leer la nota de seguridad en `supabase/schema.sql` sección 8 y pasar a
Supabase Auth.

---

## Docker (anexo)

`Dockerfile` y `docker-compose.yml` están solo como resguardo para un futuro
self-hosting. Vercel no los mira.

```bash
cp .env.example .env && docker compose up --build
```
## -- https://uydlzfwdvpdwhevilupo.supabase.co/rest/v1/
## -- public (sb_publishable_cPQpbj3lM_VkVGlcY2gJaw_JDJK34e4)
 ## -- secret key (sb_secret_0hrKwpykJu0TC6z8wGlTVQ_Ns5V5up0)