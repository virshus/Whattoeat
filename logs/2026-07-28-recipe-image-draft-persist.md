# 2026-07-28 — Persistencia imágenes + draft al crear receta

## Problema
1. Fotos subidas usaban `URL.createObjectURL` → `blob:` que muere al recargar; no quedaban en Supabase.
2. Al cambiar de app/pestaña, `onAuthStateChange` re-bootstrapaba (TOKEN_REFRESHED), desmontaba la UI y `AddRecipeView` reseteaba a "opciones".

## Fix
- `fileToPersistedImageUrl`: comprime a JPEG data URL y se guarda en `image_url`.
- Draft de creación en `sessionStorage` (`utils/addRecipeDraft.ts`); restaura método + campos.
- Auth: no re-bootstrap en `TOKEN_REFRESHED` / `INITIAL_SESSION`; soft-load no pone `bootstrapping` ni resetea la vista.
