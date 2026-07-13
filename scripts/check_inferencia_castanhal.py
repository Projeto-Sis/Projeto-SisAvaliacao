from __future__ import annotations

import csv
import math
from collections import Counter
from dataclasses import dataclass
from pathlib import Path


CSV_PATH = Path(__file__).resolve().parents[1] / "Amostras_Castanhal_Refinadas_II_III_IMPORTAR_SISAVALIA.csv"

# Atributos do avaliando usados na validacao tecnica de Castanhal.
SUBJECT_AREA = 106.91
SUBJECT_STANDARD = 2.0

# Modelo validado para esta base:
# y = ln(valor_unitario)
# x1 = area
# x2 = ln(padrao)
EXPECTED = {
    "n": 13,
    "k": 2,
    "foundation_sample_grade": "II",
    "regressors_grade": "III",
    "model_grade": "III",
    "precision_grade": "III",
    "micronumerosity_ok": True,
    "r2": 0.891327,
    "adj_r2": 0.869592,
    "p_area": 0.00002286,
    "p_padrao_ln": 0.00067906,
    "p_f_modelo": 0.00001516,
    "unit_estimate": 2626.36,
    "lower_unit": 2454.22,
    "upper_unit": 2810.57,
    "amplitude_percent": 13.57,
    "total_estimate": 280784.17,
}


@dataclass(frozen=True)
class InferenceResult:
    n: int
    k: int
    standard_counts: dict[int, int]
    micronumerosity_ok: bool
    r2: float
    adj_r2: float
    p_area: float
    p_padrao_ln: float
    p_f_modelo: float
    foundation_sample_grade: str
    regressors_grade: str
    model_grade: str
    unit_estimate: float
    lower_unit: float
    upper_unit: float
    amplitude_percent: float
    precision_grade: str
    total_estimate: float


def num(value: str) -> float:
    text = str(value or "").strip().replace("R$", "").replace(" ", "")
    if "," in text and "." in text:
        text = text.replace(".", "").replace(",", ".")
    else:
        text = text.replace(",", ".")
    return float(text)


def transpose(matrix: list[list[float]]) -> list[list[float]]:
    return [list(row) for row in zip(*matrix)]


def multiply(a: list[list[float]], b: list[list[float]]) -> list[list[float]]:
    b_t = transpose(b)
    return [[sum(left * right for left, right in zip(row, col)) for col in b_t] for row in a]


def inverse(matrix: list[list[float]]) -> list[list[float]]:
    n = len(matrix)
    augmented = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(matrix)]

    for i in range(n):
        pivot = max(range(i, n), key=lambda r: abs(augmented[r][i]))
        if abs(augmented[pivot][i]) < 1e-12:
            raise AssertionError("Matriz singular na validacao inferencial.")
        augmented[i], augmented[pivot] = augmented[pivot], augmented[i]

        divisor = augmented[i][i]
        augmented[i] = [value / divisor for value in augmented[i]]

        for r in range(n):
            if r == i:
                continue
            factor = augmented[r][i]
            augmented[r] = [value - factor * pivot_value for value, pivot_value in zip(augmented[r], augmented[i])]

    return [row[n:] for row in augmented]


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
    result = 1.0
    c = 1.0
    d = 1 - (a + b) * x / (a + 1)
    minimum = 1e-30
    if abs(d) < minimum:
        d = minimum
    d = 1 / d
    result = d

    for m in range(1, 201):
        m2 = 2 * m
        aa = m * (b - m) * x / ((a - 1 + m2) * (a + m2))
        d = max(abs(1 + aa * d), minimum) * (1 if 1 + aa * d >= 0 else -1)
        c = max(abs(1 + aa / c), minimum) * (1 if 1 + aa / c >= 0 else -1)
        d = 1 / d
        result *= d * c

        aa = -(a + m) * (a + b + m) * x / ((a + m2) * (a + 1 + m2))
        d = max(abs(1 + aa * d), minimum) * (1 if 1 + aa * d >= 0 else -1)
        c = max(abs(1 + aa / c), minimum) * (1 if 1 + aa / c >= 0 else -1)
        d = 1 / d
        delta = d * c
        result *= delta
        if abs(delta - 1) < 3e-12:
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


