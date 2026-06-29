import Button from "./Button";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary" | "success";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: "var(--color-text-secondary)",
            }}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: "0.95rem", color: "var(--color-text-main)", lineHeight: 1.5 }}>{message}</p>
        </div>
        <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
