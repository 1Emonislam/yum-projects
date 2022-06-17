import moment from 'moment-timezone'
import { generateInstallments } from './index'

describe('generateInstallments', () => {
  describe('general', () => {
    const result = generateInstallments({
      principal: 250000,
      duration: {
        value: 12,
        unit: 'week',
      },
      interestRateInPercents: 8,
      startDate: moment(),
      holidays: [],
    })

    describe('installment', () => {
      it('should have future status', () => {
        const installmentsWithFutureStatus = result.filter(
          i => i.status === 'future'
        ).length
        const installmentsAll = result.length
        expect(installmentsWithFutureStatus).toBe(installmentsAll)
      })
    })

    it('due date should have 0 miliseconds', () => {
      const result = generateInstallments({
        principal: 250000,
        duration: {
          value: 12,
          unit: 'week',
        },
        interestRateInPercents: 8,
        startDate: moment(),
        holidays: [],
      })

      expect(moment(result[0].due).format('SSS')).toBe('000')
    })
  })

  describe('small loan, principal USh 1,100,000, 20 weeks, 13% service charge', () => {
    const result = generateInstallments({
      principal: 1100000,
      duration: {
        value: 20,
        unit: 'week',
      },
      interestRateInPercents: 13,
      startDate: moment(),
      holidays: [],
    })

    it('should have all installments higher than the last one', () => {
      expect(result[result.length - 1].total).toBeLessThan(
        result[result.length - 2].total
      )
    })
  })

  describe('a fake loan with one installment', () => {
    const result = generateInstallments({
      principal: 1000000,
      duration: {
        value: 1,
        unit: 'week',
      },
      interestRateInPercents: 10,
      startDate: moment(),
      holidays: [],
    })

    it('should have one installment', () => {
      expect(result).toHaveLength(1)
    })

    it('should have installment with total amount same as disbursed amount', () => {
      expect(result[0].total).toEqual(1000000 * 1.1)
    })
  })

  describe('a loan with overridden installment target set to USh 65,000', () => {
    const result = generateInstallments({
      principal: 1100000,
      duration: {
        value: 20,
        unit: 'week',
      },
      interestRateInPercents: 13,
      startDate: moment(),
      holidays: [],
      overrideTarget: 65000,
    })

    it('should have installments equal to 65,000', () => {
      expect(result[0].target).toEqual(65000)
    })

    it('should have installments equal to remainder from all installments', () => {
      // using parseInt(parseFloat()) due to floating point number precision problem
      expect(result[result.length - 1].target).toEqual(
        parseInt(parseFloat(1100000 * 1.13 - 65000 * 19).toPrecision(8)) // 7999.999999999767
      )
    })
  })

  describe('small loan, principal USh 250,000, 12 weeks, 8% service charge', () => {
    const result = generateInstallments({
      principal: 250000,
      duration: {
        value: 12,
        unit: 'week',
      },
      interestRateInPercents: 8,
      startDate: moment(),
      holidays: [],
    })

    it('should produce 12 installments', () => {
      expect(result).toHaveLength(12)
    })

    it('should have 8% interest rate', () => {
      expect(result[0].interest).toBe(Math.round((250000 * 0.08) / 12))
    })

    it('should have flat interest rate', () => {
      const nextToLastInstallment = result.length - 2
      expect(result[0].interest).toBe(result[nextToLastInstallment].interest)
    })

    describe('principal repayment amount', () => {
      it('should be equal to subtraction of the total installment amount and the interest part', () => {
        expect(result[0].principalRepayment).toBe(
          result[0].total - result[0].interest
        )
      })
    })

    describe('total number of installments', () => {
      it('should be equal to sum of principal and interest', () => {
        const sum = result.reduce(
          (all, installment) => all + installment.total,
          0
        )

        expect(sum).toBe(250000 + Math.round(250000 * 0.08))
      })
    })

    describe('the last principal outstanding closing balance', () => {
      it('should be equal to zero', () => {
        const lastInstallment = result.length - 1
        expect(result[lastInstallment].principalOutstandingClosingBalance).toBe(
          0
        )
      })
    })
  })

  describe('small loan, principal USh 253,000, 12 weeks, 8% service charge', () => {
    const result = generateInstallments({
      principal: 253000,
      duration: {
        value: 12,
        unit: 'week',
      },
      interestRateInPercents: 8,
      startDate: moment(),
      holidays: [],
    })

    it('should round installments to 500s', () => {
      expect(result[0].total).toBe(23000)
    })

    it('should take into account the rounding in the last installment', () => {
      const lastInstallment = result.length - 1
      expect(result[lastInstallment].total).toBe(20240)
    })
  })

  describe('small loan, principal USh 2,500,000, 40 weeks, 26% service charge', () => {
    const result = generateInstallments({
      principal: 2500000,
      duration: {
        value: 40,
        unit: 'week',
      },
      interestRateInPercents: 26,
      startDate: moment(),
      holidays: [],
    })

    it('should produce 40 installments', () => {
      expect(result).toHaveLength(40)
    })

    it('should have 26% interest rate', () => {
      expect(result[0].interest).toBe(Math.round((2500000 * 0.26) / 40))
    })

    it('should have flat interest rate', () => {
      const nextToLastInstallment = result.length - 2
      expect(result[0].interest).toBe(result[nextToLastInstallment].interest)
    })

    describe('principal repayment amount', () => {
      it('should be equal to subtraction of the total installment amount and the interest part', () => {
        expect(result[0].principalRepayment).toBe(
          result[0].total - result[0].interest
        )
      })
    })

    describe('total number of installments', () => {
      it('should be equal to sum of principal and interest', () => {
        const sum = result.reduce(
          (all, installment) => all + installment.total,
          0
        )

        expect(sum).toBe(2500000 + 2500000 * 0.26)
      })
    })

    describe('the last principal outstanding closing balance', () => {
      it('should be equal to zero', () => {
        const lastInstallment = result.length - 1
        expect(result[lastInstallment].principalOutstandingClosingBalance).toBe(
          0
        )
      })
    })
  })

  describe('small entrepreneurs loan, principal USh 3,000,000, 43 weeks, 29% service charge', () => {
    const result = generateInstallments({
      principal: 3000000,
      duration: {
        value: 43,
        unit: 'week',
      },
      interestRateInPercents: 29,
      startDate: moment(),
      holidays: [],
    })

    it('should produce 43 installments', () => {
      expect(result).toHaveLength(43)
    })

    it('should have 29% interest rate', () => {
      expect(result[0].interest).toBe(Math.round((3000000 * 0.29) / 43))
    })

    it('should have flat interest rate', () => {
      const nextToLastInstallment = result.length - 2
      expect(result[0].interest).toBe(result[nextToLastInstallment].interest)
    })

    describe('principal repayment amount', () => {
      it('should be equal to subtraction of the total installment amount and the interest part', () => {
        expect(result[0].principalRepayment).toBe(
          result[0].total - result[0].interest
        )
      })
    })

    describe('total number of installments', () => {
      it('should be equal to sum of principal and interest', () => {
        const sum = result.reduce(
          (all, installment) => all + installment.total,
          0
        )

        expect(sum).toBe(3000000 + 3000000 * 0.29)
      })
    })

    describe('the last principal outstanding closing balance', () => {
      it('should be equal to zero', () => {
        const lastInstallment = result.length - 1
        expect(result[lastInstallment].principalOutstandingClosingBalance).toBe(
          0
        )
      })
    })
  })

  describe('small loan, principal USh 500,000, 20 weeks, 13% service charge', () => {
    const result = generateInstallments({
      principal: 500000,
      duration: {
        value: 15,
        unit: 'week',
      },
      interestRateInPercents: 10,
      startDate: moment(),
      floorTo: 50,
      toDate: true,
      holidays: [],
    })

    it('should produce 15 installments', () => {
      expect(result).toHaveLength(15)
    })

    it('should have 10% interest rate', () => {
      expect(result[13].interest).toBe(Math.round((500000 * 0.1) / 15))
    })

    it('should have flat interest rate', () => {
      const nextToLastInstallment = result.length - 2
      expect(result[0].interest).toBe(result[nextToLastInstallment].interest)
    })

    describe('principal repayment amount', () => {
      it('should be equal to subtraction of the total installment amount and the interest part', () => {
        expect(result[0].principalRepayment).toBe(
          result[0].total - result[0].interest
        )
      })
    })

    describe('total number of installments', () => {
      it('should be equal to sum of principal and interest', () => {
        const sum = result.reduce(
          (all, installment) => all + installment.total,
          0
        )

        expect(sum).toBe(500000 + Math.round(500000 * 0.1))
      })
    })

    describe('the last principal outstanding closing balance', () => {
      it('should be equal to zero', () => {
        const lastInstallment = result.length - 1
        expect(result[lastInstallment].principalOutstandingClosingBalance).toBe(
          0
        )
      })
    })

    describe('target and total', () => {
      it('should be equal for every installment', () => {
        expect(
          result.every(installment => installment.total === installment.target)
        ).toBe(true)
      })
    })
  })

  test('holidays', () => {
    const today = 1613304000000 // February 14, 2021 (Sunday)

    Date.now = jest.fn(() => today)

    const result = generateInstallments({
      principal: 250000,
      duration: {
        value: 12,
        unit: 'week',
      },
      interestRateInPercents: 8,
      startDate: moment(),
      holidays: [
        {
          startAt: '2021-02-01',
          endAt: '2021-02-28',
          yearly: false,
        },
        {
          startAt: '2021-05-01',
          endAt: '2021-05-30',
          yearly: false,
        },
        {
          startAt: '2021-06-27',
          endAt: '2021-06-27',
          yearly: false,
        },
      ],
    })

    expect(moment(result[0].due).isSame(moment('2021-03-07'), 'day')).toBe(true)

    expect(moment(result[1].due).isSame(moment('2021-03-14'), 'day')).toBe(true)

    expect(moment(result[7].due).isSame(moment('2021-04-25'), 'day')).toBe(true)

    expect(moment(result[8].due).isSame(moment('2021-06-06'), 'day')).toBe(true)

    expect(moment(result[9].due).isSame(moment('2021-06-13'), 'day')).toBe(true)

    expect(moment(result[10].due).isSame(moment('2021-06-20'), 'day')).toBe(
      true
    )

    expect(moment(result[11].due).isSame(moment('2021-07-04'), 'day')).toBe(
      true
    )
  })
})
