/**
 * Passwords should contain at least 1 upper case letter
 * Passwords should contain at least 1 lower case letter
 * Passwords should contain at least 1 number
 * Passwords should contain at least 1 special character
 * Passwords should contain at least 8 characters
 */

export const strongPasswordRegExRule = {
  pattern: {
    value: /(?=^.{8,}$)((?=.*\d)(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    message: `Password should be at least 8 characters long, have an uppercase and lowercase letter, a number, and a special character`,
  },
}
