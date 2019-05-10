import { BigInt } from "@graphprotocol/graph-ts";

import { LogNewCup, LogNote } from "../generated/SaiTub/SaiTub";
import * as schema from "../generated/schema";

export function handleNewCdp(event: LogNewCup): void {
  let cdpId = BigInt.fromI32(event.params.cup as u32);

  // Original contract names
  let cup = new schema.Cup(cdpId.toString());
  cup.lad = event.params.lad.toHex();
  cup.time = event.block.timestamp;
  cup.save();

  // Alternative names
  let cdp = new schema.Cdp(cdpId.toString());
  cdp.owner = event.params.lad.toHex();
  cdp.created = event.block.timestamp.times(BigInt.fromI32(1000));
  cdp.save();
}

export function handleOpen(event: LogNote): void {
  // TODO
}

export function handleGive(event: LogNote): void {
  // TODO
}

export function handleLock(event: LogNote): void {
  // TODO
}

export function handleFree(event: LogNote): void {
  // TODO
}

export function handleDraw(event: LogNote): void {
  // TODO
}

export function handleWipe(event: LogNote): void {
  // TODO
}

export function handleShut(event: LogNote): void {
  // TODO
}

export function handleBite(event: LogNote): void {
  // TODO
}
