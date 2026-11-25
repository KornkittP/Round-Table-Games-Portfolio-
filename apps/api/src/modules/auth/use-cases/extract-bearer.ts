export abstract class ExtractBearer {
  static execute(header?: string | null): string | null {
    const match = /^Bearer\s+(\S+)$/i.exec(header ?? "")
    return match ? match[1] : null
  }
}
