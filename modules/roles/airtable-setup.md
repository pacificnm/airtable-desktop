# Roles module — Airtable setup

Create these tables in your base (names can match; field names should match for the default mappings).

## Roles

| Field name   | Type        | Notes                          |
|-------------|-------------|--------------------------------|
| Name        | Single line | Primary field                  |
| Description | Long text   | Optional                       |
| Active      | Checkbox    | Default on for new roles       |

## Role Permissions

| Field name | Type        | Notes                                    |
|-----------|-------------|------------------------------------------|
| Label     | Single line | Primary — e.g. `Tickets — read`          |
| Role      | Link        | Link to **Roles** (single)               |
| Resource  | Single line | e.g. `tickets`, `users`, `settings`      |
| Action    | Single select | Options: `read`, `write`, `delete`, `admin` |
| Allowed   | Checkbox    | Grant or deny                            |

After creating tables, copy each table’s ID into `modules/roles/tables.ts` (or paste codegen from **Developer → Tables**).
