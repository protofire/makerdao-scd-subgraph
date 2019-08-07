import { Address, BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts'

export const CDP_ENGINE_ID = '0x0'

let PRECISION = BigDecimal.fromString('1000000000000000000') // 10^18
export let ZERO = BigDecimal.fromString('0')

export function toAddress(value: Bytes): Address {
  return Address.fromHexString(value.toHex()).subarray(-20) as Address
}

export function toBigInt(value: Bytes, bigEndian: boolean = true): BigInt {
  let val = bigEndian ? (value.reverse() as Bytes) : value

  return BigInt.fromUnsignedBytes(val)
}

export function toBigDecimal(value: Bytes, bigEndian: boolean = true): BigDecimal {
  let val = toBigInt(value, bigEndian)

  return val.divDecimal(PRECISION)
}
