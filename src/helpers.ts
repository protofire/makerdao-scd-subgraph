import { Address, BigDecimal, BigInt, Bytes, log } from '@graphprotocol/graph-ts'

let PRECISION = BigDecimal.fromString('1000000000000000000') // 10^18
export let ZERO = BigDecimal.fromString('0')

export function toAddress(value: Bytes): Address {
  return Address.fromHexString(value.toHex()).subarray(-20) as Address
}

export function toBigInt(value: Bytes): BigInt {
  let val = value.reverse() as Bytes // Convert to big-endian

  return BigInt.fromUnsignedBytes(val)
}

export function toBigDecimal(value: Bytes): BigDecimal {
  let val = toBigInt(value)

  return val.divDecimal(PRECISION)
}
