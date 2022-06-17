const generateCode = (prefix, count = 0) => {
  return `${prefix}${String(count + 1).padStart(3, '0')}`
}

const generateBranchCode = count => generateCode('B', count)
const generateClientCode = count => generateCode('C', count)
const generateClientGroupCode = count => generateCode('G', count)
const generateLoanCode = count => generateCode('L', count)

module.exports = {
  generateBranchCode,
  generateClientCode,
  generateClientGroupCode,
  generateLoanCode,
}
