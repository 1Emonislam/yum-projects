const { normalizePhoneNumber } = require('./normalizePhoneNumber')

describe('normalizePhoneNumber', () => {
  it('should not add the country code if already provided', () => {
    expect(normalizePhoneNumber('+256752177646')).toBe('+256752177646')
  })

  it('should add the default country code', () => {
    expect(normalizePhoneNumber('752177646')).toBe('+256752177646')
  })

  it('should add a custom country code', () => {
    expect(normalizePhoneNumber('123456789', '+48')).toBe('+48123456789')
  })

  it('should add a + sign if phone number starts with 256 and is longer than 9', () => {
    expect(normalizePhoneNumber('256709653025', '+256')).toBe('+256709653025')
  })

  it('should add the default country code for numbers starting with 256 but being 9 chars long', () => {
    expect(normalizePhoneNumber('256709653', '+256')).toBe('+256256709653')
  })
})
