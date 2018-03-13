var fs = require('fs');
var parse = require('csv-parse');
var Random = require("random-js");
var random = new Random(Random.engines.mt19937().autoSeed());

var levels = [];

var hands = [];

const defaults = {
    minPlayers : 4,
    maxPlayers : 10
}

const positions = [
    {code : "UTG", pos : "EP"},
    {code : "+1", pos : "EP"},
    {code : "+2", pos : "EP"},
    {code : "+3", pos : "EP"},
    {code : "LJ", pos : "MP"},
    {code : "HJ", pos : "MP"},
    {code : "CO", pos : "CO"},
    {code : "BU", pos : "BU"},
    {code : "SB", pos : "SB"}
]

var levelsParser = parse({delimiter : ","}, function(err, data){
    data.forEach((di, i)=>{
        if(i>0)
            levels.push({
                ante : +di[1],
                sb : +di[2],
                bb : +di[3]
            });
    })
    // console.log("and now levels!")
    // console.log(levels);
    generate();
});

var handsParser = parse({delimiter: ','}, function(err, data){
    data.forEach(function(di) {
        let key = di[0];
        if(key.charAt(0) !== key.charAt(1) && !key.endsWith("s")){
            key = key + "o";
        }
        hands.push({
            hand : key,
            combos : +di[1],
            percentage : +(+di[1] / 13.26).toFixed(2),
            EP : +di[3],
            MP : +di[4],
            CO : +di[5],
            BU : +di[6]
        });
    }, this);
    // let mpPush = Object.keys(hands).filter(x=>hands[x].bu === 1);
    // var sum = mpPush.reduce((prev, cur)=>{
    //     return prev + hands[cur].percentage
    // }, 0);
    // console.log("percentage : " + sum.toFixed(2));
    // console.log(mpPush.join(","));
    fs.createReadStream(__dirname+'/levels.csv').pipe(levelsParser);
});

fs.createReadStream(__dirname+'/starting-hands2.csv').pipe(handsParser);

function main(){
    let players = random.integer(4, 10);
    let m = random.real(3, 5, true).toFixed(2);

    let level = random.pick(levels);
    var {m : m1, stack} = generateStackSize(level, m, players);
    let pos = generatePosition(players);
    let hand = random.pick(hands, 0, 500);
    
    // console.log("players : ", players);
    // console.log("position : ", pos.code);
    // console.log("stack size : ", stack);
    // console.log("level : ", level);
    // console.log("m : ", m);
    // console.log("hand : ", hand.hand);

    let answer = "FOLD";

    if(m<4){
        answer = "PUSH";
    } else if(pos.code === "SB"){
        answer = "PUSH"
    } else if(hand[pos.pos]){
        answer = "PUSH"
    }
    return `level:${level.sb}/${level.bb}/${level.ante}, players:${players}, position: ${pos.code}, stack : ${stack}, hand : ${hand.hand}\tM=${m1.toFixed(2)},${answer}`
}

function generatePosition(maxPlayers = defaults.maxPlayers){
    return random.pick(positions.reverse(), 0, maxPlayers - 1);
    //return positions.reverse()[1];
}


function generateStackSize(level, m, players = 10){
    let orbit =  level.sb + level.bb + level.ante * players;
    let stack = m * orbit;
    stack = Math.floor(stack / 25) * 25;
    return {
        m : stack / orbit,
        stack : stack
    }
}

function generate(){
    for(let i=0; i<1000; i++){
        console.log(main());
    }
}


