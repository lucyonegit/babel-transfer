const traverse = require('@babel/traverse').default
const Types = require('@babel/types')

/**
 * 创建解构变量Node
 * @param {'var'|'let'|'const'} kind 变量声明类型
 * @param {string} importVarName 导入变量名
 * @param {string} reName 变量重命名
 * @param {string} packageName 变量名
 * @returns 
 */
const variablePatternCreate = (kind, importVarName, reName, packageName) => {
    let node = Types.variableDeclaration(
        kind,
        [Types.variableDeclarator(
            Types.objectPattern(
                [Types.objectProperty(
                    Types.identifier(importVarName),
                    Types.identifier(reName),
                    false,
                    importVarName === reName
                )]
            ),
            Types.identifier(packageName)
        )]
    )
    return node
}
/**
 * 
 * @param {'var'|'let'|'const'} kind  变量声明类型
 * @param {string} varName 变量名
 * @param {string} packageName require包名
 * @returns 
 */
const variableDefaultCreate = (kind, varName, packageName) => {
    let node = Types.variableDeclaration(
        kind,
        [
            Types.variableDeclarator(
                Types.identifier(varName),
                Types.callExpression(
                    Types.identifier('require'),
                    [
                        Types.stringLiteral(packageName)
                    ]
                )
            )
        ]
    )
    return node
}

module.exports = (ast) => {
    traverse(ast, {
        ImportDeclaration: path => {
            //如果是解构形式
            let specifiers = path.node.specifiers[0]
            let packageName = path.node.source.value
            let localName = specifiers.local.name
            if (specifiers.type === 'ImportSpecifier') {
                let importVarName = specifiers.imported.name
                let node = variablePatternCreate('const', importVarName, localName, packageName)
                path.replaceWith(node)
            }
            // 如果默认导入
            else if (specifiers.type === 'ImportDefaultSpecifier') {
                let node = variableDefaultCreate('var', localName, packageName)
                path.replaceWith(node)
            }
        }
    })
}

