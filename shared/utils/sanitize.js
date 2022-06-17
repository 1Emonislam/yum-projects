// Source: https://gist.github.com/simonrenoult/2fa79fec8f035b2d35cef0767363b227

import _ from 'lodash'

export const sanitize = object => {
  if (_.isString(object)) return _sanitizeString(object)
  if (_.isArray(object)) return _sanitizeArray(object)
  if (_.isPlainObject(object)) return _sanitizeObject(object)
  return object
}

const _sanitizeString = string => {
  return _.isEmpty(string) ? null : string
}

const _sanitizeArray = array => {
  return _.filter(_.map(array, sanitize), _isProvided)
}

const _sanitizeObject = object => {
  return _.pickBy(_.mapValues(object, sanitize), _isProvided)
}

const _isProvided = value => {
  const typeIsNotSupported =
    !_.isNull(value) &&
    !_.isString(value) &&
    !_.isArray(value) &&
    !_.isPlainObject(value)
  return typeIsNotSupported || !_.isEmpty(value)
}
