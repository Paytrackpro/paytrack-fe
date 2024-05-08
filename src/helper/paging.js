const pagingToPathParams = ({ filter, getCellValue, pagination }) => {
  return {
    sb: pagination.sortBy,
    d: pagination.descending ? '1' : '',
    p: pagination.page,
    r: pagination.rowsPerPage,
  }
}

const pathParamsToPaging = ({ query }, paging) => {
  paging.sortBy = query.sb
  paging.descending = query.d === '1'
  paging.page = Number(query.p) || 1
  const defaultRowPerPage = defaultPaging.defaultRowPerPage || 10
  paging.rowsPerPage = Number(query.r) || defaultRowPerPage
  const filter = {
    page: paging.page,
    size: paging.rowsPerPage,
    order: paging.sortBy,
  }
  if (paging.sortBy) {
    filter.order = paging.sortBy
    if (paging.descending) {
      filter.order += ' desc'
    }
  }
  return filter
}

const defaultPaging = {
  sortBy: '',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
}

export { pagingToPathParams, pathParamsToPaging, defaultPaging }
