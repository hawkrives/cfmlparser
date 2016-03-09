#!/bin/bash

cd `dirname $0`
CWD="`pwd`"

box $CWD/run.cfm

exitcode=$(<.exitcode)
rm -f .exitcode

exit $exitcode
