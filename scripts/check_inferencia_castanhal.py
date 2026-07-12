from __future__ import annotations

import csv
import math
from collections import Counter
from pathlib import Path

import numpy as np

CSV_PATH = Path(__file__).resolve().parents[1] / "Amostras_Castanhal_Refinadas_II_III_IMPORTAR_SISAVALIA.csv"
SUBJECT_AREA = 106.91
SUBJECT_STANDARD = 2


def num(value: str) -> float:
    text = str(value or "").strip().replace("R$", "").replace(" ", "")
    if "," in text and "." in text:
        text = text.replace(".", "").replace(",", ".")
    else:
        text = text.replace(",", ".")
    return float(text)


def log_gamma(value: float) -> float:
    coefficients = [
        676.5203681218851,
        -1259.1392167224028,
        771.3234287776531,
        -176.6150291621406,
        12.507343278686905,
        -0.13857109526572012,
        9.984369578019572e-6,
        1.5056327351493116e-7,
    ]
    if value < 0.5:
        return math.log(math.pi) - math.log(math.sin(math.pi * value)) - log_gamma(1 - value)
    x = 0.9999999999998099
    z = value - 1
    for index, coefficient in enumerate(coefficients):
        x += coefficient / (z + index + 1)
    t = z + len(coefficients) - 0.5
    return 0.5 * math.log(2 * math.pi) + (z + 0.5) * math.log(t) - t + math.log(x)


def beta_continued_fraction(a: float, b: float, x: float) -> float:
    max_iterations = 200
    epsilon = 3e-12
    minimum = 1e-30
    qab = a + b
    qap = a + 1
    qam = a - 1
    c = 1.0
    d = 1 - qab * x / qap
    if abs(d) < minimum:
        d = minimum
    d = 1 / d
    result = d
    for m in range(1, max_iterations + 1):
        m2 = 2 * m
        aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1 + aa * d
        if abs(d) < minimum:
            d = minimum
        c = 1 + aa / c
        if abs(c) < minimum:
            c = minimum
        d = 1 / d
        result *= d * c
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1 + aa * d
        if abs(d) < minimum:
            d = minimum
        c = 1 + aa / c
        if abs(c) < minimum:
            c = minimum
        d = 1 / d
        delta = d * c
        result *= delta
        if abs(delta - 1) < epsilon:
            break
    return result


def regularized_beta(x: float, a: float, b: float) -> float:
    if x <= 0:
        return 0.0
    if x >= 1:
        return 1.0
    factor = math.exp(log_gamma(a + b) - log_gamma(a) - log_gamma(b) + a * math.log(x) + b * math.log(1 - x))
    if x < (a + 1) / (a + b + 2):
        return factor * beta_continued_fraction(a, b, x) / a
    return 1 - factor * beta_continued_fraction(b, a, 1 - x) / b


def student_two_tailed_p(t_value: float, degrees_of_freedom: int) -> float:
    if not math.isfinite(t_value) or degrees_of_freedom <= 0:
        return 1.0
    x = degrees_of_freedom / (degrees_of_freedom + t_value * t_value)
    return regularized_beta(x, degrees_of_freedom / 2, 0.5)


def student_critical_two_tailed(alpha: float, degrees_of_freedom: int) -> float:
    if not (0 < alpha < 1) or degrees_of_freedom <= 0:
        return math.nan
    lower = 0.0
    upper = 20.0
    for _ in range(100):
        middle = (lower + upper) / 2
        if student_two_tailed_p(middle, degrees_of_freedom) > alpha:
            lower = middle
        else:
            upper = middle
    return (lower + upper) / 2


def f_survival(f_value: float, numerator_df: int, denominator_df: int) -> float:
    if not math.isfinite(f_value) or f_value < 0 or numerator_df <= 0 or denominator_df <= 0:
        return 1.0
    x = denominator_df / (denominator_df + numerator_df * f_value)
    return regularized_beta(x, denominator_df / 2, numerator_df / 2)


