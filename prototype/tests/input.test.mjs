// Controle de toque: o Juninho não pode ficar parado por um "soltou" que o celular engoliu.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Input } from '../src/input.js';

function camada() {
  const layer = new EventTarget();
  layer.getBoundingClientRect = () => ({ left: 0, top: 0 });
  layer.setPointerCapture = () => {};
  const el = () => ({ hidden: true, style: {}, classList: { toggle() {} } });
  return { layer, base: el(), knob: el() };
}

function toque(tipo, id, x, y) {
  const e = new Event(tipo);
  e.pointerId = id;
  e.clientX = x;
  e.clientY = y;
  return e;
}

test('toque novo assume o controle mesmo sem o "soltou" do dedo anterior', () => {
  const { layer, base, knob } = camada();
  const inp = new Input(layer, base, knob);
  layer.dispatchEvent(toque('pointerdown', 1, 100, 100));
  layer.dispatchEvent(toque('pointermove', 1, 100, 160));
  assert.ok(inp.read().y > 0.9, 'o primeiro dedo não andou');
  // o celular engoliu o pointerup do dedo 1; o jogador encosta de novo e arrasta para a direita
  layer.dispatchEvent(toque('pointerdown', 2, 200, 200));
  layer.dispatchEvent(toque('pointermove', 2, 260, 200));
  const v = inp.read();
  assert.ok(v.x > 0.9 && Math.abs(v.y) < 0.1, `o toque novo não moveu: ${JSON.stringify(v)}`);
  // e soltar o dedo novo para o Juninho
  layer.dispatchEvent(toque('pointerup', 2, 260, 200));
  assert.equal(inp.read().x, 0);
});

test('perder o toque (lostpointercapture) solta o controle', () => {
  const { layer, base, knob } = camada();
  const inp = new Input(layer, base, knob);
  layer.dispatchEvent(toque('pointerdown', 7, 50, 50));
  layer.dispatchEvent(toque('pointermove', 7, 110, 50));
  assert.ok(inp.read().x > 0.9);
  layer.dispatchEvent(toque('lostpointercapture', 7, 110, 50));
  assert.equal(inp.pointerId, null);
  assert.equal(inp.read().x, 0);
});
