export function normalizePhoneNumber(phoneNumber, defaultCountryCode = '+256') {
  if (!phoneNumber) {
    throw new Error('Provide a phone number string')
  }

  const numberOnly = phoneNumber.trim().replace(/ /g, '')

  if (phoneNumber.trim().startsWith('256') && phoneNumber.trim().length > 9) {
    return `+${phoneNumber.trim()}`
  }

  if (!phoneNumber.trim().startsWith('+')) {
    return `${defaultCountryCode}${numberOnly}`
  }

  return numberOnly
}
