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
    address: undefined
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

  async handleShow() {
    if (!supportsETH(this.state.wallet)) {
      return;
    }

    let address = "Implement Me!";

    // TODO: fetch supported paths from ethGetAccountPaths

    // TODO: use the 0th result, and join the contained
    // hardenedPath and relPath arrays to form an addressNList

    // TODO: request the address at that path, without showing on device

    // This will show the Address & QRCode in the App:
    this.setState({ address });

    // TODO: request the address again, this time showing on device
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
        <Button disabled={!this.state.wallet} onClick={() => this.handleShow()}>
          Show Address
        </Button>
        <br />
        <br />
        <div hidden={!this.state.address}>
          <QRCode value={this.state.address} size={128} includeMargin="true" />
          <br />
          <span>{this.state.address}</span>
        </div>
      </>
    );
  }
}
