import { EthereumEvent } from '@graphprotocol/graph-ts'

import { LogNewCup } from '../generated/SaiTub/SaiTub'
import { Cdp, CdpAction } from '../generated/schema'
import { toBigInt } from './helpers'

export function createCdp(event: LogNewCup): Cdp {
  let cdpId = toBigInt(event.params.cup).toString()

  let cdp = new Cdp(cdpId.toString())
  cdp.created = event.block.timestamp
  cdp.owner = event.params.lad
  cdp.createdAtBlock = event.block.number
  cdp.createdAtTransaction = event.transaction.hash

  return cdp
}

export function createCdpAction(type: string, event: EthereumEvent): CdpAction {
  let action = new CdpAction(event.transaction.hash.toHex())
  action.type = type

  action.block = event.block.number
  action.timestamp = event.block.timestamp
  action.transactionHash = event.transaction.hash

  return action
}

export function addActionToCdp(action: CdpAction, cdpId: string): void {
  let cdp = Cdp.load(cdpId.toString())

  if (cdp) {
    action.cdp = cdp.id

    // Save action as the most recent action
    cdp.block = action.block
    cdp.timestamp = action.timestamp

    // Check if CDP has been shut
    if (action.type === 'SHUT') {
      cdp.deleted = true
    }

    // Persist changes in the CDP
    cdp.save()
  }

  // Persist CDP action
  action.save()
}
