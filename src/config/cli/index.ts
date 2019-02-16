/* tslint:disable no-console */
import chalk from 'chalk'
import * as program from 'commander'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as validator from 'validator'
import * as walk from 'walk'
import Handlebars from './helpers/handlebars'

const throwError = (message: string) => {
  console.error(`${chalk.bgRed.white.bold(' ERROR ')} ${message}`)
  process.exit(1)
}

const logInfo = (message: string) => {
  console.log(`${chalk.bgBlue.white.bold(' INFO ')} ${message}`)
}

const logSuccess = (message: string) => {
  console.log(`${chalk.bgGreen.white.bold(' SUCCESS ')} ${message}`)
}

program
  .command('create:entity <name>')
  .description('Create a new entity with the given name.')
  .option('-f, --force', 'Force the acceptance of the given entity name')
  .action((name: string, args: any) => {
    const entityName: string = name[0].toLowerCase() + name.slice(1) // make first letter lowercase
    const entityPath: string = __dirname + '/../../api/data'
    const templateDir: string = __dirname + '/templates'

    console.log(chalk.grey(`entityName: ${entityName}`))
    console.log(chalk.grey(`entityPath: ${entityPath}`))
    console.log(chalk.grey(`force: ${args.force}`))

    if (!validator.isAlpha(entityName)) {
      throwError('Please provide an entity name with only letters.')
    }

    if (entityName.slice(-1) === 's' && !args.force) {
      throwError('That name ends with an "s" which looks funky. Use "-f" to use the name anyways.')
    }

    if (fs.existsSync(`${entityPath}/${entityName}`)) {
      throwError("That entity (or a directory named the same thing) already exists. Please don't make me kill it")
    }

    const walker = walk.walk(templateDir)

    walker.on('file', (root, fileStats, next) => {
      const source = fs.readFileSync(`${root}/${fileStats.name}`).toString()
      const template = Handlebars.compile(source)
      const filePath = `${entityPath}/${entityName}`
      const fileName = fileStats.name === 'index.ts' ? fileStats.name : `${entityName}.${fileStats.name}`

      mkdirp.sync(filePath)
      fs.writeFileSync(`${filePath}/${fileName}`, template({ entityName }))

      logInfo(`Created ${fileName}`)

      next()
    })
    walker.on('errors', (root, nodeStatsArray, next) => {
      next()
    })
    walker.on('end', () => {
      logSuccess('All done! Enjoy!')
    })
  })

program.parse(process.argv)
