## API (OpenAPI v2.0.0) — Esquel Ahorra

Fuente: https://api.esquel-ahorra.online/openapi.json

### Cambios relevantes para el frontend

- `Product` ya no expone `codigo_barra` directo: ahora devuelve `barcodes: Barcode[] | null`.
- `GET /products/barcode/{barcode}` ya no acepta `fallback_name`.
- Invitaciones:
  - `POST /auth/invite` ahora recibe `{ email }` (sin `rol`).
  - Existen `GET /auth/invite` y `GET /auth/invite-link` (respuesta no tipada en OpenAPI).
- `POST /auth/logout` existe (respuesta no tipada en OpenAPI).

### Endpoints usados por la app

Auth

- `POST /auth/register` -> `Token`
- `POST /auth/login` -> `Token`
- `POST /auth/refresh?refresh_token=...` -> `Token`
- `POST /auth/logout` -> respuesta sin schema
- `GET /auth/me` -> `UserProfile`
- `POST /auth/invite` body `InviteSupervisorRequest` -> respuesta sin schema
- `GET /auth/invite` -> respuesta sin schema
- `GET /auth/invite-link` -> respuesta sin schema

Productos

- `POST /products` body `ProductCreate` -> `Product`
- `GET /products/search?barcode=&name=` -> `ProductSearchResponse`
- `GET /products/barcode/{barcode}` -> `Product`
- `GET /products/{product_id}` -> `Product`
- `PUT /products/{product_id}/price` body `ProductUpdate` -> `Product`

Locales

- `GET /locals/?skip=&limit=` -> `Local[]`
- `POST /locals/` body `LocalCreate` -> `Local`
- `GET /locals/{local_id}` -> `Local`
- `GET /locals/{local_id}/productos` -> `LocalConProductos`
- `GET /locals/{local_id}/corrections/count` -> respuesta sin schema

Correcciones

- `GET /corrections/pending` -> `PriceCorrection[]`
- `PUT /corrections/{correction_id}/approve` -> respuesta sin schema

