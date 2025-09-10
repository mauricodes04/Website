import json, sys, time, math, random
from datetime import datetime, timezone

TICK_HZ = 10           # ~10 samples/second
DT = 1.0 / TICK_HZ

# --- Baseline “healthy” operating points (can tweak later) ---
BASE = {
    "nozzle_temp_c": 205.0,     # PLA-ish
    "bed_temp_c": 60.0,
    "extruder_flow_mm3_s": 6.0, # nominal volumetric flow
    "motor_current_x_a": 0.8,
    "motor_current_y_a": 0.8,
    "motor_current_z_a": 0.9,
    "vibration_rms_g": 0.02,
    "print_speed_mm_s": 50.0,
    "layer_height_mm": 0.2,
    "ambient_temp_c": 24.0,
}

# Small “physically plausible” noise scales
NOISE = {
    "nozzle_temp_c": 0.4,
    "bed_temp_c": 0.2,
    "extruder_flow_mm3_s": 0.15,
    "motor_current_x_a": 0.03,
    "motor_current_y_a": 0.03,
    "motor_current_z_a": 0.04,
    "vibration_rms_g": 0.004,
    "print_speed_mm_s": 0.8,
    "layer_height_mm": 0.0,   # constant during a layer
    "ambient_temp_c": 0.05,
}

# Simple fault injectors you can toggle in the schedule below
def apply_faults(t, state, active_faults):
    """
    Mutate 'state' in-place based on currently active faults.
    Faults are additive; combine to make complex scenarios.
    """
    if "UNDER_EXTRUSION" in active_faults:
        # nozzle partial clog: flow drops, motor current up slightly, vibration up a bit
        state["extruder_flow_mm3_s"] *= 0.7 + 0.05*math.sin(1.7*t)
        state["motor_current_x_a"]   *= 1.06
        state["vibration_rms_g"]     *= 1.3

    if "OVER_EXTRUSION" in active_faults:
        state["extruder_flow_mm3_s"] *= 1.25
        state["motor_current_x_a"]   *= 1.04

    if "NOZZLE_TEMP_DRIFT_DOWN" in active_faults:
        # heater can’t keep up: nozzle temp slowly drifts down
        state["nozzle_temp_c"] -= 0.05

    if "BED_TEMP_OSCILLATE" in active_faults:
        # bad PID: bed temp oscillates at ~0.1 Hz
        state["bed_temp_c"] += 1.5*math.sin(2*math.pi*0.1*t)

    if "Y_AXIS_STICK_SLIP" in active_faults:
        # friction spikes: Y current/vibration spike quasi-periodically
        state["motor_current_y_a"] *= 1.0 + 0.25*max(0, math.sin(4.0*t))
        state["vibration_rms_g"]   *= 1.0 + 0.6*max(0, math.sin(4.0*t-0.8))

    if "AMBIENT_BREEZE" in active_faults:
        # draft cools nozzle/bed slightly, increases variation
        state["ambient_temp_c"] -= 0.02
        state["nozzle_temp_c"]  -= 0.05
        state["bed_temp_c"]     -= 0.03

def tick(state, t):
    # add small noise around baseline
    for k, base in BASE.items():
        sigma = NOISE[k]
        # gentle periodicity on some signals (e.g., extrusion pulses from microsteps)
        wobble = 0.0
        if k in ("extruder_flow_mm3_s", "vibration_rms_g"):
            wobble = 0.03 * math.sin(2*math.pi*(0.8 if k=="extruder_flow_mm3_s" else 3.2)*t)
        state[k] = base + random.gauss(0, sigma) + wobble

    # modest coupling: faster print → slightly higher current & vibration
    speed_factor = 1.0 + 0.004*(state["print_speed_mm_s"] - BASE["print_speed_mm_s"])
    state["motor_current_x_a"] *= speed_factor
    state["motor_current_y_a"] *= speed_factor
    state["vibration_rms_g"]   *= speed_factor

    # clamp sanity (avoid negatives)
    state["extruder_flow_mm3_s"] = max(0.0, state["extruder_flow_mm3_s"])
    state["vibration_rms_g"]     = max(0.0, state["vibration_rms_g"])

    return state

def main():
    # Fault schedule: (start_s, end_s, {FAULTS})
    fault_schedule = [
        (15, 30, {"UNDER_EXTRUSION"}),
        (45, 65, {"BED_TEMP_OSCILLATE"}),
        (75, 95, {"Y_AXIS_STICK_SLIP", "AMBIENT_BREEZE"}),
        (110, 130, {"NOZZLE_TEMP_DRIFT_DOWN"}),
        # add or edit windows as you like
    ]

    t = 0.0
    start = time.time()
    state = BASE.copy()

    # Precompute schedule windows for speed
    def active_faults(now_s):
        active = set()
        for (a, b, faults) in fault_schedule:
            if a <= now_s <= b:
                active |= faults
        return active

    try:
        while True:
            now = time.time()
            t = now - start

            # 1) baseline tick
            state = tick(state, t)

            # 2) apply faults
            faults = active_faults(t)
            apply_faults(t, state, faults)

            # 3) emit a record (JSON Lines)
            record = {
                "ts": datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
                "t_sec": round(t, 3),
                "layer_index": int(t // 12),  # pretend each layer ~12s
                "faults_active": sorted(list(faults)),
                "signals": {k: round(v, 5) for k, v in state.items()},
            }
            try:
                sys.stdout.write(json.dumps(record) + "\n")
                sys.stdout.flush()
            except (BrokenPipeError, OSError):
                # Downstream closed (e.g., bridge crashed or pipeline ended). Exit gracefully.
                return

            # 4) wait to keep ~10 Hz
            sleep_left = DT - (time.time() - now)
            if sleep_left > 0:
                time.sleep(sleep_left)
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    main()
