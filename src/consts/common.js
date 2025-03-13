const MDateFormat = 'YYYY-MM-DD'
const MDateFormat1 = 'MM/DD/YYYY'
const MDateFormat2 = 'YYYY-MM-DD HH:mm:ss'

export { MDateFormat, MDateFormat1, MDateFormat2 }
export const DESTINATION_CHECK_NONE = 0
export const DESTINATION_CHECK_CHECKING = 1
export const DESTINATION_CHECK_FAIL = 2
export const DESTINATION_CHECK_DONE = 3

//status info enum
export const STATUS_INFO = Object.freeze({
  draft: {
    statusShow: 'Draft',
    statusColor: 'brown-13',
    statusIcon: 'drive_file_rename_outline',
  },
  sent: {
    statusShow: 'Sent',
    statusColor: 'info',
    statusIcon: 'send',
  },
  paid: {
    statusShow: 'Paid',
    statusColor: 'positive',
    statusIcon: 'check_circle',
  },
  rejected: {
    statusShow: 'Rejected',
    statusColor: 'negative',
    statusIcon: 'disabled_by_default',
  },
  ready_bulk_pay_btc: {
    statusShow: 'Payable',
    statusColor: 'warning',
    statusIcon: 'schedule',
  },
  received: {
    statusShow: 'Received',
    statusColor: 'info',
    statusIcon: 'archive',
  },
  approved: {
    statusShow: 'Approved',
    statusColor: 'info',
    statusIcon: 'how_to_reg',
  },
  waiting_approval: {
    statusShow: 'Waiting for Approval',
    statusColor: 'warning',
    statusIcon: 'schedule',
  },
  unknown: {
    statusShow: 'Unknown',
    statusColor: 'warning',
    statusIcon: 'schedule',
  },
})

export const COINS = [
  { label: 'BTC', value: 'btc', color: 'orange-7' },
  { label: 'LTC', value: 'ltc', color: 'blue-grey-7' },
  { label: 'DCR', value: 'dcr', color: 'cyan-8' },
]
