# Backend - Portal de Cursos

Backend del portal web que integra cursos de diferentes plataformas educativas. Incluye autenticación JWT, modelo de cursos, favoritos y API REST.

## Tecnologías

- Python 3.11
- Django + Django REST Framework
- PostgreSQL
- JWT (djangorestframework-simplejwt)
- django-filter, python-dotenv, psycopg2-binary, django-cors-headers
- Motor de búsqueda NLP: spacy, scikit-learn, numpy

## Estructura del proyecto

```
backend/
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── apps/
│   ├── users/
│   ├── courses/
│   ├── search/
│   └── recommendations/
├── core/
│   ├── permissions.py
│   └── pagination.py
├── requirements.txt
├── manage.py
└── .env.example
```

## Instalación

### 1. Dependencias

Desde la carpeta `backend`:

```bash
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate   # Linux/macOS
pip install -r requirements.txt
```

**Modelo de lenguaje spaCy (requerido para el buscador NLP):**

```bash
python -m spacy download en_core_web_sm
```

Si en Windows falla la instalación de `numpy` o `scikit-learn` por falta de compilador C, instala solo binarios:

```bash
python -m pip install --only-binary :all: numpy scikit-learn spacy
```

### 2. Configurar variables de entorno

Copiar el archivo de ejemplo y editar con tus datos:

```bash
copy .env.example .env   # Windows
# cp .env.example .env   # Linux/macOS
```

Editar `.env` y configurar al menos:

- `SECRET_KEY`: clave secreta de Django (generar una distinta en producción).
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: datos de tu base PostgreSQL.

### 3. Base de datos PostgreSQL

Crear la base de datos (por ejemplo en `psql` o pgAdmin):

```sql
CREATE DATABASE portal_cursos;
```

### 4. Migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Crear usuario administrador (opcional)

```bash
python manage.py createsuperuser
```

Se pedirá email (usado como nombre de usuario), nombre y contraseña.

### 6. Cargar cursos de ejemplo

```bash
python manage.py load_courses
```

Para borrar cursos existentes y volver a cargar:

```bash
python manage.py load_courses --clear
```

### 7. Ejecutar el servidor

```bash
python manage.py runserver
```

El API quedará disponible en `http://127.0.0.1:8000/`.

## Endpoints de la API

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario (body: `name`, `email`, `password`, opcional `interests`) |
| POST | `/api/auth/login` | Login (body: `email`, `password`). Devuelve `access` y `refresh` (JWT) |
| POST | `/api/auth/refresh` | Refrescar token (body: `refresh`) |

### Cursos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/courses/` | Lista cursos. Filtros: `?category=`, `?level=`, `?platform=` |
| GET | `/api/courses/<id>/` | Detalle de un curso |

### Búsqueda inteligente (NLP)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/search/?q=texto` | Búsqueda por relevancia. Parámetros opcionales: `category`, `platform`, `level` |

El motor procesa la consulta con NLP (limpieza, minúsculas, stopwords, lematización), la convierte en vector TF-IDF y calcula la similitud coseno con los cursos (título + descripción + categoría). Los resultados se ordenan por `similarity_score` descendente.

**Ejemplo de respuesta:**

```json
{
  "query": "python beginner",
  "results": [
    {
      "id": 12,
      "title": "Python for Beginners",
      "platform": "Udemy",
      "rating": 4.6,
      "similarity_score": 0.89
    }
  ]
}
```

**Ejemplos de uso:**

- `GET /api/search/?q=python` — cursos de Python
- `GET /api/search/?q=design` — cursos de diseño
- `GET /api/search/?q=music` — cursos de música
- `GET /api/search/?q=aprende machine learning&platform=Coursera` — búsqueda con filtro de plataforma

### Interacciones (requieren JWT)

Registrar vistas o clics para alimentar las recomendaciones. Header: `Authorization: Bearer <access_token>`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/interactions/` | Registrar interacción (body: `{"course": <id>, "interaction_type": "view" \| "favorite" \| "click"}`). Ejemplo: cuando el usuario abre un curso, enviar `interaction_type: "view"`. |

### Recomendaciones personalizadas (requieren JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/recommendations/` | Hasta 10 cursos recomendados para el usuario (según favoritos, interacciones y popularidad). |

**Ejemplo de respuesta:**

```json
{
  "user": 1,
  "recommendations": [
    {
      "id": 25,
      "title": "Advanced Python",
      "platform": "Coursera",
      "rating": 4.7,
      "score": 0.91
    }
  ]
}
```

### Favoritos (requieren JWT)

