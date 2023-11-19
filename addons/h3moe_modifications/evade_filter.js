'use strict';
var common = require('../../engine/postingOps').common;
var db = require('../../db');
var globalFilters = db.filters();


var evasionList = '[\u061C\u034F\u200B\u200C\u200D\u2060\uFEFF _\*\']*?';

common.applyFilters = function(boardFilters, message, callback) {

  boardFilters = boardFilters || [];

  globalFilters.find({}).toArray(
      function(error, foundGlobalFilters) {

        if (error) {
          return callback(error);
        }

        boardFilters = boardFilters.concat(foundGlobalFilters);

        for (var i = 0; i < boardFilters.length; i++) {

          var filter = boardFilters[i];

          var parameters = 'g';

          if (filter.caseInsensitive) {
            parameters += 'i';
          }

          message = message.replace(new RegExp(filter.originalTerm.split('')
		                                     .map(common.escapeRegExp)
		                                     .join(evasionList),
		                    parameters),
              filter.replacementTerm);

        }

        callback(null, message);

      });

};
