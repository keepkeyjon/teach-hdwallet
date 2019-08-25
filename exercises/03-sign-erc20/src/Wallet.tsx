import * as React from "react";
import * as debug from "debug";

import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.css";

import QRCode from "qrcode-react";

import PinPadModal from "./PinPadModal";

import PinPadModal from "./PinPadModal";

import {
  Keyring,
  supportsETH,
  Events,
  bip32ToAddressNList,
} from "@shapeshiftoss/hdwallet-core";
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
    serialized: undefined,
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
        <PinPadModal
          show={this.state.pinOpen}
          onSubmit={(pin: string) => this.pinEntered(pin)}
          onHide={() => this.cancel()}
        />
        <div hidden={this.state.address}>
          <h4>Implement 'Sign Tx'</h4>
          <p>
            Use the <code>TODO</code> hints in <code>Wallet.tsx</code>
          </p>
        </div>
        <div hidden={!this.state.serialized}>
          <span>{this.state.serialized}</span>
        </div>
      </>
    );
  }
}
