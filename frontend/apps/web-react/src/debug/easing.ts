/**
 * Tiny, safe arithmetic evaluator for user-typed easing curves like
 * `1 - (3x^2 - 2x^3)`, `x`, `(1-x)^2`. Supports one variable `x`, the operators
 * + - * / ^ (^ is power, right-associative), parentheses, unary minus, and
 * implicit multiplication (`3x`, `2(1-x)`). No `eval`/`Function` — the input is
 * tokenised and run through shunting-yard + RPN, so nothing executable leaks in.
 */

export interface CompiledEasing {
  /** Evaluates the curve at x. Falls back to the default curve on parse error. */
  fn: (x: number) => number;
  /** Human-readable parse error, or null when the expression is valid. */
  error: string | null;
}

/** Default falloff: smoothstep, full (1) at x=0 down to 0 at x=1. */
export const DEFAULT_FALL = (x: number): number => 1 - (3 * x * x - 2 * x * x * x);

type Token =
  | { t: 'num'; v: number }
  | { t: 'var' }
  | { t: 'op'; v: '+' | '-' | '*' | '/' | '^' }
  | { t: 'neg' }
  | { t: 'lp' }
  | { t: 'rp' };

const PREC: Record<string, number> = { '+': 2, '-': 2, '*': 3, '/': 3, '^': 4 };
const RIGHT_ASSOC = new Set(['^']);
const NEG_PREC = 3.5; // unary minus binds tighter than * but looser than ^

function isDigit(c: string | undefined): boolean {
  return c !== undefined && c >= '0' && c <= '9';
}

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let prev: Token | undefined;
  const push = (tok: Token) => {
    out.push(tok);
    prev = tok;
  };
  const operandEnds = () => prev !== undefined && (prev.t === 'num' || prev.t === 'var' || prev.t === 'rp');

  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === ' ' || c === '\t') {
      i++;
      continue;
    }
    if (isDigit(c) || c === '.') {
      let j = i + 1;
      while (j < src.length && (isDigit(src[j]) || src[j] === '.')) j++;
      const v = Number(src.slice(i, j));
      if (!Number.isFinite(v)) throw new Error(`bad number "${src.slice(i, j)}"`);
      if (operandEnds()) push({ t: 'op', v: '*' });
      push({ t: 'num', v });
      i = j;
      continue;
    }
    if (c === 'x' || c === 'X') {
      if (operandEnds()) push({ t: 'op', v: '*' }); // 3x -> 3*x
      push({ t: 'var' });
      i++;
      continue;
    }
    if (c === '(') {
      if (operandEnds()) push({ t: 'op', v: '*' }); // 2(…) -> 2*(…)
      push({ t: 'lp' });
      i++;
      continue;
    }
    if (c === ')') {
      push({ t: 'rp' });
      i++;
      continue;
    }
    if (c === '+' || c === '-' || c === '*' || c === '/' || c === '^') {
      const unary = c === '-' || c === '+';
      const atOperand = prev === undefined || prev.t === 'op' || prev.t === 'neg' || prev.t === 'lp';
      if (unary && atOperand) {
        if (c === '-') push({ t: 'neg' }); // unary '+' is a no-op
      } else {
        push({ t: 'op', v: c });
      }
      i++;
      continue;
    }
    throw new Error(`unexpected "${c}"`);
  }
  return out;
}

function toRpn(tokens: Token[]): Token[] {
  const out: Token[] = [];
  const stack: Token[] = [];
  const topPrec = (): number => {
    const top = stack[stack.length - 1];
    if (!top) return -1;
    if (top.t === 'op') return PREC[top.v] ?? -1;
    if (top.t === 'neg') return NEG_PREC;
    return -1; // lp
  };
  for (const tok of tokens) {
    if (tok.t === 'num' || tok.t === 'var') {
      out.push(tok);
    } else if (tok.t === 'neg') {
      while (topPrec() > NEG_PREC) out.push(stack.pop()!);
      stack.push(tok);
    } else if (tok.t === 'op') {
      const p = PREC[tok.v] ?? 0;
      while (
        stack.length &&
        stack[stack.length - 1]?.t !== 'lp' &&
        (topPrec() > p || (topPrec() === p && !RIGHT_ASSOC.has(tok.v)))
      ) {
        out.push(stack.pop()!);
      }
      stack.push(tok);
    } else if (tok.t === 'lp') {
      stack.push(tok);
    } else {
      // rp
      while (stack.length && stack[stack.length - 1]?.t !== 'lp') out.push(stack.pop()!);
      if (!stack.length) throw new Error('mismatched )');
      stack.pop();
    }
  }
  while (stack.length) {
    const top = stack.pop()!;
    if (top.t === 'lp') throw new Error('mismatched (');
    out.push(top);
  }
  return out;
}

function evalRpn(rpn: Token[], x: number): number {
  const st: number[] = [];
  for (const tok of rpn) {
    if (tok.t === 'num') st.push(tok.v);
    else if (tok.t === 'var') st.push(x);
    else if (tok.t === 'neg') {
      const a = st.pop();
      if (a === undefined) throw new Error('malformed expression');
      st.push(-a);
    } else if (tok.t === 'op') {
      const b = st.pop();
      const a = st.pop();
      if (a === undefined || b === undefined) throw new Error('malformed expression');
      st.push(
        tok.v === '+' ? a + b : tok.v === '-' ? a - b : tok.v === '*' ? a * b : tok.v === '/' ? a / b : Math.pow(a, b),
      );
    }
  }
  if (st.length !== 1) throw new Error('malformed expression');
  return st[0] ?? 0;
}

export function compileEasing(expr: string): CompiledEasing {
  if (expr.length > 200) return { fn: DEFAULT_FALL, error: 'expression too long' };
  try {
    const rpn = toRpn(tokenize(expr));
    const fn = (x: number) => evalRpn(rpn, x);
    if (!Number.isFinite(fn(0.5))) return { fn: DEFAULT_FALL, error: 'result is not a finite number' };
    return { fn, error: null };
  } catch (error: unknown) {
    return { fn: DEFAULT_FALL, error: error instanceof Error ? error.message : 'parse error' };
  }
}
