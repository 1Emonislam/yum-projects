const countCumulativeRealization = installments => {
  return installments.reduce((acc, installment = {}) => {
    const { realization = 0, total, target } = installment
    return acc + realization + (total - target)
  }, 0)
}

module.exports = {
  countCumulativeRealization,
}
