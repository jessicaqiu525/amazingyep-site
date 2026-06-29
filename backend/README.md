# Amazing Yep Backend

This backend includes the first SAGE export flow for product data.

## Local development

```bash
pnpm install
SAGE_TEMPLATE_PATH="/path/to/SAGE_BPU_ProductList.xls" pnpm dev
```

The local API defaults to `http://127.0.0.1:4000`.

## Product API

- `GET /api/products` - list products
- `GET /api/products?category=Bags` - list by category
- `GET /api/products?search=cooler` - search products
- `GET /api/products/:id` - get one product by ID or SKU
- `POST /api/products` - create or upsert a product
- `PUT /api/products/:id` - update a product
- `DELETE /api/products/:id` - delete a product
- `POST /api/uploads/images` - upload one image using form field `image`

For the MVP, products are stored in `data/products.json` and seeded from `data/products.seed.json`.

## SAGE bulk export

SAGE Bulk Product Update expects its own workbook structure, so the exporter is template-driven:

1. Download the latest SAGE Bulk Product Update `.xls` file from SAGE Supplier Center.
2. Set `SAGE_TEMPLATE_PATH` to that file path on the backend server.
3. Send Amazing Yep product records to `POST /api/exports/sage/products`.
4. The backend fills matching SAGE columns and returns a SAGE-compatible `.xls` file.

Example request body:

```json
{
  "products": [
    {
      "id": 8,
      "sku": "AK468",
      "name": "Caribou Clip Handle Cooler",
      "category": "Bags",
      "description": "Custom cooler bag with clip handle.",
      "keywords": ["cooler", "bag", "custom"],
      "colors": ["Gray"],
      "pricing": [
        { "quantity": 100, "price": 10.44 },
        { "quantity": 250, "price": 7.84 },
        { "quantity": 500, "price": 5.22 },
        { "quantity": 1000, "price": 3.62 }
      ],
      "setupCharge": 50,
      "imprintLocation": "Front",
      "imprintArea": "Available on request",
      "sagePictureUrl": "https://example.com/images/ak468.jpg"
    }
  ]
}
```

The exporter preserves SAGE's column names and updates rows by `ItemNum` or `ProductID` when possible. New products are appended to the workbook.
