import { useState, useMemo, Fragment, type ReactNode } from 'react';
import { ChevronUp, ChevronDown, Search, Plus, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: { label: string; value: string }[];
  render?: (item: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
  getRowId: (item: T) => string | number;
  actions?: {
    label?: string;
    items: {
      label: string;
      onClick: (item: T) => void;
      destructive?: boolean;
      disabled?: boolean;
    }[];
  };
  onCreateClick?: () => void;
  createLabel?: string;
  emptyMessage?: string;
  pageSize?: number;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Rechercher...',
  onSearch,
  searchQuery = '',
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  getRowId,
  actions,
  onCreateClick,
  createLabel = 'Ajouter',
  emptyMessage = 'Aucune donnée disponible',
  pageSize = 10,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') {
        setSortKey(null);
        setSortDir(null);
      } else {
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredData = useMemo(() => {
    const source = Array.isArray(data) ? data : [];
    let result = [...source];

    if (localSearch && onSearch) {
      onSearch(localSearch);
    }

    if (sortKey && sortDir) {
      result.sort((a: any, b: any) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        if (typeof aVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [data, localSearch, sortKey, sortDir, onSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const allSelected = paginatedData.length > 0 && paginatedData.every((item) => selectedIds.includes(getRowId(item)));
  const someSelected = paginatedData.some((item) => selectedIds.includes(getRowId(item)));

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange?.(selectedIds.filter((id) => !paginatedData.some((item) => getRowId(item) === id)));
    } else {
      const newIds = [...selectedIds];
      paginatedData.forEach((item) => {
        const id = getRowId(item);
        if (!newIds.includes(id)) newIds.push(id);
      });
      onSelectionChange?.(newIds);
    }
  };

  const toggleRow = (id: string | number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
        )}
        {onCreateClick && (
          <Button onClick={onCreateClick} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            {createLabel}
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {selectable && (
                  <th className="p-3 w-10">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={toggleAll}
                      aria-label="Tout sélectionner"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn('p-3 text-left font-medium text-muted-foreground', col.className)}
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        {col.label}
                        {sortKey === col.key && sortDir === 'asc' && <ChevronUp className="h-4 w-4" />}
                        {sortKey === col.key && sortDir === 'desc' && <ChevronDown className="h-4 w-4" />}
                        {sortKey !== col.key && <ChevronUp className="h-4 w-4 opacity-0 group-hover:opacity-50" />}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
                {actions && <th className="p-3 w-10" />}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i}>
                    {selectable && <td className="p-3"><Skeleton className="h-4 w-4" /></td>}
                    {columns.map((col) => (
                      <td key={col.key} className="p-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                    {actions && <td className="p-3"><Skeleton className="h-4 w-4" /></td>}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const id = getRowId(item);
                  const isSelected = selectedIds.includes(id);
                  return (
                    <tr
                      key={id}
                      className={cn(
                        'border-t transition-colors hover:bg-muted/50',
                        isSelected && 'bg-muted/30',
                        onRowClick && 'cursor-pointer'
                      )}
                      onClick={() => onRowClick && onRowClick(item)}
                    >
                      {selectable && (
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRow(id)}
                            aria-label={`Sélectionner la ligne ${id}`}
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.key} className={cn('p-3', col.className)}>
                          {col.render ? col.render(item) : (item as any)[col.key]}
                        </td>
                      ))}
                      {actions && (
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.items.map((action, idx) => (
                                <Fragment key={idx}>
                                  {idx > 0 && <DropdownMenuSeparator />}
                                  <DropdownMenuItem
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); action.onClick(item); }}
                                    disabled={action.disabled}
                                    className={action.destructive ? 'text-red-600' : ''}
                                  >
                                    {action.label}
                                  </DropdownMenuItem>
                                </Fragment>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredData.length} élément{filteredData.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
