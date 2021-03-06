APP.addPlugin("Meta", ["Project"], _=>{

    class Meta {

        registerProjectFile( buffer ){
            let project = DATA.project;
            let path = buffer.path;
            let projectPath = DATA.projectPath;
            if( !path.startsWith(DATA.projectPath) || buffer.pluginData.Meta )
                return;

            buffer.pluginData.Meta = {};

            path = path.substr( projectPath.length );

            if( !project.meta )
                project.meta = {};

            let metadef = {};
            APP.pollBufferMeta( buffer, metadef );

            let metabuf = project.meta[ path ];
            if( !metabuf )
                metabuf = project.meta[path] = {};

            for( let key in metadef ){
                if( !(key in metabuf) ){
                    metabuf[key] = metadef[key]["default"];
                }
                buffer.pluginData.Meta[key] = metadef[key];
            }

            APP.dirtyProject();

        }

        pollBufferActions( buffer, actions ){
            const meta = this.getBufferMeta(buffer);
            
            for( let key in meta ){
                if( buffer.pluginData.Meta[ key ] )
                    actions.push( getAction(key) );
            }

            function getAction( key ){
                let def = buffer.pluginData.Meta[ key ];
                return {
                    category: def.category,
                    label: def.label,
                    type: def.type,
                    value: meta[key],
                    cb( value ){
                        if( def.cb )
                            value = def.cb(value);
                        
                        if( meta[key] === value )
                            return value;

                        meta[key] = value;
                        APP.dirtyProject();
                        return value;
                    }
                };
            }
        }

        setMeta( buffer, key, value ){
        }

        getBufferMeta( buffer, key ){
            let path = buffer.path;
            const projectPath = DATA.projectPath;
            if( !path.startsWith(projectPath) )
                return null;

            path = path.substr( projectPath.length );
            return DATA.project.meta[path];
        }

        addMeta( buffer, key, type, args ){
        }

    }

    APP.add( new Meta() );
});
