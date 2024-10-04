function validateIdNumber (idNumber) {
  const regex = /^[A-Z][12]\d{8}$/
  if (!regex.test(idNumber)) {
    return false
  }

  const letterMapping = {
    A: 10,
    B: 11,
    C: 12,
    D: 13,
    E: 14,
    F: 15,
    G: 16,
    H: 17,
    I: 34,
    J: 18,
    K: 19,
    L: 20,
    M: 21,
    N: 22,
    O: 35,
    P: 23,
    Q: 24,
    R: 25,
    S: 26,
    T: 27,
    U: 28,
    V: 29,
    W: 32,
    X: 30,
    Y: 31,
    Z: 33
  }

  const firstLetterValue = letterMapping[idNumber[0]]
  const n1 = Math.floor(firstLetterValue / 10)
  const n2 = firstLetterValue % 10

  const n3 = parseInt(idNumber[1])
  const n4 = parseInt(idNumber[2])
  const n5 = parseInt(idNumber[3])
  const n6 = parseInt(idNumber[4])
  const n7 = parseInt(idNumber[5])
  const n8 = parseInt(idNumber[6])
  const n9 = parseInt(idNumber[7])
  const n10 = parseInt(idNumber[8])
  const n11 = parseInt(idNumber[9])

  const total = n1 * 1 + n2 * 9 + n3 * 8 + n4 * 7 + n5 * 6 + n6 * 5 + n7 * 4 + n8 * 3 + n9 * 2 + n10 * 1 + n11 * 1

  return total % 10 === 0
}

module.exports = {
  validateIdNumber
}
