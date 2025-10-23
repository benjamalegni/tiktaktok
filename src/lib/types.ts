export const TURNS = {
    X: '×',
    O: '○'
} as const;

export const ROWS = 3;
export const COLUMNS = 3;

export type TurnValue = typeof TURNS[keyof typeof TURNS];

export const MAX_MOVES = 6;

export const WINNER_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
] as const;


 const MatchStatus = {
    waiting: 'waiting',
    active: 'active',
    finished: 'finished',
    abandoned: 'abandoned',
} as const;

export type MatchStatus = typeof MatchStatus[keyof typeof MatchStatus];

export const musicPlaylist = [
  '/sounds/music/tiktaktok-theme.mp3',
  '/sounds/music/tiktaktok-menu1.mp3',
  '/sounds/music/tiktaktok-menu2.webm',
]