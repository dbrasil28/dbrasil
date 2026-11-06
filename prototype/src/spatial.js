// Grade espacial uniforme reconstruída a cada quadro. Suficiente para centenas de
// unidades em celular; buckets são reaproveitados para evitar lixo no GC.

export class SpatialHash {
  constructor(cellSize = 1.5) {
    this.cell = cellSize;
    this.inv = 1 / cellSize;
    this.map = new Map();
    this.pool = [];
  }

  static key(ix, iy) {
    return (ix + 32768) * 65536 + (iy + 32768);
  }

  clear() {
    for (const arr of this.map.values()) {
      arr.length = 0;
      this.pool.push(arr);
    }
    this.map.clear();
  }

  insert(e) {
    const k = SpatialHash.key(Math.floor(e.x * this.inv), Math.floor(e.y * this.inv));
    let arr = this.map.get(k);
    if (!arr) {
      arr = this.pool.pop() || [];
      this.map.set(k, arr);
    }
    arr.push(e);
  }

  /** Coloca em `out` os candidatos nas células que tocam o círculo (x, y, r). */
  query(x, y, r, out) {
    out.length = 0;
    const x0 = Math.floor((x - r) * this.inv);
    const x1 = Math.floor((x + r) * this.inv);
    const y0 = Math.floor((y - r) * this.inv);
    const y1 = Math.floor((y + r) * this.inv);
    for (let ix = x0; ix <= x1; ix++) {
      for (let iy = y0; iy <= y1; iy++) {
        const arr = this.map.get(SpatialHash.key(ix, iy));
        if (arr) for (let i = 0; i < arr.length; i++) out.push(arr[i]);
      }
    }
    return out;
  }
}
