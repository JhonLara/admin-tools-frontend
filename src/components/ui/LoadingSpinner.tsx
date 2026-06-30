export default function LoadingSpinner({ message = "Cargando..." }: { message?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1rem",
        gap: "1rem",
      }}
    >
      <div className="spinner" />
      <span
        style={{
          color: "#64748B",
          fontSize: "0.95rem",
          fontWeight: 500,
        }}
      >
        {message}
      </span>
    </div>
  );
}
