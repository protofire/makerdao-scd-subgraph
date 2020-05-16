import { BigDecimal, Bytes, ethereum, log } from '@graphprotocol/graph-ts'

import { LogNewCup, LogNote } from '../generated/SaiTub/SaiTub'
import { Cdp, CdpAction, EthPrice, MkrPrice, CdpEngine } from '../generated/schema'

import { pep, pip } from './contracts'
import { toAddress, toBigDecimal, toBigInt, ZERO, CDP_ENGINE_ID } from './helpers'

// Create a CDP
export function handleNewCdp(event: LogNewCup): void {
  let cdpId = toBigInt(event.params.cup).toString()
  let sender = toAddress(event.params.lad)

  let cdp = new Cdp(cdpId)

  cdp.debt = ZERO
  cdp.collateral = ZERO
  cdp.collateralUsd = ZERO
  cdp.ratio = ZERO

  cdp.owner = sender
  cdp.created = event.block.timestamp
  cdp.createdAtBlock = event.block.number
  cdp.createdAtTransaction = event.transaction.hash

  // Create synthetic OPEN action since this event is emitted before LogNewCup event
  let actionType = 'OPEN'
  let action = new CdpAction(event.transaction.hash.toHex() + '-' + actionType)
  action.cdp = cdp.id
  action.sender = cdp.owner
  action.type = actionType

  action.block = event.block.number
  action.timestamp = event.block.timestamp
  action.transactionHash = event.transaction.hash

  action.ethPrice = getEthPrice(event)
  action.mkrPrice = getMkrPrice(event)

  action.save()

  // Save action as the most recent action
  cdp.latestAction = action.id
  cdp.modified = action.timestamp
  cdp.modifiedAtBlock = action.block
  cdp.modifiedAtTransaction = action.transactionHash

  cdp.ethPrice = action.ethPrice
  cdp.mkrPrice = action.mkrPrice

  cdp.save()

  //update cdpEngine entity
  let cdpEngine = getCdpEngineEntity()
  cdpEngine.cdpCount++
  cdpEngine.openCdpCount++

  cdpEngine.cdpOwners = addOwner(cdp.owner, cdpEngine.cdpOwners)

  cdpEngine.lastBlock = action.block
  cdpEngine.lastModifiedDate = action.timestamp

  cdpEngine.save()
}

// Transfer CDP ownership (changes lad)
export function handleGive(event: LogNote): void {
  let actionType = 'GIVE'
  let actionId = event.transaction.hash.toHex() + '-' + actionType
  let cdpId = toBigInt(event.params.foo).toString()
  let sender = toAddress(event.params.guy)
  let value = toAddress(event.params.bar)

  let action = CdpAction.load(actionId)

  if (action == null) {
    action = new CdpAction(actionId)
    action.cdp = cdpId
    action.sender = sender
    action.type = actionType
    action.value = value.toHexString()

    action.block = event.block.number
    action.timestamp = event.block.timestamp
    action.transactionHash = event.transaction.hash

    action.ethPrice = getEthPrice(event)
    action.mkrPrice = getMkrPrice(event)

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Transfer CDP ownership
      cdp.owner = value

      // Save current ETH/MKR prices
      cdp.ethPrice = action.ethPrice
      cdp.mkrPrice = action.mkrPrice

      // Calculate collateralization ratio
      if (action.ethPrice) {
        cdp.collateralUsd = cdp.collateral.times(action.ethPrice)
        cdp.ratio = cdp.debt.equals(ZERO) ? ZERO : cdp.collateralUsd.div(cdp.debt)
      }

      // Save action as the most recent action
      cdp.latestAction = action.id
      cdp.modified = action.timestamp
      cdp.modifiedAtBlock = action.block
      cdp.modifiedAtTransaction = action.transactionHash

      cdp.save()

      // update cdpEngine entity
      let cdpEngine = getCdpEngineEntity()
      cdpEngine.lastBlock = action.block
      cdpEngine.lastModifiedDate = action.timestamp
      cdpEngine.save()
    }
  }
}

