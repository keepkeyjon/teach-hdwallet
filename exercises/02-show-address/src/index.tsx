import * as React from "react";
import { render } from "react-dom";

import "./styles.css";

import { Wallet } from "./Wallet";

function App() {
  return (
    <div className="App">
      <Wallet />
    </div>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
