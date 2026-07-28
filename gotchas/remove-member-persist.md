# Gotcha: sacar del menú compartido no persistía

## Síntoma

Sacás a alguien del menú compartido, la UI lo quita, pero al recargar vuelve a aparecer.

## Causa

El `DELETE` directo a `household_members` con RLS: si la política no permite el borrado, Supabase responde **sin error** y con **0 filas**. La app creía que había funcionado.

## Fix

RPC `remove_household_member(p_user_id)` (`security definer`) en `supabase/schema.sql`:

1. Cualquier persona del menú compartido puede sacar a otra (sin roles admin/miembro en producto).
2. Borra el membership de verdad.
3. Recrea un hogar personal para la persona sacada (así no queda sin menú).

Cliente: `householdData.removeHouseholdMember` llama al RPC. La UI no muestra “Administrador” / “Miembro”.

## Acción en tu proyecto Supabase

SQL Editor → volver a ejecutar el bloque de `remove_household_member` de `schema.sql`. Sin eso, el cliente nuevo falla al sacar personas del menú.
