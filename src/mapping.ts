import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'

import { LogNewCup, LogNote } from '../generated/sai/tub'
import { Cdp, CdpAction } from '../generated/schema'

import { pep, pip } from './contracts'
import { toAddress, toBigDecimal, toBigInt, ZERO } from './helpers'

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

  action.ethPrice = getEthPrice(event.block.number)
  action.mkrPrice = getMkrPrice(event.block.number)

  action.save()

  // Save action as the most recent action
  cdp.latestAction = action.id
  cdp.modified = action.timestamp
  cdp.modifiedAtBlock = action.block
  cdp.modifiedAtTransaction = action.transactionHash

  cdp.ethPrice = action.ethPrice
  cdp.mkrPrice = action.mkrPrice

  cdp.save()
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

    action.ethPrice = getEthPrice(event.block.number)
    action.mkrPrice = getMkrPrice(event.block.number)

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

    action.ethPrice = getEthPrice(event.block.number)
    action.mkrPrice = getMkrPrice(event.block.number)

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

    action.ethPrice = getEthPrice(event.block.number)
    action.mkrPrice = getMkrPrice(event.block.number)

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

    action.ethPrice = getEthPrice(event.block.number)
    action.mkrPrice = getMkrPrice(event.block.number)

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

    action.ethPrice = getEthPrice(event.block.number)
    action.mkrPrice = getMkrPrice(event.block.number)

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

    action.ethPrice = getEthPrice(event.block.number)
    action.mkrPrice = getMkrPrice(event.block.number)

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Reset outstanding debt
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

    action.ethPrice = getEthPrice(event.block.number)
    action.mkrPrice = getMkrPrice(event.block.number)

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Mark CDP as deleted
      cdp.deleted = event.block.timestamp

      // Reset collateral and debt
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
    }
  }
}

function getEthPrice(blockNumber: BigInt): BigDecimal {
  let result = pip.peek()

  if (result.value1) {
    return toBigDecimal(result.value0)
  } else {
    log.warning('There is no price for ETH at block {}', [blockNumber.toString()])

    return null
  }
}

function getMkrPrice(blockNumber: BigInt): BigDecimal {
  let result = pep.peek()

  if (result.value1) {
    return toBigDecimal(result.value0)
  } else {
    log.warning('There is no price for ETH at block {}', [blockNumber.toString()])

    return null
  }
}
