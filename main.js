/* Dos jugadores */

/* LINKS */
// https://www.codeandweb.com/physicseditor/tutorials/phaser-p2-physics-example-tutorial
// https://phaser.io/examples/v2/p2-physics/load-polygon-2
// https://phaser.io/examples/v2/p2-physics/contact-events
// https://phaser.io/examples/v2/p2-physics/chain

/* OBJETOS */

var objetos = [{
    name: "Frigorífico",
    masa: 50,
    img: "frigo",
    scale: [1,1]
},{
    name: "Carrito",
    masa: 25,
    img: "carrito",
    scale: [1,1]
},{
    name: "Televisión",
    masa: 15,
    img: "tele",
    scale: [1,1]
},{
    name: "Cohete",
    masa: 87,
    img: "cohete",
    scale: [1,1]
},{
    name: "Tonel",
    masa: 14,
    img: "tonel",
    scale: [1,1]
}]; // AÑADIR MÁS

var state = "PLAY_PLAYER_SELECT"; // Otros estados son: PLAY_PLAYER_ANIM, PLAY_PLAYER_BOOST, WAIT_BROKE

var game = new Phaser.Game(1000,600,Phaser.AUTO,"",{preload: preload, create: create, update: update});

var nubes = [];
var intro, turnos = 0 ;
var player = 1;
var timeBoost = 0;
var startTime = 0, topTime = 0;
var personajes = [];
var frame, alma, cropRect;
var subiendo = true;
var lanzados = [];
var selected;
var collGroup;
var pesoBarra = 0;
var barra;
var penalizacion;
var collided = false;

function preload(){
    game.load.image("cielo","cielo.png");
    game.load.image("nube1","nube1-01.png");
    game.load.image("nube2","nube2-01.png");
    game.load.image("frigo","frigo.png");
    game.load.image("tele","tele.png");
    game.load.image("cohete","cohete.png");
    game.load.image("carrito","carrito.png");
    game.load.image("tonel","tonel.png");

    game.load.image("boost-frame","boost-frame.png");
    game.load.image("boost-alma","boost-alma.png");

    game.load.physics("fisica","fisica.json");

    game.load.spritesheet("barra","barra.png",800,75);
    game.load.spritesheet("torreIz", "torreIz.png",200,600);
    game.load.spritesheet("torreDe", "torreDe.png",200,600);
    game.load.spritesheet("personaje-verde","personaje-verde.png",600,600);
    game.load.spritesheet("personaje-rojo","personaje-rojo.png",600,600);
}

function create(){
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 1000;

    collGroup = game.physics.p2.createCollisionGroup();

    var cielo = game.add.sprite(0,0,"cielo");
    nubes[0] = game.add.sprite(30,100,"nube1");
    nubes[0].scale.setTo(0.2,0.2);
    nubes[1] = game.add.sprite(50,120,"nube2");
    nubes[1].scale.setTo(0.2,0.2);

    barra = game.add.sprite(145,270,"barra");
    barra.scale.setTo(0.65,0.65);
    barra.animations.add("barra1",[0,1,2,3,4],7,true);
    barra.animations.add("barra2",[5,6,7,8,9],7,true);
    barra.animations.add("barra3",[10,11,12,13,14],7,true);
    barra.animations.add("barra4",[15,16,17,18,19],7,true);
    barra.animations.add("barra5",[20,21,22,23,24],7,true);
    barra.animations.play("barra1");
    game.physics.p2.enable(barra,false);
    barra.body.static = true;
    barra.anchor.setTo(0.5,0.5);
    barra.body.x = 400;
    barra.body.y = 290;
    //barra.body.setCollisionGroup(collGroup);


    var colIzq = game.add.sprite(150,300,"torreIz"); //new Phaser.Rectangle(200,400,50,200);
    colIzq.width = 100;
    colIzq.animations.add("constant",[0,1,2,3,4],7,true);
    colIzq.animations.play("constant");
    var colDer = game.add.sprite(550,300,"torreDe"); //new Phaser.Rectangle(550,400,50,200);
    colDer.width = 100;
    colDer.animations.add("constant",[0,1,2,3,4],7,true);
    colDer.animations.play("constant");

    createSpriteObjetos();

    personajes[0] = game.add.sprite(50,500,"personaje-verde");
    personajes[0].width = 100;
    personajes[0].height = 100;
    personajes[0].frame = 0;
    personajes[0].animations.add("derecha",[24,25,26,27,28,28,29,30,31,32,33,34,35],20,true);
    personajes[0].animations.add("izquierda",[36,37,38,39,40,41,42,43,44,45,46,47],20,true);
    personajes[0].animations.add("quieto", [48, 49, 50], 4, true); //Diferentes FPs P1 de P2 (razones estéticas)

    personajes[1] = game.add.sprite(-10,500,"personaje-rojo");
    personajes[1].width = 100;
    personajes[1].height = 100;
    personajes[1].frame = 0;
    personajes[1].animations.add("derecha",[24,25,26,27,28,28,29,30,31,32,33,34,35],20,true);
    personajes[1].animations.add("izquierda",[36,37,38,39,40,41,42,43,44,45,46,47],20,true);
    personajes[1].animations.add("quieto", [48, 49, 50], 3, true);
    
    personajes[0].animations.play("quieto");
    personajes[1].animations.play("quieto");


    intro = game.add.text(20,15,"Jugador 1 - Turnos: 0",{
        font: "20pt Rainmaker",
        fill: "black"
    });

    mostrarLineaRandom();

    //game.physics.p2.setImpactEvents(true);
}