// Add collateral to a CDP (increases ink)
export function handleLock(event: LogNote): void {
  let actionType = 'LOCK'
  let actionId = event.transaction.hash.toHex() + '-' + actionType
  let cdpId = toBigInt(event.params.foo).toString()
  let sender = toAddress(event.params.guy)
  let value = toBigDecimal(event.params.bar)

  let action = CdpAction.load(actionId)

  if (action == null) {
    action = new CdpAction(actionId)
    action.cdp = cdpId
    action.sender = sender
    action.type = actionType
    action.value = value.toString()

    action.block = event.block.number
    action.timestamp = event.block.timestamp
    action.transactionHash = event.transaction.hash

    action.ethPrice = getEthPrice(event)
    action.mkrPrice = getMkrPrice(event)

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Increase collateral
      cdp.collateral = cdp.collateral.plus(value)

      // Save current ETH/MKR prices
      cdp.ethPrice = action.ethPrice
      cdp.mkrPrice = action.mkrPrice

      // Calculate collateralization ratio
      if (action.ethPrice) {
        cdp.collateralUsd = cdp.collateral.times(action.ethPrice)
        cdp.ratio = cdp.debt.equals(ZERO) ? ZERO : cdp.collateralUsd.div(cdp.debt)
      }

      // Save action as the most recent action
      cdp.latestAction = action.id
      cdp.modified = action.timestamp
      cdp.modifiedAtBlock = action.block
      cdp.modifiedAtTransaction = action.transactionHash

      cdp.save()

      // update cdpEngine entity
      let cdpEngine = getCdpEngineEntity()
      cdpEngine.totalCollateral = cdpEngine.totalCollateral.plus(value)
      cdpEngine.lastBlock = action.block
      cdpEngine.lastModifiedDate = action.timestamp
      cdpEngine.save()
    }
  }
}

// Remove collateral from a CDP (decreases ink)
export function handleFree(event: LogNote): void {
  let actionType = 'FREE'
  let actionId = event.transaction.hash.toHex() + '-' + actionType
  let cdpId = toBigInt(event.params.foo).toString()
  let sender = toAddress(event.params.guy)
  let value = toBigDecimal(event.params.bar)

  let action = CdpAction.load(actionId)

  if (action == null) {
    action = new CdpAction(actionId)
    action.cdp = cdpId
    action.sender = sender
    action.type = actionType
    action.value = value.toString()

    action.block = event.block.number
    action.timestamp = event.block.timestamp
    action.transactionHash = event.transaction.hash

    action.ethPrice = getEthPrice(event)
    action.mkrPrice = getMkrPrice(event)

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Decrease collateral
      cdp.collateral = cdp.collateral.minus(value)

      // Save current ETH/MKR prices
      cdp.ethPrice = action.ethPrice
      cdp.mkrPrice = action.mkrPrice

      // Calculate collateralization ratio
      if (action.ethPrice) {
        cdp.collateralUsd = cdp.collateral.times(action.ethPrice)
        cdp.ratio = cdp.debt.equals(ZERO) ? ZERO : cdp.collateralUsd.div(cdp.debt)
      }

      // Save action as the most recent action
      cdp.latestAction = action.id
      cdp.modified = action.timestamp
      cdp.modifiedAtBlock = action.block
      cdp.modifiedAtTransaction = action.transactionHash

      cdp.save()

      // update cdpEngine entity
      let cdpEngine = getCdpEngineEntity()
      cdpEngine.totalCollateral = cdpEngine.totalCollateral.minus(value)
      cdpEngine.lastBlock = action.block
      cdpEngine.lastModifiedDate = action.timestamp
      cdpEngine.save()
    }
  }
}

// Create DAI against a CDP (increases art, rum)
export function handleDraw(event: LogNote): void {
  let actionType = 'DRAW'
  let actionId = event.transaction.hash.toHex() + '-' + actionType
  let cdpId = toBigInt(event.params.foo).toString()
  let sender = toAddress(event.params.guy)
  let value = toBigDecimal(event.params.bar)

  let action = CdpAction.load(actionId)

  if (action == null) {
    action = new CdpAction(actionId)
    action.cdp = cdpId
    action.sender = sender
    action.type = actionType
    action.value = value.toString()

    action.block = event.block.number
    action.timestamp = event.block.timestamp
    action.transactionHash = event.transaction.hash

    action.ethPrice = getEthPrice(event)
    action.mkrPrice = getMkrPrice(event)

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Increase outstanding debt
      cdp.debt = cdp.debt.plus(value)

      // TODO: Update collateral less fee

      // Save current ETH/MKR prices
      cdp.ethPrice = action.ethPrice
      cdp.mkrPrice = action.mkrPrice

      // Calculate collateralization ratio
      if (action.ethPrice) {
        cdp.collateralUsd = cdp.collateral.times(action.ethPrice)
        cdp.ratio = cdp.debt.equals(ZERO) ? ZERO : cdp.collateralUsd.div(cdp.debt)
      }

      // Save action as the most recent action
      cdp.latestAction = action.id
      cdp.modified = action.timestamp
      cdp.modifiedAtBlock = action.block
      cdp.modifiedAtTransaction = action.transactionHash

      cdp.save()

      // update cdpEngine entity
      let cdpEngine = getCdpEngineEntity()
      cdpEngine.totalDebt = cdpEngine.totalDebt.plus(value)
      cdpEngine.lastBlock = action.block
      cdpEngine.lastModifiedDate = action.timestamp
      cdpEngine.save()
    }
  }
}

