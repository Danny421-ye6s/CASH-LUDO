import test from "node:test";import assert from "node:assert/strict";import {createGame,roll,move} from "./game-engine.js";
test("six gives the same player another turn",()=>{let s=move(roll(createGame(),6));assert.equal(s.turn,"red");assert.equal(s.progress.red,6)});
test("non-six passes turn",()=>{let s=move(roll(createGame(),3));assert.equal(s.turn,"blue");assert.equal(s.progress.red,3)});
test("rejects invalid dice",()=>assert.throws(()=>roll(createGame(),0)));
test("requires a roll before moving",()=>assert.throws(()=>move(createGame())));