function update(){

    // ANIMACIONES MANUALES
    nubes[0].x += 0.5;
    nubes[1].x += 1;

    if(nubes[0].x > 1000)
        nubes[0].x = -100;
    if(nubes[1].x > 1000)
        nubes[1].x = -100;

    // INPUT
    if(state == "PLAY_PLAYER_SELECT"){
        if(objetos.filter(function(obj){
            return obj.sprite.selected;
        }).length > 0){
            selected = objetos.filter(function(obj){
                return obj.sprite.selected;
            })[0];
            //alert("SE HA SELECCIONADO "+selected.name);
            nextState();
        }
    }
    if(state == "PLAY_PLAYER_ANIM"){
        personajes[player -1 ].x += 4;
        if(personajes[player -1].x > 900){
            nextState();
        }
    }
    if(state == "PLAY_PLAYER_BOOST"){
        var now = Date.now();
        if(game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR)){
            if(startTime == 0){
                startTime = now;
            }else{
                timeBoost = now-startTime;
                cropRect.height = 600 - timeBoost; //alma.height - (alma.height*1500)/timeBoost;
                
                alma.updateCrop();
                if(cropRect.height < 0){
                    startTime = now;
                    cropRect.height = alma.height;
                    alma.updateCrop();
                }
            }
        }else if(timeBoost > 0){
            penalizacion = 1;
            var change = Math.abs(600 - timeBoost);
            console.log("Change: "+change)
            if (change > 50){
                penalizacion = Math.ceil(Math.pow(change / 100,2));
                console.log("Penalizacion: "+penalizacion);
            }
            var penalizacionText = game.add.text(300,350,"Fuerza x"+penalizacion,{
                font: "20pt Rainmaker",
                fill: "black"
            });
            setTimeout(function(){
                penalizacionText.destroy();   
            },1000);
            startTime = 0;
            timeBoost = 0;
            alma.destroy();
            frame.destroy();
            nextState();
        }
    }
    var maxPeso = 200;
    if(state == "WAIT_BROKE"){
        var objeto = lanzados[lanzados.length -1];
        if(objeto.x > 147 && objeto.x < 667){
            if(objeto.y > 200){
                if(!collided){
                    collided = true;
                    pesoBarra += objeto.body.mass*penalizacion;
                    if(pesoBarra >  maxPeso * 0.2){
                        barra.animations.play("barra2");
                    }
                    if(pesoBarra >  maxPeso * 0.4){
                        barra.animations.play("barra3");
                    }
                    if(pesoBarra >  maxPeso * 0.6){
                        barra.animations.play("barra4");
                    }
                    if(pesoBarra > maxPeso * 0.8){
                        barra.animations.play("barra5");
                    }
                    if(pesoBarra > maxPeso) {
                        barra.destroy();
                        setTimeout(function(){
                            game.add.sprite(0,0,"cielo");
                            var final = game.add.text(300,350,"¡Lo has roto!", {
                                font: "20pt Rainmaker",
                                fill: "black"
                            });
                            var final = game.add.text(300,450,"Ha ganado el jugador " + ((player == 2) ? 1 : 2), {
                                font: "20pt Rainmaker",
                                fill: "black"
                            });
                            
                            var chapuza = "personaje-rojo";
                            if(player === 2) {
                                player = 0;
                                chapuza = "personaje-verde";
                            }
                            
                            personajes[player] = game.add.sprite(500,500,chapuza);
                            personajes[player].width = 100;
                            personajes[player].height = 100;
                            personajes[player].frame = 0;
                            personajes[player].animations.add("derecha",[24,25,26,27,28,28,29,30,31,32,33,34,35],20,true);
                            personajes[player].animations.add("izquierda",[36,37,38,39,40,41,42,43,44,45,46,47],20,true);
                            personajes[player].animations.add("quieto", [48, 49, 50], 4, true); //Diferentes FPs P1 de P2 (razones estéticas)
                            personajes[player].animations.play("quieto");
                        },500);                        
                        
                    }
                }
            }
        }

        if(personajes[player - 1]){
            personajes[player - 1].x -= 4;
            if(personajes[player - 1].x < 50-(60*(player - 1)) && pesoBarra < maxPeso){
            nextState();
            }
        }
    }

    lanzados.forEach(function(obj){
        if(obj){
            if(obj.x < 100 && obj.y > 400){
                obj.destroy();
            }
        }
    });


    // PHYSICS

    // RENDER
}

