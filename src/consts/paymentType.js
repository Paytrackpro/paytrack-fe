const PAYMENT_TYPES = {
  BTC: 'btc',
  LTC: 'ltc',
  DCR: 'dcr',
}

const PAYMENT_TYPE_OPTIONS = [
  {
    label: 'BTC',
    value: 'btc',
    isChecked: false,
  },
  {
    label: 'LTC',
    value: 'ltc',
    isChecked: false,
  },
  {
    label: 'DCR',
    value: 'dcr',
    isChecked: false,
  },
]

const PAYMENT_OBJECT_REMINDER = 'reminder'
const PAYMENT_OBJECT_REQUEST = 'request'
const PAYMENT_OBJECT_APPROVAL = 'approval'

export { PAYMENT_TYPES, PAYMENT_TYPE_OPTIONS, PAYMENT_OBJECT_REMINDER, PAYMENT_OBJECT_REQUEST, PAYMENT_OBJECT_APPROVAL }
