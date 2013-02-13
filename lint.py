#!/usr/bin/env python
from closure_linter import errors
from closure_linter import errorrules
import closure_linter
import sys

orig = errorrules.ShouldReportError

def reportp(error):
 return error not in (
   errors.INVALID_JSDOC_TAG,
   errors.MISSING_JSDOC_TAG_DESCRIPTION,
   errors.UNNECESSARY_DOUBLE_QUOTED_STRING,
   errors.LINE_TOO_LONG,
 ) and orig (error)

errorrules.ShouldReportError = reportp

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == "fix":
        from closure_linter import fixjsstyle
        closure_linter.fixjsstyle.main(["fixjsstyle", "qp.js", "app.js"])
    else:
        from closure_linter import gjslint
        gjslint.main(["gjslint", "qp.js", "app.js"])
