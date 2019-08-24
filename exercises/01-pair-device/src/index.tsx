import * as React from "react";
import { render } from "react-dom";

import { Keyring, HDWallet } from "@shapeshiftoss/hdwallet-core";
import { WebUSBKeepKeyAdapter } from "@shapeshiftoss/hdwallet-keepkey-webusb";
import { TrezorAdapter } from "@shapeshiftoss/hdwallet-trezor-connect";

import "./styles.css";
import { string } from "prop-types";

class WalletContext extends React.Component {
  keyring: Keyring;
  keepkeyAdapter: any;
  trezorAdapter: any;
  wallet: HDWallet;

  constructor(props) {
    super(props);
    this.keyring = new Keyring();
    this.keepkeyAdapter = WebUSBKeepKeyAdapter.useKeyring(this.keyring);
    this.trezorAdapter = TrezorAdapter.useKeyring(this.keyring, {
      debug: false,
      manifest: {
        appUrl: "example.com",
        email: "you@example.com"
      }
    });
  }

  async handlePair(vendor: string) {
    let adapter = {
      keepkey: this.keepkeyAdapter,
      trezor: this.trezorAdapter
    }[vendor];

    console.log(`Pairing ${vendor}`);
    this.wallet = await adapter.pairDevice();
    console.log(this.wallet)
  }

  render() {
    return (
      <>
        <button onClick={() => this.handlePair("keepkey")}>Pair KeepKey</button>
        <button onClick={() => this.handlePair("trezor")}>Pair Trezor</button>
      </>
    );
  }
}

function App() {
  return (
    <div className="App">
      <WalletContext />
    </div>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
