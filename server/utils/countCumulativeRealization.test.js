const { countCumulativeRealization } = require('./index')

describe('countCumulativeRealization', () => {
  it('should return cumulative realization', () => {
    const cumulativeRealization = countCumulativeRealization([
      {
        total: 1,
        target: 1,
        realization: 1,
      },
      {
        total: 1,
        target: 1,
        realization: 1,
      },
      {
        total: 1,
        target: 1,
        realization: 1,
      },
    ])

    expect(cumulativeRealization).toBe(3)
  })

  it('should return zero in case of no realizations', () => {
    const cumulativeRealization = countCumulativeRealization([
      {
        total: 1,
        target: 1,
        realization: 0,
      },
      {
        total: 1,
        target: 1,
        realization: 0,
      },
      {
        total: 1,
        target: 1,
        realization: 0,
      },
    ])

    expect(cumulativeRealization).toBe(0)
  })

  it('should treat differences between total and target as realization', () => {
    const cumulativeRealization = countCumulativeRealization([
      {
        total: 1,
        target: 0,
        realization: 0,
      },
      {
        total: 1,
        target: 1,
        realization: 0,
      },
    ])

    expect(cumulativeRealization).toBe(1)
  })
})
