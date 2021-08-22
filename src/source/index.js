const fs = require('fs')
const path = require('path')
module.exports = () => {
    return fs.readFileSync(path.resolve(__dirname, './code.js'), { encoding: 'utf-8' })
}