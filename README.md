# lexicon_wn

 A node.js application to serve wordnet semantics and morphosemantic relationships.
 The code forces an 'isa' relationship with the hypernym "hierarchy," with selective inheritance, providing local access to deep semantics without having to recurse.

## Inheritance

In Lexi, inheritance of synsets is straight forward. As WordNet is not a strict hierarchy, a design decision was made to, more or less, choose a random hypernym if there is more than one. Some attributes do not inherit down, and are explicitly listed in the code. Words inherit from a private flavor of its synset. 
![Image Lexi Inheritance](Lexi_Inheritance.png)

## License
Copyright (C) 2019 - 2021, Kurt K. Christensen

I haven't worked out the details yet, but I intend to make this code freely available, but please acknowledge where you got it from. More to come.

## ToDos

- [x] Add WN and morphy licenses.

- [x] Debug 'uses' relationship. (and other relationships if they are likewise affected)

- [ ] Put a search form on '/'.

- [ ] Add an in-memory (sqlite?) wordlist with soundex to help with spelling and morph attributes.

- [ ] Come up with a way of verifying that everything is working as it should.

- [x] It looks like Express 4.x has screwed this up. Need to figure out how to use Connect?

- [ ] Add commentary to lexicon's methods to help decypher what each one is trying to do.


## NOTE: npm update is removing lexicon.js from node_modules. Copy it back in after npm update.

## API

Many of these calls default to Content-Type: 'application/json'.
By adding a '.text' suffix, the same JSON is returned with Content-Type: text/plain.
By adding a '.html' suffix, the data is rendered as HTML with clickable hyperlinks.

-----
**/surface/**
* /surface/happiness
* /surface/happiness.text
* /surface/happiness.html

Returns a list of words that have a surface (spelled like) 'happiness'

```json
[
  {
	  "type": "word",
	  "surface": "happiness",
	  "fos": "n",
	  "tag_count": "2",
	  "gloss": "emotions experienced when in a state of well-being",
	  "word_ref": "/word/107526757/1",
	  "synset_ref": "/synset/107526757",
	  "w_num": "1",
	  "reference": "happiness.n.2->happiness.n.2"
  },
  {
	  "type": "word",
	  "surface": "happiness",
	  "fos": "n",
	  "tag_count": "1",
	  "gloss": "state of well-being characterized by emotions ranging from contentment to intense joy",
	  "word_ref": "/word/113987423/1",
	  "synset_ref": "/synset/113987423",
	  "w_num": "1",
	  "reference": "happiness.n.1->happiness.n.1"
  }
]
```
 

-----
**/word/**
* /word/113987423/1
* /word/113987423/1.text
* /word/113987423/1.html

Returns a deep semantic of a particular word as part of a synset.

-----
**/synset/**
* /synset/113987423
* /synset/113987423.text
* /synset/113987423.html

Provides a deep semantic of a synset, and references to incorporated words.


## WordNet Citation
Princeton University "About WordNet." [WordNet](https://wordnet.princeton.edu). Princeton University. 2010. 

See also: [morphosemantic-links.xls](http://wordnetcode.princeton.edu/standoff-files/morphosemantic-links.xls)