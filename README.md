# Encuestas de Satisfacción — Frontend

Cliente del sistema de encuestas de satisfacción de la FES Acatlán.
React + TypeScript + Vite + Tailwind CSS.

Necesita el API corriendo: ver el repositorio `cuestionarioDeSatisfaccionAPI`.

## Levantar el entorno

```bash
cp .env.example .env        # ajusta VITE_API_BASE_URL si el API no está en :3000
npm install
npm run dev
```

Queda en <http://localhost:5173>.

## Cómo se maneja la sesión

- `services/http.ts` es el único punto que habla con el API. Pone el
  `Authorization`, convierte los errores en `ApiError` con el mensaje que mandó
  el servidor, y ante un 401 borra la sesión y emite el evento
  `auth:no-autorizado`.
- `context/SessionProvider.tsx` escucha ese evento, así que un 401 en cualquier
  petición cierra la sesión, no solo en la pantalla que la disparó.
- La sesión se guarda en `localStorage` y se relee al arrancar.

## Roles

`types/auth.ts` define los códigos de rol, y son los mismos que emite el API en
`CA_Roles.Codigo`: `administrador` y `administrador_encuestas`. Se comparan
contra `usuario.rol`, que es el **código**, nunca contra `rolNombre`, que es solo
la etiqueta visible y puede cambiar.

`ProtectedRoute` manda al login cuando no hay sesión, y a `/sin-permiso` cuando
hay sesión pero el rol no alcanza. Son casos distintos: rebotar al login a quien
ya inició sesión deja al usuario sin entender qué pasó.

## Estilos

Tailwind CSS v4, configurado desde `src/index.css` con el plugin
`@tailwindcss/vite`. Los colores institucionales están declarados como tokens en
el bloque `@theme` y se usan como `bg-unam-azul`, `text-unam-oro`, etc.

## Comandos

| Comando | Para qué |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Typecheck y compilación de producción |
| `npm run lint` | ESLint |
| `npm run preview` | Sirve lo compilado |
