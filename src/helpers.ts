import { Address, BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts'

export function toAddress(value: Bytes): Bytes {
  return Address.fromHexString(value.toHex())
}

export function toBigInt(value: Bytes): BigInt {
  let val = parseInt(value.toHex()) as u32

  return BigInt.fromI32(val)
}

export function toBigDecimal(value: Bytes, decimals: u32 = 18): BigDecimal {
  let val = BigInt.fromUnsignedBytes(value.reverse() as Bytes)
  let precision = Math.pow(parseFloat('10'), parseFloat(decimals.toString()))

  return val.divDecimal(BigDecimal.fromString(precision.toString()))
}
