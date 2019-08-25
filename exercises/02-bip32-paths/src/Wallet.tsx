import * as React from "react";
import * as debug from "debug";

import { Keyring, supportsETH } from "@shapeshiftoss/hdwallet-core";
import { WebUSBKeepKeyAdapter } from "@shapeshiftoss/hdwallet-keepkey-webusb";
import { TrezorAdapter } from "@shapeshiftoss/hdwallet-trezor-connect";

const log = debug.default("hdwallet");
window.localStorage.debug = "*";

export class Wallet extends React.Component {
  keyring;
  keepkeyAdapter;
  trezorAdapter;
  state = { wallet: undefined, paths: undefined };

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

    if (supportsETH(wallet)) {
      let paths = JSON.stringify(
        wallet.ethGetAccountPaths({
           coin: 'Ethereum',
           accountIdx: 1
         }), null, 2)

      this.setState({ paths })
    }

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
        <br/><br/>
        <div hidden={!this.state.paths}>{this.state.paths}</div>
      </>
    );
  }
}
