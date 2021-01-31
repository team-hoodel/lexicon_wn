var fs = require('fs');
var util = require('util');
var brief = function ( item ) {
    if (item === undefined) {
        return undefined;
    } else if (Array.isArray(item)) {
        if (item.length) {
//            console.log("Debug: Array " + util.inspect(item));
            var returnlist = [];
            for (var i=0; i<item.length; i++) {
                returnlist.push(brief(item[i]));
            }
            return returnlist;
        } else {
            return undefined;
        }
    } else if (item.surface !== undefined) {
        return { type: 'word', "surface" : item.surface, "fos": item.fos, "tag_Count": item.tag_count, "gloss": item.synset.private.glosses[0], "word_ref": "/word/" + item.synset_id + "/" + item.w_num, "synset_ref": "/synset/" + item.synset_id, "w_num": item.w_num, "reference": item.private.words[0].surface + "." + item.fos + "." + Number(item.private.words[0].tag_count).toString() + "->" + item.surface + "." + item.fos + "." + Number(item.tag_count).toString() };
    } else if (item.private !== undefined) {
        return { "type": 'synset', "term" : item.private.words[0].surface, "reference": item.private.words[0].surface + "." + item.fos + "." + Number(item.private.words[0].tag_count).toString(), "fos": item.fos, "gloss": item.private.glosses[0], "synset_ref": "/synset/" + item.synset_id };
    } else {
//        console.log("Debug: Fall through " + util.inspect(item));
        return item;
    }
};


