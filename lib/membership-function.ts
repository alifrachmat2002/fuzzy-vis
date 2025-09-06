/**
 * Common fuzzy membership functions.
 *
 * All functions return a number in [0, 1]. Inputs outside parameter ranges
 * produce 0 unless otherwise noted. Functions validate basic parameter
 * constraints and will throw an Error if invalid parameters are provided.
 */

// Internal helpers (not exported)
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const isFiniteNumber = (v: unknown): v is number =>
    typeof v === "number" && Number.isFinite(v);

function assertFiniteNumbers(name: string, values: Array<[string, unknown]>) {
    for (const [label, v] of values) {
        if (!isFiniteNumber(v)) {
            throw new Error(
                `${name}: parameter '${label}' must be a finite number.`
            );
        }
    }
}

/**
 * Triangular membership function.
 *
 * µ(x; a, b, c) =
 *  - 0, x <= a
 *  - (x - a) / (b - a), a < x < b
 *  - 1, x = b
 *  - (c - x) / (c - b), b < x < c
 *  - 0, x >= c
 *
 * Constraints: a <= b <= c
 *
 * @param x - Input value.
 * @param a - Left foot.
 * @param b - Peak.
 * @param c - Right foot.
 * @returns Degree of membership in [0, 1].
 */
export function triangular(x: number, a: number, b: number, c: number): number {
    assertFiniteNumbers("triangular", [
        ["x", x],
        ["a", a],
        ["b", b],
        ["c", c],
    ]);
    if (!(a <= b && b <= c)) {
        throw new Error("triangular: require a <= b <= c");
    }

    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    if (x > a && x < b) return clamp01((x - a) / (b - a || Number.EPSILON));
    if (x > b && x < c) return clamp01((c - x) / (c - b || Number.EPSILON));
    return 0;
}

/**
 * Trapezoidal membership function.
 *
 * µ(x; a, b, c, d) forms a plateau between b and c.
 *
 * Constraints: a <= b <= c <= d
 *
 * @param x - Input value.
 * @param a - Left foot.
 * @param b - Left shoulder (start of plateau).
 * @param c - Right shoulder (end of plateau).
 * @param d - Right foot.
 * @returns Degree of membership in [0, 1].
 */
export function trapezoidal(
    x: number,
    a: number,
    b: number,
    c: number,
    d: number
): number {
    assertFiniteNumbers("trapezoidal", [
        ["x", x],
        ["a", a],
        ["b", b],
        ["c", c],
        ["d", d],
    ]);
    if (!(a <= b && b <= c && c <= d)) {
        throw new Error("trapezoidal: require a <= b <= c <= d");
    }

    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x > a && x < b) return clamp01((x - a) / (b - a || Number.EPSILON));
    if (x > c && x < d) return clamp01((d - x) / (d - c || Number.EPSILON));
    return 0;
}

/**
 * Gaussian membership function.
 *
 * µ(x; µ, σ) = exp(-((x - µ)^2) / (2σ^2))
 *
 * Constraints: σ > 0
 *
 * @param x - Input value.
 * @param mu - Center (mean).
 * @param sigma - Standard deviation (> 0).
 * @returns Degree of membership in [0, 1].
 */
export function gaussian(x: number, mu: number, sigma: number): number {
    assertFiniteNumbers("gaussian", [
        ["x", x],
        ["mu", mu],
        ["sigma", sigma],
    ]);
    if (!(sigma > 0)) throw new Error("gaussian: require sigma > 0");
    const z = (x - mu) / sigma;
    return clamp01(Math.exp(-0.5 * z * z));
}

/**
 * Generalized bell-shaped membership function.
 *
 * µ(x; a, b, c) = 1 / (1 + |(x - c) / a|^(2b))
 *
 * Constraints: a != 0, b > 0
 *
 * @param x - Input value.
 * @param a - Width parameter (|a| controls spread).
 * @param b - Slope parameter (> 0).
 * @param c - Center.
 * @returns Degree of membership in [0, 1].
 */
export function generalizedBell(
    x: number,
    a: number,
    b: number,
    c: number
): number {
    assertFiniteNumbers("generalizedBell", [
        ["x", x],
        ["a", a],
        ["b", b],
        ["c", c],
    ]);
    if (a === 0) throw new Error("generalizedBell: require a != 0");
    if (!(b > 0)) throw new Error("generalizedBell: require b > 0");
    const t = Math.abs((x - c) / a);
    return clamp01(1 / (1 + Math.pow(t, 2 * b)));
}

/**
 * Sigmoid membership function.
 *
 * µ(x; a, c) = 1 / (1 + exp(-a(x - c)))
 *
 * @param x - Input value.
 * @param a - Slope (positive increases, negative decreases).
 * @param c - Center (offset).
 * @returns Degree of membership in [0, 1].
 */
export function sigmoid(x: number, a: number, c: number): number {
    assertFiniteNumbers("sigmoid", [
        ["x", x],
        ["a", a],
        ["c", c],
    ]);
    const v = 1 / (1 + Math.exp(-a * (x - c)));
    return clamp01(v);
}

