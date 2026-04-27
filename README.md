# Sistema de Gestión de Pagos Manuales (Prueba Técnica)

Este proyecto consiste en un sistema de microservicios para la gestión de pagos manuales, diseñado para manejar múltiples comercios (merchants), sus transacciones y liquidaciones periódicas.

## 🚀 Cómo empezar

Para levantar el sistema completo (Base de Datos, API Gateway y Servicio de Pagos) con un solo comando, asegúrate de tener Docker instalado y ejecuta:

```bash
docker-compose up --build
```

Esto levantará:
- **PostgreSQL**: Base de datos relacional (Puerto 5433 local).
- **Payment Service (NestJS)**: Lógica de negocio y persistencia (Puerto 3001 interno).
- **API Gateway (Express)**: Punto de entrada único (Puerto 3000 local).

---

## ⚙️ Variables de Envío

El sistema utiliza las siguientes variables configuradas en el archivo `docker-compose.yml`:

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | Conexión a PostgreSQL (Prisma) | `postgresql://user_prueba:password_prueba@postgres_db:5432/payment_db` |
| `PORT` (Gateway) | Puerto del API Gateway | `3000` |
| `PORT` (Service) | Puerto del Servicio de Pagos | `3001` |
| `JWT_SECRET` | Clave secreta para validación JWT | `PRUEBA_TECNICA_SECRET_KEY` |
| `PAYMENT_SERVICE_URL`| URL interna para el proxy | `http://payment-service:3001` |

---

## 📡 Catálogo de Endpoints (API Gateway)

Todos los endpoints requieren autenticación mediante el header `x-api-key` o un `Bearer Token` (JWT).

### 💳 Transacciones (`/api/v1/transactions`)

- **POST `/`**: Crea una nueva transacción.
  - **Body**: `{ "merchant_id": "UUID", "amount": 100.50, "currency": "USD", "type": "payin" }`
- **GET `/`**: Lista transacciones con paginación y filtros.
  - **Query Params**: `page`, `limit`, `status`, `type`, `date_from`, `date_to`.
- **GET `/:id`**: Obtiene el detalle de una transacción específica.
- **PATCH `/:id/status`**: Actualiza el estado de una transacción siguiendo la máquina de estados.
  - **Body**: `{ "status": "approved" }`

### 💰 Liquidaciones (`/api/v1/settlements`)

- **POST `/generate`**: Genera una liquidación para un merchant en un rango de fechas.
  - **Body**: `{ "merchant_id": "UUID", "period_start": "ISO_DATE", "period_end": "ISO_DATE" }`
- **GET `/:id`**: Obtiene el detalle de una liquidación y sus transacciones asociadas.

### 🏢 Merchants (`/api/v1/merchants`)
- **POST `/`**: Registra un nuevo comercio y genera su `api_key`.

---

## 🛠️ Decisiones de Diseño y Justificación

1. **Arquitectura de Microservicios**: Se separó el **API Gateway** del **Servicio de Pagos** para permitir escalabilidad independiente y centralizar la seguridad (Auth, Rate Limiting).
2. **Validación de Datos**: Se utilizó `class-validator` y `class-transformer` en NestJS para garantizar la integridad de los datos antes de procesarlos.
3. **Persistencia con Prisma**: Se eligió Prisma como ORM por su robustez, tipado fuerte y facilidad para manejar migraciones y relaciones complejas.
4. **Seguridad Dual (JWT + API Key)**: El Gateway implementa un middleware que soporta ambos métodos, permitiendo tanto integraciones de servidor a servidor (API Key) como aplicaciones cliente (JWT).
5. **Rate Limiting**: Se implementó una lógica en memoria en el Gateway para proteger el servicio de pagos de ráfagas de tráfico, limitando a 100 peticiones por minuto por API Key.
6. **Máquina de Estados**: Las transacciones siguen un flujo lógico (ej. de `pending` a `approved`) para evitar estados inconsistentes en la base de datos.
7. **Docker Multi-stage**: Los Dockerfiles están optimizados para reducir el tamaño de la imagen final, separando las dependencias de construcción de las de ejecución.

---

## 🛠️ Tecnologías utilizadas

- **Node.js** (v20+)
- **TypeScript**
- **NestJS** (Payment Service)
- **Express.js** (API Gateway)
- **PostgreSQL**
- **Prisma ORM**
- **Docker & Docker Compose**