Enviar header: `Authorization: Bearer <access_token>`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/favorites/` | Listar favoritos del usuario |
| POST | `/api/favorites/` | Agregar favorito (body: `{"course": <id>}`). Se registra también una interacción tipo `favorite`. |
| DELETE | `/api/favorites/<id>/` | Eliminar favorito (id del favorito) |

## Paginación

Las listas devuelven el formato:

```json
{
  "count": 54,
  "next": "http://.../api/courses/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

Tamaño de página por defecto: 20. Se puede cambiar con `?page_size=` (máximo 100).

## Motor de búsqueda con NLP

El buscador interpreta consultas en lenguaje natural (por ejemplo *"python para principiantes"*, *"curso de diseño ui"*, *"aprende machine learning"*) y devuelve los cursos más relevantes, no solo coincidencias exactas.

**Flujo:**

1. **Preprocesamiento** (`apps/search/nlp_processor.py`): limpia el texto, pasa a minúsculas, elimina stopwords y lematiza (p. ej. *"Learning Python programming for beginners"* → *"learn python program beginner"*).
2. **Vectores TF-IDF**: título, descripción y categoría de cada curso se convierten en un vector con `TfidfVectorizer` (scikit-learn). Los vectores se cachean y solo se recalculan al iniciar el servidor o cuando se crean/actualizan/eliminan cursos.
3. **Similitud**: la consulta se procesa con el mismo NLP, se vectoriza y se calcula la similitud coseno con todos los cursos; los resultados se ordenan por esa puntuación.

**Instalación del modelo spaCy:** después de `pip install -r requirements.txt`, ejecuta:

```bash
python -m spacy download en_core_web_sm
```

Sin este modelo, el endpoint `/api/search/` devolverá error 503 hasta que se instale.

## Sistema de recomendaciones personalizadas

El sistema sugiere cursos relevantes para cada usuario combinando **favoritos**, **cursos visualizados**, **categorías de interés** y **popularidad**.

### Qué es un sistema de recomendación

Un sistema de recomendación intenta predecir qué ítems (aquí, cursos) le interesan más al usuario a partir de su historial (favoritos, vistas, clics) y de las características de los ítems. Así se ofrecen sugerencias personalizadas en lugar de una lista genérica.

### Algoritmo utilizado: híbrido

Se combinan tres señales:

1. **Content-based filtering (similitud)**  
   Cursos similares a los que el usuario ya tiene en favoritos. Se reutilizan los vectores TF-IDF del motor de búsqueda (título, descripción, categoría) y se calcula la **similitud coseno** entre cada curso candidato y los favoritos del usuario. Para cada candidato se toma la máxima similitud con alguno de sus favoritos.

2. **Preferencias por categoría**  
   Se detectan las categorías más frecuentes en sus favoritos e interacciones (vistas). A los cursos de esas categorías se les asigna un peso mayor (normalizado entre 0 y 1).

3. **Popularidad**  
   Se da más peso a cursos con mejor **rating** y más **visualizaciones** (interacciones tipo `view`). Rating y número de vistas se normalizan y se promedian.

### Cómo funciona el score híbrido

El score final de cada curso es:

```
score = (0.6 × similarity_score) + (0.3 × category_preference) + (0.1 × popularity_score)
```

- **similarity_score**: similitud coseno con los favoritos (normalizada a [0, 1]).
- **category_preference**: peso de la categoría del curso según el perfil del usuario (0 si no coincide con sus preferencias).
- **popularity_score**: combinación de rating (p. ej. rating/5) y vistas normalizadas, en [0, 1].

Los resultados se ordenan por este `score` descendente, se excluyen los cursos que ya están en favoritos y se devuelven como máximo **10 recomendaciones**.

### Usuario nuevo (sin favoritos)

Si el usuario aún no tiene favoritos, no hay señal de similitud ni de categoría. En ese caso se devuelven los cursos **más populares** ordenados por **rating**.

### Registro de interacciones

- Al **abrir un curso**, el frontend debe enviar `POST /api/interactions/` con `{"course": <id>, "interaction_type": "view"}`.
- Al **marcar favorito** con `POST /api/favorites/`, se registra automáticamente una interacción tipo `favorite`.
- Las recomendaciones se cachean por usuario y se **recalculan** cuando el usuario añade o quita favoritos.

## Resumen rápido

1. `pip install -r requirements.txt`
2. `python -m spacy download en_core_web_sm`
3. Configurar `.env` (PostgreSQL y `SECRET_KEY`)
4. Crear BD en PostgreSQL (el nombre según `DB_NAME` en `.env`)
5. `python manage.py migrate`
6. `python manage.py createsuperuser` (opcional)
7. `python manage.py load_courses`
8. `python manage.py runserver`

**En Windows (PowerShell)** puedes ejecutar todo de una vez (pasos 4–7) con:

```powershell
.\run.ps1
```

Luego puedes: registrar usuario, iniciar sesión, listar cursos y agregar favoritos (con el token JWT en el header).
