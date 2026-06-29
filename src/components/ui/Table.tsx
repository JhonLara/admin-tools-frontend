import { ReactNode } from "react";

interface Column<T> {
  header: string;
  accessor: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
}

export default function Table<T>({ columns, data, keyExtractor }: TableProps<T>) {
  if (data.length === 0) {
    return <div className="empty-state">No hay registros</div>;
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={keyExtractor(row)}>
              {columns.map((col, i) => (
                <td key={i}>{col.accessor(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
