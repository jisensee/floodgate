import { WebWalletConnector as ArgentWebWalletConnector } from '@argent/starknet-react-webwallet-connector'
import { O } from '@mobily/ts-belt'
import { sepolia } from '@starknet-react/chains'
import { Connector } from '@starknet-react/core'

export class WebWalletConnector extends Connector {
  private connector = new ArgentWebWalletConnector({
    url: 'https://web.hydrogen.argent47.net',
  })

  get id() {
    return this.connector.id
  }

  get name() {
    return this.connector.name
  }

  get icon() {
    const { dark, light } = this.connector.icon

    return {
      dark:
        O.map(dark, (svg) => `data:image/svg+xml;base64,${btoa(svg)}`) ??
        undefined,
      light:
        O.map(light, (svg) => `data:image/svg+xml;base64,${btoa(svg)}`) ??
        undefined,
    }
  }

  available() {
    return this.connector.available()
  }

  ready() {
    return this.connector.ready()
  }

  async connect() {
    const acc = await this.connector.connect()
    const chainId = await acc.getChainId()

    return {
      account: acc.address,
      chainId: BigInt(chainId.toString()),
    }
  }

  disconnect() {
    return this.connector.disconnect()
  }

  async account() {
    const acc = await this.connector.account()
    if (!acc) throw new Error('No account')

    return acc
  }

  chainId() {
    return Promise.resolve(sepolia.id)
  }
}
