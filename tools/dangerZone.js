module.exports = async function displayDangerInformation() {
  console.log()
  console.log()
  console.log(chalk.bgRed('                                      '))
  console.log(chalk.bgRed('                                      '))
  console.log(chalk.bgRed('             DANGER ZONE              '))
  console.log(chalk.bgRed('                                      '))
  console.log(chalk.bgRed('                                      '))
  console.log()
  console.log()
  const msg = `Seeding protected environment ${argv.env} in %d`
  await new Promise(r => {
    interactive.await(msg, 5)
    setTimeout(() => {
      interactive.await(msg, 4)
      setTimeout(() => {
        interactive.await(msg, 3)
        setTimeout(() => {
          interactive.await(msg, 2)
          setTimeout(() => {
            interactive.await(msg, 1)
            setTimeout(() => {
              interactive.await(msg, 0)
              setTimeout(() => {
                r()
              }, 1000)
            }, 1000)
          }, 1000)
        }, 1000)
      }, 1000)
    }, 1000)
  })
}
