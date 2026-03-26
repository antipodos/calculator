class Calculator {
  constructor() {
    this.currentValue = "0";
    this.previousValue = null;
    this.operator = null;
    this.waitingForOperand = false;
  }

  clear() {
    this.currentValue = "0";
    this.previousValue = null;
    this.operator = null;
    this.waitingForOperand = false;
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
    if (!this.operator || this.waitingForOperand) return;
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
  }

  roundResult(value) {
    return Math.round(value * 1e10) / 1e10;
  }

  getExpression() {
    if (!this.operator) return "";
    const opSymbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };
    return `${this.previousValue} ${opSymbols[this.operator] || this.operator}`;
  }
}

const calculator = new Calculator();

const resultEl = document.getElementById("result");
const expressionEl = document.getElementById("expression");

function updateDisplay() {
  resultEl.textContent = calculator.currentValue;
  expressionEl.textContent = calculator.getExpression();
}

function setActiveOperator(op) {
  document.querySelectorAll(".btn-operator").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.value === op && op !== null) {
      btn.classList.add("active");
    }
  });
}

document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const { action, value } = btn.dataset;

    if (action === "digit") {
      calculator.inputDigit(value);
      setActiveOperator(null);
    } else if (action === "decimal") {
      calculator.inputDecimal();
      setActiveOperator(null);
    } else if (action === "operator") {
      calculator.handleOperator(value);
      setActiveOperator(value);
    } else if (action === "equals") {
      calculator.equals();
      setActiveOperator(null);
    } else if (action === "clear") {
      calculator.clear();
      setActiveOperator(null);
    } else if (action === "sign") {
      calculator.toggleSign();
    } else if (action === "percent") {
      calculator.inputPercent();
    }

    updateDisplay();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    calculator.inputDigit(e.key);
    setActiveOperator(null);
  } else if (e.key === ".") {
    calculator.inputDecimal();
  } else if (e.key === "+") {
    calculator.handleOperator("+");
    setActiveOperator("+");
  } else if (e.key === "-") {
    calculator.handleOperator("-");
    setActiveOperator("-");
  } else if (e.key === "*") {
    calculator.handleOperator("*");
    setActiveOperator("*");
  } else if (e.key === "/") {
    e.preventDefault();
    calculator.handleOperator("/");
    setActiveOperator("/");
  } else if (e.key === "Enter" || e.key === "=") {
    calculator.equals();
    setActiveOperator(null);
  } else if (e.key === "Escape") {
    calculator.clear();
    setActiveOperator(null);
  } else if (e.key === "Backspace") {
    if (
      !calculator.waitingForOperand &&
      calculator.currentValue !== "0" &&
      calculator.currentValue !== "Error"
    ) {
      calculator.currentValue =
        calculator.currentValue.length > 1
          ? calculator.currentValue.slice(0, -1)
          : "0";
    }
  }
  updateDisplay();
});
