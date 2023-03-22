#!/bin/bash

LOCALE_PATH=`pwd`/src/utils/locales
HTML5_LOCALE_PATH=$2
BASE_FILE=$LOCALE_PATH/en.json
KEYS_FILE=/tmp/keys.txt

cat $BASE_FILE | grep "(\".*\"):" -oEi > $KEYS_FILE

LOCALE_FILE=$LOCALE_PATH/$1.json

echo "{" > $LOCALE_FILE
grep -Fw -f $KEYS_FILE "$HTML5_LOCALE_PATH/$1.json" >> $LOCALE_FILE

cat $LOCALE_FILE | tail -1 | grep ",$" -q
if [ "$?" = "1" ]; then
  truncate -s -1 $LOCALE_FILE
  echo ',' >> $LOCALE_FILE
fi;

cat $LOCALE_FILE | grep "(\".*\"):" -oEi > $KEYS_FILE

grep -Fwv -f $KEYS_FILE $BASE_FILE | grep "(\".*\"):" -oEi | sed -e 's/.*/    & "",/' >> $LOCALE_FILE

cat $LOCALE_FILE | tail -1 | grep ",$" -q
if [ "$?" = "0" ]; then
  truncate -s -2 $LOCALE_FILE
  echo '' >> $LOCALE_FILE
fi;

echo -n "}" >> $LOCALE_FILE
