# lexicon_wn
 A node.js application to serve wordnet semantics and morph-syntatic relationships.
 The code forces an 'isa' relationship with the hypernym "hierarchy," proving local access to deep semantics without having to recurse.


## ToDos

- [ ] Add WN and morphy licenses.

- [ ] Debug 'uses' relationship. (and other relationships if they are likewise affected)

- [ ] Put a search form on '/'.

- [ ] Add an in-memory (sqlite?) wordlist with soundex to help with spelling.

- [ ] Come up with a way of verifying that everything is working as it should.


## API

Many of these calls default to Content-Type: 'application/json'.
By adding a '.text' suffix, the same (pretty-printed) JSON is returned with Content-Type: text/plain.
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
* /synset/113987423.html
* /synset/113987423.html

Provides a deep semantic of a synset, and references to incorporated words.


