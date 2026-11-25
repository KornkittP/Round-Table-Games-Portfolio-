export abstract class IsPreorderOpen {
  /** Open only while the flag is on and the closing time (if any) has not passed. */
  static execute(
    game: { preorderOpen: boolean; preorderCloses?: string | null },
    now = new Date()
  ): boolean {
    if (!game.preorderOpen) return false
    return !game.preorderCloses || new Date(game.preorderCloses) > now
  }
}
