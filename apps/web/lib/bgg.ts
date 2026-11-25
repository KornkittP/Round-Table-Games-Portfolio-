import snapshot from "./bgg.json"
export function bggGame(slug:string){
 return Object.hasOwn(snapshot,slug)?snapshot[slug as keyof typeof snapshot]:undefined
}