// Use DAI to cancel CDP debt (decreases art, rum)
export function handleWipe(event: LogNote): void {
  let actionType = 'WIPE'
  let actionId = event.transaction.hash.toHex() + '-' + actionType
  let cdpId = toBigInt(event.params.foo).toString()
  let sender = toAddress(event.params.guy)
  let value = toBigDecimal(event.params.bar)

  let action = CdpAction.load(actionId)

  if (action == null) {
    action = new CdpAction(actionId)
    action.cdp = cdpId
    action.sender = sender
    action.type = actionType
    action.value = value.toString()

    action.block = event.block.number
    action.timestamp = event.block.timestamp
    action.transactionHash = event.transaction.hash

    action.ethPrice = getEthPrice(event)
    action.mkrPrice = getMkrPrice(event)

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Decrease outstanding debt
      cdp.debt = cdp.debt.minus(value)

      // TODO: Update collateral less fee

      // Save current ETH/MKR prices
      cdp.ethPrice = action.ethPrice
      cdp.mkrPrice = action.mkrPrice

      // Calculate collateralization ratio
      if (action.ethPrice) {
        cdp.collateralUsd = cdp.collateral.times(action.ethPrice)
        cdp.ratio = cdp.debt.equals(ZERO) ? ZERO : cdp.collateralUsd.div(cdp.debt)
      }

      // Save action as the most recent action
      cdp.latestAction = action.id
      cdp.modified = action.timestamp
      cdp.modifiedAtBlock = action.block
      cdp.modifiedAtTransaction = action.transactionHash

      cdp.save()

      // update cdpEngine entity
      let cdpEngine = getCdpEngineEntity()
      cdpEngine.totalDebt = cdpEngine.totalDebt.minus(value)
      cdpEngine.lastBlock = action.block
      cdpEngine.lastModifiedDate = action.timestamp
      cdpEngine.save()
    }
  }
}

// Liquidate a CDP - Wipe all debt (zeros art, decreases ink)
export function handleBite(event: LogNote): void {
  let actionType = 'BITE'
  let actionId = event.transaction.hash.toHex() + '-' + actionType
  let cdpId = toBigInt(event.params.foo).toString()
  let sender = toAddress(event.params.guy)

  let action = CdpAction.load(actionId)

  if (action == null) {
    action = new CdpAction(actionId)
    action.cdp = cdpId
    action.sender = sender
    action.type = actionType

    action.block = event.block.number
    action.timestamp = event.block.timestamp
    action.transactionHash = event.transaction.hash

    action.ethPrice = getEthPrice(event)
    action.mkrPrice = getMkrPrice(event)

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // I think this should be after calculating ratio.
      // Reset outstanding debt
      let debt = cdp.debt
      let collateral = cdp.collateral
      cdp.debt = ZERO

      // TODO: Calculate remaining collateral

      // Save current ETH/MKR prices
      cdp.ethPrice = action.ethPrice
      cdp.mkrPrice = action.mkrPrice

      // Calculate collateralization ratio
      if (action.ethPrice) {
        cdp.collateralUsd = cdp.collateral.times(action.ethPrice)
        cdp.ratio = cdp.debt.equals(ZERO) ? ZERO : cdp.collateralUsd.div(cdp.debt)
      }

      // Save action as the most recent action
      cdp.latestAction = action.id
      cdp.modified = action.timestamp
      cdp.modifiedAtBlock = action.block
      cdp.modifiedAtTransaction = action.transactionHash

      cdp.save()

      // update cdpEngine entity
      let cdpEngine = getCdpEngineEntity()

      cdpEngine.totalCollateral = cdpEngine.totalCollateral.minus(collateral)
      cdpEngine.totalDebt = cdpEngine.totalDebt.minus(debt)
      cdpEngine.openCdpCount--

      cdpEngine.lastBlock = action.block
      cdpEngine.lastModifiedDate = action.timestamp

      cdpEngine.save()
    }
  }
}

