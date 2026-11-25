export abstract class ParseAdminEmails {
  /** ADMIN_EMAILS is comma separated and case-insensitive. */
  static execute(raw = process.env.ADMIN_EMAILS ?? ""): Set<string> {
    return new Set(
      raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    )
  }
}
