import * as React from "react";
import * as debug from "debug";

import { Keyring } from "@shapeshiftoss/hdwallet-core";
import { WebUSBKeepKeyAdapter } from "@shapeshiftoss/hdwallet-keepkey-webusb";
import { TrezorAdapter } from "@shapeshiftoss/hdwallet-trezor-connect";

const log = debug.default("hdwallet");
window.localStorage.debug = "*";

export class Wallet extends React.Component {
  keyring;
  keepkeyAdapter;
  trezorAdapter;
  state = { wallet: undefined };

  constructor(props) {
    super(props);

    this.keyring = new Keyring();

    this.keyring.onAny((event: string[], ...values: any[]) => {
      const [[, { from_wallet = false }]] = values;
      log((from_wallet ? "🔑" : "🖥") + " " + event.join("."), ...values);
    });

    this.keepkeyAdapter = WebUSBKeepKeyAdapter.useKeyring(this.keyring);

    this.trezorAdapter = TrezorAdapter.useKeyring(this.keyring, {
      debug: false,
      manifest: {
        appUrl: "example.com",
        email: "you@example.com"
      }
    });
  }

  async handlePair(adapter) {
    let wallet = await adapter.pairDevice();
    this.setState({ wallet });
  }

  render() {
    return (
      <>
        <button onClick={() => this.handlePair(this.keepkeyAdapter)}>
          Pair KeepKey
        </button>
        <button onClick={() => this.handlePair(this.trezorAdapter)}>
          Pair Trezor
        </button>
      </>
    );
  }
}
