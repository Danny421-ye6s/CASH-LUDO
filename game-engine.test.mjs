import test from "node:test";
import assert from "node:assert/strict";
import {createGame,rollDice,moveToken,getLegalMoves,globalSquare,FINISH_PROGRESS,SAFE_SQUARES,applyPlayerCommand} from "./game-engine.js";


test("starts with four tokens in each active player's base",()=>{const s=createGame();assert.deepEqual(s.tokens.red,[-1,-1,-1,-1]);assert.deepEqual(s.tokens.blue,[-1,-1,-1,-1]);assert.equal(s.playerCount,2);});
test("supports exactly two or four players",()=>{assert.deepEqual(createGame({playerCount:2}).playerOrder,["red","blue"]);assert.deepEqual(createGame({playerCount:4}).playerOrder,["red","green","blue","yellow"]);assert.throws(()=>createGame({playerCount:3}));});
test("four-player games create four sets of four tokens",()=>{const s=createGame({playerCount:4});assert.equal(Object.keys(s.tokens).length,4);for(const c of s.playerOrder)assert.equal(s.tokens[c].length,4);});
test("six followed by a movement roll allows a token to leave base",()=>{let s=rollDice(createGame(),6);s=rollDice(s,5);assert.equal(getLegalMoves(s,5)[0].type,"enter-and-move");});
test("six gives a bonus roll before any movement",()=>{const s=rollDice(createGame(),6);assert.equal(s.awaitingBonusRoll,true);assert.equal(s.tokens.red[0],-1);});
test("a non-six movement roll moves token and passes turn",()=>{let s=rollDice(createGame(),6);s=rollDice(s,5);s=moveToken(s,0);assert.equal(s.tokens.red[0],4);assert.equal(s.turn,"blue");});
test("four-player turn order advances clockwise",()=>{let s=createGame({playerCount:4});s=rollDice(s,2);assert.equal(s.turn,"green");});
test("four-player turn order continues after green",()=>{let s=createGame({playerCount:4});s.tokens.red[0]=0;s.pendingDice=1;s.legalMoves=[{token:0,type:"move",from:0,to:1}];s=moveToken(s,0);assert.equal(s.turn,"green");});
test("requires an exact roll to finish",()=>{let s=createGame();s.tokens.red[0]=FINISH_PROGRESS-2;s.pendingDice=3;s.legalMoves=getLegalMoves(s,3);assert.equal(s.legalMoves.length,0);s.pendingDice=2;s.legalMoves=getLegalMoves(s,2);assert.equal(s.legalMoves[0].type,"finish");});
test("three consecutive sixes forfeit the turn",()=>{let s=createGame();s=rollDice(s,6);s=rollDice(s,6);s=rollDice(s,6);assert.equal(s.turn,"blue");assert.equal(s.consecutiveSixes,0);assert.equal(s.lastAction.type,"three-sixes-forfeit");});
test("safe squares prevent capture",()=>{const s=createGame(),safe=SAFE_SQUARES[1];s.tokens.red[0]=safe-1;s.tokens.blue[0]=(safe-26+52)%52;const after=moveToken({...s,turn:"red",pendingDice:1,legalMoves:[{token:0,type:"move",from:safe-1,to:safe}]},0);assert.notEqual(after.tokens.blue[0],-1);});
test("captures an opponent on an unsafe square",()=>{const s=createGame();s.tokens.red[0]=4;s.tokens.blue[0]=(6-26+52)%52;s.pendingDice=2;s.legalMoves=[{token:0,type:"move",from:4,to:6}];const after=moveToken(s,0);assert.equal(after.tokens.blue[0],-1);assert.deepEqual(after.lastAction.captured,[{color:"blue",token:0}]);});
test("four-player capture can capture opponents",()=>{const s=createGame({playerCount:4});s.tokens.red[0]=4;s.tokens.green[0]=(6-13+52)%52;s.pendingDice=2;s.legalMoves=[{token:0,type:"move",from:4,to:6}];const after=moveToken(s,0);assert.equal(after.tokens.green[0],-1);assert.deepEqual(after.lastAction.captured,[{color:"green",token:0}]);});
test("rejects moving a token that is not legal",()=>{const s=createGame();s.pendingDice=6;s.legalMoves=[{token:0,type:"enter",from:-1,to:0}];assert.throws(()=>moveToken(s,2));});
test("rejects a stale server command",()=>assert.throws(()=>applyPlayerCommand(createGame(),{type:"roll"},{authenticatedColor:"red",expectedVersion:99,dice:4})));
test("rejects a command from the wrong player",()=>assert.throws(()=>applyPlayerCommand(createGame(),{type:"roll"},{authenticatedColor:"blue",expectedVersion:0,dice:4})));
test("rejects invalid dice",()=>assert.throws(()=>rollDice(createGame(),7)));
test("a six always grants a bonus roll even when no token can move",()=>{let s=createGame();s.tokens.red=[56,56,56,56];s=rollDice(s,6);assert.equal(s.turn,"red");assert.equal(s.consecutiveSixes,1);assert.equal(s.lastAction.type,"bonus-roll");});
test("track positions wrap correctly for all player colors",()=>{assert.equal(globalSquare("red",51),51);assert.equal(globalSquare("blue",0),26);assert.equal(globalSquare("green",0),13);assert.equal(globalSquare("yellow",0),39);});
test("does not capture on a safe square",()=>{const s=createGame();s.tokens.red[0]=7;s.tokens.blue[0]=(8-26+52)%52;s.pendingDice=1;s.legalMoves=[{token:0,type:"move",from:7,to:8}];const after=moveToken(s,0);assert.notEqual(after.tokens.blue[0],-1);});

test("six then five uses five as the movement roll",()=>{let s=rollDice(createGame(),6);s=rollDice(s,5);assert.equal(s.pendingDice,5);assert.equal(s.lastAction.dice,5);assert.equal(s.legalMoves[0].type,"enter-and-move");});
test("two sixes then five uses five as the movement roll",()=>{let s=rollDice(createGame(),6);s=rollDice(s,6);s=rollDice(s,5);assert.equal(s.pendingDice,5);assert.equal(s.consecutiveSixes,0);});
