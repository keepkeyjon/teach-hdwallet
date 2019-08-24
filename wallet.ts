import { Keyring } from '@shapeshiftoss/hdwallet-core'
import { WebUSBKeepKeyAdapter } from '@shapeshiftoss/hdwallet-keepkey-webusb'

const keyring = new Keyring()

let adapter = WebUSBKeepKeyAdapter.useKeyring(keyring)

async function getWallet () {
  let wallet = await adapter.pairDevice()
  console.log({wallet})
}