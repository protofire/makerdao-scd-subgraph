import { LogNewCup, LogNote } from '../generated/SaiTub/SaiTub'
import { Cdp, CdpAction } from '../generated/schema'

import { toAddress, toBigDecimal, toBigInt, ZERO } from './helpers'

export function handleNewCdp(event: LogNewCup): void {
  let cdpId = toBigInt(event.params.cup).toString()
  let sender = toAddress(event.params.lad)

  let cdp = new Cdp(cdpId)

  cdp.debt = ZERO
  cdp.collateral = ZERO

  cdp.created = event.block.timestamp
  cdp.owner = sender
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

  action.save()

  // Save action as the most recent action
  cdp.latestAction = action.id

  cdp.save()
}

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

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Transfer CDP
      cdp.owner = value

      // Save action as the most recent action
      cdp.latestAction = action.id

      cdp.save()
    }
  }
}

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

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Increase collateral
      cdp.collateral = cdp.collateral.plus(value)

      // Save action as the most recent action
      cdp.latestAction = action.id

      cdp.save()
    }
  }
}

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

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Decrease collateral
      cdp.collateral = cdp.collateral.minus(value)

      // Save action as the most recent action
      cdp.latestAction = action.id

      cdp.save()
    }
  }
}

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

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Increase outstanding debt
      cdp.debt = cdp.debt.plus(value)

      // TODO: Update collateral less fee

      // Save action as the most recent action
      cdp.latestAction = action.id

      cdp.save()
    }
  }
}

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

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Decrease outstanding debt
      cdp.debt = cdp.debt.minus(value)

      // TODO: Update collateral less fee

      // Save action as the most recent action
      cdp.latestAction = action.id

      cdp.save()
    }
  }
}

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

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Reset outstanding debt
      cdp.debt = ZERO

      // TODO: Calculate remaining collateral

      // Save action as the most recent action
      cdp.latestAction = action.id

      cdp.save()
    }
  }
}

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

    action.save()

    // Update CDP related to this action
    let cdp = Cdp.load(cdpId)

    if (cdp != null) {
      // Mark CDP as deleted
      cdp.deleted = true

      // Reset collateral and debt
      cdp.debt = ZERO
      cdp.collateral = ZERO

      // Save action as the most recent action
      cdp.latestAction = action.id

      cdp.save()
    }
  }
}