/**
 * S-shaped (increasing) membership function.
 * Smoothly transitions from 0 to 1 between a and b.
 *
 * Constraints: a < b
 *
 * @param x - Input value.
 * @param a - Start of transition.
 * @param b - End of transition.
 * @returns Degree of membership in [0, 1].
 */
export function sCurve(x: number, a: number, b: number): number {
    assertFiniteNumbers("sCurve", [
        ["x", x],
        ["a", a],
        ["b", b],
    ]);
    if (!(a < b)) throw new Error("sCurve: require a < b");
    if (x <= a) return 0;
    if (x >= b) return 1;
    const t = (x - a) / (b - a);
    if (t <= 0.5) return 2 * t * t;
    const u = 1 - t;
    return 1 - 2 * u * u;
}

/**
 * Z-shaped (decreasing) membership function.
 * Smoothly transitions from 1 to 0 between a and b.
 *
 * Constraints: a < b
 *
 * @param x - Input value.
 * @param a - Start of transition (where it starts to decrease).
 * @param b - End of transition (where it reaches 0).
 * @returns Degree of membership in [0, 1].
 */
export function zCurve(x: number, a: number, b: number): number {
    assertFiniteNumbers("zCurve", [
        ["x", x],
        ["a", a],
        ["b", b],
    ]);
    if (!(a < b)) throw new Error("zCurve: require a < b");
    if (x <= a) return 1;
    if (x >= b) return 0;
    const t = (x - a) / (b - a);
    if (t <= 0.5) return 1 - 2 * t * t;
    const u = 1 - t;
    return 2 * u * u;
}

/**
 * Π-shaped (pi) membership function.
 * Rises from 0 to 1 between a and b, stays at 1 until c, then falls to 0 by d.
 *
 * Constraints: a <= b <= c <= d, with a < d and typically b <= c.
 *
 * @param x - Input value.
 * @param a - Left foot (0 until a).
 * @param b - Left shoulder (reaches 1 by b).
 * @param c - Right shoulder start (stays 1 until c).
 * @param d - Right foot (back to 0 by d).
 * @returns Degree of membership in [0, 1].
 */
export function piCurve(
    x: number,
    a: number,
    b: number,
    c: number,
    d: number
): number {
    assertFiniteNumbers("piCurve", [
        ["x", x],
        ["a", a],
        ["b", b],
        ["c", c],
        ["d", d],
    ]);
    if (!(a <= b && b <= c && c <= d)) {
        throw new Error("piCurve: require a <= b <= c <= d");
    }
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x > a && x < b) return sCurve(x, a, b);
    if (x > c && x < d) return zCurve(x, c, d);
    return 0;
}

/**
 * Left-shoulder membership (monotonically decreasing): 1 at/left of a, 0 at/after b.
 * Equivalent to zCurve(x, a, b).
 *
 * Constraints: a < b
 *
 * @param x - Input value.
 * @param a - Point where it begins to decrease (≤ a: 1).
 * @param b - Point where it reaches 0 (≥ b: 0).
 * @returns Degree of membership in [0, 1].
 */
export function leftShoulder(x: number, a: number, b: number): number {
    return zCurve(x, a, b);
}

/**
 * Right-shoulder membership (monotonically increasing): 0 at/before a, 1 at/after b.
 * Equivalent to sCurve(x, a, b).
 *
 * Constraints: a < b
 *
 * @param x - Input value.
 * @param a - Point where it begins to increase (≤ a: 0).
 * @param b - Point where it reaches 1 (≥ b: 1).
 * @returns Degree of membership in [0, 1].
 */
export function rightShoulder(x: number, a: number, b: number): number {
    return sCurve(x, a, b);
}

/**
 * Crisp (singleton) membership: 1 at x === c, else 0.
 *
 * Note: In numeric contexts, an epsilon tolerance may be desired; this
 * implementation uses strict equality by default.
 *
 * @param x - Input value.
 * @param c - Singleton center.
 * @returns 1 if x === c, else 0.
 */
export function singleton(x: number, c: number): number {
    assertFiniteNumbers("singleton", [
        ["x", x],
        ["c", c],
    ]);
    return x === c ? 1 : 0;
}

/**
 * Convenience: complement of a membership degree.
 *
 * @param mu - Membership degree in [0, 1].
 * @returns 1 - mu, clamped to [0, 1].
 */
export function complement(mu: number): number {
    if (!isFiniteNumber(mu))
        throw new Error("complement: mu must be a finite number");
    return clamp01(1 - mu);
}

export type MembershipFunction =
    | typeof triangular
    | typeof trapezoidal
    | typeof gaussian
    | typeof generalizedBell
    | typeof sigmoid
    | typeof sCurve
    | typeof zCurve
    | typeof piCurve
    | typeof leftShoulder
    | typeof rightShoulder
    | typeof singleton;