def grade_by_threshold(value: float, grade_iii: float, grade_ii: float, grade_i: float) -> str:
    if value <= grade_iii:
        return "III"
    if value <= grade_ii:
        return "II"
    if value <= grade_i:
        return "I"
    return "Nao classificado"


def load_approved_rows() -> list[dict[str, str]]:
    with CSV_PATH.open(newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f, delimiter=";"))
    return [row for row in rows if "rejeitad" not in (row.get("status_validacao") or "").strip().lower()]


def calculate() -> InferenceResult:
    approved = load_approved_rows()
    y = []
    x_rows = []
    standards = []

    for row in approved:
        price = num(row["preco"])
        area = num(row["area"])
        standard = num(row["padrao"])
        y.append(math.log(price / area))
        x_rows.append([1.0, area, math.log(standard)])
        standards.append(int(standard))

    n = len(y)
    p = len(x_rows[0])
    k = p - 1
    xt = transpose(x_rows)
    xtx_inv = inverse(multiply(xt, x_rows))
    beta = [row[0] for row in multiply(multiply(xtx_inv, xt), [[value] for value in y])]
    fitted = [sum(value * beta[index] for index, value in enumerate(row)) for row in x_rows]
    residuals = [observed - predicted for observed, predicted in zip(y, fitted)]
    mean_y = sum(y) / n
    sse = sum(value * value for value in residuals)
    sst = sum((value - mean_y) ** 2 for value in y)
    ssr = sst - sse
    df = n - p
    mse = sse / df
    r2 = 1 - sse / sst
    adj_r2 = 1 - (1 - r2) * (n - 1) / (n - p)
    standard_errors = [math.sqrt(max(xtx_inv[i][i] * mse, 0)) for i in range(p)]
    t_stats = [coefficient / error for coefficient, error in zip(beta, standard_errors)]
    p_values = [student_two_tailed_p(t_value, df) for t_value in t_stats]
    f_stat = (ssr / k) / mse
    p_f = f_survival(f_stat, k, df)

    subject = [1.0, SUBJECT_AREA, math.log(SUBJECT_STANDARD)]
    log_unit = sum(value * beta[index] for index, value in enumerate(subject))
    leverage = multiply(multiply([subject], xtx_inv), [[value] for value in subject])[0][0]
    confidence_se = math.sqrt(max(mse * leverage, 0))
    t80 = student_critical_two_tailed(0.2, df)
    unit_estimate = math.exp(log_unit)
    lower_unit = math.exp(log_unit - t80 * confidence_se)
    upper_unit = math.exp(log_unit + t80 * confidence_se)
    amplitude_percent = (upper_unit - lower_unit) / unit_estimate * 100
    total_estimate = unit_estimate * SUBJECT_AREA

    sample_min_ii = 4 * (k + 1)
    sample_min_iii = 6 * (k + 1)
    foundation_sample_grade = "III" if n >= sample_min_iii else "II" if n >= sample_min_ii else "I"
    max_regressor_p = max(p_values[1:])
    standard_counts = dict(sorted(Counter(standards).items()))

    return InferenceResult(
        n=n,
        k=k,
        standard_counts=standard_counts,
        micronumerosity_ok=all(count >= 3 for count in standard_counts.values()),
        r2=r2,
        adj_r2=adj_r2,
        p_area=p_values[1],
        p_padrao_ln=p_values[2],
        p_f_modelo=p_f,
        foundation_sample_grade=foundation_sample_grade,
        regressors_grade=grade_by_threshold(max_regressor_p, 0.10, 0.20, 0.30),
        model_grade=grade_by_threshold(p_f, 0.01, 0.02, 0.05),
        unit_estimate=unit_estimate,
        lower_unit=lower_unit,
        upper_unit=upper_unit,
        amplitude_percent=amplitude_percent,
        precision_grade=grade_by_threshold(amplitude_percent, 30, 40, 50),
        total_estimate=total_estimate,
    )


