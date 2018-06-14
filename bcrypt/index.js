const bcrypt = require('bcrypt')
const password = 'superman'

async function hashPassword () {
  const hashedPassword = await bcrypt.hash(password, 10)
  console.log('hashed password: ', hashedPassword)
}

async function comparePassword (input) {
  const hashedPassword = '$2a$10$Q49GCf4uEOVoBCVqlaPmeOs481Jz2ygQN4GaIaDhLqjFC2gtY7sZq'
  const same = await bcrypt.compare(input, hashedPassword)
  if (!same) {
    console.log(input, ' is wrong')
  } else {
    console.log(input, ' is correct')
  }
}

hashPassword()
comparePassword('superman')
comparePassword('anpanman')