// Close a CDP - Wipe all debt, free all collateral and delete the CDP
export function handleShut(event: LogNote): void {
  let actionType = 'SHUT'
  let actionId = event.transaction.hash.toHex() + '-' + actionType
  let cdpId = toBigInt(event.params.foo).toString()
  let sender = toAddress(event.params.guy)

  let action = CdpAction.load(actionId)

  if (action == null) {
    action = new CdpAction(actionId)
    action.cdp = cdpId
    action.sender = sender
    action.type = actionType

    action.block = event.block.number
    action.timestamp = event.block.timestamp
    action.transactionHash = event.transaction.hash

    action.ethPrice = getEthPrice(event)
    action.mkrPrice = getMkrPrice(event)

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Mark CDP as deleted
      cdp.deleted = event.block.timestamp

      // Reset collateral and debt
      let debt = cdp.debt
      let collateral = cdp.collateral
      cdp.debt = ZERO
      cdp.collateral = ZERO

      // Save current ETH/MKR prices
      cdp.ethPrice = action.ethPrice
      cdp.mkrPrice = action.mkrPrice

      // Calculate collateralization ratio
      if (action.ethPrice) {
        cdp.collateralUsd = cdp.collateral.times(action.ethPrice)
        cdp.ratio = cdp.debt.equals(ZERO) ? ZERO : cdp.collateralUsd.div(cdp.debt)
      }

      // Save action as the most recent action
      cdp.latestAction = action.id
      cdp.modified = action.timestamp
      cdp.modifiedAtBlock = action.block
      cdp.modifiedAtTransaction = action.transactionHash

      cdp.save()

      // update cdpEngine entity
      let cdpEngine = getCdpEngineEntity()

      cdpEngine.totalCollateral = cdpEngine.totalCollateral.minus(collateral)
      cdpEngine.totalDebt = cdpEngine.totalDebt.minus(debt)
      cdpEngine.openCdpCount--

      cdpEngine.lastBlock = action.block
      cdpEngine.lastModifiedDate = action.timestamp
      cdpEngine.save()
    }
  }
}

function getEthPrice(event: ethereum.Event): BigDecimal {
  let blockNumber = event.block.number
  let price = EthPrice.load(blockNumber.toString())

  if (!price) {
    let result = pip.peek()

    if (!result.value1) {
      log.warning('There is no price for ETH at block {}', [blockNumber.toString()])

      return null
    }

    price = new EthPrice(blockNumber.toString())
    price.block = blockNumber
    price.timestamp = event.block.timestamp
    price.value = toBigDecimal(result.value0)

    price.save()
  }

  return price.value
}

function getMkrPrice(event: ethereum.Event): BigDecimal {
  let blockNumber = event.block.number
  let price = MkrPrice.load(blockNumber.toString())

  if (!price) {
    let result = pep.peek()

    if (!result.value1) {
      log.warning('There is no price for MKR at block {}', [blockNumber.toString()])

      return null
    }

    price = new MkrPrice(blockNumber.toString())
    price.block = blockNumber
    price.timestamp = event.block.timestamp
    price.value = toBigDecimal(result.value0)

    price.save()
  }

  return price.value
}

// Not possible to make it generic
// https://github.com/AssemblyScript/assemblyscript/issues/219
function addOwner(owner: Bytes, list: Array<Bytes>): Array<Bytes> {
  let response = list
  let exists = false

  // there is no possible to use array.some to achieve the same functionality
  //https://docs.assemblyscript.org/basics/limitations#closures
  for (let i = 0, k = list.length; i < k; ++i) {
    if (list[i].toHexString() == owner.toHexString()) {
      exists = true
      break
    }
  }

  if (!exists) {
    response.push(owner)
  }

  return response
}

function getCdpEngineEntity(): CdpEngine {
  let cdpEngine = CdpEngine.load(CDP_ENGINE_ID)

  if (cdpEngine === null) {
    cdpEngine = new CdpEngine(CDP_ENGINE_ID)
    cdpEngine.cdpCount = 0
    cdpEngine.openCdpCount = 0
    cdpEngine.totalCollateral = ZERO
    cdpEngine.totalDebt = ZERO
    cdpEngine.cdpOwners = []
  }

  return cdpEngine as CdpEngine
}
