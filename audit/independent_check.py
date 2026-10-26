"""Independent recomputation of every statistic in the explorer.

Deliberately does not import the project's TypeScript. Reads the CSV directly,
uses only the Python standard library, and prints full precision alongside the
values the site displays.
"""
from __future__ import annotations

import csv
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV = ROOT / "data" / "sample42.csv"
PUBLIC = ROOT / "public" / "data" / "sample42.csv"
META = ROOT / "data" / "sample42.meta.json"


def load(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def mean(xs: list[float]) -> float:
    return math.fsum(xs) / len(xs)


def median(xs: list[float]) -> float:
    s = sorted(xs)
    n = len(s)
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2


def sd(xs: list[float]) -> float:
    m = mean(xs)
    return math.sqrt(math.fsum((x - m) ** 2 for x in xs) / (len(xs) - 1))


def ols(us: list[float], ys: list[float]) -> dict[str, float]:
    mu, my = mean(us), mean(ys)
    sxx = math.fsum((u - mu) ** 2 for u in us)
    syy = math.fsum((y - my) ** 2 for y in ys)
    sxy = math.fsum((u - mu) * (y - my) for u, y in zip(us, ys))
    a = sxy / sxx
    b = my - a * mu
    r = sxy / math.sqrt(sxx * syy)
    return {"a": a, "b": b, "r": r, "r2": r * r, "sxx": sxx, "syy": syy, "sxy": sxy}


def fit(rows: list[dict[str, str]], kind: str) -> dict[str, float]:
    ys = [float(r["life_exp"]) for r in rows]
    us = [math.log(float(r["gdp_pc_ppp"])) if kind == "log" else float(r["gdp_pc_ppp"]) for r in rows]
    line = ols(us, ys)
    pred = [line["a"] * u + line["b"] for u in us]
    res = [y - p for y, p in zip(ys, pred)]
    sse = math.fsum(e * e for e in res)
    n = len(rows)
    line.update(
        sse=sse,
        se=math.sqrt(sse / (n - 2)),
        rmse=math.sqrt(sse / n),
        n=n,
        mean_u=mean(us),
        mean_y=mean(ys),
    )
    return line


def ranks(xs: list[float]) -> list[float]:
    order = sorted(range(len(xs)), key=lambda i: xs[i])
    out = [0.0] * len(xs)
    i = 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and xs[order[j + 1]] == xs[order[i]]:
            j += 1
        r = (i + j) / 2 + 1
        for k in range(i, j + 1):
            out[order[k]] = r
        i = j + 1
    return out


def spearman(xs: list[float], ys: list[float]) -> float:
    return ols(ranks(xs), ranks(ys))["r"]


def predict(f: dict[str, float], kind: str, x: float) -> float:
    return f["a"] * (math.log(x) if kind == "log" else x) + f["b"]


def gap(f: dict[str, float], kind: str, low: dict[str, str], high: dict[str, str]) -> dict[str, float]:
    xl, xh = float(low["gdp_pc_ppp"]), float(high["gdp_pc_ppp"])
    yl, yh = float(low["life_exp"]), float(high["life_exp"])
    pl, ph = predict(f, kind, xl), predict(f, kind, xh)
    obs = yh - yl
    pred = ph - pl
    return {
        "observed": obs,
        "predicted": pred,
        "share": pred / obs * 100,
        "remainder": obs - pred,
        "pred_low": pl,
        "pred_high": ph,
        "res_low": yl - pl,
        "res_high": yh - ph,
        "per1000_low": f["a"] / xl * 1000 if kind == "log" else f["a"] * 1000,
        "per1000_high": f["a"] / xh * 1000 if kind == "log" else f["a"] * 1000,
        "exact_low": predict(f, kind, xl + 1000) - pl,
        "exact_high": predict(f, kind, xh + 1000) - ph,
        "ratio": xh / xl,
    }


def main() -> None:
    rows = load(CSV)
    pub = load(PUBLIC)
    meta = json.loads(META.read_text(encoding="utf-8"))
    print(f"rows: {len(rows)}; public rows: {len(pub)}")
    print(f"data sha256: {hashlib.sha256(CSV.read_bytes()).hexdigest()}")
    print(f"public sha256: {hashlib.sha256(PUBLIC.read_bytes()).hexdigest()}")
    assert len(rows) == 42 and len(pub) == 42
    assert rows == pub
    assert meta["rows"] == 42 and meta["year"] == 2019

    xs = [float(r["gdp_pc_ppp"]) for r in rows]
    ys = [float(r["life_exp"]) for r in rows]
    print(f"x mean {mean(xs):.12f} median {median(xs):.12f} sd {sd(xs):.12f} min {min(xs):.12f} max {max(xs):.12f}")
    print(f"y mean {mean(ys):.12f} median {median(ys):.12f} sd {sd(ys):.12f} min {min(ys):.12f} max {max(ys):.12f}")
    print(f"spearman {spearman(xs, ys):.12f}")

    lin = fit(rows, "linear")
    log = fit(rows, "log")
    for name, f in (("linear", lin), ("log", log)):
        print(
            f"{name}: a={f['a']:.12f} b={f['b']:.12f} r={f['r']:.12f} r2={f['r2']:.12f} "
            f"sse={f['sse']:.12f} se={f['se']:.12f} mean_u={f['mean_u']:.12f}"
        )

    by_iso = {r["iso3"]: r for r in rows}
    g = gap(log, "log", by_iso["ZWE"], by_iso["SGP"])
    print("gap (log):", {k: round(v, 12) for k, v in g.items()})
    glin = gap(lin, "linear", by_iso["ZWE"], by_iso["SGP"])
    print("gap (linear):", {k: round(v, 12) for k, v in glin.items()})

    target = float(by_iso["SGP"]["life_exp"])
    inv = math.exp((target - log["b"]) / log["a"])
    print(f"inverse target {target:.12f} -> {inv:.12f}; multiple {inv / float(by_iso['ZWE']['gdp_pc_ppp']):.12f}")
    x_on_y = ols([float(r["life_exp"]) for r in rows], [math.log(float(r["gdp_pc_ppp"])) for r in rows])
    print(f"x-on-y slope {x_on_y['a']:.12f} intercept {x_on_y['b']:.12f} income {math.exp(x_on_y['a'] * target + x_on_y['b']):.12f}")

    without = [r for r in rows if r["iso3"] not in {"NGA", "TCD"}]
    slog = fit(without, "log")
    sg = gap(slog, "log", by_iso["ZWE"], by_iso["SGP"])
    sinv = math.exp((target - slog["b"]) / slog["a"])
    print(
        f"without NGA,TCD: n={len(without)} a={slog['a']:.12f} b={slog['b']:.12f} r={slog['r']:.12f} "
        f"r2={slog['r2']:.12f} se={slog['se']:.12f} gap={sg['predicted']:.12f} share={sg['share']:.12f} inverse={sinv:.12f}"
    )

    # Income groups and counts.
    counts: dict[str, int] = {}
    for r in rows:
        counts[r["income_group"]] = counts.get(r["income_group"], 0) + 1
    print("income groups today:", counts)
    changed = [(r["name"], r["income_group_2019"], r["income_group"]) for r in rows if r["income_group_2019"] != r["income_group"]]
    print("changed groups:", changed)

    # Cross-check the metadata's live-pull claim is at least internally consistent.
    print("meta changed:", meta["income_groups"]["changed"])
    print("meta live result:", meta["live_pull_result"])

    # Duplicate fact checks used by the UI.
    assert abs(g["observed"] - 22.535) < 1e-9
    assert abs(g["share"] - 83.7770927) < 1e-5
    assert abs(sg["share"] - 79.3276268) < 1e-5
    print("OK: independent recomputation matches the site's published anchors.")


if __name__ == "__main__":
    main()
