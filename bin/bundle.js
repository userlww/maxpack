/***
    分析模块依赖，生成模块间的依赖对象
    @author Maxwell
 ***/

const fs = require('fs');
const co = require('co');
const parse = require('./parse');
const _resolve = require('./resolve');
let moduleId = 0;
let chunkId = 0;


/** 
 * 分析处理模块依赖
 * @param:{string} mainMoudle 入口js文件
 * @param:{object} option 构建选项
 * @returns {*|Promise}
 */

module.export = function (mainMoudle, option) {
    let departTree = {
        modules: {}, //用于存储各个模块对象
        chunks: {}, // 存储各个块
        mapModuleNameToId: {}, //映射模块名到id之间的关系
        modulesById: {}
    };
    return co(function* () {
        departTree = yield parseModule(departTree, mainMoudle, option.context, option);
        departTree = buildTree(departTree);
        return departTree;
    })
};

/**
 * @param {object} departTree 模块依赖关系对象
 * @param {string} ModuleName 模块名称，可能是相对路径或者绝对路径，或者一个名字
 * @param {string} context 上下文 入口js文件所在的目录
 * @param {object} option 选项
 * @returns {*|Promise}
 */

function parseModule(departTree, moduleName, context, option) {
    let module;
    return co(function* () {
        //查找模块
        let absoluteFileName = yield _resolve(moduleName, context, option, resolve);
        module = departTree.modules[absoluteFileName] = {
            id: moduleId++,
            fileName: absoluteFileName,
            name: moduleName
        };

        let filenameWithLoaders = absoluteFileName;
        let loaders = absoluteFileName.split(/!/g);
        let filename = loaders.pop();
        if (!filename) {
            throw `找不到文件{filename}`;
        }
        let source = fs.readFileSync(filename).toString();

        //处理loader

        let ret = yield execLoaders(filenameWithLoaders,loaders,source,option);
        let parseModule = parse(ret);
        module.requires = parseModule.requires || [];
        module.asyncs = parseModule.asyncs || [];
        module.source = parseModule.source;

        //写入映射关系
        departTree.mapModuleNameToId[moduleName] = moduleId - 1;
        dapartTree.modulesById[mid - 1] = module;


        //如果此模块有依赖的模块，采用深度遍历的原则，遍历解析其依赖的模块

        let requireModules = parseModule.requires;
        if(requireModules && requireModules.length > 0) {
            for (let require of requireModules) {
                departTree = yield parseModule(departTree,require.name,context,option);
            }

            //写入依赖模块的id，生成目标JS文件的时候会用到
            requireModules.forEach(requireItem => {
                requireItem.id = departTree.mapModuleNameToId[requireItem.name]
            })
        }

        　　　　//处理require.ensure的模块
        let asyncModules = parseModule.asyncs||[];
        if(asyncModules && asyncModules.length > 0) {
            for(let asyncModule of asyncModules) {
                let requires = asyncModule.requires;
                
            }
        }









    })
}