// Positions relative to a (0, 0) origin at the top-center of the graph layer.
// Node pill is 160w × 44h — coordinates point at the node's center.
// Branches sit at x = -340 (CAD) / 0 (Sim) / +340 (Docs).

export const NODE_WIDTH = 160
export const NODE_HEIGHT = 44

const COL = 340
const ROW = 78

export const NODE_POSITIONS = {
  root: { x: 0, y: 0 },

  'cad-1': { x: -COL, y: ROW * 1.4 },
  'cad-2': { x: -COL, y: ROW * 2.4 },
  'cad-3': { x: -COL, y: ROW * 3.4 },
  'cad-4': { x: -COL, y: ROW * 4.4 },
  'cad-approval': { x: -COL, y: ROW * 5.4 },
  'cad-5': { x: -COL, y: ROW * 6.4 },
  'cad-6': { x: -COL, y: ROW * 7.4 },
  'cad-7': { x: -COL, y: ROW * 8.4 },

  'sim-1': { x: 0, y: ROW * 1.4 },
  'sim-2': { x: 0, y: ROW * 2.4 },
  'sim-3': { x: 0, y: ROW * 3.4 },
  'sim-4': { x: 0, y: ROW * 4.4 },
  'sim-5': { x: 0, y: ROW * 5.4 },

  'docs-1': { x: COL, y: ROW * 1.4 },
  'docs-2': { x: COL, y: ROW * 2.4 },
  'docs-3': { x: COL, y: ROW * 3.4 },
  'docs-4': { x: COL, y: ROW * 4.4 },

  final: { x: 0, y: ROW * 9.6 },
}