def assert_close(name: str, actual: float, expected: float, tolerance: float) -> None:
    if abs(actual - expected) > tolerance:
        raise AssertionError(f"{name}: esperado {expected}, obtido {actual}")


def validate(result: InferenceResult) -> None:
    if result.n != EXPECTED["n"]:
        raise AssertionError(f"n: esperado {EXPECTED['n']}, obtido {result.n}")
    if result.k != EXPECTED["k"]:
        raise AssertionError(f"k: esperado {EXPECTED['k']}, obtido {result.k}")
    if result.standard_counts != {1: 3, 2: 7, 3: 3}:
        raise AssertionError(f"contagem de padrao inesperada: {result.standard_counts}")
    for key in ("micronumerosity_ok", "foundation_sample_grade", "regressors_grade", "model_grade", "precision_grade"):
        actual = getattr(result, key)
        if actual != EXPECTED[key]:
            raise AssertionError(f"{key}: esperado {EXPECTED[key]}, obtido {actual}")

    assert_close("r2", result.r2, EXPECTED["r2"], 0.00001)
    assert_close("r2_ajustado", result.adj_r2, EXPECTED["adj_r2"], 0.00001)
    assert_close("p_area", result.p_area, EXPECTED["p_area"], 0.0000001)
    assert_close("p_padrao_ln", result.p_padrao_ln, EXPECTED["p_padrao_ln"], 0.0000001)
    assert_close("p_f_modelo", result.p_f_modelo, EXPECTED["p_f_modelo"], 0.0000001)
    assert_close("valor_unitario_estimado", result.unit_estimate, EXPECTED["unit_estimate"], 0.02)
    assert_close("ic80_unitario_inferior", result.lower_unit, EXPECTED["lower_unit"], 0.02)
    assert_close("ic80_unitario_superior", result.upper_unit, EXPECTED["upper_unit"], 0.02)
    assert_close("amplitude_ic80_percentual", result.amplitude_percent, EXPECTED["amplitude_percent"], 0.01)
    assert_close("valor_total_estimado", result.total_estimate, EXPECTED["total_estimate"], 0.05)


def main() -> None:
    result = calculate()
    validate(result)
    print("VALIDACAO INFERENCIAL CASTANHAL: OK")
    print(f"arquivo={CSV_PATH}")
    print(f"n={result.n}")
    print(f"k={result.k}")
    print(f"contagem_padrao={result.standard_counts}")
    print(f"micronumerosidade_padrao_ok={result.micronumerosity_ok}")
    print(f"r2={result.r2:.6f}")
    print(f"r2_ajustado={result.adj_r2:.6f}")
    print(f"p_area={result.p_area:.8f}")
    print(f"p_padrao_ln={result.p_padrao_ln:.8f}")
    print(f"p_f_modelo={result.p_f_modelo:.8f}")
    print(f"grau_amostra_por_quantidade={result.foundation_sample_grade}")
    print(f"grau_regressores_por_significancia={result.regressors_grade}")
    print(f"grau_modelo_por_f={result.model_grade}")
    print(f"valor_unitario_estimado={result.unit_estimate:.2f}")
    print(f"ic80_unitario_inferior={result.lower_unit:.2f}")
    print(f"ic80_unitario_superior={result.upper_unit:.2f}")
    print(f"amplitude_ic80={result.amplitude_percent:.2f}%")
    print(f"grau_precisao={result.precision_grade}")
    print(f"valor_total_estimado={result.total_estimate:.2f}")


if __name__ == "__main__":
    main()
