#!/bin/bash

LOCALE_PATH=`pwd`/src/utils/locales
HTML5_LOCALE_PATH=$2
BASE_FILE=$LOCALE_PATH/en.json
KEYS_FILE=/tmp/keys.txt

cat $BASE_FILE | grep "(\".*\"):" -oEi > $KEYS_FILE

LOCALE_FILE=$LOCALE_PATH/$1.json

echo "{" > $LOCALE_FILE
grep -Fw -f $KEYS_FILE "$HTML5_LOCALE_PATH/$1.json" >> $LOCALE_FILE

cat $LOCALE_FILE | tail -1 | grep ",$"

if [ "$?" = "0" ]; then
  truncate -s -2 $LOCALE_FILE
fi;

echo "}" >> $LOCALE_FILE