/* FUNCIONES EXTERNAS A PHASER */

function changePlayer(){
    player++;
    if(player==3){
        player = 1;
        turnos++;
    }
    intro.text = "Jugador "+player+" - Turnos: "+turnos;
}

function nextState(){
    switch(state){
        case "PLAY_PLAYER_SELECT": {
            state = "PLAY_PLAYER_ANIM";
            personajes[player - 1].animations.play("derecha");
            rmSpriteObjetos();
        }break;
        case "PLAY_PLAYER_ANIM": {
            state = "PLAY_PLAYER_BOOST";
            personajes[player - 1].animations.stop();
            personajes[player -1].frame = 0;
            alma = game.add.sprite(700,100,"boost-alma");
            alma.scale.setTo(0.75,0.75);
            frame = game.add.sprite(700,100,"boost-frame");
            frame.scale.setTo(0.75,0.75);
            cropRect = new Phaser.Rectangle(0,0,100,600);
            alma.crop(cropRect);
        }
            break;
        case "PLAY_PLAYER_BOOST": {
            var objeto = game.add.sprite(899,499,selected.img);
            objeto.scale.setTo(selected.scale[0],selected.scale[1]);
            game.physics.p2.enable(objeto,false);
            objeto.body.clearShapes();
            objeto.body.loadPolygon("fisica",selected.img);
            objeto.body.mass = selected.masa;
            //objeto.body.setCollisionGroup(collGroup);
            //objeto.anchor.setTo(0,0); 
            personajes[player - 1].animations.play("izquierda");
            switch(selected.img) {
                case "tele":
                    objeto.body.velocity.x = -400;
                    objeto.body.velocity.y = 10000;
                    break;
                case "tonel":
                    objeto.body.velocity.x = -500;
                    objeto.body.velocity.y = 10000;
                    break;
                case "cohete":
                    objeto.body.velocity.x = -300;
                    objeto.body.velocity.y = 10000;
                default:
                    objeto.body.velocity.x = -600;
                    objeto.body.velocity.y = 10000;
            }
            
            lanzados.push(objeto);

            state = "WAIT_BROKE";
            
        }break;
        case "WAIT_BROKE":{
            collided = false;
            resetSelectedObject();
            personajes[player - 1].animations.play("quieto");
            personajes[player - 1].frame = 0;
            changePlayer();
            state = "PLAY_PLAYER_SELECT"; 
            mostrarLineaRandom();
        } break;
    }
}

function createSpriteObjetos(){
    for(var i=0;i<objetos.length;i++){
        objetos[i].sprite = game.add.sprite(50 +(150)*(i%5),50,objetos[i].img);
        objetos[i].sprite.scale.setTo(objetos[i].scale[0],objetos[i].scale[1]);
        objetos[i].sprite.inputEnabled = false;
        objetos[i].sprite.visible = false;
        objetos[i].sprite.events.onInputDown.add(function(){
            this.selected = true;
        },objetos[i].sprite);
    }
}

function rmSpriteObjetos(){
    for(var i=0;i<objetos.length;i++){
        objetos[i].sprite.visible = false;
        objetos[i].sprite.inputEnabled = false;
    }
}

function mostrarLineaRandom(){
    var rnd = getRandomInt(0,1);
    console.log(rnd);
    for(var i=rnd*5;i<(rnd+1)*5;i++){
        console.log(objetos[i]);
        objetos[i].sprite.visible = !objetos[i].sprite.visible;
        objetos[i].sprite.inputEnabled = !objetos[i].sprite.inputEnabled;
    }
}

function resetSelectedObject(){
    objetos.forEach(function(obj){
        obj.sprite.selected = false;
    });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}