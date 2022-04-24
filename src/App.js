import { useReducer } from "react";
import { ArrowLeft } from "react-bootstrap-icons";
import DigitButton from "./DigitButton";
import OperationButton from "./OperationButton";

import "./App.css";
import "./styles.css";

export const ACTIONS = {
  ADD_DIGIT: "add-digit",
  CHOOSE_OPERATION: "choose-operation",
  CLEAR: "clear",
  DELETE_DIGIT: "delete-digit",
  EVALUATE: "evaluate",
  PERCENTAGE: "percentage",
};

function reducer(state, { type, payload }) {
  // eslint-disable-next-line default-case
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        };
      }
      // We want to make sure that the user wont input more than one 0 if there are no other digits inputed
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state;
      }
      // No more than one "."
      if (payload.digit === "." && state.currentOperand.includes(".")) {
        return state;
      }
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      };
    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) {
        return state;
      }

      // Replacing operations
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        };
      }

      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        };
      }

      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      };

    case ACTIONS.CLEAR:
      return {}; // Clearing the screen, returns an empty state

    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        // after an evaluation, this acts like delete button
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        };
      }
      if (state.currentOperand == null) return state;
      if (state.currentOperand.length === 1) {
        // if there is only one digit, acts like delete button
        return { ...state, currentOperand: null };
      }

      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1), // removes the last digit from the current operand
      };

    case ACTIONS.PERCENTAGE:
      return {
        currentOperand: state.currentOperand / 100,
      };

    case ACTIONS.EVALUATE:
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state;
      }

      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      };
  }
}

function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);

  if (isNaN(prev) || isNaN(current)) return "";

  let computation = "";

  // eslint-disable-next-line default-case
  switch (operation) {
    case "+":
      computation = prev + current;
      break;
    case "-":
      computation = prev - current;
      break;
    case "*":
      computation = prev * current;
      break;
    case "/":
      computation = prev / current;
      break;
    case "%":
      computation = current / 100;
      
      break;
  }

  return computation.toString();
}

const INTEGER_FORMATER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
});

function formatOperand(operand) {
  if (operand == null) return;

  const [integer, decimal] = operand.split(".");
  if (decimal == null) return INTEGER_FORMATER.format(integer);

  return `${INTEGER_FORMATER.format(integer)}.${decimal}`;
}

const App = () => {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
    {}
  );

  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <OperationButton operation="+" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <OperationButton operation="/" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
        <ArrowLeft />
      </button>
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <button onClick={() => dispatch({ type: ACTIONS.CLEAR })}>AC</button>
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="()" dispatch={dispatch} />
      <OperationButton operation="%" dispatch={dispatch} />
      {/* <button onClick={() => dispatch({ type: ACTIONS.PERCENTAGE })}>%</button> */}
      <DigitButton digit="0" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <button
        className="evaluate"
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
      >
        =
      </button>
    </div>
  );
};

export default App;
