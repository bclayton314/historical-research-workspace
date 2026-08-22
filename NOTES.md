Title:
The Boxer Rebellion and the Great Game in China

Type:
Book

Author:
David J. Silbey

Publication:
Hill and Wang

Summary:
A concise military history placing the Boxer uprising
inside the wider strategic rivalry among the imperial powers.

Reliability notes:
Useful modern synthesis. Its concise format means specific
claims should be compared with primary accounts and more
specialized scholarship.


Title:
British naval report on the attack on the Taku Forts

Type:
Primary source

Publication:
British naval records

Summary:
Contemporary operational account describing Allied naval
preparations, the Chinese ultimatum, and the nighttime battle.

Reliability notes:
Valuable firsthand institutional evidence, but likely shaped
by British strategic assumptions and post-battle justification.


curl -X POST \
  http://localhost:5000/api/projects/1/sources \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Boxer Rebellion and the Great Game in China",
    "author": "David J. Silbey",
    "source_type": "book",
    "publication": "Hill and Wang",
    "publication_date": "2012-03-27",
    "citation": "Silbey, David J. The Boxer Rebellion and the Great Game in China.",
    "summary": "A military and diplomatic history of the Boxer conflict.",
    "reliability_notes": "A useful modern synthesis."
  }'