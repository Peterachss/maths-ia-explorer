# scripts/crosscheck.py
# Independent implementation of every number in the IA. Standard library only.
import csv, json, math, statistics, sys
from pathlib import Path

path = Path(sys.argv[1] if len(sys.argv) > 1 else "data/sample42.csv")
rows = list(csv.DictReader(path.open(encoding="utf-8")))

def mean(v): return math.fsum(v) / len(v)

def ols(u, y):
    ub, yb = mean(u), mean(y)
    sxx = math.fsum((a - ub) ** 2 for a in u)
    syy = math.fsum((b - yb) ** 2 for b in y)
    sxy = math.fsum((a - ub) * (b - yb) for a, b in zip(u, y))
    a = sxy / sxx
    return {"a": a, "b": yb - a * ub, "r": sxy / math.sqrt(sxx * syy),
            "sxx": sxx, "syy": syy, "sxy": sxy, "meanU": ub, "meanY": yb}

def ranks(v):
    order = sorted(range(len(v)), key=lambda i: v[i])
    out, i = [0.0] * len(v), 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and v[order[j + 1]] == v[order[i]]:
            j += 1
        for k in range(i, j + 1):
            out[order[k]] = (i + j) / 2 + 1
        i = j + 1
    return out

def analyse(sel):
    xs = [float(r["gdp_pc_ppp"]) for r in sel]
    ys = [float(r["life_exp"]) for r in sel]
    iso = [r["iso3"] for r in sel]
    n = len(xs)
    lin = ols(xs, ys)
    lg = ols([math.log(x) for x in xs], ys)
    f_lin = lambda x: lin["a"] * x + lin["b"]
    f_log = lambda x: lg["a"] * math.log(x) + lg["b"]
    sse_lin = math.fsum((y - f_lin(x)) ** 2 for x, y in zip(xs, ys))
    sse_log = math.fsum((y - f_log(x)) ** 2 for x, y in zip(xs, ys))
    out = {
        "n": n,
        "x": {"mean": mean(xs), "sd": statistics.stdev(xs), "median": statistics.median(xs)},
        "y": {"mean": mean(ys), "sd": statistics.stdev(ys), "median": statistics.median(ys)},
        "spearman": ols(ranks(xs), ranks(ys))["r"],
        "linear": {**lin, "r2": 1 - sse_lin / lin["syy"], "sse": sse_lin, "se": math.sqrt(sse_lin / (n - 2))},
        "log": {**lg, "r2": 1 - sse_log / lg["syy"], "sse": sse_log, "se": math.sqrt(sse_log / (n - 2))},
        "residuals_log": [y - f_log(x) for x, y in zip(xs, ys)],
    }
    if "SGP" in iso and "ZWE" in iso:
        i, j = iso.index("SGP"), iso.index("ZWE")
        xh, xl, yh, yl = xs[i], xs[j], ys[i], ys[j]
        pg = f_log(xh) - f_log(xl)
        out["gap"] = {
            "observed": yh - yl, "predicted": pg, "percent": 100 * pg / (yh - yl),
            "predicted_zwe": f_log(xl), "predicted_sgp": f_log(xh),
            "slope_zwe_per_1000": 1000 * lg["a"] / xl, "slope_sgp_per_1000": 1000 * lg["a"] / xh,
            "exact_zwe_1000": lg["a"] * math.log((xl + 1000) / xl),
            "exact_sgp_1000": lg["a"] * math.log((xh + 1000) / xh),
            "inverse_for_sgp_life": math.exp((yh - lg["b"]) / lg["a"]),
            "inverse_for_83_6": math.exp((83.6 - lg["b"]) / lg["a"]),
        }
        xy = ols(ys, [math.log(x) for x in xs])
        out["x_on_y"] = {"slope": xy["a"], "intercept": xy["b"], "x_at_sgp_life": math.exp(xy["a"] * yh + xy["b"])}
    return out

result = {"all": analyse(rows),
          "without_nga_tcd": analyse([r for r in rows if r["iso3"] not in ("NGA", "TCD")])}
Path("docs").mkdir(exist_ok=True)
Path("docs/crosscheck.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
print("Wrote docs/crosscheck.json")
