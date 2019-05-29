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
  let action = new CdpAction(event.block.timestamp.toString() + '-' + event.transaction.hash.toHex())
  action.type = 'OPEN'
  action.cdp = cdp.id
  action.sender = cdp.owner

  action.block = event.block.number
  action.timestamp = event.block.timestamp
  action.transactionHash = event.transaction.hash

  action.save()

  // Save action as the most recent action
  cdp.block = action.block
  cdp.timestamp = action.timestamp

  cdp.save()
}

export function handleGive(event: LogNote): void {
  let cdpId = toBigInt(event.params.foo).toString()
  let value = toAddress(event.params.bar)
  let sender = toAddress(event.params.guy)

  let cdp = Cdp.load(cdpId)

  let action = new CdpAction(event.block.timestamp.toString() + '-' + event.transaction.hash.toHex())
  action.type = 'GIVE'
  action.transferTo = value
  action.cdp = cdp ? cdp.id : null
  action.sender = sender

  action.block = event.block.number
  action.timestamp = event.block.timestamp
  action.transactionHash = event.transaction.hash

  action.save()

  if (cdp != null) {
    // Transfer CDP
    cdp.owner = value

    // Save action as the most recent action
    cdp.block = action.block
    cdp.timestamp = action.timestamp

    cdp.save()
  }
}

export function handleLock(event: LogNote): void {
  let cdpId = toBigInt(event.params.foo).toString()
  let value = toBigDecimal(event.params.bar)
  let sender = toAddress(event.params.guy)

  let cdp = Cdp.load(cdpId)

  let action = new CdpAction(event.block.timestamp.toString() + '-' + event.transaction.hash.toHex())
  action.type = 'LOCK'
  action.amount = value
  action.cdp = cdp ? cdp.id : null
  action.sender = sender

  action.block = event.block.number
  action.timestamp = event.block.timestamp
  action.transactionHash = event.transaction.hash

  action.save()

  if (cdp != null) {
    // Increase collateral
    cdp.collateral = cdp.collateral == ZERO ? value : cdp.collateral.plus(value)

    // Save action as the most recent action
    cdp.block = action.block
    cdp.timestamp = action.timestamp

    cdp.save()
  }
}

export function handleFree(event: LogNote): void {
  let cdpId = toBigInt(event.params.foo).toString()
  let value = toBigDecimal(event.params.bar)
  let sender = toAddress(event.params.guy)

  let cdp = Cdp.load(cdpId)

  let action = new CdpAction(event.block.timestamp.toString() + '-' + event.transaction.hash.toHex())
  action.type = 'FREE'
  action.amount = value
  action.cdp = cdp ? cdp.id : null
  action.sender = sender

  action.block = event.block.number
  action.timestamp = event.block.timestamp
  action.transactionHash = event.transaction.hash

  action.save()

  if (cdp != null) {
    // Decrease collateral
    cdp.collateral = cdp.collateral == ZERO ? ZERO : cdp.collateral.minus(value)

    // Save action as the most recent action
    cdp.block = action.block
    cdp.timestamp = action.timestamp

    cdp.save()
  }
}

export function handleDraw(event: LogNote): void {
  let cdpId = toBigInt(event.params.foo).toString()
  let value = toBigDecimal(event.params.bar)
  let sender = toAddress(event.params.guy)

  let cdp = Cdp.load(cdpId)

  let action = new CdpAction(event.block.timestamp.toString() + '-' + event.transaction.hash.toHex())
  action.type = 'DRAW'
  action.amount = value
  action.cdp = cdp ? cdp.id : null
  action.sender = sender

  action.block = event.block.number
  action.timestamp = event.block.timestamp
  action.transactionHash = event.transaction.hash

  action.save()

  if (cdp != null) {
    // Increase outstanding debt
    cdp.debt = cdp.debt == ZERO ? value : cdp.debt.plus(value)

    // TODO: Update collateral less fee

    // Save action as the most recent action
    cdp.block = action.block
    cdp.timestamp = action.timestamp

    cdp.save()
  }
}

export function handleWipe(event: LogNote): void {
  let cdpId = toBigInt(event.params.foo).toString()
  let value = toBigDecimal(event.params.bar)
  let sender = toAddress(event.params.guy)

  let cdp = Cdp.load(cdpId)

  let action = new CdpAction(event.block.timestamp.toString() + '-' + event.transaction.hash.toHex())
  action.type = 'WIPE'
  action.amount = value
  action.cdp = cdp ? cdp.id : null
  action.sender = sender

  action.block = event.block.number
  action.timestamp = event.block.timestamp
  action.transactionHash = event.transaction.hash

  action.save()

  if (cdp != null) {
    // Decrease outstanding debt [DAI]
    cdp.debt = cdp.debt == ZERO ? ZERO : cdp.debt.minus(value)

    // TODO: Update collateral less fee

    // Save action as the most recent action
    cdp.block = action.block
    cdp.timestamp = action.timestamp

    cdp.save()
  }
}

export function handleBite(event: LogNote): void {
  let cdpId = toBigInt(event.params.foo).toString()
  let sender = toAddress(event.params.guy)

  let cdp = Cdp.load(cdpId)

  let action = new CdpAction(event.block.timestamp.toString() + '-' + event.transaction.hash.toHex())
  action.type = 'BITE'
  action.cdp = cdp ? cdp.id : null
  action.sender = sender

  action.block = event.block.number
  action.timestamp = event.block.timestamp
  action.transactionHash = event.transaction.hash

  action.save()

  if (cdp != null) {
    // Reset outstanding debt
    cdp.debt = ZERO

    // TODO: Calculate remaining collateral

    // Save action as the most recent action
    cdp.block = action.block
    cdp.timestamp = action.timestamp

    // Persist changes in the CDP
    cdp.save()
  }
}

export function handleShut(event: LogNote): void {
  let cdpId = toBigInt(event.params.foo).toString()
  let sender = toAddress(event.params.guy)

  let cdp = Cdp.load(cdpId)

  let action = new CdpAction(event.block.timestamp.toString() + '-' + event.transaction.hash.toHex())
  action.type = 'SHUT'
  action.cdp = cdp ? cdp.id : null
  action.sender = sender

  action.block = event.block.number
  action.timestamp = event.block.timestamp
  action.transactionHash = event.transaction.hash

  action.save()

  if (cdp != null) {
    // Mark CDP as deleted
    cdp.deleted = true

    // Reset collateral and debt
    cdp.debt = ZERO
    cdp.collateral = ZERO

    // Save action as the most recent action
    cdp.block = action.block
    cdp.timestamp = action.timestamp

    // Persist changes in the CDP
    cdp.save()
  }
}
