function prettyDate(num) {
  if (num <= 0) {
    throw new Error("invalid date value")
  }
  if (num < 10) {
    return `0${num}`
  }
  return `${num}`
}

export { prettyDate }
