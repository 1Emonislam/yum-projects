const moment = require('moment-timezone')
const { generateInstallmentsStartDate } = require('./index')

const timezone = 'Africa/Kampala'

const frequency = 'weekly'

const isEqual = (d1, d2) =>
  moment(d1).tz(timezone).isSame(moment(d2).tz(timezone), 'day')

describe('generateInstallmentsStartDate', () => {
  describe('assuming it’s January 1, 2021 (Friday)', () => {
    const start = moment('2021-01-01').tz(timezone).endOf('day').toDate()

    describe('assuming the loan has just been disbursed', () => {
      describe('every Friday', () => {
        const startDate = generateInstallmentsStartDate({
          dayOfWeek: 5,
          frequency,
          start,
        })

        describe('startDate', () => {
          it(`should be Friday, January 8, 2021, 23:59:59 Africa/Kampala time`, () => {
            expect(isEqual(startDate, '2021-01-08')).toBe(true)
          })
        })
      })

      describe('every Monday', () => {
        const startDate = generateInstallmentsStartDate({
          dayOfWeek: 1,
          frequency,
          start,
        })

        describe('startDate', () => {
          it(`should be Monday, January 4, 2021, 23:59:59 Africa/Kampala time`, () => {
            expect(isEqual(startDate, '2021-01-04')).toBe(true)
          })
        })
      })

      describe('every Thursday', () => {
        const startDate = generateInstallmentsStartDate({
          dayOfWeek: 4,
          frequency,
          start,
        })

        describe('startDate', () => {
          it(`should be Thursday, January 7, 2021, 23:59:59 Africa/Kampala time`, () => {
            expect(isEqual(startDate, '2021-01-07')).toBe(true)
          })
        })
      })

      describe('every Sunday', () => {
        const startDate = generateInstallmentsStartDate({
          dayOfWeek: 7,
          frequency,
          start,
        })

        describe('startDate', () => {
          it(`should be Sunday, January 3, 2021, 23:59:59 Africa/Kampala time`, () => {
            expect(isEqual(startDate, '2021-01-03')).toBe(true)
          })
        })
      })
    })

    describe('assuming the loan disbursement can be in 14 days', () => {
      const firstLoanDisbursement = 14

      describe('every Friday', () => {
        const startDate = generateInstallmentsStartDate({
          dayOfWeek: 5,
          frequency,
          start,
          firstLoanDisbursement,
        })

        describe('startDate', () => {
          it(`should be Friday, January 22, 2021, 23:59:59 Africa/Kampala time`, () => {
            expect(isEqual(startDate, '2021-01-22')).toBe(true)
          })
        })
      })

      describe('every Monday', () => {
        const startDate = generateInstallmentsStartDate({
          dayOfWeek: 1,
          frequency,
          start,
          firstLoanDisbursement,
        })

        describe('startDate', () => {
          it(`should be Monday, January 18, 2021, 23:59:59 Africa/Kampala time`, () => {
            expect(isEqual(startDate, '2021-01-18')).toBe(true)
          })
        })
      })

      describe('every Thursday', () => {
        const startDate = generateInstallmentsStartDate({
          dayOfWeek: 4,
          frequency,
          start,
          firstLoanDisbursement,
        })

        describe('startDate', () => {
          it(`should be Thursday, January 21, 2021, 23:59:59 Africa/Kampala time`, () => {
            expect(isEqual(startDate, '2021-01-21')).toBe(true)
          })
        })
      })

      describe('every Sunday', () => {
        const startDate = generateInstallmentsStartDate({
          dayOfWeek: 7,
          frequency,
          start,
          firstLoanDisbursement,
        })

        describe('startDate', () => {
          it(`should be Sunday, January 17, 2021, 23:59:59 Africa/Kampala time`, () => {
            expect(isEqual(startDate, '2021-01-17')).toBe(true)
          })
        })
      })
    })
  })

  describe('examples from https://coda.io/d/Yam_dR5481_z8AB/Installment-Collection-Grace-Period_suPvo#_luJ0J', () => {
    test('Example 1', () => {
      const start = moment('2021-04-30').tz(timezone).endOf('day').toDate()

      const startDate = generateInstallmentsStartDate({
        dayOfWeek: 1,
        frequency,
        start,
        gracePeriod: 5,
      })

      expect(isEqual(startDate, '2021-05-10')).toBe(true)
    })

    test('Example 2', () => {
      const start = moment('2021-04-30').tz(timezone).endOf('day').toDate()

      const startDate = generateInstallmentsStartDate({
        dayOfWeek: 5,
        frequency,
        start,
        gracePeriod: 5,
      })

      expect(isEqual(startDate, '2021-05-07')).toBe(true)
    })

    test('Example 3', () => {
      const start = moment('2021-05-03').tz(timezone).endOf('day').toDate()

      const startDate = generateInstallmentsStartDate({
        dayOfWeek: 5,
        frequency,
        start,
        gracePeriod: 5,
      })

      expect(isEqual(startDate, '2021-05-14')).toBe(true)
    })
  })
})
