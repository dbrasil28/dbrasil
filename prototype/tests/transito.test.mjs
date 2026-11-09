// Trânsito da avenida no dia normal (D88): na abertura, antes do sinal pegar, os carros param para quem atravessa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { defaultSettings } from '../src/settings.js';
import { AVENIDA } from '../src/config.js';

const DT = 1 / 30;

test('dia normal: o carro para antes do pedestre atravessando e volta a andar quando a rua fica livre; depois do sinal, não para mais', () => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 11, meta: { abertura: true } });
  g.update(DT, { x: 0, y: 0 });
  const ab = g.abertura;
  assert.ok(ab && ab.fase === 'normal', 'a partida não começou na abertura');
  ab.t = -1e9; // o sinal não pega durante o teste
  const p = g.player;
  const f = AVENIDA.faixas[0]; // descendo (sentido 1)
  g.traffic.length = 0;
  g.trafficT = g.trafficT.map(() => 1e9); // só o carro do teste
  const carro = { x: f.x, y: p.y - 20, faixa: 0, sentido: f.sentido, v: 10, len: 4, wid: 1.8, modelo: 'fusca', warned: true };
  g.traffic.push(carro);
  // uma pessoa parada no meio da faixa, 12 m à frente do carro
  const civ = ab.civis[0];
  civ.x = f.x;
  civ.y = carro.y + 12;
  civ.vx = civ.vy = 0;
  civ.troca = 1e9;
  for (const o of ab.civis) if (o !== civ) { o.x = -12; o.vx = o.vy = 0; o.troca = 1e9; }
  p.x = -10; // o Juninho longe da avenida
  for (let i = 0; i < 90; i++) g.update(DT, { x: 0, y: 0 });
  const frente = carro.y + carro.len / 2;
  assert.ok(carro.vAtual < 0.3, `o carro não parou (${carro.vAtual.toFixed(1)} m/s)`);
  assert.ok(frente < civ.y - 0.3, 'o carro passou por cima do pedestre');
  // a pessoa sai da rua: o carro volta a andar
  civ.x = -12;
  for (let i = 0; i < 60; i++) g.update(DT, { x: 0, y: 0 });
  assert.ok(carro.vAtual > 5, 'o carro não voltou a andar');
  // depois do sinal (todo mundo louco), não para mais para ninguém
  const c2 = { x: f.x, y: p.y - 20, faixa: 0, sentido: f.sentido, v: 10, len: 4, wid: 1.8, modelo: 'fusca', warned: true };
  g.traffic.length = 0;
  g.traffic.push(c2);
  g.pularAbertura();
  const alvo = g.enemies[0];
  alvo.x = f.x;
  alvo.y = c2.y + 12;
  alvo.speed = 0;
  for (let i = 0; i < 30; i++) g.update(DT, { x: 0, y: 0 });
  assert.ok(c2.vAtual > 8, 'parou para a horda depois do sinal');
});

test('dia normal: a pessoa olha antes de atravessar e não pisa na frente do carro andando', () => {
  const g = new Game({ ...defaultSettings(), elenco: false, aberta: false }, { seed: 11, meta: { abertura: true } });
  g.update(DT, { x: 0, y: 0 });
  const ab = g.abertura;
  ab.t = -1e9;
  const p = g.player;
  p.x = -10;
  const f = AVENIDA.faixas[1]; // descendo
  g.traffic.length = 0;
  g.trafficT = g.trafficT.map(() => 1e9);
  const carro = { x: f.x, y: p.y - 20, faixa: 1, sentido: f.sentido, v: 10, len: 4, wid: 1.8, modelo: 'uno', warned: true };
  g.traffic.push(carro);
  for (const o of ab.civis) { o.x = -12; o.vx = o.vy = 0; o.troca = 1e9; }
  // na beira da faixa, andando para dentro dela, com o carro chegando a 6 m
  const civ = ab.civis[0];
  civ.x = f.x - carro.wid / 2 - 1;
  civ.y = carro.y + carro.len / 2 + 6;
  civ.vx = 0.9;
  const x0 = civ.x;
  let entrou = false;
  for (let i = 0; i < 30 * 3; i++) {
    g.update(DT, { x: 0, y: 0 });
    const dentro = Math.abs(civ.x - carro.x) < carro.wid / 2 && Math.abs(civ.y - carro.y) < carro.len / 2 + 0.3;
    if (dentro) entrou = true;
  }
  assert.ok(!entrou, 'a pessoa entrou no carro');
  assert.ok(carro.y > civ.y, 'o carro não passou');
  assert.ok(carro.vAtual > 8, 'o carro freou à toa');
  assert.ok(civ.x > x0 + 0.5, 'depois que o carro passou ela não atravessou');
});
