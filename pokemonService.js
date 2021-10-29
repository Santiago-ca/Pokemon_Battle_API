const { json } = require('body-parser');
let pokemon = require('./pokemon');
let battleResult = require('./battleResult');
let type = require('./type');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function constructPokemon(pokemonName){
    return new Promise((resolve, reject) =>{
        try {
            fetch("https://pokeapi.co/api/v2/pokemon/"+pokemonName).then((respuesta)=>{
                return respuesta.json();
            }).then((resp) => {
                let types = [];
        
                for(const actType of resp.types){
                    fetch(actType.type.url).then((typeReq)=>{
                        return typeReq.json();
                    }).then((typeResp) => {
                        types.push(constructType(typeResp));
                        pokemon = {
                            name:pokemonName,
                            types:types
                        }
                        resolve(pokemon);
                    })
                }
              
            }).catch(error =>{
                resolve(null);
            }); 
        } catch (error) {
            resolve(null);
        }
    })
   
}

function constructType(typeJson){
    let double_damages_from = [], double_damages_to=[];
    let half_damages_from = [], half_damages_to=[];
    let no_damages_from = [], no_damages_to=[];
    
    let damages = typeJson.damage_relations;
    for(var i = 0; true; i++){
        let allOver = true;
        if(damages.double_damage_from.length>i){
            double_damages_from.push(damages.double_damage_from[i].name);
            allOver=false;
        }
        if(damages.double_damage_to.length>i){
            double_damages_to.push(damages.double_damage_to[i].name);
            allOver=false;
        }
        if(damages.half_damage_from.length>i){
            half_damages_from.push(damages.half_damage_from[i].name);
            allOver=false;
        }
        if(damages.half_damage_to.length>i){
            half_damages_to.push(damages.half_damage_to[i].name);
            allOver=false;
        }
        if(damages.no_damage_from.length>i){
            no_damages_from.push(damages.no_damage_from[i].name);
            allOver=false;
        }
        if(damages.no_damage_to.length>i){
            no_damages_to.push(damages.no_damage_to[i].name);
            allOver=false;
        }
        
        if(allOver) break;
    }

    type = {
        name:typeJson.name,
        double_damage_from:double_damages_from,
        double_damage_to:double_damages_to,
        half_damage_from:half_damages_from,
        half_damage_to:half_damages_to,
        no_damage_from:no_damages_from,
        no_damage_to:no_damages_to
    }

  
    return type;
}


function fight(pokemon1, pokemon2){
    let winner = '',pokemon1Points = 0,pokemon2Points = 0;
    var pointsRecord = calculateTotalPointsAndHistory(pokemon1.types, pokemon2.types);
    var totalPoints = pointsRecord.totalPoints;
    if(totalPoints!=0){
        winner = totalPoints>0?pokemon1.name:pokemon2.name;
        pokemon1Points = totalPoints;
        pokemon2Points = totalPoints*-1;
    }
    battleResult = {
        winner : winner,
        pokemon1Points : pokemon1Points,
        pokemon2Points : pokemon2Points,
        pointsRecount : pointsRecord.history 
    }
    return battleResult;
}

function calculateTotalPointsAndHistory(typesPokemon1, typesPokemon2){
    var totalPoints = 0;
    let history = [];
    for(const currType1 of typesPokemon1){
        let type1Name = currType1.name, type1NameToShow=type1Name.toUpperCase();
        for(const currType2 of typesPokemon2){
            let type2Name = currType2.name, type2NameToShow=type2Name.toUpperCase();;
            if(currType2.double_damage_to.includes(type1Name)){
                totalPoints-=70;
                history.push({
                    pokemon1Move : type1NameToShow+' gets -70PTS by double damaging from '+type2NameToShow,
                    pokemon2Move : type2NameToShow+' gets +70PTS by double damaging to '+type1NameToShow
                });
            }
            if(currType2.double_damage_from.includes(type1Name)){
                totalPoints+=70;
                history.push({
                    pokemon1Move : type1NameToShow+' gets +70PTS by double damaging to '+type2NameToShow,
                    pokemon2Move : type2NameToShow+' gets -70PTS by double damaging from '+type1NameToShow
                });
            }
            if(currType2.half_damage_to.includes(type1Name)){
                totalPoints-=30;
                history.push({
                    pokemon1Move : type1NameToShow+' gets -30PTS by double damaging from '+type2NameToShow,
                    pokemon2Move : type2NameToShow+' gets +30PTS by double damaging to '+type1NameToShow
                });
            }
            if(currType2.half_damage_from.includes(type1Name)){
                totalPoints+=30;
                history.push({
                    pokemon1Move : type1NameToShow+' gets +30PTS by double damaging to '+type2NameToShow,
                    pokemon2Move : type2NameToShow+' gets -30PTS by double damaging from '+type1NameToShow
                });
            }
        }
    }  

    return {totalPoints,history};
}

module.exports = {constructPokemon, fight};