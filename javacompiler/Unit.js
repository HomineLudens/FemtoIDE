
let unitId = 1;
let depth = 0;
class Unit {
    
    constructor(){
        this.name = [];
        this.imports = [];
        this.types = [];
        this.id = unitId++;
        this.file = "";
    }

    resolve( fqcn, trail, test, scope ){
        if( !test )
            test = _=>true;

        depth++;

        if( typeof test != "function" ){
            throw new Error(`Type of test is ${typeof test}: ${test?test.constructor.name:test}`);
        }
        
        let ret;
        const {Ref} = require("./Ref.js");
        if( fqcn instanceof Ref )
            fqcn = fqcn.name;

        if( typeof fqcn == "string" )
            fqcn = fqcn.split(".");
        else
            fqcn = [...fqcn];
        
        if( depth==20 ){
            // throw new Error(`d=10: ${fqcn.join(".")}`);
        }

        let srcfqcn = [...fqcn];

        if( scope ){
            let len = trail.length;
            let oscope = scope;
            while( scope && !ret ){
                if( scope.resolve ){
                    trail.length = len;
                    ret = scope.resolve( fqcn, trail, test );
                }
                scope = scope.scope;
            }

            if( ret ){
                while( oscope ){
                    let i = trail.indexOf(oscope);
                    if( i != -1 ){
                        trail.splice(0, i);
                        break;
                    }
                    oscope = oscope.scope;
                }
            }
            depth--;
            return ret;
        }else{

            let name = fqcn[0];
            let type = this.types.find( t => t.name == name );
            if( type ){
                trail.push(this);
                trail.push(type);
                if( fqcn.length ){
                    if( !type.resolve ){
                        console.error("Error: ", type, fqcn);
                    }
                    ret = type.resolve(fqcn.splice(1,fqcn.length), trail, test);
                }
                else{
                    depth--;
                    return type;
                }
            }
        }

        if( !ret ){
            const {toAST} = require("./AST.js");
            let unit;
            let dirs = [...this.name];
            let path;
            while( !unit ){
                path = [ ...dirs, ...fqcn ];
                unit = toAST(path);
                if( !dirs.length ) break;
                dirs.pop();
            }
            if( unit && unit != this ){
                ret = unit.resolve(path, trail, test, null);
            }
        }

        if( !ret ){
            for( let impdecl of this.imports ){
                let imp = impdecl.fqcn;
                if( impdecl.star ){
                    // ignore for now
                }else if( imp[imp.length-1] == fqcn[0] ){
                    scope = null;
                    let cfqcn = [...fqcn];
                    cfqcn.shift();
                    ret = this.resolve([...imp, ...cfqcn], trail, test, null);
                    if( ret )
                        break;
                }
            }
        }
        
        if( !ret ){
            for( let impdecl of this.imports ){
                let imp = impdecl.fqcn;
                if( (!impdecl.star && imp[imp.length-1] != fqcn[0]) || !impdecl.isStatic )
                    continue;

                let cfqcn = [...impdecl.fqcn, ...fqcn];
                ret = this.resolve( cfqcn, trail, test, null );

                if( ret )
                    break;
            }
        }

        
        if( !ret ){
            throw new Error( "Could not find " + srcfqcn.join(".") );
        }
        
        depth--;
        return ret;
    }

    binary( data, name, extension ){
        this.name = [...name];
        let clazzName = this.name.pop();
        const Clazz = require("./Clazz.js");
        const clazz = new Clazz( clazzName, this );
        clazz.binary( data, extension );
        this.types.push( clazz );        
    }

    staticImage( sprite, name ){
        this.name = [...name];
        console.log("Static Image: ", this.name);
        let clazzName = this.name.pop();
        const Clazz = require("./Clazz.js");
        const clazz = new Clazz( clazzName, this );
        clazz.staticImage( sprite );
        this.types.push( clazz );
    }

    image( sprite, name ){
        this.name = [...name];
        console.log("Image: ", this.name);
        let clazzName = this.name.pop();
        const Clazz = require("./Clazz.js");
        const clazz = new Clazz( clazzName, this );
        clazz.image( sprite );
        this.types.push( clazz );
    }

    process( node ){
        const ImportDeclaration = require("./ImportDeclaration.js");
        const Clazz = require("./Clazz.js");
        const {Enum} = require("./Enum.js");

        let ocu = node.children.ordinaryCompilationUnit[0];
        if( !ocu )
            throw new Error("No compilation unit in file");

        let packageDeclNodes = ocu.children["packageDeclaration"] || [];
        if( packageDeclNodes.length ){
            this.name = packageDeclNodes[0]
                .children
                .Identifier
                .map(n=>n.image);
        }

        let importDeclNodes = ocu.children["importDeclaration"] || [];
        for( let declNode of importDeclNodes ){
            this.imports.push( new ImportDeclaration(declNode) );
        };

        let typeDeclNodes = ocu.children["typeDeclaration"] || [];
        for( let declNode of typeDeclNodes ){
            for( let key in declNode.children ){
                for( let kdeclNode of declNode.children[key] ){
                    let clazz;
                    if( kdeclNode.name == "interfaceDeclaration" )
                        clazz = Clazz;
                    else if( kdeclNode.name == "classDeclaration" && kdeclNode.children.normalClassDeclaration )
                        clazz = Clazz;
                    else if( kdeclNode.name == "classDeclaration" && kdeclNode.children.enumDeclaration )
                        clazz = Enum;

                    if( !clazz )
                        throw new Error("Unknown type declaration: " + JSON.stringify(kdeclNode));

                    this.types.push( new clazz(kdeclNode, this) );
                }
            }
        }

    }

}

function getUnit( scope ){
    while( scope.scope )
        scope = scope.scope;
    return scope;
}

module.exports = { Unit, getUnit };
