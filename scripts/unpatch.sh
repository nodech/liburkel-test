#!/bin/sh

echo "Un-Applying patches..."
for f in `cat patches/.patches`
do
  echo "Un-Applying $f..."
  patch -p1 -N -s -R < patches/$f
done
