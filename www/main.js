let instances = [];

function boot(){
    try{
        let width = (localStorage.getItem("width")|0) || 800;
        let height = (localStorage.getItem("height")|0) || 600;

        nw.Window.open('www/index.html', {min_width:400, min_height:300, width, height, frame:false}, win=>{
            let inst = {win, project:null};
            instances.push(inst);

            win.window.onOpenProject = project => {
                inst.project = project.split(require("path").sep).pop();
                win.window.APP.setStatus(`Opened project ${inst.project}.`);
            };

            win.on("close", _=>{
                instances.splice(instances.indexOf(inst), 1);
                width = win.width;
                height = win.height;
                localStorage.setItem("width", width);
                localStorage.setItem("height", height);

                win.close(true);
            });
        });
    }catch(ex){
        console.log(ex);
    }
}

nw.App.on('open', (args)=>{
    ARGS = args;
    let ignore = true;
    args = args.split(/("(?:[^\\"]*\\"|[^"])*")|\s+/);
    args = args.filter(x=>{
        if( ignore || !x ){
            ignore = false;
            return false;
        }
        x = x.trim();
        ignore = x.startsWith("--") && x.endsWith("=");
        return x.length && !x.startsWith("--");
    });

    args = args.map(a => {
	return a.replace(/^"(.*)"$/, "$1");
    });

    if( args.length > 1 ){

	let str = JSON.stringify(args);

	let inst;
	do {
            let project = args.shift();
	    inst = instances.find(inst=>inst.project == project);
	} while(args.length && !inst);

        if(inst){
            args.forEach(arg=>{
                inst.win.window.APP[arg]();
            });
        }else{
	    instances[0].win.window.APP.log(str);
	    boot();
	};

    }else{
        boot();
    }
});

nw.Window.open("www/splash.html", {
    width:485,//868,
    height:280,//374,
    position:"center",
    frame:false,
    transparent:true
}, splash =>{

    setTimeout(_=>{
        boot();
        splash.close(true);
    }, 4000);

});
