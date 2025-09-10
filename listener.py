import sys, json, math, time
from collections import defaultdict, deque

# --------- Config ----------
SIGNALS = [
    "nozzle_temp_c",
    "bed_temp_c",
    "extruder_flow_mm3_s",
    "print_speed_mm_s",
]

# EWMA settings (fast-ish adaptation to normal behavior)
ALPHA = 0.05              # 0.02–0.1 is a good range
EPS = 1e-9

# Z-score thresholds
WARN_Z = 3.0              # soft anomaly
ALERT_Z = 4.5             # strong anomaly
RUNLEN_ALERT = 6          # or sustained moderate deviation

# Optional: minimum seconds between identical messages to reduce spam
DEDUP_COOLDOWN_S = 3.0

# For short trend checks (e.g., drift vs. spike)
TREND_WINDOW = 80         # last N samples (at 10 Hz ≈ 8s)

# --------- Helpers ----------
class EWStats:
    """Exponentially Weighted Mean/Variance (Welford-style)"""
    def __init__(self, alpha=ALPHA):
        self.alpha = alpha
        self.mean = None
        self.var = None

    def update(self, x):
        if self.mean is None:
            self.mean = x
            self.var = 0.0
            return self.mean, self.var
        # EWMA for mean
        m_prev = self.mean
        self.mean = self.alpha * x + (1 - self.alpha) * self.mean
        # EW variance (on residual)
        resid = x - m_prev
        self.var = self.alpha * (resid * resid) + (1 - self.alpha) * (self.var if self.var is not None else 0.0)
        return self.mean, self.var

class RunLength:
    """Counts consecutive samples beyond |z| >= threshold."""
    def __init__(self, threshold):
        self.threshold = threshold
        self.count = 0

    def update(self, z):
        if abs(z) >= self.threshold:
            self.count += 1
        else:
            self.count = 0
        return self.count

def zscore(x, mean, var):
    return (x - (mean if mean is not None else 0.0)) / math.sqrt((var if var is not None else 0.0) + EPS)

def short_diagnosis(signal, z, value, context):
    """Human-friendly guess + suggested tweaks."""
    s = signal
    sign = "high" if z > 0 else "low"

    if s == "extruder_flow_mm3_s":
        if z < 0:
            return ("Possible under-extrusion (flow low).",
                    ["Increase nozzle temp +5 °C",
                     "Reduce print speed −10%",
                     "Check for partial clog / filament path"])
        else:
            return ("Possible over-extrusion (flow high).",
                    ["Reduce extrusion multiplier −5–10%",
                     "Lower nozzle temp −5 °C if over-melting"])

    if s == "nozzle_temp_c":
        if z < 0:
            return ("Nozzle temp below trend (heater lag / draft).",
                    ["Raise nozzle temp +3–5 °C",
                     "Reduce fan / shield from drafts",
                     "Check heater PID / power"])
        else:
            return ("Nozzle temp above trend.",
                    ["Lower nozzle temp −3–5 °C",
                     "Verify fan RPM / PID gains"])

    if s == "bed_temp_c":
        # Look for oscillation hint via recent variance
        recent = context.get("recent", [])
        osc = False
        if len(recent) >= 20:
            # heuristic: sign changes in first difference imply oscillation
            diffs = [recent[i+1]-recent[i] for i in range(len(recent)-1)]
            sign_changes = sum(1 for i in range(len(diffs)-1) if diffs[i]*diffs[i+1] < 0)
            osc = sign_changes > len(diffs) * 0.35
        if osc:
            return ("Bed temp oscillating (PID/drafts).",
                    ["Tune bed PID",
                     "Cover enclosure / reduce drafts",
                     "Allow more warm-up time"])
        return (f"Bed temp {sign} vs trend.",
                ["Adjust bed temp ±3 °C",
                 "Check enclosure / drafts / PID"])

    if s == "print_speed_mm_s":
        if z > 0:
            return ("Print speed above trend (could trigger flow/adhesion issues).",
                    ["Consider −10% speed",
                     "Verify extrusion keeps up"])
        else:
            return ("Print speed below trend.",
                    ["Check if speed reductions are intentional",
                     "Re-balance temp vs. speed"])

    return (f"{s} {sign} vs expected.", ["Inspect recent changes"])

# --------- Main Loop ----------
def main():
    stats = {s: EWStats(ALPHA) for s in SIGNALS}
    runlen = {s: RunLength(WARN_Z) for s in SIGNALS}
    recents = {s: deque(maxlen=TREND_WINDOW) for s in SIGNALS}

    last_emit = {}  # (signal -> (msg, t_last))

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue

        ts = rec.get("ts")
        t_sec = rec.get("t_sec")
        sigs = rec.get("signals", {})

        # Watch each configured signal
        for s in SIGNALS:
            if s not in sigs:
                continue
            x = float(sigs[s])

            # Update stats
            mean, var = stats[s].update(x)
            z = zscore(x, mean, var)
            recents[s].append(x)
            rl = runlen[s].update(z)

            # Decide severity
            severity = None
            if abs(z) >= ALERT_Z or rl >= RUNLEN_ALERT:
                severity = "ALERT"
            elif abs(z) >= WARN_Z:
                severity = "WARN"

            if severity:
                diag, actions = short_diagnosis(s, z, x, {"recent": list(recents[s])})

                # Deduplicate rapid repeats
                key = f"{severity}:{s}:{'HIGH' if z>0 else 'LOW'}"
                now = time.time()
                last = last_emit.get(key, (None, 0.0))[1]
                if now - last >= DEDUP_COOLDOWN_S:
                    last_emit[key] = (diag, now)

                    # Emit a compact event (easy to paste to an LLM later)
                    event = {
                        "ts": ts,
                        "t_sec": t_sec,
                        "severity": severity,
                        "signal": s,
                        "value": round(x, 4),
                        "zscore": round(float(z), 2),
                        "message": diag,
                        "suggestions": actions
                    }
                    print(json.dumps(event))
                    sys.stdout.flush()

                    # Optional: pretend to “pause” on severe flow/nozzle issues
                    if severity == "ALERT" and s in ("extruder_flow_mm3_s", "nozzle_temp_c"):
                        ctrl = {
                            "ts": ts,
                            "t_sec": t_sec,
                            "control_action": "PAUSE_PRINT",
                            "reason": f"{s} severe anomaly",
                        }
                        print(json.dumps(ctrl))
                        sys.stdout.flush()

if __name__ == "__main__":
    main()
