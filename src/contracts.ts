import { Address } from '@graphprotocol/graph-ts'

import { Pep } from '../generated/sai/pep'
import { Pip } from '../generated/sai/pip'

export let pip = Pip.bind(
  // MainNet
  Address.fromString('0x729D19f657BD0614b4985Cf1D82531c67569197B'),

  // Kovan
  // Address.fromString('0xa5aa4e07f5255e14f02b385b1f04b35cc50bdb66'),
)

export let pep = Pep.bind(
  // MainNet
  Address.fromString('0x99041F808D598B782D5a3e498681C2452A31da08'),

  // Kovan
  // Address.fromString('0x02998f73fabb52282664094b0ff87741a1ce9030'),
)
