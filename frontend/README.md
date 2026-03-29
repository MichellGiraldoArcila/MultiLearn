# Frontend — Portal de Cursos

Frontend en React (Vite + TailwindCSS) del portal educativo. Se conecta al backend Django REST para listar cursos, búsqueda inteligente, favoritos y recomendaciones.

## Tecnologías

- React 18
- Vite 5
- React Router 6
- Axios
- TailwindCSS 3

## Requisitos

- Node.js 18+
- Backend del proyecto ejecutándose en `http://127.0.0.1:8000` (o configurar `VITE_API_URL`)

## Instalación y ejecución

```bash
cd frontend
npm install
npm run dev
```

La aplicación quedará en **http://localhost:5173**.

En desarrollo, las peticiones a `/api/*` se redirigen al backend mediante el proxy de Vite (ver `vite.config.js`). El backend debe estar en `http://127.0.0.1:8000`.

## Variables de entorno

Opcional: crear `.env` en `frontend/`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Si no se define, en desarrollo se usa el mismo origen (proxy al backend).

## Estructura

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx      # Logo, buscador, login/favoritos/recomendaciones
│   │   ├── SearchBar.jsx   # Input de búsqueda
│   │   ├── CourseCard.jsx  # Tarjeta de curso (imagen, título, rating, favorito)
│   │   ├── ProtectedRoute.jsx
│   │   └── LoadingSpinner.jsx
│   ├── pages/
│   │   ├── Home.jsx        # Lista de cursos, filtros, búsqueda
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── CourseDetail.jsx  # Detalle y registro de vista (POST /api/interactions/)
│   │   ├── Favorites.jsx
│   │   └── Recommendations.jsx
│   ├── services/
│   │   └── api.js          # Axios, baseURL, interceptor JWT
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio: cursos y búsqueda |
| `/search?q=...` | Búsqueda (misma vista con query) |
| `/login` | Inicio de sesión |
| `/register` | Registro |
| `/course/:id` | Detalle del curso (registra interacción `view`) |
| `/favorites` | Favoritos (requiere login) |
| `/recommendations` | Recomendaciones (requiere login) |

## Autenticación

- El token JWT se guarda en `localStorage` (`access_token`, `refresh_token`).
- El interceptor de Axios añade `Authorization: Bearer <token>` y renueva con `refresh` en 401.
- Las rutas `/favorites` y `/recommendations` redirigen a `/login` si no hay sesión.

## Build para producción

```bash
npm run build
npm run preview
```

Para producción, configurar `VITE_API_URL` con la URL real del backend.
