const fs = require('fs')
const path = require('path')
const prettier = require("prettier");
const getCodeStr = require('../source/index')
const babelParser = require('@babel/parser')
const generate = require('@babel/generator').default
const getAST = (source) => {
    return babelParser.parse(source, {
        sourceType: 'module'
    })
}
const cleanCatch = () => {
    Object.keys(require.cache).forEach(key => {
        delete require.cache[key]
    })
}
fs.watch(
    path.resolve(__dirname, '../visitor.js'),
    { recursive: false },
    (eventType, file) => {
        if (file && eventType === "change") {
            const codeStr = getCodeStr()
            const ast = getAST(codeStr)
            cleanCatch()
            const traverse = require('../visitor.js')
            traverse(ast)
            const afterCode = generate(ast, codeStr).code
            console.log(file, 'codegen success!', new Date().getTime())
            fs.writeFileSync('./output.js', prettier.format(afterCode, { semi: true, parser: 'espree' }), { encoding: 'utf-8' })
            fs.writeFileSync('./astcode.json', prettier.format(JSON.stringify(ast), { semi: true, parser: "json" }), { encoding: 'utf-8' })
        }
    })