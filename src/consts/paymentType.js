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

export const PAYMENT_STATUS_WAIT_APPROVAL = 4
export const PAYMENT_STATUS_APPROVED = 5

export const PAYMENT_STATUS_WAIT_APPROVAL_TEXT = 'wait approve'
export const PAYMENT_STATUS_APPROVED_TEXT = 'approved'

export const getStatusTagColor = (status) => {
  if ([PAYMENT_STATUS_WAIT_APPROVAL, PAYMENT_STATUS_WAIT_APPROVAL_TEXT].includes(status)) {
    return 'orange'
  } else if ([PAYMENT_STATUS_APPROVED, PAYMENT_STATUS_APPROVED_TEXT].includes(status)) {
    return 'teal'
  }
  return 'black'
}

export const getStatusText = (status) => {
  if ([PAYMENT_STATUS_WAIT_APPROVAL, PAYMENT_STATUS_WAIT_APPROVAL_TEXT].includes(status)) {
    return 'Wait Approval'
  } else if ([PAYMENT_STATUS_APPROVED, PAYMENT_STATUS_APPROVED_TEXT].includes(status)) {
    return 'Approved'
  }
  return null
}

export { PAYMENT_TYPES, PAYMENT_TYPE_OPTIONS, PAYMENT_OBJECT_REMINDER, PAYMENT_OBJECT_REQUEST }
