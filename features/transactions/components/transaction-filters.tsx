"use client";

import {
  FilterBar,
  FilterSearch,
  FilterSelect,
} from "@/components/ui/filter-bar";


import {
  TRANSACTION_STATUSES,
} from "../types/transaction";

interface TransactionFiltersProps {
  readonly search?: string;
  readonly status?: string;
}

const statusOptions = Object.values(
  TRANSACTION_STATUSES,
).map((status) => ({
  value: status,
  label:
    status.charAt(0) +
    status.slice(1).toLowerCase(),
}));

export function TransactionFilters({
  search,
  status,
}: TransactionFiltersProps) {
  return (
    <FilterBar resetParams={["page"]}>
      <FilterSearch
        name="search"
        placeholder="Search transactions..."
        defaultValue={search}
      />

      <FilterSelect
        name="status"
        placeholder="All statuses"
        options={statusOptions}
      />
    </FilterBar>
  );
}