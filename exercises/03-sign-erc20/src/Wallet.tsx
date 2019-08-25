import * as React from "react";
import * as debug from "debug";

import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.css";

import QRCode from "qrcode-react";

import { Keyring, supportsETH } from "@shapeshiftoss/hdwallet-core";
import { WebUSBKeepKeyAdapter } from "@shapeshiftoss/hdwallet-keepkey-webusb";
import { TrezorAdapter } from "@shapeshiftoss/hdwallet-trezor-connect";

const log = debug.default("hdwallet");
window.localStorage.debug = "*";

export class Wallet extends React.Component {
  keyring;
  keepkeyAdapter;
  trezorAdapter;
  state = {
    wallet: undefined,
    serialized: undefined
  };

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

  async handleSign() {
    if (!supportsETH(this.state.wallet)) {
      return;
    }

    let wallet = this.state.wallet;

    try {
      // TODO: sign an ERC20 transaction, and extract the raw serialized tx
      let serialized = "";

      // This will show the serialized tx in the App
      this.setState({ serialized });
    } catch (e) {
      console.error(e);
      this.setState({ address: "Oops, something went wrong" });
    }
  }

  render() {
    return (
      <>
        <Button onClick={() => this.handlePair(this.keepkeyAdapter)}>
          Pair KeepKey
        </Button>
        <Button onClick={() => this.handlePair(this.trezorAdapter)}>
          Pair Trezor
        </Button>
        <hr />
        <Button disabled={!this.state.wallet} onClick={() => this.handleSign()}>
          Sign Tx
        </Button>
        <br />
        <br />
        <div hidden={this.state.serialized}>
          <h4>Implement 'Sign Tx'</h4>
          <p>
            Use the <code>TODO</code> hints in <code>Wallet.tsx</code>
          </p>
        </div>
        <div hidden={!this.state.serialized}>
          <QRCode
            value={this.state.serialized}
            size={128}
            includeMargin="true"
          />
          <br />
          <span>{this.state.serialized}</span>
        </div>
      </>
    );
  }
}
