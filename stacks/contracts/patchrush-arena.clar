;; PatchRush daily territory board for Stacks.

(define-constant BOARD_SIZE u6)
(define-constant CELL_COUNT u36)
(define-constant MAX_CLAIMS_PER_ROUND u3)
(define-constant BASE_SCORE u10)
(define-constant NEIGHBOR_BONUS u3)

(define-constant ERR_INVALID_ROUND (err u400))
(define-constant ERR_INVALID_COLOR (err u401))
(define-constant ERR_OUT_OF_BOUNDS (err u402))
(define-constant ERR_CELL_CLAIMED (err u403))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_CLAIM_LIMIT (err u405))
(define-constant ERR_ALREADY_BOOSTED (err u406))

(define-map cells
  {
    round-id: uint,
    index: uint
  }
  {
    owner: principal,
    color: uint,
    score: uint,
    created-at: uint,
    boosts: uint
  }
)

(define-map claim-counts
  {
    round-id: uint,
    player: principal
  }
  uint
)

(define-map player-scores
  {
    round-id: uint,
    player: principal
  }
  uint
)

(define-map round-claimed-counts uint uint)

(define-map boosts
  {
    round-id: uint,
    index: uint,
    player: principal
  }
  bool
)

(define-private (valid-round? (round-id uint))
  (and (>= round-id u20200101) (<= round-id u20991231))
)

(define-private (cell-index (x uint) (y uint))
  (+ (* y BOARD_SIZE) x)
)

(define-private (occupied? (round-id uint) (index uint))
  (is-some (map-get? cells { round-id: round-id, index: index }))
)

(define-private (neighbor-count (round-id uint) (x uint) (y uint))
  (+
    (if (and (> x u0) (occupied? round-id (cell-index (- x u1) y))) u1 u0)
    (if (and (< (+ x u1) BOARD_SIZE) (occupied? round-id (cell-index (+ x u1) y))) u1 u0)
    (if (and (> y u0) (occupied? round-id (cell-index x (- y u1)))) u1 u0)
    (if (and (< (+ y u1) BOARD_SIZE) (occupied? round-id (cell-index x (+ y u1)))) u1 u0)
  )
)

(define-public (claim-cell
    (round-id uint)
    (x uint)
    (y uint)
    (color uint)
  )
  (let
    (
      (index (cell-index x y))
      (claim-key { round-id: round-id, player: tx-sender })
      (current-claims (default-to u0 (map-get? claim-counts claim-key)))
      (score (+ BASE_SCORE (* NEIGHBOR_BONUS (neighbor-count round-id x y))))
      (score-key { round-id: round-id, player: tx-sender })
    )
    (asserts! (valid-round? round-id) ERR_INVALID_ROUND)
    (asserts! (> color u0) ERR_INVALID_COLOR)
    (asserts! (and (< x BOARD_SIZE) (< y BOARD_SIZE)) ERR_OUT_OF_BOUNDS)
    (asserts! (< current-claims MAX_CLAIMS_PER_ROUND) ERR_CLAIM_LIMIT)
    (asserts! (is-none (map-get? cells { round-id: round-id, index: index })) ERR_CELL_CLAIMED)
    (map-set cells { round-id: round-id, index: index }
      {
        owner: tx-sender,
        color: color,
        score: score,
        created-at: stacks-block-height,
        boosts: u0
      }
    )
    (map-set claim-counts claim-key (+ current-claims u1))
    (map-set player-scores score-key (+ (default-to u0 (map-get? player-scores score-key)) score))
    (map-set round-claimed-counts round-id (+ (default-to u0 (map-get? round-claimed-counts round-id)) u1))
    (print
      {
        event: "cell-claimed",
        round-id: round-id,
        index: index,
        owner: tx-sender,
        color: color,
        score: score
      }
    )
    (ok index)
  )
)

(define-public (boost-cell (round-id uint) (index uint))
  (let
    (
      (boost-key { round-id: round-id, index: index, player: tx-sender })
    )
    (asserts! (valid-round? round-id) ERR_INVALID_ROUND)
    (asserts! (< index CELL_COUNT) ERR_OUT_OF_BOUNDS)
    (asserts! (not (default-to false (map-get? boosts boost-key))) ERR_ALREADY_BOOSTED)
    (match (map-get? cells { round-id: round-id, index: index })
      cell
        (let
          (
            (next-boosts (+ (get boosts cell) u1))
            (score-key { round-id: round-id, player: (get owner cell) })
          )
          (map-set boosts boost-key true)
          (map-set cells { round-id: round-id, index: index }
            {
              owner: (get owner cell),
              color: (get color cell),
              score: (get score cell),
              created-at: (get created-at cell),
              boosts: next-boosts
            }
          )
          (map-set player-scores score-key (+ (default-to u0 (map-get? player-scores score-key)) u1))
          (print
            {
              event: "cell-boosted",
              round-id: round-id,
              index: index,
              actor: tx-sender,
              owner: (get owner cell),
              boosts: next-boosts
            }
          )
          (ok next-boosts)
        )
      ERR_NOT_FOUND
    )
  )
)

(define-read-only (get-cell (round-id uint) (index uint))
  (begin
    (asserts! (< index CELL_COUNT) ERR_OUT_OF_BOUNDS)
    (match (map-get? cells { round-id: round-id, index: index })
      cell (ok cell)
      ERR_NOT_FOUND
    )
  )
)

(define-read-only (get-player-score (round-id uint) (player principal))
  (ok (default-to u0 (map-get? player-scores { round-id: round-id, player: player })))
)

(define-read-only (get-claim-count (round-id uint) (player principal))
  (ok (default-to u0 (map-get? claim-counts { round-id: round-id, player: player })))
)

(define-read-only (get-round-claimed-count (round-id uint))
  (ok (default-to u0 (map-get? round-claimed-counts round-id)))
)

(define-read-only (has-boosted (round-id uint) (index uint) (player principal))
  (begin
    (asserts! (< index CELL_COUNT) ERR_OUT_OF_BOUNDS)
    (ok (default-to false (map-get? boosts { round-id: round-id, index: index, player: player })))
  )
)