def main():
    with CSV_PATH.open(newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f, delimiter=";"))

    approved = [
        row
        for row in rows
        if "rejeitad" not in (row.get("status_validacao") or "").strip().lower()
    ]
    y = []
    x_rows = []
    standards = []
    for row in approved:
        price = num(row["preco"])
        area = num(row["area"])
        standard = num(row["padrao"])
        unit_value = price / area
        y.append(math.log(unit_value))
        x_rows.append([1.0, area, math.log(standard)])
        standards.append(int(standard))

    yv = np.array(y, dtype=float)
    x = np.array(x_rows, dtype=float)
    n, p = x.shape
    k = p - 1
    beta = np.linalg.inv(x.T @ x) @ x.T @ yv
    fitted = x @ beta
    resid = yv - fitted
    sse = float(resid.T @ resid)
    df_resid = n - p
    mse = sse / df_resid
    sst = float(((yv - yv.mean()).T @ (yv - yv.mean())))
    ssr = sst - sse
    r2 = 1 - sse / sst
    adj_r2 = 1 - (1 - r2) * (n - 1) / (n - p)

    xtx_inv = np.linalg.inv(x.T @ x)
    se_beta = np.sqrt(np.diag(mse * xtx_inv))
    t_stats = beta / se_beta
    p_values = np.array([student_two_tailed_p(float(t), df_resid) for t in t_stats])
    f_stat = (ssr / k) / mse
    p_f = f_survival(float(f_stat), k, df_resid)

    x0 = np.array([1.0, SUBJECT_AREA, math.log(SUBJECT_STANDARD)])
    yhat = float(x0 @ beta)
    leverage = float(x0.T @ xtx_inv @ x0)
    tcrit80 = student_critical_two_tailed(0.2, df_resid)
    se_conf = math.sqrt(mse * leverage)
    unit_estimate = math.exp(yhat)
    lower = math.exp(yhat - tcrit80 * se_conf)
    upper = math.exp(yhat + tcrit80 * se_conf)
    amplitude = (upper - lower) / unit_estimate
    total_estimate = unit_estimate * SUBJECT_AREA

    precision_grade = "III" if amplitude <= 0.30 else "II" if amplitude <= 0.40 else "I" if amplitude <= 0.50 else "Nao classificado"
    sample_min_ii = 4 * (k + 1)
    sample_min_iii = 6 * (k + 1)
    foundation_sample_grade = "III" if n >= sample_min_iii else "II" if n >= sample_min_ii else "I"
    max_regressor_p = max(float(p) for p in p_values[1:])
    regressors_grade = "III" if max_regressor_p <= 0.10 else "II" if max_regressor_p <= 0.20 else "I" if max_regressor_p <= 0.30 else "Nao classificado"
    model_grade = "III" if p_f <= 0.01 else "II" if p_f <= 0.02 else "I" if p_f <= 0.05 else "Nao classificado"
    standard_counts = Counter(standards)
    micronumerosity_ok = all(count >= 3 for count in standard_counts.values())

    print(f"arquivo={CSV_PATH}")
    print(f"n={n}")
    print(f"k={k}")
    print(f"min_grau_II={sample_min_ii}")
    print(f"min_grau_III={sample_min_iii}")
    print(f"contagem_padrao={dict(sorted(standard_counts.items()))}")
    print(f"micronumerosidade_padrao_ok={micronumerosity_ok}")
    print(f"r2={r2:.6f}")
    print(f"r2_ajustado={adj_r2:.6f}")
    print(f"p_area={p_values[1]:.8f}")
    print(f"p_padrao_ln={p_values[2]:.8f}")
    print(f"p_f_modelo={p_f:.8f}")
    print(f"grau_amostra_por_quantidade={foundation_sample_grade}")
    print(f"grau_regressores_por_significancia={regressors_grade}")
    print(f"grau_modelo_por_f={model_grade}")
    print(f"valor_unitario_estimado={unit_estimate:.2f}")
    print(f"ic80_unitario_inferior={lower:.2f}")
    print(f"ic80_unitario_superior={upper:.2f}")
    print(f"amplitude_ic80={amplitude:.2%}")
    print(f"grau_precisao={precision_grade}")
    print(f"valor_total_estimado={total_estimate:.2f}")


if __name__ == "__main__":
    main()
