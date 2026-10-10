import { queryOptions } from "@tanstack/react-query";
import { getPublicCatalog } from "./catalog.functions";

export const catalogOptions = queryOptions({ queryKey: ["public-catalog"], queryFn: () => getPublicCatalog(), staleTime: 60_000 });