module.exports = function (directory, myEmitter) {
    "use strict";

    var input,
        lexicon = {
            synsets: [],
            synset_map: {},
            word_map: {},
            sentence_frames: [
                ["Something ", "s"],
                ["Somebody ", "s"],
                ["It is ", "ing"],
                ["Something is ", "ing PP"],
                ["Something ", "s something Adjective/Noun"],
                ["Something ", "s Adjective/Noun"],
                ["Somebody ", "s Adjective"],
                ["Somebody ", "s something"],
                ["Somebody ", "s somebody"],
                ["Something ", "s somebody"],
                ["Something ", "s something"],
                ["Something ", "s to somebody"],
                ["Somebody ", "s on something"],
                ["Somebody ", "s somebody something"],
                ["Somebody ", "s something to somebody"],
                ["Somebody ", "s something from somebody"],
                ["Somebody ", "s somebody with something"],
                ["Somebody ", "s somebody of something"],
                ["Somebody ", "s something on somebody"],
                ["Somebody ", "s somebody PP"],
                ["Somebody ", "s something PP"],
                ["Somebody ", "s PP"],
                ["Somebody's (body part) ", "s"],
                ["Somebody ", "s somebody to INFINITIVE"],
                ["Somebody ", "s somebody INFINITIVE"],
                ["Somebody ", "s that CLAUSE"],
                ["Somebody ", "s to somebody"],
                ["Somebody ", "s to INFINITIVE"],
                ["Somebody ", "s whether INFINITIVE"],
                ["Somebody ", "s somebody into VERB-ing something"],
                ["Somebody ", "s something with something"],
                ["Somebody ", "s INFINITIVE"],
                ["Somebody ", "s VERB-ing"],
                ["It ", "s that CLAUSE"],
                ["Something ", "s INFINITIVE"]
            ],
            propertyList: function (item) {
                var mylist = [], attrib;
                for ( attrib in item ) {
                    mylist.push(attrib);
                }
                return mylist;
            },
            stringify: function (item) {
                return util.inspect(item, {depth:4});
            },
            getSynsetById: function (synset_id) {
                var semantic_id = this.synset_map[Number(synset_id).toString()];
                if (semantic_id === undefined) {
                    return;
                }
                return this.synsets[semantic_id];
            },
            getSynsetBySemanticId: function (semantic_id) {
                return this.synsets[semantic_id];
            },
            lookupWord: function (surface) {
                return this.word_map["_" + surface.toLowerCase()];
            },
            surfaceService: function (surface) {
                var wordlist = lexicon.word_map['_' + surface.toLowerCase()],
                    jsonlist = [], i, briefword;
                if (wordlist) {
                    for (i=0; i<wordlist.length; i++) {
                        briefword = brief(wordlist[i]);
                        briefword.tag_count = wordlist[i].tag_count;
                        briefword.gloss = wordlist[i].synset.private.glosses[0];
                        jsonlist.push(briefword);
                    }
                }
                return jsonlist;
            },
            wordService: function (word) {
                var returnObject = brief(word),
                    attrib,
                    i, j,
                    maxi, maxj,
                    items, itemSurrogate,
                    format = 'json', frame_parts,
                    attrib,synonyms = [];
                if (word !== undefined) {
                    returnObject.gloss = word.synset.private.glosses[0];
                    for (i=0; i<word.synset.private.words.length; i++) {
                        if (i !== word.w_num -1) {
                            synonyms.push(brief(word.synset.private.words[i]));
                        }
                    }
                    returnObject.synonyms = synonyms;
                    for ( attrib in word ) {
                        if (attrib !== 'synset' && attrib !== 'private') { 
                            if (attrib === 'sent_frames') {
                                returnObject.sent_frames = [];
                                for (i=0; i< word.sent_frames.length; i++) {
                                    frame_parts = lexicon.sentence_frames[word.sent_frames[i]-1];
                                     returnObject.sent_frames.push(frame_parts); // [0] + returnObject.surface + frame_parts[1]);
                                }
                            } else {
                                returnObject[attrib] = brief(word[attrib]);
    
                            }
                        }
                    }
                }
                return returnObject;
            },
            synsetService: function (synset) {
                var words,
                    word,
                    max,
                    i, j,
                    maxi, maxj,
                    items,
                    format = 'json',
                    attrib, surrogate,
                    returnObject = brief(synset),
                    attrib, frame_parts;
                if (synset !== undefined) {
                    for ( attrib in synset.private ) {
                        if (attrib !== 'private') {
                            if (attrib === 'sent_frames') {
                                returnObject.sent_frames = [];
                                for (i=0; i< synset.sent_frames.length; i++) {
                                    frame_parts = lexicon.sentence_frames[synset.sent_frames[i]-1];
                                   returnObject.sent_frames.push(frame_parts); // [0] + synset.private.words[0].surface + frame_parts[1]);
                                }
                            } else {
                                returnObject[attrib] = brief(synset.private[attrib]);
                            }
                        }
                    }
                }
            return returnObject;
            }
        };

//    console.log("myEmitter");
//    console.log(myEmitter);

    function readLines(input, func, done_event) {
        var remaining = '',
            index,
            last,
            line;

        input.on('data', function (data) {
            remaining += data;
            index = remaining.indexOf('\n');
            last  = 0;
            while (index > -1) {
                line = remaining.substring(last, index);
                last = index + 1;
//                console.log(line);
                func(line);
                index = remaining.indexOf('\n', last);
            }

            remaining = remaining.substring(last);
        });

        input.on('end', function () {
            if (remaining.length > 0) {
//                console.log(remaining);
                func(remaining);
            }
            myEmitter.emit(done_event);
        });
    }

    function parse_gline(record) {
        var parse_g = /^g\((\d+),'(.+)'\)\.$/,
            uses_test = /^"/,
            result,
            synset_id,
            gloss,
            glosses,
            gloss_list = [],
            use_list = [],
            gloss_entry,
            semantic_id,
            privacy = function (C) {
                var F = function () {};
                F.prototype = C;
                return new F();
            },
            new_synset;
        result = parse_g.exec(record);
        if (result) {
            synset_id = result[1];
            if (typeof synset_id !== 'string') {
                synset_id = Number(synset_id).toString();
            }
            semantic_id = lexicon.synset_map[synset_id];
            if (semantic_id === undefined) {
                gloss = result[2];
                glosses = gloss.split(/; /);
                while (glosses[0]) {
//                console.log(glosses);
                    gloss_entry = glosses.shift();
                    if (uses_test.test(gloss_entry)) {
                        use_list.push(gloss_entry);
                    } else {
                        gloss_list.push(gloss_entry);
                    }
                }
                semantic_id = lexicon.synsets.length;
                lexicon.synset_map[synset_id] = semantic_id;
                new_synset = {
                    synset_id: synset_id,
                };
                new_synset['private'] = privacy(new_synset);
                new_synset.private['glosses'] = gloss_list;
                new_synset.private['usage'] = use_list;
                new_synset.private['words'] = [];
                lexicon.synsets[semantic_id] = new_synset;
            } else {
                console.log ("wn_g.pl repeated " + record);
            }
        }
    }

    function parse_sline(record) {
        var parse_s = /^s\((\d+),(\d+),'(.+)',(.),(\d+),(\d+)\)\.$/,
            alt_parse_s = /^s\((\d+),(\d+),'(.+)',(.)\)\.$/,
            result,
            synset_id,
            w_num,
            surface,
            ss_type,
            sense_number,
            tag_count,
            word,
            word_number,
            semantic_id;
        result = parse_s.exec(record);
        if (!result) {
            result = alt_parse_s.exec(record);
            result.push(1);
            result.push(0);
        }

//            console.log(result);

        if (result) {
            synset_id = result[1];
            w_num = result[2];
            surface = result[3];
            ss_type = result[4];
            tag_count = result[5];
            word_number = parseInt(w_num, 10);
            if (typeof synset_id !== 'string') {
                synset_id = Number(synset_id).toString();
            }
            semantic_id = lexicon.synset_map[synset_id];
            if (semantic_id !== undefined) {
				if (lexicon.synsets[semantic_id].private.words[w_num - 1] === undefined) {
	                word = {
	                    "synset": lexicon.synsets[semantic_id],
	                    "w_num": w_num,
	                    "surface": surface,
	                    "tag_count": tag_count
	                };
	                lexicon.synsets[semantic_id].fos = ss_type;
	                lexicon.synsets[semantic_id].private.words[w_num - 1] = word;
	                if (lexicon.word_map["_" + surface.toLowerCase()] === undefined) {
	                    lexicon.word_map["_" + surface.toLowerCase()] = [];
	                }
	                lexicon.word_map["_" + surface.toLowerCase()].push(word);
				} else {
					console.log("Repeated wn_s " + record);
				}
            }
        } else {
            console.log("wn_s.pl record failed to parse " + record);
        }
    }

    function parse_synrel(record) {
        var parse_rel = /^(\S{1,3})\((\d+),(\d+)\)\.$/, // = /^(\S+)\((\d+),(\d+)\)\.$/,
            result,
            rel,
            lsynset_id,
            rsynset_id,
            rel_forward,
            rel_reverse,
            lsemantic_id,
            rsemantic_id,
            lentity,
            rentity,
            lentity_anchor,
            rentity_anchor,
            rel_map = {
                hyp: ["hypernyms", "hyponyms"],
                at: ["attributes", "attribute_of"],
                cs: ["causes", "caused_by"],
                ent: ["entails", "entailed_by"],
                ins: ["instance_of", "has_instances"],
                mm: ["member_of", "has_members"],
                mp: ["part_of", "has_parts"],
                ms: ["substance_of", "has_substances"],
                sim: ["has_satellites", "satellite_of"]
            },
            inherited_down = {
                "hyponyms" : "No",
                "has_instances" : "No",
                "has_sattelites" : "No",
                "satellite_of" : "No",
                "attributes" : "No",
                "attribute_of" : "No"
            };

        result = parse_rel.exec(record);

        if (result) {
            rel = result[1];
            lsynset_id = result[2];
            rsynset_id = result[3];

//            console.log(rel + " of " + JSON.stringify(rel_map));

            rel_forward = rel_map[rel][0];
            rel_reverse = rel_map[rel][1];
            if (typeof lsynset_id !== 'string') {
                lsynset_id = Number(lsynset_id).toString();
            }
            lsemantic_id = lexicon.synset_map[lsynset_id];
            if (typeof rsynset_id !== 'string') {
                rsynset_id = Number(rsynset_id).toString();
            }
            rsemantic_id = lexicon.synset_map[rsynset_id];
            if (lsemantic_id !== undefined && rsemantic_id !== undefined) {
                lentity = lexicon.synsets[lsemantic_id];
                rentity = lexicon.synsets[rsemantic_id];
                
                lentity_anchor = lentity;
                rentity_anchor = rentity;
                if (inherited_down[rel_forward] === "No") {
                    lentity_anchor = lentity.private;
                }
                if (inherited_down[rel_reverse] === "No") {
                    rentity_anchor = rentity.private;
                }
                
                if (!lentity_anchor.hasOwnProperty(rel_forward)) {
                    if (rel !== 'sim' || lentity.fos !== 's') {
                        lentity_anchor[rel_forward] = [];
                    }
                }
                if (!rentity_anchor.hasOwnProperty(rel_reverse)) {
                    if (rel !== 'sim' || rentity.fos !== 'a') {
                        rentity_anchor[rel_reverse] = [];
                    }
                }
                if (rel !== 'sim') {
                    lentity_anchor[rel_forward].push(rentity);
                    rentity_anchor[rel_reverse].push(lentity);
                } else {
                    if (lentity.fos === 'a') {
                        lentity_anchor[rel_forward].push(rentity);
                        rentity_anchor[rel_reverse].push(lentity);
                    }
                }
            } else {
                console.log("The record '" + record + "' references nonexisting synsets.");
            }
        } else {
            console.log("The record '" + record + "' failed to parse.");
        }
    }

    function parse_wordrel(record) {
        var parse_rel = /^(\S{1,3})\((\d+),(\d+),(\d+),(\d+)\)\.$/, // = /^(\S+)\((\d+),(\d+)\)\.$/,
            result,
            rel,
            lsynset_id,
            lword_num,
            rsynset_id,
            rword_num,
            rel_forward,
            rel_reverse,
            lsemantic_id,
            rsemantic_id,
            lentity,
            rentity,
            rel_map = {
                ant: ["antonyms"], // back relationship is explicit in the file.
                der: ["der"],
                per: ["pertains_to", "pertained_from"],  // special case, derived_from, if left word is adverb (fos = 'r')
                ppl: ["participle_of", "has_participles"],
                sa: ["see_also", "referenced_by"],
                vgp: ["grouped_on", "group_with"]
            };

        result = parse_rel.exec(record);

        if (result) {
            rel = result[1];
            lsynset_id = result[2];
            lword_num = result[3];
            rsynset_id = result[4];
            rword_num = result[5];

//            console.log(rel + " of " + JSON.stringify(rel_map));

            rel_forward = rel_map[rel][0];
            rel_reverse = rel_map[rel][1];
            if (typeof lsynset_id !== 'string') {
                lsynset_id = Number(lsynset_id).toString();
            }
            lsemantic_id = lexicon.synset_map[lsynset_id];
            if (typeof rsynset_id !== 'string') {
                rsynset_id = Number(rsynset_id).toString();
            }
            rsemantic_id = lexicon.synset_map[rsynset_id];
            if (lsemantic_id !== undefined && rsemantic_id !== undefined) {
                if (rel === 'der') {
                    switch (lexicon.synsets[rsemantic_id].fos) {
                    case 'v':
                        rel_forward = 'derived_verbs';
                        break;
                    case 'n':
                        rel_forward = 'derived_nouns';
                        break;
                    case 'a':
                    case 's':
                        rel_forward = 'derived_adjectives';
                        break;
                    case 'r':
                        rel_forward = 'derived_adverbs';
                        break;
                    default:
                        console.log("Encountered unexpected fos for " + rsemantic_id);
                    };
                }
                if (rel === 'per' && lexicon.synsets[lsemantic_id].fos === 'r') {
                    rel_forward = 'derived_from';
                    rel_reverse = 'derives';
                }

                lentity = lexicon.synsets[lsemantic_id];
                if (lword_num > 0) {
                    lentity = lentity.private.words[lword_num - 1];
                }

                rentity = lexicon.synsets[rsemantic_id];
                if (rword_num > 0) {
                    rentity = rentity.private.words[rword_num - 1];
                }

                if (lentity !== undefined && rentity !== undefined) {
                    if (lentity[rel_forward] === undefined) {
                        lentity[rel_forward] = [];
                    }
                    lentity[rel_forward].push(rentity);
                    if (rel_reverse !== undefined) {
                        if (rentity[rel_reverse] === undefined) {
                            rentity[rel_reverse] = [];
                        }
                        rentity[rel_reverse].push(lentity);
                    }
                }
            } else {
                console.log("lentity from " + lsynset_id + "(" + lsemantic_id + ")," + lword_num + "(" + record + ") is " + lentity + ". Should have been " + lexicon.synsets[lsemantic_id].private.words[lword_num - 1]);
                console.log("rentity from " + rsynset_id + "(" + rsemantic_id + ")," + rword_num + "(" + record + ") is " + rentity + ". Should have been " + lexicon.synsets[rsemantic_id].private.words[rword_num - 1]);
            }
        } else {
            console.log("The record '" + record + "' failed to parse.");
        }
    }


    function parse_cls(record) {
        var parse_rel = /^cls\((\d+),(\d+),(\d+),(\d+),([tru])\)\.$/,
            result,
            rel,
            lsynset_id,
            lword_num,
            rsynset_id,
            rword_num,
            class_type,
            rel_forward,
            rel_reverse,
            lsemantic_id,
            rsemantic_id,
            lentity,
            rentity,
            class_names = {
                t: ["topics", "topic_of"],
                r: ["regions", "region_of"],
                u: ["uses", "usage_of"]
            };

        result = parse_rel.exec(record);

        if (result) {
            lsynset_id = result[1];
            lword_num = result[2];
            rsynset_id = result[3];
            rword_num = result[4];
            class_type = result[5];
            rel_forward = class_names[class_type][0];
            rel_reverse = class_names[class_type][1];
            if (typeof lsynset_id !== 'string') {
                lsynset_id = Number(lsynset_id).toString();
            }
            lsemantic_id = lexicon.synset_map[lsynset_id];
            if (typeof rsynset_id !== 'string') {
                rsynset_id = Number(rsynset_id).toString();
            }
            rsemantic_id = lexicon.synset_map[rsynset_id];
            if (lsemantic_id !== undefined && rsemantic_id !== undefined) {
                lentity = lexicon.synsets[lsemantic_id].private;
                if (lword_num > 0) {
                    lentity = lentity.private.words[lword_num - 1];
                }

                rentity = lexicon.synsets[rsemantic_id].private;
                if (rword_num > 0) {
                    rentity = rentity.private.words[rword_num - 1];
                }

                if (lentity !== undefined && rentity !== undefined) {
                    if (lentity[rel_forward] === undefined) {
                        lentity[rel_forward] = [];
                    }
                    lentity[rel_forward].push(rentity);
                    if (rentity[rel_reverse] === undefined) {
                        rentity[rel_reverse] = [];
                    }
                    rentity[rel_reverse].push(lentity);
                }
            } else {
                console.log("lentity from " + lsynset_id + "(" + lsemantic_id + ")," + lword_num + "(" + record + ") is " + lentity + ". Should have been " + lexicon.synsets[lsemantic_id].private.words[lword_num - 1]);
                console.log("rentity from " + rsynset_id + "(" + rsemantic_id + ")," + rword_num + "(" + record + ") is " + rentity + ". Should have been " + lexicon.synsets[rsemantic_id].private.words[rword_num - 1]);
            }
        } else {
            console.log("The record '" + record + "' failed to parse.");
        }
    }

    function parse_fr(record) {
        var parse_rel = /^fr\((\d+),(\d+),(\d+)\)\.$/,
            result,
            synset_id,
            frame_num,
            word_num,
            semantic_id,
            entity;

        result = parse_rel.exec(record);

        if (result) {
            synset_id = result[1];
            word_num = result[2];
            frame_num = result[3];
            if (typeof synset_id !== 'string') {
                synset_id = Number(synset_id).toString();
            }
            semantic_id = lexicon.synset_map[synset_id];
            if (semantic_id !== undefined) {
                entity = lexicon.synsets[semantic_id];
                if (word_num > 0) {
                    entity = entity.private.words[word_num - 1];
                }

                if (entity !== undefined) {
                    if (entity["sent_frames"] === undefined) {
                        entity["sent_frames"] = [];
                    }
                    entity["sent_frames"].push(frame_num);
                }
            } else {
                console.log("entity from " + synset_id + "(" + semantic_id + ")," + word_num + "(" + record + ") is " + entity + ". Should have been " + lexicon.synsets[semantic_id].private.words[word_num - 1]);
            }
        } else {
            console.log("The record '" + record + "' failed to parse.");
        }
    }
    
    function parse_semlink(record) {
        var parse_semlink = /^(.+)\((\d+),(\d+)\)\.$/,
            result,
            sem,
            rsem,
            found,
            i,
            max,
            lsynset_id,
            rsynset_id,
            lsynset,
            rsynset,
            sem_map = {
                'agent': 'agent_of',
                'body_part': 'body_part_of',
                'by_means_of': 'mechanism_for',
                'destination': 'destination_of',
                'event': 'event_of',
                'instrument': 'instrument_of',
                'location': 'location_of',
                'material': 'material_of',
                'property': 'property_of',
                'result': 'result_of',
                'state': 'state_of',
                'undergoer': 'undergoes',
                'uses': 'used_by',
                'vehicle': 'vehicle_of'
            };
        
        result = parse_semlink.exec(record);
        if (result) {
            sem = result[1];
            rsem = sem_map[sem];
            if (rsem) {
                lsynset_id = result[2];
                if (typeof lsynset_id !== 'string') {
                    lsynset_id = Number(lsynset_id).toString();
                }
                rsynset_id = result[3];
                if (typeof rsynset_id !== 'string') {
                    rsynset_id = Number(rsynset_id).toString();
                }
                lsynset = lexicon.getSynsetById(lsynset_id);
                rsynset = lexicon.getSynsetById(rsynset_id);
                if (lsynset !== undefined && rsynset !== undefined) {
					if (!lsynset[sem]) {
                    	lsynset[sem]=[];
                	}
					if (!rsynset[rsem]) {
                    	rsynset[rsem]=[];
                	}
                	found = 0;
                	max = lsynset[sem].length;
                	for (i=0;i<max;i++) {
                		if (lsynset[sem][i] === rsynset) {
                    		found = 1;
                    	}
                	}
                	if (!found) {
                		lsynset[sem].push(rsynset);
					}
                	found = 0;
                	max = rsynset[rsem].length;
                	for (i=0;i<max;i++) {
                		if (rsynset[rsem][i] === lsynset) {
                    		found = 1;
                   	 }
                	}
                	if (!found) {
                		rsynset[rsem].push(lsynset);
             		}
			 	}
            } else {
                console.log("The record '" + record + "' has no reverse semantic.");
            }
        } else {
            console.log("The record '" + record + "' failed to parse.");
        }
    }

    function parse_syntax(record) {
        var parse_rel = /^syntax\((\d+),(\d+),(.+)\)\.$/, // = /^(\S+)\((\d+),(\d+)\)\.$/,
            result,
            synset_id,
            word_num,
            syntax,
            semantic_id,
            entity;

        result = parse_rel.exec(record);

        if (result) {
            synset_id = result[1];
            word_num = result[2];
            syntax = result[3];
            if (typeof synset_id !== 'string') {
                synset_id = Number(synset_id).toString();
            }
            semantic_id = lexicon.synset_map[synset_id];
            if (semantic_id !== undefined) {
                entity = lexicon.synsets[semantic_id];
                if (word_num > 0) {
                    entity = entity.private.words[word_num - 1];
                }

                if (entity !== undefined) {
                    if (entity["syntax"] === undefined) {
                        entity["syntax"] = [];
                    } else {
                        console.log("Multiple syntax found at " + synset_id + ", " + word_num + ".");
                    }
                    entity["syntax"].push(syntax);
                }
            } else {
                console.log("entity from " + synset_id + "(" + semantic_id + ")," + word_num + "(" + record + ") is " + entity + ". Should have been " + lexicon.synsets[semantic_id].private.words[word_num - 1]);
            }
        } else {
            console.log("The record '" + record + "' failed to parse.");
        }
    }

// ---------------- Run the damn thing.

    input = fs.createReadStream(directory + '/wn_g.pl');
    console.log('Processing wn_g.pl');
    readLines(input, parse_gline, 'wn_g');

    function load_s() {
        input = fs.createReadStream(directory + '/wn_s.pl');
        console.log('Processing wn_s.pl');
        readLines(input, parse_sline, 'wn_s');
    }
    myEmitter.once('wn_g', load_s);

    // load Synset Relationships

    function load_hyp() {
        input = fs.createReadStream(directory + '/wn_hyp.pl');
        console.log('Processing wn_hyp.pl');
        readLines(input, parse_synrel, 'wn_hyp');
    }
    myEmitter.once('wn_s', load_hyp);

    function load_at() {
        input = fs.createReadStream(directory + '/wn_at.pl');
        console.log('Processing wn_at.pl');
        readLines(input, parse_synrel, 'wn_at');
    }
    myEmitter.once('wn_hyp', load_at);

    function load_cs() {
        input = fs.createReadStream(directory + '/wn_cs.pl');
        console.log('Processing wn_cs.pl');
        readLines(input, parse_synrel, 'wn_cs');
    }
    myEmitter.once('wn_at', load_cs);

    function load_ent() {
        input = fs.createReadStream(directory + '/wn_ent.pl');
        console.log('Processing wn_ent.pl');
        readLines(input, parse_synrel, 'wn_ent');
    }
    myEmitter.once('wn_cs', load_ent);

    function load_ins() {
        input = fs.createReadStream(directory + '/wn_ins.pl');
        console.log('Processing wn_ins.pl');
        readLines(input, parse_synrel, 'wn_ins');
    }
    myEmitter.once('wn_ent', load_ins);

    function load_mm() {
        input = fs.createReadStream(directory + '/wn_mm.pl');
        console.log('Processing wn_mm.pl');
        readLines(input, parse_synrel, 'wn_mm');
    }
    myEmitter.once('wn_ins', load_mm);

    function load_mp() {
        input = fs.createReadStream(directory + '/wn_mp.pl');
        console.log('Processing wn_mp.pl');
        readLines(input, parse_synrel, 'wn_mp');
    }
    myEmitter.once('wn_mm', load_mp);

    function load_ms() {
        input = fs.createReadStream(directory + '/wn_ms.pl');
        console.log('Processing wn_ms.pl');
        readLines(input, parse_synrel, 'wn_ms');
    }
    myEmitter.once('wn_mp', load_ms);

    function load_sim() {
        input = fs.createReadStream(directory + '/wn_sim.pl');
        console.log('Processing wn_sim.pl');
        readLines(input, parse_synrel, 'wn_sim');
    }
    myEmitter.once('wn_ms', load_sim);



    function load_ant() {
        input = fs.createReadStream(directory + '/wn_ant.pl');
        console.log('Processing wn_ant.pl');
        readLines(input, parse_wordrel, 'wn_ant');
    }
    myEmitter.once('wn_sim', load_ant);

    function load_der() {
        input = fs.createReadStream(directory + '/wn_der.pl');
        console.log('Processing wn_der.pl');
        readLines(input, parse_wordrel, 'wn_der');
    }
    myEmitter.once('wn_ant', load_der);

    function load_per() {
        input = fs.createReadStream(directory + '/wn_per.pl');
        console.log('Processing wn_per.pl');
        readLines(input, parse_wordrel, 'wn_per');
    }
    myEmitter.once('wn_der', load_per);

    function load_ppl() {
        input = fs.createReadStream(directory + '/wn_ppl.pl');
        console.log('Processing wn_ppl.pl');
        readLines(input, parse_wordrel, 'wn_ppl');
    }
    myEmitter.once('wn_per', load_ppl);

    function load_sa() {
        input = fs.createReadStream(directory + '/wn_sa.pl');
        console.log('Processing wn_sa.pl');
        readLines(input, parse_wordrel, 'wn_sa');
    }
    myEmitter.once('wn_ppl', load_sa);

    function load_vgp() {
        input = fs.createReadStream(directory + '/wn_vgp.pl');
        console.log('Processing wn_vgp.pl');
        readLines(input, parse_wordrel, 'wn_vgp');
    }
    myEmitter.once('wn_sa', load_vgp);


    function load_cls() {
        input = fs.createReadStream(directory + '/wn_cls.pl');
        console.log('Processing wn_cls.pl');
        readLines(input, parse_cls, 'wn_cls');
    };
    myEmitter.once('wn_vgp', load_cls);

    function load_fr() {
        input = fs.createReadStream(directory + '/wn_fr.pl');
        console.log('Processing wn_fr.pl');
        readLines(input, parse_fr, 'wn_fr');
    };
    myEmitter.once('wn_cls', load_fr);

    function load_syntax() {
        input = fs.createReadStream(directory + '/wn_syntax.pl');
        console.log('Processing wn_syntax.pl');
        readLines(input, parse_syntax, 'wn_syntax');
    };
    myEmitter.once('wn_fr', load_syntax);

// wn_sk.pl?

    function load_semlink() {
        input = fs.createReadStream(directory + '/wn_semlink.pl');
        console.log('processing wn_semlink.pl');
        readLines(input, parse_semlink, 'wn_semlink');
    }
    myEmitter.once('wn_syntax', load_semlink);

    function load_end() {
        var synset,
            max_sid = lexicon.synsets.length,
//            hypercount,
            max_wnum,
            i,
            j,
            inherit = function (C, P) {
                C.__proto__ = P; // EXTREMELY BAD FORM, but I don't know another way around it.
            };
        console.log('Setting prototype inheritance.');
        for (i = 0; i < max_sid; i += 1) {
            synset = lexicon.synsets[i];
            if (synset.hasOwnProperty("hypernyms")) {
//                hypercount = synset.hypernyms.length;
//                if (hypercount === 1) {
                try {
                    inherit(synset, synset.hypernyms[0]);
                } catch (err) {
                    console.log("Error trying to set hypernym __proto__ for synsets[" + i + "]. " + err);
                }
//                } else {
//                    console.log("Don't yet handle hypercount = " + hypercount + " from synset: " + synset.synset_id + " (" + i + ")");
//                }
            }
            if (synset.hasOwnProperty("instance_of")) {
                try {
                    inherit(synset, synset["instance_of"][0]);
                } catch (err) {
                    console.log("Error trying to set instance_of __proto__ for synsets[" + i + "]. " + err);
                }
            }
            max_wnum = synset.private.words.length;
            for (j = 0; j < max_wnum; j += 1) {
                try {
                    inherit(synset.private.words[j], synset.private);
                } catch (err) {
                    console.log("Error trying to set __proto__ for synsets[" + i + "].private.words[" + j + "]. " + err);
                }
            }
        }

        console.log('Done building lexicon.');
    }
    myEmitter.once('wn_semlink', load_end);

    return lexicon;
};


