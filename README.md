# 📝 To-Do List Application

## **Con respecto a al punto de mejora para el método DELETE, es correcto enviar un 200 ya que es la respuesta a que le proceso de borrado fue realizada con éxtio, luego no se hace una búsqueda del mismo id de tasks para que devuelva un 204. Por lo tanto no se aplica mejora según mi criterio.
## ** Con respecto al Git Flow: Se realizan tareas dentro de la rama dev. De ella se crean nuevas ramas que realzian PRs a rama dev, tomando la rama dev como principal.


Una aplicación web completa para gestión de tareas desarrollada con CodeIgniter 4, Docker, MySQL y JavaScript vanilla.

## 🏗️ Arquitectura del Proyecto

- **Backend**: CodeIgniter 4 (PHP 8.2)
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Base de Datos**: MySQL 8.0
- **Containerización**: Docker & Docker Compose
- **Testing**: PHPUnit

## 🚀 Instalación y Configuración

### Prerrequisitos

- Docker Desktop
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/apizarro1204/to-do-list-srn.git
   cd to-do-list-srn
   ```

2. **Configurar entorno**
   ```bash
   # El archivo .env ya está configurado para Docker
   # No necesitas modificarlo para un setup básico
   ```

3. **Levantar los servicios con Docker**
   ```bash
   docker-compose up -d --build
   ```

4. **Verificar instalación**
   - Aplicación: http://localhost:8080
   - Base de datos MySQL: localhost:3306

### 🏃‍♂️ Comandos Útiles

```bash
# Ver logs de la aplicación
docker-compose logs app

# Ver logs de la base de datos
docker-compose logs db

# Ejecutar comandos dentro del contenedor
docker exec -it codeigniter_app bash

# Detener servicios
docker-compose down

# Rebuildar después de cambios
docker-compose up -d --build
```

## 📋 Funcionalidades

### ✅ Gestión de Tareas (CRUD Completo)
- ➕ Crear nuevas tareas
- 📝 Editar título de tareas existentes
- ✔️ Marcar tareas como completadas/pendientes
- 🗑️ Eliminar tareas (con confirmación)
- 📊 Visualización en tiempo real

### 🔧 Características Técnicas
- 🌐 API REST completa
- ⚡ Interfaz reactiva con AJAX
- 🎨 Diseño responsivo
- 🔔 Notificaciones de usuario
- ⚠️ Manejo robusto de errores
- 📱 Optimización móvil

## 🧪 Testing

### Ejecutar Pruebas Unitarias

```bash
# Dentro del contenedor
docker exec -it codeigniter_app bash
vendor/bin/phpunit

# O directamente
docker exec -it codeigniter_app vendor/bin/phpunit
```

### Cobertura de Pruebas
- ✅ TaskModel: Operaciones CRUD
- ✅ Validaciones de datos
- ✅ Estados de completado
- ✅ Casos de error

## 🗄️ Estructura de Base de Datos

```sql
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/tasks` | Obtener todas las tareas |
| GET | `/tasks/{id}` | Obtener tarea específica |
| POST | `/tasks` | Crear nueva tarea |
| PUT | `/tasks/{id}` | Actualizar tarea |
| DELETE | `/tasks/{id}` | Eliminar tarea |

### Ejemplos de Uso

```javascript
// Crear tarea
fetch('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Nueva tarea' })
})

// Actualizar tarea
fetch('/tasks/1', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true })
})
```

## 📁 Estructura del Proyecto

```
to-do-list-srn/
├── app/
│   ├── Controllers/
│   │   ├── Home.php
│   │   └── Tasks.php
│   ├── Models/
│   │   └── TaskModel.php
│   ├── Database/
│   │   └── Migrations/
│   └── Config/
├── public/
│   ├── css/
│   │   └── todo.css
│   ├── js/
│   │   └── todo.js
│   └── todo.html
├── tests/
│   └── app/
│       └── TaskModelTest.php
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno (.env)
```ini
CI_ENVIRONMENT = development
app.baseURL = 'http://localhost:8080'
database.default.hostname = db
database.default.database = codeigniter
database.default.username = ci_user
database.default.password = ci_pass
```

### Docker Services
- **app**: Aplicación CodeIgniter (Puerto 8080)
- **db**: Base de datos MySQL (Puerto 3306)

## 🌿 Gestión de Branches

El proyecto utiliza GitFlow:
- `main`: Código en producción
- `dev`: Desarrollo activo
- `feature/*`: Nuevas funcionalidades
- `fix/*`: Correcciones de bugs

## 📊 Mejoras y Características Implementadas

### 🎯 Calidad de Código
- ✅ Documentación PHPDoc completa
- ✅ Separación de responsabilidades
- ✅ Manejo robusto de errores
- ✅ Validación de datos
- ✅ Código limpio y legible

### 🎨 Experiencia de Usuario
- ✅ Notificaciones en tiempo real
- ✅ Indicadores de carga
- ✅ Confirmaciones de acciones
- ✅ Diseño responsivo
- ✅ Accesibilidad mejorada

### 🔒 Seguridad
- ✅ Validación de entrada
- ✅ Sanitización de datos
- ✅ Manejo seguro de errores
- ✅ Headers HTTP apropiados

## 🐛 Resolución de Problemas

### Problemas Comunes

1. **Puerto 8080 ocupado**
   ```bash
   # Cambiar puerto en docker-compose.yml
   ports:
     - "8081:80"
   ```

2. **Problemas de permisos**
   ```bash
   docker exec -it codeigniter_app chown -R www-data:www-data /var/www/html/writable
   ```

3. **Base de datos no conecta**
   ```bash
   # Verificar logs
   docker-compose logs db
   ```
   
## 👨‍💻 Autor

**apizarro1204**
- GitHub: [@apizarro1204](https://github.com/apizarro1204)

---

### Uso de la IA
- **Copilot**: Uso de IA integrada para verificación de calidad de código. Refactorización. Configuración inicial de proyecto codeigniter con docker. Revisión de logs de errores. Creación de README. Agregar y mejorar comentarios claves en funcionalidades.

