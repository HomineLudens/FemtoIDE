const vfsfunc = require('./vfs.js');
const sourcepath = vfsfunc.sourcepath;
const vfs = vfsfunc.create();

const parsers = {};

function resolveVFS( fqcn ){

    let fparts = typeof fqcn == "string" ? fqcn.split(".") : fqcn;

    for( let i=0; i<sourcepath.length; ++i ){

        let ctx = vfs;
        let parts = [...sourcepath[i]];
        while( parts.length ){
            if( !ctx[parts[0]] ) break;
            ctx = ctx[ parts.shift() ];
        }

        if( parts.length )
            continue;

        let j;
        for( j=0; ctx && !ctx.src && j<fparts.length; ++j ){
            ctx = ctx[ fparts[j] ];
        }

        if( ctx ){
            fparts.splice(0, j-1);
            return ctx;
        }

    }

    return null;

}

function toAST( fqcn ){
    let pkg = [...fqcn];

    let res = resolveVFS( fqcn );

    if( !res )
        return null;

    if( res.unit )
        return res.unit;

    pkg.splice( pkg.length-fqcn.length+1, fqcn.length );

    let parser = parsers[ res.parser||"java" ];
    res.unit = parser.run( res.src, pkg );

    return res.unit;

}

var depth;

function ast( node, depth=0, name ){

    if( Array.isArray(node) ){
        node.forEach( n => ast(n, depth, name) );
        return;
    }

    if( node.name )
        name = node.name;
    else
        name += ":" + (node.image || "DOH!");


    console.log( name.padStart(depth*2+name.length, " ") );

    for( let k in node.children ){
        ast( node.children[k], depth+1, k );
    }

    if( !depth )
        depth[0][0][0] = 1;
}


module.exports = {
    resolveVFS,
    toAST,
    parsers,
    vfs,
    ast
};