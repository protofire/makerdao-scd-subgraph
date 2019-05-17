import { Address, BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts'

export function toAddress(value: Bytes): Bytes {
  return Address.fromHexString(value.toHex())
}

export function toBigInt(value: Bytes): BigInt {
  let val = parseInt(value.toHex()) as u32

  return BigInt.fromI32(val)
}

export function toBigDecimal(value: Bytes): Bytes {
  // TODO
  return value
}
