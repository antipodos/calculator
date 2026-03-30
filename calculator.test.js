const { test } = require("node:test");
const assert = require("node:assert/strict");

// Inline the Calculator class so tests don't require a browser environment
class Calculator {
  constructor() {
    this.currentValue = "0";
    this.previousValue = null;
    this.operator = null;
    this.waitingForOperand = false;
    this.lastOperator = null;
    this.lastOperand = null;
  }

  clear() {
    this.currentValue = "0";
    this.previousValue = null;
    this.operator = null;
    this.waitingForOperand = false;
    this.lastOperator = null;
    this.lastOperand = null;
  }

  inputDigit(digit) {
    if (this.waitingForOperand) {
      this.currentValue = String(digit);
      this.waitingForOperand = false;
    } else {
      this.currentValue =
        this.currentValue === "0" ? String(digit) : this.currentValue + digit;
    }
  }

  inputDecimal() {
    if (this.waitingForOperand) {
      this.currentValue = "0.";
      this.waitingForOperand = false;
      return;
    }
    if (!this.currentValue.includes(".")) {
      this.currentValue += ".";
    }
  }

  toggleSign() {
    const value = parseFloat(this.currentValue);
    if (value !== 0) {
      this.currentValue = String(-value);
    }
  }

  inputPercent() {
    const value = parseFloat(this.currentValue);
    this.currentValue = String(value / 100);
  }

  calculate(a, b, op) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    switch (op) {
      case "+":
        return numA + numB;
      case "-":
        return numA - numB;
      case "*":
        return numA * numB;
      case "/":
        if (numB === 0) {
          return "Error";
        }
        return numA / numB;
      default:
        return numB;
    }
  }

  handleOperator(nextOperator) {
    if (this.operator && !this.waitingForOperand) {
      const result = this.calculate(
        this.previousValue,
        this.currentValue,
        this.operator
      );
      this.currentValue =
        result === "Error" ? "Error" : String(this.roundResult(result));
      this.previousValue = this.currentValue;
    } else {
      this.previousValue = this.currentValue;
    }
    this.operator = nextOperator;
    this.waitingForOperand = true;
  }

  equals() {
    if (this.operator && !this.waitingForOperand) {
      this.lastOperator = this.operator;
      this.lastOperand = this.currentValue;
      const result = this.calculate(
        this.previousValue,
        this.currentValue,
        this.operator
      );
      this.currentValue =
        result === "Error" ? "Error" : String(this.roundResult(result));
      this.previousValue = null;
      this.operator = null;
      this.waitingForOperand = true;
    } else if (!this.operator && this.lastOperator !== null) {
      const result = this.calculate(
        this.currentValue,
        this.lastOperand,
        this.lastOperator
      );
      this.currentValue =
        result === "Error" ? "Error" : String(this.roundResult(result));
      this.waitingForOperand = true;
    }
  }

  roundResult(value) {
    return Math.round(value * 1e10) / 1e10;
  }
}

// --- Tests ---

test("addition: 3 + 4 = 7", () => {
  const calc = new Calculator();
  calc.inputDigit("3");
  calc.handleOperator("+");
  calc.inputDigit("4");
  calc.equals();
  assert.equal(calc.currentValue, "7");
});

test("subtraction: 10 - 3 = 7", () => {
  const calc = new Calculator();
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.handleOperator("-");
  calc.inputDigit("3");
  calc.equals();
  assert.equal(calc.currentValue, "7");
});

test("multiplication: 6 * 7 = 42", () => {
  const calc = new Calculator();
  calc.inputDigit("6");
  calc.handleOperator("*");
  calc.inputDigit("7");
  calc.equals();
  assert.equal(calc.currentValue, "42");
});

test("division: 20 / 4 = 5", () => {
  const calc = new Calculator();
  calc.inputDigit("2");
  calc.inputDigit("0");
  calc.handleOperator("/");
  calc.inputDigit("4");
  calc.equals();
  assert.equal(calc.currentValue, "5");
});

test("division by zero returns Error", () => {
  const calc = new Calculator();
  calc.inputDigit("9");
  calc.handleOperator("/");
  calc.inputDigit("0");
  calc.equals();
  assert.equal(calc.currentValue, "Error");
});

test("decimal input: 1.5 + 2.5 = 4", () => {
  const calc = new Calculator();
  calc.inputDigit("1");
  calc.inputDecimal();
  calc.inputDigit("5");
  calc.handleOperator("+");
  calc.inputDigit("2");
  calc.inputDecimal();
  calc.inputDigit("5");
  calc.equals();
  assert.equal(calc.currentValue, "4");
});

test("clear resets calculator", () => {
  const calc = new Calculator();
  calc.inputDigit("5");
  calc.handleOperator("+");
  calc.inputDigit("3");
  calc.clear();
  assert.equal(calc.currentValue, "0");
  assert.equal(calc.operator, null);
  assert.equal(calc.previousValue, null);
});

test("sign toggle: 5 becomes -5", () => {
  const calc = new Calculator();
  calc.inputDigit("5");
  calc.toggleSign();
  assert.equal(calc.currentValue, "-5");
});

test("percent: 50% = 0.5", () => {
  const calc = new Calculator();
  calc.inputDigit("5");
  calc.inputDigit("0");
  calc.inputPercent();
  assert.equal(calc.currentValue, "0.5");
});

test("chained operations: 2 + 3 * (operator precedence not applied) = 5 * 4 = 20", () => {
  // Calculator evaluates left-to-right: 2 + 3 = 5, then 5 * 4 = 20
  const calc = new Calculator();
  calc.inputDigit("2");
  calc.handleOperator("+");
  calc.inputDigit("3");
  calc.handleOperator("*");
  calc.inputDigit("4");
  calc.equals();
  assert.equal(calc.currentValue, "20");
});

test("floating point result is rounded correctly: 0.1 + 0.2 = 0.3", () => {
  const calc = new Calculator();
  calc.inputDigit("0");
  calc.inputDecimal();
  calc.inputDigit("1");
  calc.handleOperator("+");
  calc.inputDigit("0");
  calc.inputDecimal();
  calc.inputDigit("2");
  calc.equals();
  assert.equal(calc.currentValue, "0.3");
});

test("repeated equals repeats the last operation: 5 + 3 = 8, = 11, = 14", () => {
  const calc = new Calculator();
  calc.inputDigit("5");
  calc.handleOperator("+");
  calc.inputDigit("3");
  calc.equals();
  assert.equal(calc.currentValue, "8");
  calc.equals();
  assert.equal(calc.currentValue, "11");
  calc.equals();
  assert.equal(calc.currentValue, "14");
});

test("repeated equals works with multiplication: 2 * 3 = 6, = 18, = 54", () => {
  const calc = new Calculator();
  calc.inputDigit("2");
  calc.handleOperator("*");
  calc.inputDigit("3");
  calc.equals();
  assert.equal(calc.currentValue, "6");
  calc.equals();
  assert.equal(calc.currentValue, "18");
  calc.equals();
  assert.equal(calc.currentValue, "54");
});

test("clear resets repeated-equals state", () => {
  const calc = new Calculator();
  calc.inputDigit("5");
  calc.handleOperator("+");
  calc.inputDigit("3");
  calc.equals();
  calc.clear();
  assert.equal(calc.lastOperator, null);
  assert.equal(calc.lastOperand, null);
  calc.equals();
  assert.equal(calc.currentValue, "0");
});
