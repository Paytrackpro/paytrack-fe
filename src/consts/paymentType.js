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

export const PAYMENT_STATUS_AWAITING_APPROVAL_TEXT = 'awaiting approval'
export const PAYMENT_STATUS_APPROVED_TEXT = 'approved'

export const getStatusText = (status) => {
  ;``
  if (PAYMENT_STATUS_AWAITING_APPROVAL_TEXT == status) {
    return 'Wait Approval'
  } else if (PAYMENT_STATUS_APPROVED_TEXT == status) {
    return 'Approved'
  }
  return null
}

export { PAYMENT_TYPES, PAYMENT_TYPE_OPTIONS, PAYMENT_OBJECT_REMINDER, PAYMENT_OBJECT_REQUEST }
