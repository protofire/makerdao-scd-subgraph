import { LogNewCup, LogNote } from '../generated/SaiTub/SaiTub'

import { toAddress, toBigDecimal, toBigInt } from './helpers'
import { createCdp, createCdpAction, addActionToCdp } from './templates'

export function handleNewCdp(event: LogNewCup): void {
  let cdp = createCdp(event)
  cdp.save()

  // Create synthetic OPEN action since this event is emitted before LogNewCup event
  let action = createCdpAction('OPEN', event)

  addActionToCdp(action, cdp.id)
}

export function handleGive(event: LogNote): void {
  let cdpId = toBigInt(event.params.foo).toString()

  let action = createCdpAction('GIVE', event)
  action.value = toAddress(event.params.bar).toHex()

  addActionToCdp(action, cdpId)
}

export function handleLock(event: LogNote): void {
  let cdpId = toBigInt(event.params.foo).toString()

  let action = createCdpAction('LOCK', event)
  action.value = toBigDecimal(event.params.bar).toString()

  addActionToCdp(action, cdpId)
}

export function handleFree(event: LogNote): void {
  let cdpId = toBigInt(event.params.foo).toString()

  let action = createCdpAction('FREE', event)
  action.value = toBigDecimal(event.params.bar).toString()

  addActionToCdp(action, cdpId)
}

export function handleDraw(event: LogNote): void {
  let cdpId = toBigInt(event.params.foo).toString()

  let action = createCdpAction('DRAW', event)
  action.value = toBigDecimal(event.params.bar).toString()

  addActionToCdp(action, cdpId)
}

export function handleWipe(event: LogNote): void {
  let cdpId = toBigInt(event.params.foo).toString()

  let action = createCdpAction('WIPE', event)
  action.value = toBigDecimal(event.params.bar).toString()

  addActionToCdp(action, cdpId)
}

export function handleShut(event: LogNote): void {
  let cdpId = toBigInt(event.params.foo).toString()

  let action = createCdpAction('SHUT', event)

  addActionToCdp(action, cdpId)
}

export function handleBite(event: LogNote): void {
  let cdpId = toBigInt(event.params.foo).toString()

  let action = createCdpAction('BITE', event)

  addActionToCdp(action, cdpId)
}
