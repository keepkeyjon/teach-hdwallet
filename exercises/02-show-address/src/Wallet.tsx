import * as React from "react";
import * as debug from "debug";

import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.css";

import QRCode from "qrcode-react";

import PinPadModal from "./PinPadModal";

import { Keyring, supportsETH, Events } from "@shapeshiftoss/hdwallet-core";
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
    address: undefined,
    pinOpen: false
  };

  constructor(props) {
    super(props);

    this.keyring = new Keyring();

    this.keyring.onAny((event: string[], ...values: any[]) => {
      const [[, { from_wallet = false }]] = values;
      log((from_wallet ? "🔑" : "🖥") + " " + event.join("."), ...values);
    });

    // If the wallet asks for a PIN, open the PIN modal
    this.keyring.on(["*", "*", Events.PIN_REQUEST], m => {
      this.setState({ pinOpen: true });
    });

    // Simplification: only support the empty passphrase wallet
    this.keyring.on(["*", "*", Events.PASSPHRASE_REQUEST], m => {
      // ... by sending the empty passphrase when asked for one.
      this.state.wallet.sendPassphrase("");
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

  pinEntered(pin: string) {
    this.setState({ pinOpen: false });
    this.state.wallet.sendPin(pin);
  }

  async cancel() {
    this.setState({ pinOpen: false });
    await this.state.wallet.cancel();
  }

  async handlePair(adapter) {
    let wallet = await adapter.pairDevice();
    this.setState({ wallet });
  }

  async handleShow() {
    if (!supportsETH(this.state.wallet)) {
      return;
    }

    let wallet = this.state.wallet;

    try {
      // TODO: fetch supported paths from ethGetAccountPaths
      let paths = wallet.ethGetAccountPaths({
        // hint: need to pass which coin, and which account index.
      })

      // TODO: use the 0th result, and join the contained
      // hardenedPath and relPath arrays to form an addressNList
      let addressNList = []

      // TODO: request the address at that path, without showing on device
      let address = await wallet.ethGetAddress({
        // hint: showDisplay: false, among other things
      })

      // This will show the Address & QRCode in the App:
      this.setState({ address });

      // TODO: request the address again, this time showing on device
      await wallet.ethGetAddress({
        // hint: showDisplay: true, among other things
      })
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
        <Button disabled={!this.state.wallet} onClick={() => this.handleShow()}>
          Show Address
        </Button>
        <br />
        <br />
        <PinPadModal
          show={this.state.pinOpen}
          onSubmit={(pin: string) => this.pinEntered(pin)}
          onHide={() => this.cancel()}
        />
        <div hidden={this.state.address}>
          <h4>Implement 'Show Address'</h4>
          <p>
            Use the <code>TODO</code> hints in <code>Wallet.tsx</code>
          </p>
        </div>
        <div hidden={!this.state.address}>
          <QRCode value={this.state.address} size={128} includeMargin="true" />
          <br />
          <span>{this.state.address}</span>
        </div>
      </>
    );
  }
}
