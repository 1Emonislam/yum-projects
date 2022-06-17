import capitalize from 'lodash/capitalize'

const normalize = input => {
  return String(input)
    .trim()
    .split(' ')
    .map(s => capitalize(s))
    .join(' ')
}

export const normalizeFullName = input => {
  if (!input) {
    throw new Error('Provide an input')
  }

  const { firstName, lastName } = input

  if (!firstName) {
    throw new Error('Provide a firstName')
  }

  if (!lastName) {
    throw new Error('Provide a lastName')
  }

  return {
    firstName: normalize(firstName),
    lastName: normalize(lastName),
  }
}
