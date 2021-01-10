var util = require('util');

/*
 * GET home page.
 */
exports.index = function (req, res) {
  res.render('index', { title: 'Lexi' });
};

/*
 * GET word listing from surface.
 */
exports.surface = function (req, res) {
    var wordlist = lexicon.surfaceService(req.params[0]);
    var i;

//    console.log('surface ' + req.params[0] + ', format ' + req.params[1]);
//	console.log(util.inspect(wordlist, { depth: 3 }));

    if (wordlist.length) {
//		console.log(wordlist);
	console.warn(req.params[1]);
        if (req.params[1] === 'html') {
            res.render('words', { title: "Words matching " + req.params[0], wordlist: wordlist });
        } else if (req.params[1] === 'text'){
	        res.header('Content-Type', 'text/plain');
            res.send(wordlist);
        } else {
            res.header('Content-Type', 'application/json');
            res.send(wordlist);
        }
    } else {
	  res.status(404).send("No words found matching " + req.params[0]);
    }
};

/*
 * GET word synset_id and word_num.
 */
exports.word = function (req, res) {
    var synset_obj = lexicon.getSynsetById(req.params[0]);
    if (synset_obj !== undefined && synset_obj.private.words[req.params[1] - 1] !== undefined) {
	
        var word_obj = lexicon.wordService(synset_obj.private.words[req.params[1] - 1]);

//        console.log(req.params[0] + ' - ' + req.params[1] + " = " + word_obj.surface);

        if (req.params[2] === 'html') {
            res.render('word_detail', { title: "Word detail " + word_obj.surface, word: word_obj });
        } else if (req.params[2] === 'text') {
	            res.header('Content-Type', 'text/plain');
	            res.send(word_obj);
        }	else {
                res.header('Content-Type', 'application/json');
                res.send(word_obj);
        }
    } else {
			res.send("Object not found.");
    }
};

/*
 * GET synset from synset_id.
 */
exports.synset = function (req, res) {
    var synset = lexicon.getSynsetById(req.params[0]);
    var briefSynset = lexicon.synsetService(synset);

    if (req.params[1] === 'html') {
        res.render('synset', { title: "Synset detail " + req.params[0], synset: briefSynset });
    } else if (req.params[1] === 'text') {
        res.header('Content-Type', 'text/plain');
        res.send(briefSynset);
    } else {
        res.header('Content-Type', 'application/json');
        res.send(briefSynset);
    }
};

/*
 * GET synset from semantic_id.
 */
exports.semantic = function (req, res) {
    var synset = lexicon.getSynsetBySemanticId(req.params[0]);
    var briefSynset = lexicon.synsetService(synset.private);

    if (req.format === 'html') {
        res.render('synset', { title: "Synset detail " + req.params[0], synset: briefSynset });
    } else if (req.format === 'text') {
        res.header('Content-Type', 'text/plain');
        res.send(briefSynset);
    } else {
        res.header('Content-Type', 'application/json');
        res.send(briefSynset);
    }
};

/*
 * GET some random utility.
 */
exports.util = function (req, res) {
    var synset, aWord, fos, i,j, attrib;
    var accumulator = { "n": {},
                        "v": {},
                        "a": {},
                        "s": {},
                        "r": {}
                       }

//    res.header("Content-Type: text/plain");

    for (i=0; i<lexicon.synsets.length; i++) {
        synset = lexicon.synsets[i];
		for (j=0; j<synset.words.length; j++) {
			aWord = synset.words[j];
	        for (attrib in aWord) {
	            if (aWord.hasOwnProperty(attrib)) {
	                accumulator[synset.fos][attrib] = 'own';
	            } else {
	                if (accumulator[synset.fos][attrib] !== 'own') {
	                    accumulator[synset.fos][attrib] = 'inherited';
	                }
	            }
	        }
		}
    }

    for (fos in accumulator) {
        for (attrib in accumulator[fos]) {
	        if (accumulator[fos][attrib] === 'own') {
		        console.log(fos + "	" + attrib + "	" + accumulator[fos][attrib]);
            }
        }
    }
    res.send("Done");
};
