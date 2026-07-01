import { ReactNode, useState } from "react";

interface Column<T> {
  header: string;
  accessor: (row: T) => ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  pageSize?: number;
  onRefresh?: () => void;
}

export default function Table<T>({ columns, data, keyExtractor, pageSize = 50, onRefresh }: TableProps<T>) {
  const [page, setPage] = useState(0);

  if (data.length === 0) {
    return (
      <div>
        {onRefresh && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
            <button className="btn btn-sm btn-secondary" onClick={onRefresh}>
              ⟳ Actualizar
            </button>
          </div>
        )}
        <div className="empty-state">No hay registros</div>
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / pageSize);
  const start = page * pageSize;
  const paginated = data.slice(start, start + pageSize);

  return (
    <div>
      {onRefresh && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
          <button className="btn btn-sm btn-secondary" onClick={onRefresh}>
            ⟳ Actualizar
          </button>
        </div>
      )}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} style={col.width ? { width: col.width } : undefined}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row) => (
              <tr key={keyExtractor(row)}>
                {columns.map((col, i) => (
                  <td key={i}>{col.accessor(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1rem",
            fontSize: "0.85rem",
          }}
        >
          <button
            className="btn btn-sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ padding: "0.3rem 0.6rem" }}
          >
            ← Anterior
          </button>
          <span style={{ color: "#64748B", fontWeight: 500 }}>
            Página {page + 1} de {totalPages}
          </span>
          <button
            className="btn btn-sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{ padding: "0.3rem 0.6rem" }}
          >
            Siguiente →
          </button>
        </div>
      )}

      <div
        style={{
          textAlign: "center",
          fontSize: "0.8rem",
          color: "#94A3B8",
          marginTop: "0.5rem",
        }}
      >
        Mostrando {paginated.length} de {data.length} registros
      </div>
    </div>
  );
}
