"""Refresh the portfolio's BGG community snapshot using the official XML API."""
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from xml.etree import ElementTree

target = Path(__file__).resolve().parents[1] / "apps/web/lib/bgg.json"
games = json.loads(target.read_text(encoding="utf8"))
ids = ",".join(str(game["id"]) for game in games.values())
token = os.environ.get("BGG_API_TOKEN")
if not token:
    raise SystemExit("Set the server-side BGG_API_TOKEN to a registered BGG application token.")
request = Request("https://boardgamegeek.com/xmlapi2/thing?stats=1&id=" + ids,
                  headers={"Authorization": "Bearer " + token})
with urlopen(request, timeout=20) as response:
    if response.status != 200:
        raise SystemExit(f"BGG returned HTTP {response.status}; retry later.")
    document = ElementTree.fromstring(response.read())

for game in games.values():
    item = document.find(f"./item[@id='{game['id']}']")
    if item is None:
        raise SystemExit(f"Missing BGG record {game['id']}")
    stats = item.find("statistics/ratings")
    game.update(
        rating=float(stats.find("average").attrib["value"]),
        votes=int(stats.find("usersrated").attrib["value"]),
        weight=float(stats.find("averageweight").attrib["value"]),
        categories=[link.attrib["value"] for link in item.findall("link[@type='boardgamecategory']")],
        mechanics=[link.attrib["value"] for link in item.findall("link[@type='boardgamemechanic']")],
        description=item.findtext("description") or game["description"],
        checked=datetime.now(timezone.utc).date().isoformat(),
    )

temporary = target.with_suffix(".json.tmp")
temporary.write_text(json.dumps(games, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
temporary.replace(target)
