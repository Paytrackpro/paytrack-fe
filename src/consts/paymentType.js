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

export const PAYMENT_STATUS_WAIT_APPROVAL = 1
export const PAYMENT_STATUS_APPROVED = 2
export const PAYMENT_STATUS_REJECTED = 3

export const PAYMENT_STATUS_WAIT_APPROVAL_TEXT = 'wait approve'
export const PAYMENT_STATUS_APPROVED_TEXT = 'approved'
export const PAYMENT_STATUS_REJECTED_TEXT = 'rejected'

export const getStatusTagColor = (status) => {
  if ([PAYMENT_STATUS_WAIT_APPROVAL, PAYMENT_STATUS_WAIT_APPROVAL_TEXT].includes(status)) {
    return 'orange'
  } else if ([PAYMENT_STATUS_APPROVED, PAYMENT_STATUS_APPROVED_TEXT].includes(status)) {
    return 'teal'
  } else if ([PAYMENT_STATUS_REJECTED, PAYMENT_STATUS_REJECTED_TEXT].includes(status)) {
    return 'gray'
  }
  return 'black'
}

export const getStatusText = (status) => {
  if ([PAYMENT_STATUS_WAIT_APPROVAL, PAYMENT_STATUS_WAIT_APPROVAL_TEXT].includes(status)) {
    return 'Wait Approval'
  } else if ([PAYMENT_STATUS_APPROVED, PAYMENT_STATUS_APPROVED_TEXT].includes(status)) {
    return 'Approved'
  } else if ([PAYMENT_STATUS_REJECTED, PAYMENT_STATUS_REJECTED_TEXT].includes(status)) {
    return 'Reject'
  }
  return null
}

export { PAYMENT_TYPES, PAYMENT_TYPE_OPTIONS, PAYMENT_OBJECT_REMINDER, PAYMENT_OBJECT_REQUEST }
