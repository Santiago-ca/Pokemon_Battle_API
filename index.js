'use strict';

const express = require("express");
const bodyParser = require("body-parser");
const pokemonService = require('./pokemonService');
const cors = require('cors');

const app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());

let respuesta = {
    error:false,
    codigo:200,
    mensaje:''
}

app.get('/', function(req, res){
    respuesta = {
        codigo:200,
        mensaje:'Welcome to the Pokemon battle api, to proceed please send a request to /battle/ specifiyng two parameters: The two pokemons that will figth'
    };
    res.send(respuesta);
});

app.get('/battle/', async function(req, res){
    var parPokemon1 = req.query.pokemon1, parPokemon2 = req.query.pokemon2;
    var pokemon1 = await pokemonService.constructPokemon(parPokemon1);
    var pokemon2 = await pokemonService.constructPokemon(parPokemon2);
  
   if(pokemon1===null || pokemon2===null){
       res.send({
        codigo:400,
        message: "The pokemons you specified doesn't exists"
    })
   }else{
        var battleResult = pokemonService.fight(pokemon1, pokemon2)
        res.send({
            codigo:200,
          battleResult: battleResult
        });
   }
   
})

app.listen(3000, ()=>{
    console.log("Server initialized in port 3000");
});

