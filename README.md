# MakerDAO subgraph
The goal of this subgraph is to provide information about CDPs. This information can be queried via GraphQL in a simplest and more user-friendly way than consulting the contracts directly.

The MakerDAO subgraph currently only tracks CDPs for **Single Collateral Dai** contracts. It's important to note that the [stability fee](https://github.com/makerdao/community/blob/master/faqs/stability-fee.md#how-is-the-stability-fee-calculated) is not yet being calculated correctly for some operations that involve returning debt. That is why collateral might not be consistent after a BITE action.

This subgraph is already [deployed to The Graph hosted service](https://thegraph.com/explorer/subgraph/protofire/makerdao).

## What is MakerDAO
> The Dai Stablecoin is a collateral-backed cryptocurrency whose value is stable relative to the US Dollar. We believe that stable digital assets like Dai are essential to realizing the full potential of blockchain technology. Unlike other Stablecoins, Dai is completely decentralized3.
Users can obtain Dai by buying it from brokers or exchanges, and Dai holders can utilize a special mechanic known as the Dai Savings Rate to earn a steady, low-risk return on their holdings.
MakerDao is a smart contract platform on Ethereum that backs and stabilizes the value of Dai through a dynamic system of Collateralized Debt Positions (CDPs), autonomous feedback mechanisms, and appropriately incentivized external actors.
MakerDao enables anyone to leverage their Ethereum assets to generate Dai on the Maker Platform. Once generated, Dai can be used in the same manner as any other cryptocurrency: it can be freely sent to others, used as payments for goods and services, or held as long term savings. Importantly, the generation of Dai also creates the components needed for a robust decentralized lending platform.

[More information about MakerDAO](https://makerdao.com/en/whitepaper/).

## What is The Graph
> The Graph is a decentralized protocol for indexing and querying data from blockchains, starting with Ethereum. It makes it possible to query data that is difficult to query directly.

> The Graph indexes blockchain data. Theses indexes ("subgraphs") can then be queried with a standard GraphQL API.

[More information about The Graph](https://thegraph.com/).

## Technical Overview

This subgraph indexes the following contracts:
* [SaiTub](https://github.com/makerdao/sai/blob/master/src/tub.sol): simplified CDP engine
* [Pip](https://github.com/makerdao/medianizer): collateral price oracle (ETH)
* [Pep](https://github.com/makerdao/medianizer): governance token price oracle (MKR)

There are other contracts related but they are not in the scope of this subgraph.

The main entities defined for this subgraph are:
* Cdp: contains information about all the Cdp created
* CdpAction: represents any action done in a Cdp
* EthPrice: tracks ETH price in USD
* MkrPrice: tracks MKR token price in USD

Each CDP action belong to one of these types:
  * OPEN: emitted when a CDP is created
  * GIVE: emitted when the ownership of the CDP is transferred
  * LOCK: emitted when collateral is added to a CDP
  * FREE: emitted when collateral is removed from a CDP
  * DRAW: emitted when DAI is created from a CDP (increase debt)
  * WIPE: emitted when DAI is returned to a CDP (cancel debt)
  * BITE: emitted when a CDP is liquidated (wipe all debt but CDP remains open)
  * SHUT: emitted when a CDP is closed (wipe all debt, free all collateral and delete the CDP). After that CDP will never be used again.

 ### Working locally
This project can be `git clone` and then you will be able to run the subgraph locally by following this [instructions](https://thegraph.com/docs/quick-start#local-development).
Note that you won't need to create the subgraph by running `graph init`, instead you only need to create the subgraph with `yarn create-local` and then deploying it with `yarn deploy-local`.

```bash
# Each subgraph modification will require to run the next commands

$ yarn codegen       # only needed if the schema or ABI have been modified

$ yarn create-local  # only the first time

$ yarn deploy-local  # after any change in the subgraph
```

### Running subgraph on Kovan network

You can opt by running this subgraph in the MainNet or in the Kovan Testnet . If you want to work with Kovan you will need to comment/uncomment the network and address attributes in the `subgraph.yaml` file:

```yml
dataSources:
  - kind: ethereum/contract
    name: sai
    network: kovan
    source:
      address: '0xa71937147b55Deb8a530C7229C442Fd3F31b7db2'
```

**Important note:** you will also have to use the appropriate adresses in the [contracts configuration](https://github.com/Altoros/makerdao-subgraph/blob/master/src/contracts.ts) but be aware of Medianizer's prices are outdated on Kovan network and they might not make sense.
