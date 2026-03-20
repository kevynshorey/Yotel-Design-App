import P from "../utils/colours";

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ font: "normal 700 11px/14px 'Inter',sans-serif", color: P.sub, marginBottom: 6 }}>{title}</div>
      <div style={{ background: "rgba(123,45,142,.04)", border: `1px solid ${P.border}`, borderRadius: 8, padding: "8px 10px" }}>
        {children}
      </div>
    </div>
  );
}

export default function CommitDialog({ open, option, onCancel, onConfirmCommit, onSaveAnyway }) {
  if (!open || !option) return null;

  const hv = option.hardValidation || {};
  const hardViolations = hv.hardViolations || [];
  const hardWarnings = hv.hardWarnings || [];
  const isValid = hv.isValid !== false && hardViolations.length === 0;
  const score = typeof option.score === "number"
    ? option.score
    : (typeof option.score?.total === "number" ? option.score.total : 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Commit option"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.35)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div
        style={{
          width: "min(720px, 96vw)",
          maxHeight: "min(82vh, 760px)",
          overflow: "auto",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 16px 60px rgba(0,0,0,.25)",
          border: `1px solid ${P.border}`,
        }}
      >
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${P.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ font: "normal 700 14px/20px 'Inter',sans-serif", color: P.text }}>Commit option</div>
            <div style={{ font: "normal 400 11px/14px 'Inter',sans-serif", color: P.sub }}>
              {option.id} · {option.form} · Score {score.toFixed(1)}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              font: "normal 700 12px/16px 'Inter',sans-serif",
              color: P.sub,
              padding: "6px 8px",
              borderRadius: 6,
            }}
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "12px 14px" }}>
          {!isValid && (
            <div style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(184,53,106,.35)",
              background: "rgba(184,53,106,.08)",
              color: P.text,
              font: "normal 400 12px/16px 'Inter',sans-serif",
              marginBottom: 10,
            }}>
              <div style={{ fontWeight: 700, color: P.danger }}>This option does not meet one or more hard requirements.</div>
              <div style={{ fontSize: 11, color: P.sub, marginTop: 4 }}>
                You can still save it to the project as a non-compliant option if you want.
              </div>
            </div>
          )}

          {isValid && (
            <div style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(62,154,92,.35)",
              background: "rgba(62,154,92,.08)",
              color: P.text,
              font: "normal 400 12px/16px 'Inter',sans-serif",
              marginBottom: 10,
            }}>
              <div style={{ fontWeight: 700, color: P.success }}>Hard requirements: OK</div>
              <div style={{ fontSize: 11, color: P.sub, marginTop: 4 }}>
                You can commit this option to the project.
              </div>
            </div>
          )}

          <Section title="Summary">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, font: "normal 400 12px/16px 'Inter',sans-serif" }}>
              {[
                ["Keys", option.totalKeys],
                ["Storeys", option.storeys],
                ["GFA", option.gia ? `${Math.round(option.gia).toLocaleString()} m²` : "–"],
                ["Cost / key", option.cpk ? `$${Math.round(option.cpk).toLocaleString()}` : "–"],
              ].map(([k, v]) => (
                <div key={k}>
                  <span style={{ color: P.sub }}>{k}: </span>
                  <span style={{ fontWeight: 700, color: P.text }}>{v}</span>
                </div>
              ))}
            </div>
          </Section>

          {!isValid && (
            <Section title={`Hard requirement failures (${hardViolations.length})`}>
              <div style={{ font: "normal 400 12px/16px 'Inter',sans-serif", color: P.text }}>
                {hardViolations.slice(0, 12).map((v, i) => (
                  <div key={i} style={{ marginBottom: 4, color: P.danger }}>
                    - {v}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {hardWarnings.length > 0 && (
            <Section title={`Warnings (${hardWarnings.length})`}>
              <div style={{ font: "normal 400 12px/16px 'Inter',sans-serif", color: P.text }}>
                {hardWarnings.slice(0, 12).map((w, i) => (
                  <div key={i} style={{ marginBottom: 4, color: P.warning }}>
                    - {w}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div style={{
          padding: "12px 14px",
          borderTop: `1px solid ${P.border}`,
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          background: "#fff",
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              height: 32,
              padding: "0 12px",
              borderRadius: 8,
              border: `1px solid ${P.borderL}`,
              background: "#fff",
              cursor: "pointer",
              font: "normal 700 12px/16px 'Inter',sans-serif",
              color: P.text,
            }}
          >
            Cancel
          </button>

          {!isValid && (
            <button
              type="button"
              onClick={onSaveAnyway}
              style={{
                height: 32,
                padding: "0 12px",
                borderRadius: 8,
                border: "none",
                background: P.warning,
                cursor: "pointer",
                font: "normal 700 12px/16px 'Inter',sans-serif",
                color: "#fff",
              }}
            >
              Save anyway
            </button>
          )}

          <button
            type="button"
            onClick={onConfirmCommit}
            style={{
              height: 32,
              padding: "0 12px",
              borderRadius: 8,
              border: "none",
              background: P.purple,
              cursor: "pointer",
              font: "normal 700 12px/16px 'Inter',sans-serif",
              color: "#fff",
              opacity: isValid ? 1 : 0.65,
            }}
            title={isValid ? "Commit option" : "Commit option (will be marked non-compliant)"}
          >
            Commit
          </button>
        </div>
      </div>
    </div>
  );
}

