import { Address } from '@graphprotocol/graph-ts'

import { Pep } from '../generated/SaiTub/Pep'
import { Pip } from '../generated/SaiTub/Pip'

export let pip = Pip.bind(
  Address.fromString('0x729D19f657BD0614b4985Cf1D82531c67569197B'),
)

export let pep = Pep.bind(
  Address.fromString('0x99041F808D598B782D5a3e498681C2452A31da08'),
)
