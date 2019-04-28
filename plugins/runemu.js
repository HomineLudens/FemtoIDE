APP.addPlugin("RunEMU", [], _=> {
    const { spawn } = require('child_process');

    function replaceData( f ){
        return f.replace(/\$\{([^}]+)\}/g, (s, key)=>DATA[key]);
    }

    let running = false;

    APP.add({

        runDebug(){
            this.run(["-g"]);
            APP.setStatus("Debugging " + DATA.buildFolder);
            if( DATA.debugBuffer )
                APP.displayBuffer( DATA.debugBuffer );
            setTimeout( _=>{
                if( running ){
                    APP.onDebugEmulatorStarted(1234);
                }
            }, 500);
        },

        stopEmulator(){
            APP.killChild( running );
        },

        run( flags ){

            if( running ){
                APP.error("Emulator already running");
                return;
            }

            let execPath = DATA[
                "EMU-" + DATA.project.target
            ] + DATA.executableExt;

            if( !execPath )
                return;

            flags = flags || [];

            let typeFlags = DATA.project["emuFlags"];
            if( typeFlags ){
                if( typeFlags[DATA.project.target] )
                    flags.push(...typeFlags[DATA.project.target]);
                if( typeFlags.ALL )
                    flags.push( ...typeFlags.ALL );
            }

            flags = flags.map( f => '"' + replaceData(f) + '"' );

            APP.log([execPath, ...flags ].join(" "));

            APP.setStatus("Emulating...");
            let emu = spawn( '"' + execPath + '"', flags, {shell:true} );

            emu.stdout.on('data', data => {
                APP.log(data);
            });

            emu.stderr.on('data', data => {
                APP.error(data);
            });

            emu.on('close', code => {
                APP.onEmulatorStopped();
                APP.setStatus("Emulation ended");
                running = false;
            });

            running = emu;

        }
    });
});