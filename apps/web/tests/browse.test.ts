import { expect, test } from "bun:test"
import { browseItems, type BrowseItem } from "../lib/browse"

const sample: BrowseItem[] = [
  { id:"c", title:"C", rating:null, groups:["community"], cover:"", href:"" },
  { id:"b", title:"B", rating:8, year:2020, minPlayers:2, maxPlayers:4, groups:["community"], cover:"", href:"" },
  { id:"a", title:"A", rating:7, year:2022, minPlayers:1, maxPlayers:2, groups:["wdg"], cover:"", href:"" }
]
test("rating sorts keep unranked games last in either direction", () => {
  expect(browseItems(sample,"en","",0,"rating",false).map(g=>g.id)).toEqual(["b","a","c"])
  expect(browseItems(sample,"en","",0,"rating",true).map(g=>g.id)).toEqual(["a","b","c"])
})
test("player count uses both inclusive endpoints and composes with the group", () => {
  expect(browseItems(sample,"en","",2,"title",true).map(g=>g.id)).toEqual(["a","b"])
  expect(browseItems(sample,"en","community",4,"original",true).map(g=>g.id)).toEqual(["b"])
  expect(browseItems(sample,"en","",5,"original",true)).toEqual([])
})
test("publication year and maximum party size use numeric order", () => {
  expect(browseItems(sample,"en","",0,"year",false)[0].id).toBe("a")
  expect(browseItems(sample,"en","",0,"maxPlayers",false)[0].id).toBe("b")
  expect(sample[0].id).toBe("c")
})
